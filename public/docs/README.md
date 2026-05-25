### 🏠主页

欢迎使用实验室最新的 5090 服务器！请参考[深度学习服务器指南](env/server_guide.md)进行配置。

服务器可在实验室 WiFi 局域网环境直接连接；公网环境请联系管理员获取 Tailscale 账号。

主站：[NNL Group Lab](https://nnlgroupdmu.github.io/welcome/)

### 内网专区

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
    display: grid;
    /* 核心核心：自动伸缩网格。每个卡片最少 280px，多了就平分并撑满 */
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 25px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  
  .nav-card {
    background: #ffffff;
    border: 1px solid #e1e4e8;
    border-radius: 12px;
    padding: 24px;
    /* 删掉之前的 width 和 min-width，交给 Grid 控制 */
    position: relative;
    text-decoration: none !important;
    color: inherit !important;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* 确保卡片底部的按钮能对齐 */
  }
  
  .nav-card:hover {
    transform: translateY(-4px);
    border-color: #42b983; 
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
    margin-top: auto; /* 强行把标签推进卡片最底部 */
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
</style>
---

> 本页面列出的所有服务均运行于实验室局域网内。
> 在实验室 WiFi 网络外时，必须先开启 Tailscale 并连接到实验室虚拟网，否则无法打开链接。
> [👉 点击查看 Tailscale 虚拟局域网加入指南](vpn_guide.md)

