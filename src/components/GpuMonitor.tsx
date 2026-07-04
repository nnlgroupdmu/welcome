import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Cpu, Server, AlertCircle, Brain, Database } from 'lucide-react';
import { INTERNAL_ROUTES, NETWORK_ENDPOINTS, NETWORK_HELP_TEXT } from '../appConfig';
import { fetchWithTimeout } from '../clientUtils';

interface PrometheusResult {
    metric: {
        gpu: string;
        modelName: string;
        [key: string]: string;
    };
    value: [number, string];
}

interface GpuMemory {
    usedMb: number;
    freeMb: number;
    totalMb: number;
    usedPercent: number;
}

interface LlmInfo {
    loaded: boolean;
    modelName: string;
    modelSizeFormatted: string;
}

interface GpuInfo {
    id: string;
    model: string;
    utilization: number;
    memory: GpuMemory | null;
}

// 默认预置的 GPU 集群节点（离线/未联通时作为优雅后备展示）
const PRESET_GPUS: GpuInfo[] = [
    { id: 'GPU 0', model: 'NVIDIA RTX 5090 D', utilization: 0, memory: null },
    { id: 'GPU 1', model: 'NVIDIA RTX 5090 D', utilization: 0, memory: null },
];

/** Format bytes to human-readable size string (decimal units: 1 KB = 1000 B) */
function formatBytes(bytes: number): string {
    if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(1)} TB`;
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;
    return `${bytes} B`;
}

/** Format VRAM size from MiB to human-readable (binary units: 1 GiB = 1024 MiB).
 *  GPU memory is universally discussed in binary units. */
function formatVramMiB(mib: number): string {
    if (mib >= 1024) return `${(mib / 1024).toFixed(1)} GiB`;
    return `${Math.round(mib)} MiB`;
}

/** Determine if a GPU is hosting a loaded LLM (VRAM-resident), regardless of current utilization.
 *  During inference the util bar shows compute load; the LLM badge persists as long as the model stays in VRAM. */
function isLlmLoaded(gpu: GpuInfo, llmInfo: LlmInfo | null): boolean {
    if (!llmInfo?.loaded) return false;
    if (!gpu.memory) return false;
    if (gpu.memory.usedPercent <= 30) return false;
    return true;
}

export const GpuMonitor: React.FC = () => {
    const [gpus, setGpus] = useState<GpuInfo[]>(PRESET_GPUS);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [lastSuccessfulAt, setLastSuccessfulAt] = useState<number | null>(null);
    const [llmInfo, setLlmInfo] = useState<LlmInfo | null>(null);
    const hasLiveSnapshotRef = useRef(false);

    /**
     * Fetch a single PromQL metric across dual-route (LAN + Tailscale).
     * Returns parsed PrometheusResult[] or null on failure.
     */
    const fetchPrometheusMetric = useCallback(async (promql: string): Promise<PrometheusResult[] | null> => {
        const urls = [
            `${INTERNAL_ROUTES.tailscale.prometheusApi}?query=${encodeURIComponent(promql)}`,
            `${INTERNAL_ROUTES.lan.prometheusApi}?query=${encodeURIComponent(promql)}`,
        ];

        const fetchSinglePath = async (url: string) => {
            const response = await fetchWithTimeout(url, {}, NETWORK_ENDPOINTS.timeouts.gpuMs);
            if (!response.ok) throw new Error();
            const resData = await response.json();
            if (resData.status === 'success' && resData.data?.result) {
                return resData.data.result as PrometheusResult[];
            }
            throw new Error();
        };

        try {
            return await Promise.any(urls.map(url => fetchSinglePath(url)));
        } catch {
            return null;
        }
    }, []);

    /**
     * Build a VRAM map keyed by GPU label (e.g. "GPU 0") from FB_USED + FB_FREE metrics.
     */
    const buildMemoryMap = useCallback(
        (fbUsedResults: PrometheusResult[], fbFreeResults: PrometheusResult[]): Map<string, GpuMemory> => {
            const map = new Map<string, GpuMemory>();

            const freeByGpu = new Map<string, number>();
            for (const item of fbFreeResults) {
                freeByGpu.set(item.metric.gpu, parseFloat(item.value[1]) || 0);
            }

            for (const item of fbUsedResults) {
                const gpuIdx = item.metric.gpu;
                const usedMb = parseFloat(item.value[1]) || 0;
                const freeMb = freeByGpu.get(gpuIdx) ?? 0;
                const totalMb = usedMb + freeMb;
                const usedPercent = totalMb > 0 ? Math.round((usedMb / totalMb) * 100) : 0;

                map.set(`GPU ${gpuIdx}`, {
                    usedMb: Math.round(usedMb),
                    freeMb: Math.round(freeMb),
                    totalMb: Math.round(totalMb),
                    usedPercent,
                });
            }

            return map;
        },
        []
    );

    /**
     * Probe the LLM model server endpoint. Returns parsed LlmInfo or null.
     */
    const detectLlmModel = useCallback(async (): Promise<LlmInfo | null> => {
        const urls = [
            INTERNAL_ROUTES.tailscale.llmModelApi,
            INTERNAL_ROUTES.lan.llmModelApi,
        ];

        const fetchSinglePath = async (url: string) => {
            const response = await fetchWithTimeout(url, {}, 2500);
            if (!response.ok) throw new Error();
            return response.json();
        };

        try {
            const data = await Promise.any(urls.map(url => fetchSinglePath(url)));

            // Support both OpenAI-compatible format (data array) and Ollama format (models array)
            const models = data?.data ?? data?.models ?? [];
            if (!Array.isArray(models) || models.length === 0) return null;

            // Pick the largest model (most VRAM-relevant)
            let best = models[0];
            let bestSize = best?.meta?.size ?? best?.size ?? 0;
            for (const m of models) {
                const sz = m?.meta?.size ?? m?.size ?? 0;
                if (sz > bestSize) {
                    bestSize = sz;
                    best = m;
                }
            }

            const modelName = best?.id || best?.name || best?.model || 'Unknown';
            const sizeFormatted = bestSize > 0 ? formatBytes(bestSize) : '';

            return {
                loaded: true,
                modelName,
                modelSizeFormatted: sizeFormatted,
            };
        } catch {
            return null;
        }
    }, []);

    /**
     * Main data refresh: fetches GPU utilization, VRAM, and model info in parallel.
     * @param showPulse - whether to animate the refresh button
     */
    const fetchAllGpuData = useCallback(async (showPulse = false) => {
        if (showPulse) setIsRefreshing(true);

        try {
            // Fetch utilization + VRAM metrics + model info all in parallel
            const [utilResults, fbUsedResults, fbFreeResults, detectedLlm] = await Promise.all([
                fetchPrometheusMetric('DCGM_FI_DEV_GPU_UTIL'),
                fetchPrometheusMetric('DCGM_FI_DEV_FB_USED'),
                fetchPrometheusMetric('DCGM_FI_DEV_FB_FREE'),
                detectLlmModel(),
            ]);

            // If utilization query failed, treat as offline
            if (!utilResults) {
                setIsOnline(false);
                if (detectedLlm) setLlmInfo(detectedLlm);
                return;
            }

            // Build memory map from VRAM metrics (may be null if those queries failed)
            const memoryMap =
                fbUsedResults && fbFreeResults
                    ? buildMemoryMap(fbUsedResults, fbFreeResults)
                    : new Map<string, GpuMemory>();

            // Merge utilization + memory into GpuInfo[]
            const formattedGpus: GpuInfo[] = utilResults.map((item) => ({
                id: `GPU ${item.metric.gpu}`,
                model: item.metric.modelName || 'RTX 5090 D',
                utilization: Math.min(100, Math.max(0, parseInt(item.value[1], 10) || 0)),
                memory: memoryMap.get(`GPU ${item.metric.gpu}`) ?? null,
            }));
            formattedGpus.sort((a, b) => a.id.localeCompare(b.id));

            setGpus(formattedGpus);
            setIsOnline(true);
            hasLiveSnapshotRef.current = true;
            setLastSuccessfulAt(Date.now());

            if (detectedLlm) setLlmInfo(detectedLlm);
        } catch {
            setIsOnline(false);
            if (!hasLiveSnapshotRef.current) {
                setGpus(PRESET_GPUS);
            }
        } finally {
            setLoading(false);
            setTimeout(() => {
                setIsRefreshing(false);
            }, 600);
        }
    }, [fetchPrometheusMetric, buildMemoryMap, detectLlmModel]);

    // Initial load + 8s polling for GPU metrics
    useEffect(() => {
        fetchAllGpuData();
        const timer = setInterval(() => fetchAllGpuData(false), 8000);
        return () => clearInterval(timer);
    }, [fetchAllGpuData]);

    // Separate slower poll for model endpoint (60s) — models rarely change
    useEffect(() => {
        const timer = setInterval(async () => {
            const detected = await detectLlmModel();
            if (detected) setLlmInfo(detected);
        }, 60000);
        return () => clearInterval(timer);
    }, [detectLlmModel]);

    const hasStaleSnapshot = !isOnline && hasLiveSnapshotRef.current && lastSuccessfulAt !== null;
    const lastSuccessfulTime = lastSuccessfulAt
        ? new Intl.DateTimeFormat('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(new Date(lastSuccessfulAt))
        : '';

    // Render helpers for a single GPU card
    const renderGpuCard = (gpu: GpuInfo, canShowMetric: boolean) => {
        const llmActive = isLlmLoaded(gpu, llmInfo);
        const isHighLoad = gpu.utilization > 70;
        const isMediumLoad = gpu.utilization > 30 && gpu.utilization <= 70;

        // Bar color: high load > medium > LLM idle > low > offline
        // During inference (high util), show load colors; LLM purple only when idle
        const barColorClass = !canShowMetric
            ? 'bg-slate-800 dark:bg-zinc-800'
            : isHighLoad
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : isMediumLoad
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-400'
                    : llmActive
                        ? 'bg-gradient-to-r from-violet-500 to-purple-400'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400';

        const textColorClass = !canShowMetric
            ? 'text-slate-600 dark:text-zinc-650'
            : hasStaleSnapshot
                ? 'text-amber-400'
                : isHighLoad
                    ? 'text-rose-400'
                    : isMediumLoad
                        ? 'text-teal-400'
                        : llmActive
                            ? 'text-violet-400'
                            : 'text-teal-400';

        const vramBarColorClass = !canShowMetric || !gpu.memory
            ? 'bg-slate-800 dark:bg-zinc-800'
            : llmActive
                ? 'bg-gradient-to-r from-violet-600 to-purple-500'
                : gpu.memory.usedPercent > 70
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-sky-500 to-cyan-400';

        return (
            <div
                key={gpu.id}
                className="group relative flex flex-col p-2 rounded-lg bg-slate-900/40 dark:bg-zinc-900/45 border border-slate-800/60 dark:border-zinc-800/75 hover:border-slate-700/80 dark:hover:border-zinc-700/80 hover:bg-slate-800/20 dark:hover:bg-zinc-800/20 transition-all duration-300"
            >
                {/* Top row: GPU identity + utilization */}
                <div className="flex items-center justify-between">
                    {/* Left Side: Node Info */}
                    <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                            <span className={`text-[12px] font-bold ${canShowMetric ? 'text-slate-200 dark:text-zinc-200' : 'text-slate-500 dark:text-zinc-550'}`}>
                                {gpu.id}
                            </span>
                            {isOnline && gpu.utilization > 0 && (
                                <span className={`flex h-1.5 w-1.5 rounded-full animate-ping ${isHighLoad ? 'bg-rose-400' : 'bg-teal-400'}`} />
                            )}
                            {llmActive && (
                                <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8px] font-bold bg-violet-500/15 text-violet-400 border border-violet-500/20">
                                    <Brain className="w-2.5 h-2.5" />
                                    LLM
                                </span>
                            )}
                        </div>
                        <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-mono font-medium tracking-tight whitespace-nowrap">
                            {gpu.model}
                        </span>
                    </div>

                    {/* Right Side: Utilization Telemetry */}
                    <div className="flex flex-col items-end gap-1 shrink-0 w-[100px]">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-[8px] text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                                UTIL
                            </span>
                            <span className={`text-[11px] font-extrabold font-mono transition-colors duration-500 ${textColorClass}`}>
                                {canShowMetric ? `${gpu.utilization}%` : 'OFFLINE'}
                            </span>
                        </div>

                        {/* Utilization progress bar */}
                        <div className="w-full h-[3px] bg-slate-800/80 dark:bg-zinc-800/80 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: canShowMetric ? `${gpu.utilization}%` : '0%' }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full rounded-full ${barColorClass}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom row: VRAM telemetry (shown when data available) */}
                {canShowMetric && gpu.memory && (
                    <div className="flex flex-col gap-1 mt-1.5 pt-1.5 border-t border-slate-800/30 dark:border-zinc-800/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 min-w-0">
                                <Database className="w-2.5 h-2.5 text-slate-500 dark:text-zinc-500 shrink-0" />
                                <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-medium shrink-0">
                                    VRAM
                                </span>
                                {llmActive && llmInfo?.modelName && (
                                    <span className="text-[8px] text-violet-400/70 font-mono truncate" title={llmInfo.modelName}>
                                        · {llmInfo.modelName}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[9px] text-slate-400 dark:text-zinc-400 font-mono tabular-nums">
                                    {formatVramMiB(gpu.memory.usedMb)}
                                    <span className="text-slate-600 dark:text-zinc-600"> / </span>
                                    {formatVramMiB(gpu.memory.totalMb)}
                                </span>
                                <span className={`text-[10px] font-bold font-mono w-8 text-right ${llmActive ? 'text-violet-400' : 'text-slate-400 dark:text-zinc-400'}`}>
                                    {gpu.memory.usedPercent}%
                                </span>
                            </div>
                        </div>
                        {/* VRAM progress bar */}
                        <div className="w-full h-[2px] bg-slate-800/80 dark:bg-zinc-800/80 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${gpu.memory.usedPercent}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full rounded-full ${vramBarColorClass}`}
                            />
                        </div>
                    </div>
                )}

                {/* LLM model details tooltip area (visible on hover) */}
                {llmActive && llmInfo && (
                    <div className="mt-1 text-[8px] text-violet-400/50 font-mono truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {llmInfo.modelName}{llmInfo.modelSizeFormatted ? ` (${llmInfo.modelSizeFormatted})` : ''}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full mt-2 pt-2 border-t border-slate-700/30 dark:border-zinc-800/60 flex flex-col gap-2.5 font-sans">
            {/* Header section with telemetry feel */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-400 font-semibold text-[11px] uppercase tracking-wider">
                    <Cpu className={`w-3.5 h-3.5 text-teal-400 ${isOnline ? 'animate-pulse' : ''}`} />
                    <span>GPU 算力集群</span>
                    <span className="text-[9px] text-slate-500 dark:text-zinc-500 font-normal normal-case">
                        ({gpus.length}卡)
                    </span>
                    {llmInfo?.loaded && (
                        <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/15">
                            <Brain className="w-2.5 h-2.5" />
                            LLM 已加载
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold transition-all duration-300 ${
                        isOnline
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                            : 'bg-rose-500/5 text-slate-500 dark:text-zinc-500 border border-slate-800/80 dark:border-zinc-800/85'
                    }`}>
                        <span className={`w-1 h-1 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-slate-600 dark:bg-zinc-600'}`}></span>
                        <span>{isOnline ? '已联通' : hasStaleSnapshot ? '已过期' : '未联通'}</span>
                    </span>

                    {/* Refresh Button */}
                    <button
                        onClick={() => fetchAllGpuData(true)}
                        disabled={isRefreshing}
                        className="p-1 hover:bg-slate-800/50 dark:hover:bg-zinc-800/50 rounded-md text-slate-400 dark:text-zinc-400 hover:text-teal-400 dark:hover:text-teal-400 transition-colors cursor-pointer"
                        title="重试 / 刷新 Prometheus 仪表"
                    >
                        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
                    </button>
                </div>
            </div>

            {/* List containers */}
            <div className="flex flex-col gap-2">
                {loading ? (
                    <div className="py-2 text-center text-xs text-slate-500 dark:text-zinc-500 animate-pulse flex items-center justify-center gap-1.5">
                        <Server className="w-3.5 h-3.5 animate-bounce" />
                        <span>检测算力资源中...</span>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-1.5">
                            {gpus.map((gpu) => renderGpuCard(gpu, isOnline || hasStaleSnapshot))}
                        </div>

                        {/* Offline notice */}
                        {!isOnline && (
                            <div className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/10 flex items-start gap-2 animate-fade-in">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                <div className="flex-1 text-[10px] text-slate-400 dark:text-zinc-400 leading-normal">
                                    <span className="text-rose-400 font-semibold block mb-0.5">
                                        {hasStaleSnapshot ? `实时监控已过期，最后读取于 ${lastSuccessfulTime}` : '未检测到实时监控'}
                                    </span>
                                    {hasStaleSnapshot ? '当前显示的是内存中的最后一次成功读取值。' : '暂未读取到实时 GPU 指标。'}{NETWORK_HELP_TEXT}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
