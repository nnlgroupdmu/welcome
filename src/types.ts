/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NavItem {
  id: string;
  title: string;
  description: string;
  linkUrl: string;
  category: '环境配置' | '镜像打包' | '实验规范' | '关于本站' | '其他';
  isInternalOnly: boolean;
  contentMarkdown?: string; // Optional detailed internal doc preview
}

export interface ServiceAsset {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  localUrl: string;
  tailscaleUrl: string;
  status: 'online' | 'offline' | 'maintenance';
}

export interface MemoPost {
  id: string;
  author: string;
  avatarSeed: string; // for dynamic avatar generation
  content: string;
  timestamp: string;
  tags: string[];
  isPrivate: boolean; // if true, only visible/unblurred in member mode
}
