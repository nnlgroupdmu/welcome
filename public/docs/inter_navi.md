# 实验室内网服务导航

<div class="nav-container">

  <a class="nav-card" href="http://100.68.153.123:5230" target="_blank">
    <div class="card-icon">🔥</div>
    <div class="card-content">
      <h4>Memos 实验室广场</h4>
      <p>属于大家的动态分享区与碎片化博客。在这里同步你的炼丹进度与灵感闪现。</p>
    </div>
    <div class="card-links">
      <span class="link-tag internal" onclick="window.open('http://192.168.31.240:5230'); event.preventDefault();">内网直连</span>
      <span class="link-tag vpn">Tailscale</span>
    </div>
  </a>

  <a class="nav-card" href="http://100.68.153.123:5244" target="_blank">
    <div class="card-icon">🗄️</div>
    <div class="card-content">
      <h4>AList 软件仓库</h4>
      <p>存放实验所需的静态软件包、基础镜像和归档数据集。支持高速直链复制与下载。</p>
    </div>
    <div class="card-links">
      <span class="link-tag internal" onclick="window.open('http://192.168.31.240:5244'); event.preventDefault();">内网直连</span>
      <span class="link-tag vpn">Tailscale</span>
    </div>
  </a>

</div>

<style>
  .nav-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 25px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  
  .nav-card {
    background: #ffffff;
    border: 1px solid #e1e4e8;
    border-radius: 12px;
    padding: 24px;
    width: calc(50% - 10px);
    min-width: 280px;
    box-sizing: border-box;
    position: relative;
    text-decoration: none !important;
    color: inherit !important;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
  }
  
  .nav-card:hover {
    transform: translateY(-4px);
    border-color: #42b983; /* Docsify 主题绿，可改为你的5090红色 */
    box-shadow: 0 12px 20px rgba(0,0,0,0.08);
  }
  
  .card-icon {
    font-size: 28px;
    margin-bottom: 12px;
  }
  
  .card-content h4 {
    margin: 0 0 8px 0 !important;
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .card-content p {
    font-size: 13px !important;
    line-height: 1.6 !important;
    color: #6a737d !important;
    margin: 0 0 16px 0 !important;
  }
  
  .card-links {
    display: flex;
    gap: 8px;
  }
  
  .link-tag {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .link-tag.internal {
    background: #e6f7ff;
    color: #0050b3;
  }
  .link-tag.internal:hover { background: #bae7ff; }
  
  .link-tag.vpn {
    background: #f6ffed;
    color: #237804;
  }
  
  /* 右上角 LIVE 闪烁微章 */
  .card-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    font-size: 9px;
    background: #fd9099;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
  }
  
  .pulse-badge {
    animation: cardPulse 2s infinite;
  }
  @keyframes cardPulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
  }
</style>

---

> 本页面列出的所有服务均运行于实验室局域网内。
> 在实验室 WiFi 网络外时，必须先开启 Tailscale 并连接到实验室虚拟网，否则无法打开链接。
> [👉 点击查看 Tailscale 虚拟局域网加入指南](vpn_guide.md)

