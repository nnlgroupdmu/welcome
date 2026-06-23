/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavItem, ServiceAsset, MemoPost, ExternalLinkAsset } from './types';
import { INTERNAL_ROUTES } from './appConfig';

const baseUrl = (import.meta as any).env?.BASE_URL || '/';

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: 'nav-1',
    title: '服务器指南：远程开发环境配置',
    description: '欢迎使用实验室最新双卡 NVIDIA RTX 5090D v2 (24GB) GPU 服务器。本服务器专为高性能深度学习任务设计，面向多数同学的日常科研需求，为了确保资源的高效利用与环境的稳定隔离，请遵循我们的工作流程。',
    linkUrl: `${baseUrl}docs/index.html#/server_guide`,
    categories: ['环境配置','实验规范'],
    isInternalOnly: false
  },
  {
    id: 'nav-2',
    title: '内网接入指南',
    description: '以 5090 服务器为核心，实验室内网已部署多项网络服务。同学们需要接入我们的 Tailscale 远程组网，才能在实验室 WiFi 环境之外访问内网。建议每位同学都接入使用，按照提示步骤配置。',
    linkUrl: `${baseUrl}docs/index.html#/vpn_guide`,
    categories: ['关于本站'],
    isInternalOnly: false
  },
  {
    id: 'nav-3',
    title: '欢迎使用 Memos 广场',
    description: '为了打破实验室成员之间相对孤立的实验状态，共建更加团结的小组，我们正式上线了内网动态广场（Memos）。这里不是交作业或写正式周报的死板系统，而是属于我们实验室的“技术朋友圈”与“碎片化博客”。',
    linkUrl: `${baseUrl}docs/index.html#/memos_guide`,
    categories: ['关于本站'],
    isInternalOnly: false
  },
  {
    id: 'nav-4',
    title: 'Markdown 笔记指南',
    description: 'Markdown 不仅是简单的排版语法，更是 AI 时代最完美的纯文本数据资产。我们已经在内网推行了基于 Markdown 的 Memos 广场，那么在本地端，如何高效、规范地记录笔记，就成了提升科研效率的关键。',
    linkUrl: `${baseUrl}docs/index.html#/markdown_guide`,
    categories: ['工具使用'],
    isInternalOnly: false
  },
  {
    id: 'nav-5',
    title: '内网 Gitea 指南',
    description: '我们自己的局域网代码托管平台（相当于内网 GitHub）现已正式上线，我们可以利用自己的服务器统一管理代码，同时不用担心未发表的内容在 GitHub 裸奔。',
    linkUrl: `${baseUrl}docs/index.html#/gitea_guide`,
    categories: ['工具使用'],
    isInternalOnly: false
  }
];

export const DEFAULT_SERVICES: ServiceAsset[] = [
  {
    id: 'srv-1',
    name: 'Memos 轻笔记动态广场',
    description: '实验室闪念、日常、代码 Bug、科研发现的分享平台。',
    icon: 'StickyNote',
    localUrl: INTERNAL_ROUTES.lan.memosExplore,
    tailscaleUrl: INTERNAL_ROUTES.tailscale.memosExplore,
    status: 'online'
  },
  {
    id: 'srv-2',
    name: 'AList 文件存储中心',
    description: '服务器的共享存储空间。支持内网上传和下载。',
    icon: 'FolderClosed',
    localUrl: INTERNAL_ROUTES.lan.alist,
    tailscaleUrl: INTERNAL_ROUTES.tailscale.alist,
    status: 'online'
  },
  {
    id: 'srv-3',
    name: 'Gitea 代码托管平台',
    description: '服务器的本地 Git 代码托管平台。',
    icon: 'GitBranch',
    localUrl: INTERNAL_ROUTES.lan.giteaExplore,
    tailscaleUrl: INTERNAL_ROUTES.tailscale.giteaExplore,
    status: 'online'
  },
  {
    id: 'srv-4',
    name: 'Grafana 显卡监控大屏',
    description: '服务器的显卡资源实时监控。',
    icon: 'Gauge',
    localUrl: INTERNAL_ROUTES.lan.grafanaGpu,
    tailscaleUrl: INTERNAL_ROUTES.tailscale.grafanaGpu,
    status: 'online'
  }
];

export const DEFAULT_EXTERNAL_LINKS: ExternalLinkAsset[] = [
  {
    id: 'ext-1',
    name: '海大邮箱',
    description: '学校的官方邮箱服务，可用于学生认证。',
    icon: 'Mail',
    url: 'https://webmail.dlmu.edu.cn/coremail/',
    useFavicon: false,
  },
  {
    id: 'ext-2',
    name: 'ChatGPT',
    description: '学术翻译、写作优化与日常开发的 AI 智能助手。',
    icon: 'Sparkles',
    url: 'https://chatgpt.com',
    useFavicon: true,
    iconText: 'AI'
  },
  {
    id: 'ext-3',
    name: '学校研究生系统',
    description: '选课、答辩等流程使用，研究生事务的官方系统。',
    icon: 'Package',
    url: 'https://yjs.dlmu.edu.cn/gsapp/sys/yjsemaphome/portal/index.do',
    useFavicon: false,
    iconText: '研'
  },
  {
    id: 'ext-4',
    name: 'Overleaf',
    description: '多人学术论文协作与 LaTeX 实时在线编译平台。',
    icon: 'FileText',
    url: 'https://www.overleaf.com',
    useFavicon: true,
    iconText: '学术'
  }
];

