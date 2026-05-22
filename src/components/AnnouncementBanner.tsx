import React from 'react';

export default function AnnouncementBanner() {
  // 🌟 动态获取项目根路径（如 /welcome/），确保在 GitHub Pages 部署后绝不迷路
  const baseUrl = import.meta.env.BASE_URL;
  const docsUrl = `${baseUrl}docs/index.html`;

  return (
    <div style={{
      backgroundColor: '#3b82f6', // 科技蓝，可根据你的主页色调微调
      color: '#ffffff',
      padding: '10px 20px',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      zIndex: 1000,
      position: 'relative'
    }}>
      <span>📢 <b>通知：</b>新主页施工中，请访问 旧版实验室 Docsify 知识库</span>
      <a 
        href={docsUrl} 
        target="_blank" 
        rel="noreferrer"
        style={{
          color: '#3b82f6',
          backgroundColor: '#ffffff',
          padding: '4px 12px',
          borderRadius: '4px',
          textDecoration: 'none',
          fontSize: '12px',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
        }}
      >
        立即前往 →
      </a>
    </div>
  );
}