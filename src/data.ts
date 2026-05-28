/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavItem, ServiceAsset, MemoPost } from './types';

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: 'nav-1',
    title: '服务器指南：远程开发环境配置',
    description: '欢迎使用实验室最新双卡 NVIDIA RTX 5090D v2 (24GB) GPU 服务器。本服务器专为高性能深度学习任务设计，面向多数同学的日常科研需求，为了确保资源的高效利用与环境的稳定隔离，请遵循我们的工作流程。',
    linkUrl: `${import.meta.env.BASE_URL}docs/index.html#/server_guide`,
    categories: ['环境配置','实验规范'],
    isInternalOnly: false
  },
  {
    id: 'nav-2',
    title: '内网接入指南',
    description: '以 5090 服务器为核心，实验室内网已部署多项网络服务。同学们需要接入我们的 Tailscale 远程组网，才能在实验室 WiFi 环境之外访问内网。建议每位同学都接入使用，按照提示步骤配置。',
    linkUrl: `${import.meta.env.BASE_URL}docs/index.html#/vpn_guide`,
    categories: ['关于本站'],
    isInternalOnly: false
  },
  {
    id: 'nav-3',
    title: '欢迎使用 Memos 广场',
    description: '为了打破实验室成员之间相对孤立的实验状态，共建更加团结的小组，我们正式上线了内网动态广场（Memos）。这里不是交作业或写正式周报的死板系统，而是属于我们实验室的“技术朋友圈”与“碎片化博客”。',
    linkUrl: `${import.meta.env.BASE_URL}docs/index.html#/memos_guide`,
    categories: ['关于本站'],
    isInternalOnly: false
  },
  {
    id: 'nav-4',
    title: 'Markdown 笔记指南',
    description: 'Markdown 不仅是简单的排版语法，更是 AI 时代最完美的纯文本数据资产。我们已经在内网推行了基于 Markdown 的 Memos 广场，那么在本地端，如何高效、规范地记录笔记，就成了提升科研效率的关键。',
    linkUrl: `${import.meta.env.BASE_URL}docs/index.html#/markdown_guide`,
    categories: ['工具使用'],
    isInternalOnly: false
  },
  {
    id: 'nav-5',
    title: '内网 Gitea 指南',
    description: '我们自己的局域网代码托管平台（相当于内网 GitHub）现已正式上线，我们可以利用自己的服务器统一管理代码，同时不用担心未发表的内容在 GitHub 裸奔。',
    linkUrl: `${import.meta.env.BASE_URL}docs/index.html#/gitea_guide`,
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
    localUrl: 'http://192.168.31.240:5230/explore',
    tailscaleUrl: 'http://100.68.153.123:5230/explore',
    status: 'online'
  },
  {
    id: 'srv-2',
    name: 'AList 文件存储中心',
    description: '服务器的归档软件仓库。目前仅支持内网下载。',
    icon: 'FolderClosed',
    localUrl: 'http://192.168.31.240:5244',
    tailscaleUrl: 'http://100.68.153.123:5244',
    status: 'online'
  },
  {
    id: 'srv-3',
    name: 'Gitea 代码托管平台',
    description: '服务器的本地 Git 代码托管平台。',
    icon: 'GitBranch',
    localUrl: 'http://192.168.31.240:3000',
    tailscaleUrl: 'http://100.68.153.123:3000',
    status: 'online'
  }
];

export const DEFAULT_MEMOS: MemoPost[] = [
  {
    id: 'memo-1',
    author: 'ADMIN',
    avatarSeed: 'A',
    content: '🎉 欢迎来到 NNL Group Lab 的全新门户网站！请接入内网后浏览笔记动态~',
    timestamp: '2026-05-25 08:32',
    tags: ['公告', '欢迎'],
    isPrivate: false
  }
];