export interface PresetLink {
  name: string;
  description: string;
  icon?: string;
  url: string;
  useFavicon?: boolean;
  isEmoji?: boolean;
  emoji?: string;
  iconText?: string;
  customColor?: string;
  category: string;
}

export const PRESET_EXTERNAL_LINKS: PresetLink[] = [
  // AI 智能助手
  {
    name: 'DeepSeek',
    description: '幻方量化旗下超强国产、极高性价比大模型服务。',
    icon: 'Brain',
    url: 'https://www.deepseek.com',
    useFavicon: false,
    isEmoji: true,
    emoji: '🧠',
    category: 'AI 智能助手'
  },
  {
    name: 'Kimi Chat',
    description: '暗月轻量长文本国产 AI 助手，支持超长文本分析。',
    icon: 'Sparkles',
    url: 'https://kimi.moonshot.cn',
    useFavicon: false,
    isEmoji: true,
    emoji: '💬',
    category: 'AI 智能助手'
  },
  {
    name: 'Claude AI',
    description: 'Anthropic 开发的艺术与编码逻辑顶尖的 AI 写作助手。',
    icon: 'Sparkles',
    url: 'https://claude.ai',
    useFavicon: true,
    category: 'AI 智能助手'
  },
  {
    name: 'DeepL 智能翻译',
    description: '极其精准、自然流畅的 AI 神经网络多语种全文翻译工具。',
    icon: 'Languages',
    url: 'https://www.deepl.com/translator',
    useFavicon: false,
    isEmoji: true,
    emoji: '🌐',
    category: 'AI 智能助手'
  },
  // 学术/科研检索
  {
    name: 'Connected Papers',
    description: '一键生成论文引用网络、相似文献关联图谱的可视化平台。',
    icon: 'Network',
    url: 'https://www.connectedpapers.com',
    useFavicon: false,
    isEmoji: true,
    emoji: '🕸️',
    category: '学术/科研检索'
  },
  {
    name: 'Sci-Hub',
    description: '打开科学大门，提供免费学术论文全文下载的检索利器。',
    icon: 'FileText',
    url: 'https://sci-hub.se',
    useFavicon: false,
    isEmoji: true,
    emoji: '🦅',
    category: '学术/科研检索'
  },
  {
    name: '谷歌学术 Scholar',
    description: '全球范围权威学术文献、论文专利的多学科检索平台。',
    icon: 'GraduationCap',
    url: 'https://scholar.google.com',
    useFavicon: false,
    category: '学术/科研检索'
  },
  // 实用绘图/效率
  {
    name: 'ProcessOn 脑图',
    description: '免费、高效的在线思维导图与专业系统流程图绘制平台。',
    icon: 'Workflow',
    url: 'https://www.processon.com',
    useFavicon: false,
    isEmoji: true,
    emoji: '💡',
    category: '实用绘图/效率'
  },
  {
    name: 'TinyPNG 压图',
    description: '极其优秀的智能 WebP/PNG/JPG 无损高压压缩熊猫工具。',
    icon: 'Image',
    url: 'https://tinypng.com',
    useFavicon: false,
    isEmoji: true,
    emoji: '🐼',
    category: '实用绘图/效率'
  },
  {
    name: 'Excalidraw 手绘白板',
    description: '高颜值、手绘风格的多人在线轻量白板工具，极易上手。',
    icon: 'PenTool',
    url: 'https://excalidraw.com',
    useFavicon: false,
    isEmoji: true,
    emoji: '🎨',
    category: '实用绘图/效率'
  },
  {
    name: 'Carbon 代码美化',
    description: '为你的代码段一键生成极其精美的高清效果展示截图。',
    icon: 'Code',
    url: 'https://carbon.now.sh',
    useFavicon: false,
    isEmoji: true,
    emoji: '💻',
    category: '实用绘图/效率'
  },
  // 开发辅助/分享
  {
    name: 'GitHub 开源社区',
    description: '全球最大的开源代码及版本控制项目托管、社区交流平台。',
    icon: 'Github',
    url: 'https://github.com',
    useFavicon: true,
    category: '开发辅助/分享'
  },
  {
    name: 'MDN Web 开发指南',
    description: '权威详尽的 HTML、CSS、JS 等前端开发核心标准技术文档。',
    icon: 'PanelsTopLeft',
    url: 'https://developer.mozilla.org',
    useFavicon: true,
    category: '开发辅助/分享'
  },
  {
    name: 'Stack Overflow 社区',
    description: '全球计算机程序员及开发者的问答社区和知名漏洞解决库。',
    icon: 'Code',
    url: 'https://stackoverflow.com',
    useFavicon: true,
    category: '开发辅助/分享'
  },
  {
    name: 'Bilibili B站',
    description: '国内最火的技术分享课程、学术讲座与优质视频弹幕站。',
    icon: 'Video',
    url: 'https://www.bilibili.com',
    useFavicon: false,
    isEmoji: true,
    emoji: '📺',
    category: '开发辅助/分享'
  }
];

export const DEFAULT_MEMOS: MemoPost[] = [
  {
    id: 'memo-1',
    rawId: 'memo-1-raw', // 示例原始 ID
    author: 'ADMIN',
    avatarSeed: 'A',
    content: '🎉 欢迎来到 NNL Group Lab 的全新门户网站！请接入内网后浏览笔记动态~',
    timestamp: '2026-05-25 08:32',
    tags: ['公告', '欢迎'],
    isPrivate: false
  }
];
