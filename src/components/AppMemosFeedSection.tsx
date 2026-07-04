import { motion } from 'motion/react';
import { Check, Clock, ExternalLink, PlusCircle, RefreshCw, Send, StickyNote } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { MemoPost, MemosCacheSource, MemosSyncStatus } from '../types';
import MemoContent from './MemoContent';
import { INTERNAL_ROUTES, NETWORK_HELP_TEXT, ROUTE_LABELS, type RoutePreference } from '../appConfig';

type AppMemosFeedSectionProps = {
  filteredMemos: MemoPost[];
  isMemosRefreshing?: boolean;
  memosFetchedAt: number | null;
  memosSource: MemosCacheSource | null;
  memosSyncStatus: MemosSyncStatus;
  routePreference: RoutePreference;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  setVisibleMemosCount: Dispatch<SetStateAction<number>>;
  visibleMemosCount: number;
};

export function AppMemosFeedSection({
  filteredMemos,
  isMemosRefreshing = false,
  memosFetchedAt,
  memosSource,
  memosSyncStatus,
  routePreference,
  selectedTag,
  setSelectedTag,
  setVisibleMemosCount,
  visibleMemosCount,
}: AppMemosFeedSectionProps) {
  const memosHost = INTERNAL_ROUTES[routePreference].memos;
  const formattedFetchedAt = memosFetchedAt
    ? new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(memosFetchedAt))
    : '';
  const sourceLabel = memosSource ? ROUTE_LABELS[memosSource] : ROUTE_LABELS[routePreference];
  const syncStatusText = (() => {
    if (isMemosRefreshing || memosSyncStatus === 'syncing') return '正在同步...';
    if (memosSyncStatus === 'live') return formattedFetchedAt ? `已同步于 ${formattedFetchedAt} · ${sourceLabel}` : '已同步';
    if (memosSyncStatus === 'cached-fresh') return formattedFetchedAt ? `缓存可用，上次同步于 ${formattedFetchedAt}` : '缓存可用';
    if (memosSyncStatus === 'cached-stale') return formattedFetchedAt ? `显示缓存，上次同步于 ${formattedFetchedAt}` : '显示缓存';
    if (memosSyncStatus === 'offline-cache') return formattedFetchedAt ? `离线缓存，上次同步于 ${formattedFetchedAt}` : '离线缓存';
    if (memosSyncStatus === 'error') return '同步失败，显示内置内容';
    return '等待同步';
  })();
  const isOfflineCache = memosSyncStatus === 'offline-cache' || memosSyncStatus === 'cached-stale' || memosSyncStatus === 'error';

  return (
    <section id="section-memos-feed" className="bg-gradient-to-b from-white to-slate-50/50 dark:from-zinc-900 dark:to-zinc-900/40 rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-all duration-300 p-6 flex flex-col relative overflow-hidden order-3 lg:order-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg">
            <StickyNote className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Memos 速递</h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500">在这里速览 Memos 笔记最新发布的内容；不可达时保留内置内容</p>
            <p className={`text-[11px] mt-1 flex items-center gap-1.5 ${isOfflineCache ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              <RefreshCw className={`w-3 h-3 ${isMemosRefreshing ? 'animate-spin' : ''}`} />
              {syncStatusText}
            </p>
          </div>
        </div>

        <a
          id="btn-post-new-memo"
          href={memosHost}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full sm:w-auto active:scale-95 duration-100 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer text-center ${
            routePreference === 'tailscale'
              ? 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-100/50 border border-emerald-500/10'
              : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-100/50 border border-indigo-500/10'
          }`}
        >
          <Send className="w-3.5 h-3.5" /> 发布一条笔记
        </a>
      </div>

      <div id="memos-feed-stream" className="space-y-5 w-full">
        {filteredMemos.length > 0 ? (
          filteredMemos.slice(0, visibleMemosCount).map((memo, index) => (
            <motion.div
              id={`memo-card-${memo.id}`}
              key={memo.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="group relative bg-gradient-to-br from-white to-slate-50/35 dark:from-zinc-900/85 dark:to-zinc-900/10 hover:from-white hover:to-teal-50/10 dark:hover:from-zinc-900 dark:hover:to-teal-950/10 border border-slate-200/80 dark:border-zinc-800 hover:border-teal-200/80 dark:hover:border-teal-500/50 rounded-2xl p-4.5 sm:p-5 transition-all duration-300 hover:shadow-sm overflow-hidden flex flex-col sm:flex-row gap-4.5 items-start"
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-teal-400 to-emerald-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />

              <div className="flex sm:flex-col items-center gap-2.5 w-full sm:w-28 shrink-0 text-left sm:text-center">
                {memo.avatarUrl ? (
                  <img
                    src={memo.avatarUrl.startsWith('http') ? memo.avatarUrl : `${memosHost}${memo.avatarUrl}`}
                    alt={memo.author}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200/80 dark:border-zinc-800/85 sm:mx-auto shadow-xs"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-zinc-800 text-teal-400 font-bold border border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-center text-sm font-mono sm:mx-auto shadow-xs">
                    {memo.avatarSeed.toUpperCase()}
                  </div>
                )}

                <a
                  href={`${memosHost}/${memo.author}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-left sm:text-center flex-1 sm:flex-initial group/author hover:opacity-80 transition"
                  title="打开作者 Memos 主页"
                >
                  <h4 className="font-bold text-xs text-slate-950 dark:text-zinc-200 line-clamp-1 group-hover/author:underline group-hover/author:text-teal-600 dark:group-hover/author:text-teal-400">
                    {memo.author}
                  </h4>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono flex items-center justify-start sm:justify-center gap-0.5 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {memo.timestamp}
                  </span>
                </a>
              </div>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {memo.tags.map(tag => (
                      <span
                        key={tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition ${selectedTag === tag
                          ? 'bg-teal-600 text-white'
                          : 'bg-teal-50/65 dark:bg-teal-950/30 text-teal-800 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-teal-100/50 dark:border-teal-900/50'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href={`${memosHost}/memos/${memo.rawId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`transition-all duration-200 px-2 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-semibold border border-transparent hover:shadow-xs active:scale-95 ${
                      routePreference === 'tailscale'
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/40 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                        : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/40 hover:bg-indigo-500 hover:text-white hover:border-indigo-500'
                    }`}
                    title={`查看原站详情 (${routePreference === 'tailscale' ? 'Tailscale 专网' : '物理局域网'})`}
                  >
                    查看详情
                    <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                  </a>
                </div>

                <MemoContent content={memo.content} memoId={memo.id} />
              </div>
            </motion.div>
          ))
        ) : (
          <div id="no-memos-fallback" className="py-16 text-center bg-white dark:bg-zinc-900/40 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
            <StickyNote className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">目前没有相关的实验室备忘随笔。</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto mt-1">
              请确认已接入 {ROUTE_LABELS[routePreference]}。{NETWORK_HELP_TEXT}
            </p>
          </div>
        )}

        {filteredMemos.length > 0 && (
          <div className="flex flex-col items-center justify-center pt-4 border-t border-slate-100/80 dark:border-zinc-800 gap-3">
            {filteredMemos.length > visibleMemosCount ? (
              <button
                id="btn-load-more-memos"
                key="load-more-btn"
                onClick={() => setVisibleMemosCount(prev => prev + 5)}
                className="px-6 py-2 bg-slate-50 dark:bg-zinc-900 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-slate-200 dark:border-zinc-800 hover:border-teal-300/80 dark:hover:border-teal-500/50 text-teal-700 dark:text-teal-400 hover:text-teal-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs shrink-0 active:scale-98"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                加载更多笔记 (还有 {filteredMemos.length - visibleMemosCount} 条)
              </button>
            ) : (
              <>
                <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  已加载 {filteredMemos.length} 条最新笔记
                </p>
                <a
                  id="btn-browse-memos-site"
                  href={memosHost}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98 border ${
                    routePreference === 'tailscale'
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                      : 'bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-500 hover:text-white hover:border-indigo-500'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  在 Memos 主站浏览更多
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
