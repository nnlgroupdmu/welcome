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
  isInternalOnly: boolean;
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
  rawId?: string; // Optional: raw ID from the Memos container API
  author: string;
  avatarSeed: string; // for dynamic avatar generation
  avatarUrl?: string; // Optional: avatar URL
  content: string;
  timestamp: string;
  tags: string[];
  isPrivate: boolean; // if true, only visible/unblurred in member mode
}
