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
  }
];

export const DEFAULT_SERVICES: ServiceAsset[] = [
  {
    id: 'srv-1',
    name: 'Memos 轻速备忘流',
    description: '实验室闪念、日常、代码 Bug、科研发现的分享平台。',
    icon: 'StickyNote',
    localUrl: 'http://192.168.31.240:5230',
    tailscaleUrl: 'http://100.68.153.123:5230',
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
