export function AppFooter() {
  return (
    <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center text-slate-400 dark:text-zinc-500 text-xs">
      <div className="border-t border-slate-200 dark:border-zinc-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono text-slate-400 dark:text-zinc-500">
          © 2026 NNL Group Lab | nnlgroupdmu
        </p>
        <div className="flex gap-4">
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">版本: v3.3.2-Build</span>
        </div>
      </div>
    </footer>
  );
}
