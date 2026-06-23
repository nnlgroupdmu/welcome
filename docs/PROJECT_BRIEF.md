# 项目短摘要

## 项目定位

NNL Group Lab Open Hub 是实验室门户首页，面向成员的日常导航和文档访问。主站部署在 GitHub Pages，页面本身是静态 React/Vite 应用；实时 Memos 和 GPU/内网服务状态由访问者浏览器直接请求实验室内网 HTTP 服务。

## 主要功能

- 站内导航：展示服务器指南、Tailscale 入网、Memos、Markdown、Gitea 等实验室文档入口。
- 内网服务入口：提供 Memos、AList、Gitea、Grafana 等服务的 LAN/Tailscale 双路线访问。
- 外部快捷链接：提供学校邮箱、ChatGPT、研究生系统、Overleaf 等默认链接，并允许用户在浏览器本地增删改和排序。
- Memos 动态流：优先从内网 Memos API 拉取动态，失败时回退到内置默认内容。
- 网络诊断：检测 Tailscale 与物理局域网可达性，并自动选择或手动切换路线。
- 主题与视图偏好：支持浅色、深色、跟随系统主题，以及内网应用列表/图标视图。

## 技术栈

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- lucide-react 图标
- motion 动画
- react-markdown 与 emoji-picker-react
- Docsify 用于 `public/docs/` 在线文档站

## 常用命令

```bash
npm run dev
npm run lint
npm run build
npm run preview
npm run clean
```

## 网络模型

主站可从公网访问，但内网实时数据依赖访问者当前网络环境：

- 实验室 WiFi：优先使用 `192.168.31.240` 物理局域网地址。
- Tailscale：优先使用 `100.68.153.123` 专网地址。
- 若浏览器阻止 HTTP 私有网络请求，页面应继续保留导航和文档功能，并显示内置或离线内容。

网络端点、端口和超时配置集中在 `src/appConfig.ts`。

## 文档站关系

- 根目录 `docs/`：维护者和 AI 协作者阅读的工程文档。
- `public/docs/`：实验室成员在线阅读的 Docsify 文档站。
- 首页导航数据在 `src/data.ts` 中把部分卡片链接到 `public/docs/index.html#/...`。

## 维护提示

- 修改默认导航、默认内网服务、默认外部链接和默认 Memos：优先看 `src/data.ts`。
- 修改 LAN/Tailscale 主机、端口、请求超时和网络提示：优先看 `src/appConfig.ts`。
- 修改页面组合和全局状态：优先看 `src/App.tsx`。
- 修改单一区块 UI：优先看 `src/components/` 下对应组件。
- 不要把工程规格写进 `public/docs/`，除非它也适合普通实验室成员公开阅读。
