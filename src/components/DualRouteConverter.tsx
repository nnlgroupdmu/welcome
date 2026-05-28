import React, { useState } from 'react';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';

export default function DualRouteConverter() {
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
      className="relative border border-dashed border-indigo-200 bg-linear-to-b from-white to-slate-50/40 rounded-xl p-4 transition-all hover:shadow-xs flex flex-col gap-3.5 text-left"
    >
      {/* Target/Header line */}
      <div className="flex items-start gap-3 min-w-0">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-150/60 shrink-0">
          <ArrowLeftRight className="w-4.5 h-4.5 animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-slate-800 text-sm tracking-tight leading-snug">
              智能地址转换
            </h4>
            <span className="bg-indigo-100 text-indigo-700 font-mono text-[9px] px-1 border border-indigo-200 rounded-sm font-semibold">
              内网小助手
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
            粘贴含内网或专网地址的文本，智能识别后提供复制使用。
          </p>
        </div>
      </div>

      {/* Neat compact Input */}
      <div className="relative">
        <input 
          id="input-card-converter"
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="192.168.31.240 [:端口或路径等任意文本]"
          className="w-full px-3 py-1.5 pr-8 border border-slate-200 rounded-lg text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-700 placeholder:text-slate-400 shadow-xs"
        />
        {inputUrl && (
          <button
            onClick={() => setInputUrl('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-sm bg-transparent border-0 cursor-pointer p-1"
            title="清除内容"
          >
            &times;
          </button>
        )}
      </div>

      {/* Output Buttons Row (Swapped order: Tailscale left, Physical LAN right) */}
      <div className="grid grid-cols-2 gap-2.5 w-full pt-1.5 border-t border-slate-100">
        {/* Tailscale Route Action */}
        <button
          id="btn-copy-card-ts"
          disabled={!resolvedTs}
          className={`py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 border-solid text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition duration-100 ${
            !resolvedTs 
              ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200' 
              : 'cursor-pointer'
          }`}
          onClick={() => handleCopy(resolvedTs, 'ts')}
          title={inputUrl ? `复制 Tailscale 虚拟端链接: ${resolvedTs}` : `复制 Tailscale 原始服务器端 IP: ${TS_IP}`}
        >
          {copiedType === 'ts' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce shrink-0" />
              <span>已复制 IP</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{inputUrl ? '转换 Tailscale 链接' : '原始 Tailscale IP'}</span>
            </>
          )}
        </button>

        {/* Physical LAN Route Action */}
        <button
          id="btn-copy-card-lan"
          disabled={!resolvedLan}
          className={`py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 border-solid text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition duration-100 ${
            !resolvedLan 
              ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200' 
              : 'cursor-pointer'
          }`}
          onClick={() => handleCopy(resolvedLan, 'lan')}
          title={inputUrl ? `复制物理局域网链接: ${resolvedLan}` : `复制物理内网原始服务器 IP: ${LAN_IP}`}
        >
          {copiedType === 'lan' ? (
            <>
              <Check className="w-3.5 h-3.5 text-indigo-600 animate-bounce shrink-0" />
              <span>已复制 IP</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{inputUrl ? '转换物理内网链接' : '原始物理内网 IP'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
