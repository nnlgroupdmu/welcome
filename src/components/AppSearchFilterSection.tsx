import { Search } from 'lucide-react';

type AppSearchFilterSectionProps = {
  allMemoTags: string[];
  searchQuery: string;
  selectedTag: string | null;
  setSearchQuery: (query: string) => void;
  setSelectedTag: (tag: string | null) => void;
};

export function AppSearchFilterSection({
  allMemoTags,
  searchQuery,
  selectedTag,
  setSearchQuery,
  setSelectedTag,
}: AppSearchFilterSectionProps) {
  return (
    <section id="search-filter-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200/90 dark:border-zinc-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-200">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-35 top-1/2 -translate-y-1/2" style={{ left: '0.85rem' }} />
          <input
            id="input-global-search"
            type="text"
            placeholder="搜索任何站内指南或备忘内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm bg-slate-50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-800 dark:text-zinc-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>筛选 Memos 笔记标签:</span>
          {allMemoTags.map(tag => (
            <button
              id={`btn-tag-filter-${tag}`}
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-1 rounded-md border font-medium transition cursor-pointer ${selectedTag === tag
                ? 'bg-teal-600 border-teal-600 text-white'
                : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200/80 dark:hover:bg-zinc-700/85 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800'
              }`}
            >
              #{tag}
            </button>
          ))}
          {selectedTag && (
            <button
              id="btn-clear-tag"
              onClick={() => setSelectedTag(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium ml-2 transition-colors cursor-pointer inline-flex items-center gap-0.5 bg-transparent border-0 p-0"
            >
              <span className="text-sm leading-none font-bold">&times;</span>
              <span>清除筛选</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
