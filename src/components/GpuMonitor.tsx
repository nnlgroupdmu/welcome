import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, RefreshCw, Cpu, Server, CheckCircle2, AlertCircle } from 'lucide-react';

interface PrometheusResult {
    metric: {
        gpu: string;
        modelName: string;
        [key: string]: string;
    };
    value: [number, string];
}

interface GpuInfo {
    id: string;
    model: string;
    utilization: number;
}

// 默认预置的 GPU 集群节点（离线/未联通时作为优雅后备展示）
const PRESET_GPUS: GpuInfo[] = [
    { id: 'GPU 0', model: 'NVIDIA RTX 5090 D', utilization: 0 },
    { id: 'GPU 1', model: 'NVIDIA RTX 5090 D', utilization: 0 },
];

export const GpuMonitor: React.FC = () => {
    const [gpus, setGpus] = useState<GpuInfo[]>(PRESET_GPUS);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const fetchGpuMetrics = async (showPulse = false) => {
        if (showPulse) setIsRefreshing(true);
        const promql = "DCGM_FI_DEV_GPU_UTIL";
        const urls = [
            `http://100.68.153.123:9091/api/v1/query?query=${encodeURIComponent(promql)}`,
            `http://192.168.31.240:9091/api/v1/query?query=${encodeURIComponent(promql)}`
        ];

        const fetchSinglePath = async (url: string) => {
            const controller = new AbortController();
            const timerId = setTimeout(() => controller.abort(), 1800);
            try {
                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timerId);
                if (!response.ok) throw new Error();
                const resData = await response.json();
                if (resData.status === "success" && resData.data?.result) {
                    return resData.data.result as PrometheusResult[];
                }
                throw new Error();
            } catch (e) {
                clearTimeout(timerId);
                throw e;
            }
        };

        try {
            const rawResults = await Promise.any(urls.map(url => fetchSinglePath(url)));
            const formattedGpus = rawResults.map((item: any) => ({
                id: `GPU ${item.metric.gpu}`,
                model: item.metric.modelName || 'RTX 5090 D',
                utilization: Math.min(100, Math.max(0, parseInt(item.value[1], 10) || 0)),
            }));
            formattedGpus.sort((a, b) => a.id.localeCompare(b.id));
            setGpus(formattedGpus);
            setIsOnline(true);
        } catch (err) {
            setIsOnline(false);
            // 离线时恢复预置的节点，使其作为结构完整的展示
            setGpus(PRESET_GPUS);
        } finally {
            setLoading(false);
            setTimeout(() => {
                setIsRefreshing(false);
            }, 600);
        }
    };

    useEffect(() => {
        fetchGpuMetrics();
        const timer = setInterval(() => fetchGpuMetrics(false), 8000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full mt-2 pt-2 border-t border-slate-700/30 flex flex-col gap-2.5 font-sans">
            {/* Header section with telemetry feel */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                    <Cpu className={`w-3.5 h-3.5 text-teal-400 ${isOnline ? 'animate-pulse' : ''}`} />
                    <span>GPU 算力集群</span>
                    <span className="text-[9px] text-slate-500 font-normal normal-case">
                        ({gpus.length}卡)
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold transition-all duration-300 ${
                        isOnline 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                            : 'bg-rose-500/5 text-slate-500 border border-slate-800/80'
                    }`}>
                        <span className={`w-1 h-1 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
                        <span>{isOnline ? '已联通' : '未联通'}</span>
                    </span>

                    {/* Refresh Button */}
                    <button
                        onClick={() => fetchGpuMetrics(true)}
                        disabled={isRefreshing}
                        className="p-1 hover:bg-slate-800/50 rounded-md text-slate-400 hover:text-teal-400 transition-colors cursor-pointer"
                        title="重试 / 刷新 Prometheus 仪表"
                    >
                        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
                    </button>
                </div>
            </div>

            {/* List containers with AnimatePresence */}
            <div className="flex flex-col gap-2">
                {loading ? (
                    <div className="py-2 text-center text-xs text-slate-500 animate-pulse flex items-center justify-center gap-1.5">
                        <Server className="w-3.5 h-3.5 animate-bounce" />
                        <span>检测算力资源中...</span>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-1.5">
                            {gpus.map((gpu, index) => {
                                const isHighLoad = gpu.utilization > 70;
                                const isMediumLoad = gpu.utilization > 30 && gpu.utilization <= 70;
                                
                                // Elegant gradient color palettes
                                const barColorClass = !isOnline 
                                    ? 'bg-slate-800' 
                                    : isHighLoad 
                                        ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                                        : isMediumLoad 
                                            ? 'bg-gradient-to-r from-teal-500 to-cyan-400' 
                                            : 'bg-gradient-to-r from-emerald-500 to-teal-400';
                                
                                const textColorClass = !isOnline 
                                    ? 'text-slate-600' 
                                    : isHighLoad 
                                        ? 'text-rose-400' 
                                        : 'text-teal-400';

                                return (
                                    <div 
                                        key={gpu.id} 
                                        className="group relative flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-800/20 transition-all duration-300"
                                    >
                                        {/* Left Side: Node Info */}
                                        <div className="flex flex-col min-w-0 pr-2">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[12px] font-bold ${isOnline ? 'text-slate-200' : 'text-slate-500'}`}>
                                                    {gpu.id}
                                                </span>
                                                {isOnline && gpu.utilization > 0 && (
                                                    <span className="flex h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />
                                                )}
                                            </div>
                                            <span className="text-[9px] text-slate-500 font-mono font-medium tracking-tight whitespace-nowrap">
                                                {gpu.model}
                                            </span>
                                        </div>

                                        {/* Right Side: Data Telemetry with custom thin slider */}
                                        <div className="flex flex-col items-end gap-1 shrink-0 w-[100px]">
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-[8px] text-slate-500 uppercase tracking-wider">
                                                    UTIL
                                                </span>
                                                <span className={`text-[11px] font-extrabold font-mono transition-colors duration-500 ${textColorClass}`}>
                                                    {isOnline ? `${gpu.utilization}%` : 'OFFLINE'}
                                                </span>
                                            </div>
                                            
                                            {/* Beautiful rounded progress trace */}
                                            <div className="w-full h-[3px] bg-slate-800/80 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: isOnline ? `${gpu.utilization}%` : '0%' }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                    className={`h-full rounded-full ${barColorClass}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Offline notice (helps users understand how to connect) */}
                        {!isOnline && (
                            <div className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/10 flex items-start gap-2 animate-fade-in">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                <div className="flex-1 text-[10px] text-slate-400 leading-normal">
                                    <span className="text-rose-400 font-semibold block mb-0.5">未检测到实时监控</span>
                                    物理内网接口响应超时。欲载入集群真实负载，宿舍/校外请确保 <code className="text-teal-400 font-mono px-0.5 bg-slate-950 rounded">Tailscale</code> 运行且顶部连通路线为【TS专网】。
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
