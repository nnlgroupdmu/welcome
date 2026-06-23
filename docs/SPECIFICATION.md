# 网站项目规格说明

## 1. 产品目标

NNL Group Lab Open Hub 是实验室门户首页，目标是让成员在一个页面完成日常入口查找、内网服务访问、文档阅读、Memos 动态浏览和基础网络诊断。

项目同时服务两类内容：

- 门户首页：React/Vite 静态应用，提供导航、内网服务、动态流和快捷链接。
- 在线文档：`public/docs/` 下的 Docsify 文档站，提供服务器、入网、Memos、Markdown、Gitea、代理等成员指南。

工程维护文档放在根目录 `docs/`，不进入 Docsify 成员文档站。

## 2. 页面结构与交互

主页面由 `src/App.tsx` 组装，主要区块如下：

- `AppHeaderBar`：站点标题、GitHub 链接、管理员邮箱复制、主题切换、网络连通状态和 LAN/Tailscale 路线切换。
- `AppWelcomeBanner`：欢迎与项目介绍区域。
- `AppSearchFilterSection`：全局搜索输入与 Memos 标签过滤。
- `AppInternalNavSection`：站内文档导航卡片，支持分类筛选、搜索和展开。
- `AppMemosFeedSection`：Memos 动态流，支持搜索、标签过滤和逐步显示更多。
- `AppDigitalAssetsSection`：内网服务入口和外部快捷链接，支持列表/图标视图、预设添加、自定义添加、编辑、删除、重排和重置。
- `AppFooter`：版权和版本信息。
- `AppBackToTopButton`：页面滚动后显示的返回顶部按钮。

搜索逻辑由 `searchQuery` 同时影响站内导航与 Memos 动态。导航分类由 `NavItem.categories` 动态生成；Memos 标签由当前 `memos` 数据中的 `tags` 动态生成。

## 3. 数据与配置入口

### 3.1 类型接口

公开数据结构定义在 `src/types.ts`：

```ts
export interface NavItem {
  id: string;
  title: string;
  description: string;
  linkUrl: string;
  categories: string[];
  isInternalOnly: boolean;
}

export interface ServiceAsset {
  id: string;
  name: string;
  description: string;
  icon: string;
  localUrl: string;
  tailscaleUrl: string;
  status: 'online' | 'offline' | 'maintenance';
}

export interface ExternalLinkAsset {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  useFavicon?: boolean;
  iconText?: string;
  isEmoji?: boolean;
  emoji?: string;
  customColor?: string;
}

export interface MemoPost {
  id: string;
  rawId?: string;
  author: string;
  avatarSeed: string;
  avatarUrl?: string;
  content: string;
  timestamp: string;
  tags: string[];
  isPrivate: boolean;
}
```

### 3.2 默认内容

`src/data.ts` 管理以下默认内容：

- `DEFAULT_NAV_ITEMS`：首页左侧站内文档导航。
- `DEFAULT_SERVICES`：内网服务入口，包括 Memos、AList、Gitea、Grafana。
- `DEFAULT_EXTERNAL_LINKS`：初始外部快捷链接。
- `PRESET_EXTERNAL_LINKS`：用户可一键添加的外部链接预设。
- `DEFAULT_MEMOS`：Memos API 不可用时的兜底动态。

新增或调整默认展示内容时，优先修改 `src/data.ts`。

### 3.3 网络配置

`src/appConfig.ts` 管理网络事实：

- `ROUTE_LABELS`：`tailscale` 与 `lan` 的中文标签。
- `NETWORK_ENDPOINTS.lanHost`：`192.168.31.240`。
- `NETWORK_ENDPOINTS.tailscaleHost`：`100.68.153.123`。
- `NETWORK_ENDPOINTS.ports`：Memos、AList、Gitea、Grafana、Prometheus 端口。
- `NETWORK_ENDPOINTS.timeouts`：Memos 拉取、Tailscale 探测、LAN 探测、GPU 查询超时。
- `INTERNAL_ROUTES`：根据 host、port 和 path 生成的服务 URL。
- `NETWORK_HELP_TEXT`：面向用户的网络说明文案。

修改内网地址、端口或超时时，优先修改 `src/appConfig.ts`，避免在组件中硬编码。

## 4. 数据流与失败处理

### 4.1 Memos 动态流

页面加载时 `handleRefreshAndCheck()` 会触发 `fetchRemoteMemos()`。该函数同时尝试 Tailscale 与 LAN 的 Memos API：

- Tailscale API：`INTERNAL_ROUTES.tailscale.memosApi`
- LAN API：`INTERNAL_ROUTES.lan.memosApi`

拉取策略使用 `Promise.any`，任一路线成功即可使用返回数据。返回内容会被清洗并映射为 `MemoPost`：

