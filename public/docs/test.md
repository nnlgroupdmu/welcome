# 🚀 NNL 实验室公共门户
> 算力引领视界，数据驱动未来。本站为实验室内部资源共享与对外展示平台。

---

### 📂 站内导航 (快速跳转)
<div class="portal-grid">
  <a class="portal-card mini-card" href="#/docs/env">
    <div class="card-icon-mini">🛠️</div>
    <h4>环境配置</h4>
    <p>Cuda、Pytorch 版本及多卡并行环境搭建指南</p>
  </a>
  <a class="portal-card mini-card" href="#/docs/docker">
    <div class="card-icon-mini">📦</div>
    <h4>镜像打包</h4>
    <p>实验室 Docker 基础镜像使用与规范化打包</p>
  </a>
  <a class="portal-card mini-card" href="#/docs/rules">
    <div class="card-icon-mini">📊</div>
    <h4>实验规范</h4>
    <p>数据集存放路径规则与算力资源申请流程</p>
  </a>
  <a class="portal-card mini-card" href="#/docs/about">
    <div class="card-icon-mini">ℹ️</div>
    <h4>服务器指引</h4>
    <p>存储挂载、端口映射等核心硬件操作细节</p>
  </a>
</div>

### ⚡ 内网专区 (核心资产)
<div class="portal-grid">
  <a class="portal-card app-card" href="http://100.68.153.123:5230" target="_blank">
    <div class="card-badge pulse-badge">LIVE</div>
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

  <a class="portal-card app-card" href="http://100.68.153.123:5244" target="_blank">
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

### 📰 资讯专区 (Memos #精选 动态)
<div class="portal-grid single-col">
  <div class="portal-card feed-card">
    <div class="card-icon">📌</div>
    <div class="card-content" style="width: 100%;">
      <h4>实验室精选动态</h4>
      <p style="margin-bottom: 20px !important;">带上 #精选 标签的 Memos 笔记将自动在此同步。</p>
      
      <ul id="memos-hot-list" class="memos-list">
        <li class="memos-loading">正在同步最新动态...</li>
      </ul>
    </div>
  </div>
</div>

### 💻 终端快速连接
<details class="cmd-details-box">
  <summary class="portal-card cmd-summary-card">
    <div class="card-icon-mini">⚙️</div>
    <div style="flex: 1;">
      <h4 style="margin: 0; font-size: 16px;">SSH 快速连接与常用运维指令</h4>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #6a737d;">点击展开查看终端接入代码</p>
    </div>
    <div class="arrow-icon">▼</div>
  </summary>
  <div class="cmd-content">

```bash
# 1. 通过局域网或 Tailscale 节点接入
ssh -p 22 你的用户名@192.168.31.240

# 2. 查看当前 GPU 实时拓扑结构与负载
nvidia-smi topo -m