import { Sparkles } from 'lucide-react';
import { GpuMonitor } from './GpuMonitor';
import { NETWORK_HELP_TEXT } from '../appConfig';

export function AppWelcomeBanner() {
  return (
    <section id="welcome-banner" className="bg-slate-900 dark:bg-zinc-900 text-white relative pt-12 pb-10 border-b border-slate-800 dark:border-zinc-800 overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[400px] bg-gradient-to-r from-teal-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8 lg:gap-12">
          <div className="max-w-2xl lg:max-w-3xl space-y-2.5 flex-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse shrink-0" />
              <span className="font-mono">Move as we wish, shine as we are.</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
              在这里，由你来定义你的方向，<br className="hidden sm:inline" />
              即刻闪亮启程。
            </h2>

            <p className="text-slate-400 dark:text-zinc-400 text-sm leading-relaxed max-w-2xl">
              欢迎加入我们的实验室！科研生活将因你的创造力保持精彩。这是一个为每一位团队成员打造的资源共享中心。无论你在宿舍还是在实验室，我们都已为你搭建好畅通无阻的技术桥梁，只为支撑你每一个不设限的奇思妙想。
            </p>
          </div>

          <div className="w-full md:max-w-[340px] p-4.5 rounded-2xl bg-slate-950/45 dark:bg-zinc-950/45 border border-slate-800/80 dark:border-zinc-800/85 backdrop-blur-md shadow-2xl shrink-0 self-start md:self-center flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-duration-1000"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-400 border border-teal-500/20 shadow-[0_0_6px_rgba(45,212,191,0.5)]"></span>
                </span>
                <span className="text-[11px] font-bold text-slate-200 dark:text-zinc-200 tracking-wider uppercase">物理内网 / Tailscale 双路连接</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-400 leading-normal">
                {NETWORK_HELP_TEXT}
              </p>
            </div>
            <GpuMonitor />
          </div>
        </div>
      </div>
    </section>
  );
}
