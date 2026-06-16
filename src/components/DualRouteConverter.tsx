import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';

interface DualRouteConverterProps {
  isCompact?: boolean;
}

export default function DualRouteConverter({ isCompact = false }: DualRouteConverterProps) {
  const [inputUrl, setInputUrl] = useState('');
  const [copiedType, setCopiedType] = useState<'lan' | 'ts' | null>(null);

  const LAN_IP = '192.168.31.240';
  const TS_IP = '100.68.153.123';

  // Helper to resolve dual URLs
  const getDualUrls = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      // Default to copying the raw server IPs
      return { lan: LAN_IP, ts: TS_IP };
    }

    // Try normal replacing if IP is present
    if (trimmed.includes(LAN_IP)) {
      const fullUrl = trimmed.startsWith('http') ? trimmed : 'http://' + trimmed;
      return {
        lan: fullUrl,
        ts: fullUrl.replace(new RegExp(LAN_IP, 'g'), TS_IP)
      };
    }
    if (trimmed.includes(TS_IP)) {
      const fullUrl = trimmed.startsWith('http') ? trimmed : 'http://' + trimmed;
      return {
        lan: fullUrl.replace(new RegExp(TS_IP, 'g'), LAN_IP),
        ts: fullUrl
      };
    }

    // Fallback: If they only pasted a port or path, parse it cleanly
    const clean = trimmed;
    // Check if it's just a raw number (port)
    if (/^\d+$/.test(clean)) {
      return {
        lan: `http://${LAN_IP}:${clean}`,
        ts: `http://${TS_IP}:${clean}`
      };
    }

    // If it starts with colon (e.g. :5230/path)
    if (clean.startsWith(':')) {
      const portAndPath = clean.replace(/^:/, '');
      return {
        lan: `http://${LAN_IP}:${portAndPath}`,
        ts: `http://${TS_IP}:${portAndPath}`
      };
    }

    // If it's a relative path
    const path = clean.startsWith('/') ? clean : '/' + clean;
    return {
      lan: `http://${LAN_IP}${path}`,
      ts: `http://${TS_IP}${path}`
    };
  };

  const { lan: resolvedLan, ts: resolvedTs } = getDualUrls(inputUrl);

  const handleCopy = (text: string, type: 'lan' | 'ts') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1500);
  };

  return (
    <div 
      id="service-card-dual-converter"
      className={isCompact 
        ? "bg-slate-50/70 dark:bg-zinc-900/30 hover:bg-slate-100/40 dark:hover:bg-zinc-800/30 rounded-xl p-3 border border-slate-100/80 dark:border-zinc-800/60 transition-all flex flex-col gap-2.5 text-left" 
        : "relative border border-dashed border-indigo-200 dark:border-indigo-900/50 bg-linear-to-b from-white to-slate-50/40 dark:from-zinc-900 dark:to-zinc-950/20 rounded-xl p-4 transition-all hover:shadow-xs flex flex-col gap-3.5 text-left"
      }
    >
      {/* Target/Header line */}
      {!isCompact ? (
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-150/60 dark:border-indigo-900/50 shrink-0">
            <ArrowLeftRight className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-sm tracking-tight leading-snug">
                双路地址智能转换
              </h4>
              <span className="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-mono text-[9px] px-1 border border-indigo-200 dark:border-indigo-800/50 rounded-sm font-semibold">
                内网小助手
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-normal">
              复制服务器地址，或粘贴 192 内网或 100 专网地址后，点击复制转换地址。推荐分享给同学时转成 Tailscale 专网链接，方便校外访问。
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 truncate">双路地址智能转换</span>
          </div>
        </div>
      )}

      {/* Neat compact Input */}
      <div className="relative">
        <input 
          id="input-card-converter"
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder={isCompact ? "输入/粘贴地址如: 192.168..." : "192.168.31.240[:端口或路径等]"}
          className={`w-full pr-8 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-mono bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-700 dark:text-zinc-100 placeholder:text-slate-400 shadow-xs ${
            isCompact ? "px-2.5 py-1" : "px-3 py-1.5"
          }`}
        />
        {inputUrl && (
          <button
            onClick={() => setInputUrl('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 font-bold text-sm bg-transparent border-0 cursor-pointer p-0.5 animate-fade-in"
            title="清除内容"
          >
            &times;
          </button>
        )}
      </div>

      {/* Output Buttons Row */}
      <div className={`grid grid-cols-2 gap-2 w-full ${isCompact ? 'pt-0.5' : 'pt-1.5 border-t border-slate-150/40 dark:border-zinc-800'}`}>
        {/* Tailscale Route Action */}
        <button
          id="btn-copy-card-ts"
          disabled={!resolvedTs}
          className={`px-2 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 border-solid text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition duration-100 cursor-pointer ${
            isCompact ? 'py-1 text-[11px]' : 'py-1.5'
          } ${
            !resolvedTs 
              ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-zinc-800 shadow-none' 
              : 'cursor-pointer'
          }`}
          onClick={() => handleCopy(resolvedTs, 'ts')}
          title={inputUrl ? `复制 Tailscale 虚拟端链接: ${resolvedTs}` : `复制 Tailscale 原始服务器端 IP: ${TS_IP}`}
        >
          {copiedType === 'ts' ? (
            <>
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-bounce shrink-0" />
              <span>已复制 IP</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">{inputUrl ? '转 Tailscale' : '复制 Tailscale IP'}</span>
            </>
          )}
        </button>

        {/* Physical LAN Route Action */}
        <button
          id="btn-copy-card-lan"
          disabled={!resolvedLan}
          className={`px-2 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 border-solid text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition duration-100 cursor-pointer ${
            isCompact ? 'py-1 text-[11px]' : 'py-1.5'
          } ${
            !resolvedLan 
              ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-zinc-800 shadow-none' 
              : 'cursor-pointer'
          }`}
          onClick={() => handleCopy(resolvedLan, 'lan')}
          title={inputUrl ? `复制物理局域网链接: ${resolvedLan}` : `复制物理内网原始服务器 IP: ${LAN_IP}`}
        >
          {copiedType === 'lan' ? (
            <>
              <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 animate-bounce shrink-0" />
              <span>已复制 IP</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate">{inputUrl ? '转物理内网' : '复制物理 IP'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
