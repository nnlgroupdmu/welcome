/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NavItem {
  id: string;
  title: string;
  description: string;
  linkUrl: string;
  categories: string[]; // Supports multiple categories / tags
  isInternalOnly: boolean
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
  rawId: string;     // 新增：Memos 原站的真实 ID（用于拼接跳转链接）
  author: string;
  avatarSeed: string; // for dynamic avatar generation
  avatarUrl?: string; // 新增：Memos 系统提供的真实头像图片 URL（可选）
  content: string;
  timestamp: string;
  tags: string[];
  isPrivate: boolean; // if true, only visible/unblurred in member mode
}