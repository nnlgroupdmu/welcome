import { AnimatePresence, motion } from 'motion/react';
import { Github, Mail, Monitor, Moon, Sun, Terminal } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

type AppHeaderBarProps = {
  copiedId: string | null;
  handleCopyToClipboard: (text: string, id: string) => void;
  handleRefreshAndCheck: () => void;
  handleRoutePreferenceChange: (preference: 'tailscale' | 'lan') => void;
  isThemeDropdownOpen: boolean;
  lanLatency: number | null;
  lanStatus: 'unchecked' | 'testing' | 'connected' | 'error';
  latency: number | null;
  routePreference: 'tailscale' | 'lan';
  setIsThemeDropdownOpen: Dispatch<SetStateAction<boolean>>;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  tailscaleStatus: 'unchecked' | 'testing' | 'connected' | 'error';
  themeMode: 'light' | 'dark' | 'system';
};

export function AppHeaderBar({
  copiedId,
  handleCopyToClipboard,
  handleRefreshAndCheck,
  handleRoutePreferenceChange,
  isThemeDropdownOpen,
  lanLatency,
  lanStatus,
  latency,
  routePreference,
  setIsThemeDropdownOpen,
  setThemeMode,
  tailscaleStatus,
  themeMode,
}: AppHeaderBarProps) {
  const isTailscale = routePreference === 'tailscale';
  const currentStatus = isTailscale ? tailscaleStatus : lanStatus;
  const currentLatency = isTailscale ? latency : lanLatency;
  const networkName = isTailscale ? 'Tailscale专网' : '物理内网';

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-zinc-800/90 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 grid grid-cols-2 sm:flex sm:flex-row items-center justify-between gap-y-3 gap-x-4">
        <div className="flex items-center gap-2.5 col-span-1 justify-self-start">
          <div className="p-1.5 bg-slate-900 text-teal-400 rounded-lg flex items-center justify-center shrink-0 shadow-xs">
            <Terminal className="w-4 h-4" />
          </div>
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            NNL Group Lab
          </h1>
        </div>

        <div className="contents sm:flex sm:items-center sm:gap-3 sm:gap-4 sm:shrink-0 sm:flex-wrap sm:justify-end">
          <div className="flex items-center gap-1.5 sm:gap-2 col-span-1 justify-self-end">
            <a
              id="btn-link-github"
              href="https://github.com/nnlgroupdmu/welcome"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="访问 GitHub 仓库"
            >
              <Github className="w-5 h-5" />
            </a>
            <button
              id="btn-link-contact"
              onClick={() => handleCopyToClipboard('mistiiixv@gmail.com', 'admin-email')}
              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer relative"
              title={copiedId === 'admin-email' ? '邮箱已复制！' : '复制管理员邮箱 (mistiiixv@gmail.com)'}
            >
              <Mail className="w-5 h-5" />
              {copiedId === 'admin-email' && (
                <span className="absolute top-full mt-1 right-0 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded shadow-sm whitespace-nowrap z-50">
                  已复制
                </span>
              )}
            </button>

            <div className="relative inline-block text-left select-none" id="theme-dropdown-container">
              <button
                id="btn-toggle-theme"
                onClick={() => setIsThemeDropdownOpen(prev => !prev)}
                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center min-w-[36px] min-h-[36px]"
                title="主题设置"
              >
                <motion.div
                  key={themeMode}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {themeMode === 'light' && <Sun className="w-5 h-5 text-amber-500" />}
                  {themeMode === 'dark' && <Moon className="w-5 h-5 text-indigo-400" />}
                  {themeMode === 'system' && <Monitor className="w-5 h-5 text-slate-400 dark:text-slate-300" />}
                </motion.div>
              </button>

              <AnimatePresence>
                {isThemeDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsThemeDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-lg py-1.5 z-50 overflow-hidden"
                    >
                      {[
                        { mode: 'light' as const, label: '浅色模式', icon: <Sun className="w-3.5 h-3.5 shrink-0" />, activeClass: 'bg-amber-50/70 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' },
                        { mode: 'dark' as const, label: '深色模式', icon: <Moon className="w-3.5 h-3.5 shrink-0" />, activeClass: 'bg-indigo-50/70 dark:bg-indigo-950/20 text-indigo-400 dark:text-indigo-400' },
                        { mode: 'system' as const, label: '跟随系统', icon: <Monitor className="w-3.5 h-3.5 shrink-0" />, activeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100' },
                      ].map(item => (
                        <button
                          key={item.mode}
                          onClick={() => {
                            setThemeMode(item.mode);
                            setIsThemeDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer text-left ${
                            themeMode === item.mode
                              ? item.activeClass
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>

          <div className={`p-1 rounded-full border transition-all duration-350 flex items-center gap-1.5 select-none shadow-xs shrink-0 col-span-2 justify-self-center sm:col-span-1 sm:justify-self-auto ${
            isTailscale
              ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/15'
              : 'bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/15'
          }`}>
            <AnimatePresence mode="wait">
              {currentStatus === 'testing' ? (
                <motion.div
                  key={`testing-${routePreference}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeInOut', delay: 0.2 } }}
                  exit={{ opacity: 0, x: 4, transition: { duration: 0.4, ease: 'easeInOut' } }}
                  className="pl-3 pr-1 py-0.5 text-slate-500 text-[11px] font-bold flex items-center gap-1.5 select-none animate-pulse"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isTailscale ? 'bg-emerald-400' : 'bg-indigo-500'}`}></span>
                  <span>{networkName} 诊断中...</span>
                </motion.div>
              ) : currentStatus === 'connected' ? (
                <motion.button
                  id="btn-network-status"
                  key={`connected-${routePreference}`}
                  type="button"
                  onClick={handleRefreshAndCheck}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeInOut', delay: 0.2 } }}
                  exit={{ opacity: 0, x: 4, transition: { duration: 0.4, ease: 'easeInOut' } }}
                  className={`pl-3 pr-1.5 py-0.5 ${isTailscale ? 'text-emerald-700 hover:text-emerald-800' : 'text-indigo-700 hover:text-indigo-800'} hover:bg-black/5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all duration-300 cursor-pointer select-none whitespace-nowrap overflow-hidden`}
                  title={`当前路线 [${networkName}] 已联通。点击重新发起网络检验。`}
                >
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isTailscale ? 'bg-emerald-400' : 'bg-indigo-400'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isTailscale ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
                  </span>
                  <span>{networkName}: 已联通 ({currentLatency}ms)</span>
                </motion.button>
              ) : (
                <motion.button
                  id="btn-network-status"
                  key={`error-${routePreference}`}
                  type="button"
                  onClick={handleRefreshAndCheck}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeInOut', delay: 0.2 } }}
                  exit={{ opacity: 0, x: 4, transition: { duration: 0.4, ease: 'easeInOut' } }}
                  className="pl-3 pr-1.5 py-0.5 text-rose-700 hover:text-rose-800 hover:bg-black/5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all duration-300 cursor-pointer select-none whitespace-nowrap overflow-hidden"
                  title={`当前路线 [${networkName}] 未联通。点击重试诊断。`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                  <span>{networkName}: 未联通 (点击重测)</span>
                </motion.button>
              )}
            </AnimatePresence>

            <div className={`h-4.5 w-[1px] transition-colors duration-300 ${isTailscale ? 'bg-emerald-500/20' : 'bg-indigo-500/20'}`} />

            <button
              id="header-toggle-route-pure-capsule"
              type="button"
              onClick={() => handleRoutePreferenceChange(isTailscale ? 'lan' : 'tailscale')}
              className="relative w-11 h-5.5 bg-slate-200/80 hover:bg-slate-200 rounded-full cursor-pointer transition-all duration-300 p-0.5 select-none shrink-0 border border-slate-300/30 focus:outline-hidden"
              title={`当前网络连接路由：${isTailscale ? 'Tailscale 专网 (点击切换为物理内网)' : '物理内网直连 (点击切换为 Tailscale)'}`}
            >
              <div
                className={`w-4 h-4 rounded-full shadow-xs transition-all duration-300 transform flex items-center justify-center ${
                  isTailscale
                    ? 'translate-x-0 bg-emerald-500 text-white shadow-emerald-500/10'
                    : 'translate-x-[20px] bg-indigo-600 text-white shadow-indigo-600/10'
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
