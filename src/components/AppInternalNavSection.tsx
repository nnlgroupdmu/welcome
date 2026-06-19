import { motion } from 'motion/react';
import { BookOpen, ChevronRight, Laptop } from 'lucide-react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { NavItem } from '../types';

type AppInternalNavSectionProps = {
  activeCategory: string;
  allNavCategories: string[];
  filteredNavItems: NavItem[];
  getCategoryIcon: (category: string) => ReactNode;
  isNavExpanded: boolean;
  setActiveCategory: (category: string) => void;
  setIsNavExpanded: Dispatch<SetStateAction<boolean>>;
};

export function AppInternalNavSection({
  activeCategory,
  allNavCategories,
  filteredNavItems,
  getCategoryIcon,
  isNavExpanded,
  setActiveCategory,
  setIsNavExpanded,
}: AppInternalNavSectionProps) {
  const visibleItems = isNavExpanded ? filteredNavItems : filteredNavItems.slice(0, 4);

  return (
    <section id="section-internal-nav" className="bg-gradient-to-b from-white to-slate-50/50 dark:from-zinc-900 dark:to-zinc-900/40 rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-all duration-300 p-6 flex flex-col relative overflow-hidden order-1 lg:order-none">
      <div>
        <div className="flex items-center justify-between mb-5 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 rounded-lg">
              <Laptop className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">文档教程</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500">环境配置、资源使用规则和技术手册</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {allNavCategories.map(tab => {
            const isActive = activeCategory === tab;
            return (
              <button
                id={`btn-nav-tab-${tab}`}
                key={tab}
                onClick={() => setActiveCategory(tab)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 overflow-hidden cursor-pointer ${isActive
                  ? 'text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200/50 dark:hover:bg-zinc-700/60 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-slate-100 font-semibold'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryBg"
                    className="absolute inset-0 bg-teal-600"
                    transition={{ type: 'tween', ease: 'easeInOut', duration: 0.22 }}
                  />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredNavItems.length > 0 ? (
            visibleItems.map(item => (
              <a
                id={`nav-card-${item.id}`}
                key={item.id}
                href={item.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4.5 cursor-pointer bg-gradient-to-br from-white to-slate-50/40 dark:from-zinc-900/85 dark:to-zinc-900/10 hover:from-teal-50/10 hover:to-teal-50/30 hover:border-teal-400/60 dark:hover:border-teal-500/50 hover:shadow-xs transition-all duration-300 flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex items-start justify-between mb-3.5">
                    <span className="p-1.5 bg-slate-50 dark:bg-zinc-800 group-hover:bg-teal-100/60 dark:group-hover:bg-teal-950/60 rounded-lg transition-colors">
                      {getCategoryIcon(item.categories?.[0] || '其他')}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm group-hover:text-teal-950 dark:group-hover:text-teal-400 transition-colors mb-1.5 line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-teal-600 dark:text-teal-400 pt-2 border-t border-slate-100/85 dark:border-zinc-800/85 gap-2">
                  <div className="flex flex-wrap gap-1">
                    {item.categories?.map(cat => (
                      <span key={cat} className="bg-slate-100 dark:bg-zinc-800 group-hover:bg-teal-50/50 dark:group-hover:bg-teal-950/50 text-slate-600 dark:text-zinc-400 group-hover:text-teal-800 dark:group-hover:text-teal-300 rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap transition-colors">{cat}</span>
                    ))}
                  </div>
                  <span className="flex items-center gap-0.5 font-mono group-hover:translate-x-0.5 transition-transform shrink-0">
                    阅读指南 <ChevronRight className="w-3 h-3 text-teal-500" />
                  </span>
                </div>
              </a>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-zinc-900/60 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 dark:text-zinc-405">没有检索到相应的直达文档</p>
            </div>
          )}
        </div>

        {filteredNavItems.length > 4 && (
          <div className="flex justify-center mt-5 pt-4 border-t border-slate-100/80 dark:border-zinc-800">
            <button
              id="btn-toggle-nav-expand"
              onClick={() => setIsNavExpanded(!isNavExpanded)}
              className="px-4 py-1.5 bg-slate-50 dark:bg-zinc-900 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-slate-200 dark:border-zinc-800 hover:border-teal-300/80 dark:hover:border-teal-500/50 text-teal-700 dark:text-teal-400 hover:text-teal-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
            >
              {isNavExpanded ? '收起部分指南' : `展开更多指南 (还有 ${filteredNavItems.length - 4} 篇)`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
