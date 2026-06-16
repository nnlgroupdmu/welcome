export default function AnnouncementBanner() {
  // 稳妥获取基础路径，防止本地 undefined 崩掉
  const meta = import.meta as any;
  const baseUrl = meta.env ? meta.env.BASE_URL : '/';
  const docsUrl = `${baseUrl}docs/index.html`;

  return (
    <div className="bg-slate-800 dark:bg-zinc-900 text-sky-400 dark:text-sky-300 px-5 py-3 text-center text-sm font-medium flex justify-center items-center gap-3 flex-wrap border-b border-slate-700 dark:border-zinc-800">
      <span className="text-slate-100 dark:text-zinc-100">
        📢 <b>通知：</b> 新主页施工中，请访问 旧版实验室 Docsify 知识库
      </span>
      <a 
        href={docsUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white bg-sky-600 dark:bg-sky-700 hover:bg-sky-500 dark:hover:bg-sky-600 px-3 py-1 rounded-md text-xs font-semibold inline-block transition-colors"
      >
        立即前往 →
      </a>
    </div>
  );
}