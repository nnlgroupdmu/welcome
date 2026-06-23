# AI 交接提示词

下面这段可以直接粘贴给 AI 编程助手，用于快速接手本项目。

```text
你正在维护 NNL Group Lab Open Hub，一个实验室门户网站项目。

项目定位：
- 这是面向实验室成员的日常导航和文档入口。
- 主站是静态 React/Vite 应用，部署在 GitHub Pages。
- 实时 Memos/GPU/内网服务数据由访问者浏览器直连实验室 HTTP 内网服务获取。
- 面向成员的在线指南在 public/docs/，由 Docsify 提供。
- 面向维护者和 AI 协作者的工程文档在 docs/。

技术栈：
- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- lucide-react
- motion
- react-markdown
- emoji-picker-react
- Docsify

常用命令：
- npm run dev
- npm run lint
- npm run build
- npm run preview
- npm run clean

核心文件：
- src/App.tsx：主应用状态、数据拉取、网络诊断、过滤逻辑、快捷链接管理和页面组装。
- src/appConfig.ts：LAN/Tailscale 主机、端口、超时、内部服务 URL 和网络说明。
- src/data.ts：默认导航卡片、内网服务、外部链接预设、兜底 Memos。
- src/types.ts：公开数据结构类型。
- src/clientUtils.ts：localStorage、JSON 解析、复制、fetch timeout 工具。
- src/components/：各页面区块组件。
- public/docs/：面向实验室成员的 Docsify 文档站。
- docs/：维护者和 AI 协作者工程文档。

关键数据类型：
- NavItem：站内文档导航卡片。
- ServiceAsset：内网服务卡片，包含 localUrl 和 tailscaleUrl。
- ExternalLinkAsset：外部快捷链接，支持 favicon、emoji、文字或 lucide 图标。
- MemoPost：Memos 动态流条目。

网络模型：
- LAN host: 192.168.31.240。
- Tailscale host: 100.68.153.123。
- 页面同时支持物理局域网和 Tailscale 专网路线。
- 访问者不在内网或浏览器阻止 HTTP 私有网络请求时，页面应保留静态导航和文档能力，并回退到内置内容。

本地持久化键：
- seal_external_links
- seal_intranet_view_mode
- seal_external_shortcut_expanded
- seal_theme_mode

维护约束：
- 不要把工程维护文档混入 public/docs/，除非它也适合普通成员公开阅读。
- 不要随意改动内网地址、端口、管理员邮箱或 GitHub 仓库链接；这些是项目配置事实。
- 修改默认内容优先走 src/data.ts，修改网络配置优先走 src/appConfig.ts。
- 保持页面在公网但无内网连接时仍可用。
- 改动后至少运行 npm run lint；涉及构建或资源路径时运行 npm run build。

常见任务：
- 新增文档入口：修改 src/data.ts 的 DEFAULT_NAV_ITEMS，并确认 public/docs 中存在对应文档。
- 新增内网服务：修改 src/appConfig.ts 的端点和 src/data.ts 的 DEFAULT_SERVICES。
- 新增默认外部链接或预设：修改 src/data.ts 的 DEFAULT_EXTERNAL_LINKS 或 PRESET_EXTERNAL_LINKS。
- 调整组件 UI：先定位 src/components/ 中对应区块，尽量保持 App.tsx 的状态边界稳定。
- 更新工程文档：修改 docs/PROJECT_BRIEF.md、docs/SPECIFICATION.md 或本提示词。
```