- 内容来自 `item.content`。
- 标签优先使用 `item.tags`，没有时从内容中的 `#tag` 提取，再没有则使用 `内网同步`。
- 作者优先使用 `creatorName`、`creatorUsername`、`creator`，并把 `users/NAME` 简化为 `u/NAME`。
- 时间统一格式化为 `Asia/Shanghai` 的 `YYYY-MM-DD HH:mm`。
- 头像优先使用 API 返回的 `avatarUrl`。

如果远程 API 全部失败，页面保留当前 memos；若当前为空，则回退到 `DEFAULT_MEMOS`。

### 4.2 网络诊断与路线选择

页面加载时会同时运行：

- `testTailscaleConnection()`：探测 Tailscale 下的 Memos、Gitea、AList。
- `testLanConnection()`：探测 LAN 下的 Memos。
- `fetchRemoteMemos()`：拉取动态。

诊断请求使用 `fetchWithTimeout()` 和 `no-cors`，成功即记录延迟并标记为 `connected`，失败则标记为 `error`。

初始路线偏好为 `tailscale`。若用户没有手动切换，页面会根据诊断结果自动切到成功路线：LAN 成功优先于 Tailscale 成功。用户手动切换后，`hasManuallySwitched` 会阻止自动覆盖。

### 4.3 外部快捷链接

外部快捷链接初始化时读取 `seal_external_links`，失败时回退到 `DEFAULT_EXTERNAL_LINKS`。用户可以：

- 从预设中添加链接。
- 自定义名称、URL、描述和图标形式。
- 编辑已有链接。
- 删除链接。
- 拖拽重排。
- 重置为默认链接。

保存 URL 时，如果没有 `http` 前缀，会自动补 `https://`。图标可来自 favicon、emoji、文本标记或自动匹配的 lucide 图标。

## 5. 本地持久化

本项目按数据性质分层使用浏览器 `localStorage`。缓存策略集中在 `src/cachePolicy.ts`，读写工具集中在 `src/clientUtils.ts`。

当前持久化键：

- `seal_external_links`：用户外部快捷链接列表。
- `seal_memos`：Memos 离线缓存，结构为 `{ items, fetchedAt, source }`，仅作为启动兜底和远端失败时的离线内容。
- `seal_intranet_view_mode`：内网应用展示模式，取值为 `list` 或 `icons`。
- `seal_external_shortcut_expanded`：外部快捷链接区域是否展开。
- `seal_theme_mode`：主题偏好，取值为 `light`、`dark` 或 `system`。

默认导航 `navItems` 和内网服务 `services` 是站点配置，始终来自代码包，不读取也不写入 localStorage，避免部署后的新导航或服务地址被旧浏览器缓存遮住。

Memos 使用 stale-while-revalidate：启动时可先展示 `seal_memos`，同时后台拉取远端；缓存带 `fetchedAt` 和 `source`，超过 TTL 或远端失败时 UI 会标记“显示缓存”或“离线缓存”。GPU 指标不写入 localStorage，只在组件内存里保留最后一次成功读取值，并在网络失败时标记过期。

## 6. 文档与部署

### 6.1 文档分工

- `README.md`：仓库入口和最短项目说明。
- `docs/`：维护者和 AI 协作者工程文档。
- `public/docs/`：实验室成员在线文档站，由 `public/docs/index.html` 的 Docsify 配置加载。

### 6.2 构建与发布

常用命令：

```bash
npm run dev
npm run lint
npm run build
npm run preview
npm run clean
```

站点部署在 GitHub Pages。由于 `src/data.ts` 中文档入口依赖 `import.meta.env.BASE_URL`，构建时应保持 Vite base 配置与部署路径一致。

### 6.3 维护边界

- 修改默认内容时，优先更新 `src/data.ts`。
- 修改网络端点、端口、超时和网络说明时，优先更新 `src/appConfig.ts`。
- 修改全局交互状态和数据流时，优先查看 `src/App.tsx`。
- 修改单一区块视觉或布局时，优先查看 `src/components/`。
- 新增成员指南时，放入 `public/docs/` 并更新 `_sidebar.md`。
- 新增工程说明、规格、AI 交接上下文时，放入 `docs/`。

## 7. 验收标准

文档或代码变更后建议检查：

- Markdown 相对链接是否能从对应文件正确跳转。
- `npm run lint` 是否通过。
- 涉及资源路径、部署路径、Docsify 或构建配置时，`npm run build` 是否通过。
- 在无内网连接状态下，首页仍能显示静态导航、文档入口和默认内容。
- AI 交接提示词能让新协作者快速回答：项目是什么、核心文件在哪、配置在哪里改、如何验证。
