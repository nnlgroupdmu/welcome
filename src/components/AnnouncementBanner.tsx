export default function AnnouncementBanner() {
  // 稳妥获取基础路径，防止本地 undefined 崩掉
  const baseUrl = import.meta.env ? import.meta.env.BASE_URL : '/';
  const docsUrl = `${baseUrl}docs/index.html`;

  return (
    <div style={{
      backgroundColor: '#1e293b', // 改成深色系（slate-800），更搭你页面的 tech-grid-bg 风格
      color: '#38bdf8', // 亮蓝色文字提示
      padding: '12px 20px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      borderBottom: '1px solid #334155'
    }}>
      <span style={{ color: '#f8fafc' }}>
        📢 <b>通知：</b> 新主页施工中，请访问 旧版实验室 Docsify 知识库
      </span>
      <a 
        href={docsUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          color: '#ffffff',
          backgroundColor: '#0284c7',
          padding: '4px 12px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '12px',
          fontWeight: '600',
          display: 'inline-block'
        }}
      >
        立即前往 →
      </a>
    </div>
  );
}