/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence
} from 'motion/react';
import {
  Terminal,
  Cpu,
  Layers,
  LayoutGrid,
  List,
  Search,
  Plus,
  X,
  ExternalLink,
  Copy,
  Check,
  BookOpen,
  StickyNote,
  FolderClosed,
  Code,
  Home,
  Activity,
  Clock,
  Sparkles,
  Laptop,
  Package,
  FileText,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Send,
  Trash2,
  PlusCircle,
  ArrowUpRight,
  Menu,
  Github,
  Mail,
  Wrench,
  GitBranch,
  Gauge,
  ArrowUp,
  SquarePen,
  Library,
  Globe,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { NavItem, ServiceAsset, MemoPost, ExternalLinkAsset } from './types';
import { DEFAULT_NAV_ITEMS, DEFAULT_SERVICES, DEFAULT_MEMOS, DEFAULT_EXTERNAL_LINKS, PRESET_EXTERNAL_LINKS } from './data';

import AnnouncementBanner from './components/AnnouncementBanner'; // 🌟 引入公告
import DualRouteConverter from './components/DualRouteConverter'; // 🌟 引入双路地址智能转换小工具
import MemoContent from './components/MemoContent'; // 🌟 引入自适应内容折叠与高精测量组件
import Markdown from 'react-markdown';
import { GpuMonitor } from './components/GpuMonitor';
import { ExternalFavicon } from './components/ExternalFavicon';

import EmojiPicker, { Theme } from 'emoji-picker-react';
import zhEmojiData from 'emoji-picker-react/dist/data/emojis-zh';


export default function App() {
  // Caching configuration: Change to true to re-enable local storage persistence
  const ENABLE_CACHE = false;

  // Core Data States (Initialized from Default Data, synced with localStorage if enabled)
  const [navItems, setNavItems] = useState<NavItem[]>(() => {
    if (ENABLE_CACHE) {
      const cached = localStorage.getItem('seal_nav_items');
      if (cached) return JSON.parse(cached);
    }
    return DEFAULT_NAV_ITEMS;
  });
  const [services, setServices] = useState<ServiceAsset[]>(() => {
    if (ENABLE_CACHE) {
      const cached = localStorage.getItem('seal_services');
      if (cached) return JSON.parse(cached);
    }
    return DEFAULT_SERVICES;
  });
  const [externalLinks, setExternalLinks] = useState<ExternalLinkAsset[]>(() => {
    const cached = localStorage.getItem('seal_external_links');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_EXTERNAL_LINKS;
  });
  const [memos, setMemos] = useState<MemoPost[]>(() => {
    if (ENABLE_CACHE) {
      const cached = localStorage.getItem('seal_memos');
      if (cached) return JSON.parse(cached);
    }
    return DEFAULT_MEMOS;
  });

  // Client Filter & View States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isNavExpanded, setIsNavExpanded] = useState<boolean>(false);
  const [visibleMemosCount, setVisibleMemosCount] = useState<number>(5);

  // Automatically reset visible memos count when filters change to avoid empty-state or weird list size jumps
  useEffect(() => {
    setVisibleMemosCount(5);
  }, [selectedTag, searchQuery]);

  // Local UX State: Feedback message for script copying
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic Tailscale Connection Tester State
  const [tailscaleStatus, setTailscaleStatus] = useState<'unchecked' | 'testing' | 'connected' | 'error'>('unchecked');
  const [latency, setLatency] = useState<number | null>(null);

  // Dynamic Physical LAN Connection Tester State
  const [lanStatus, setLanStatus] = useState<'unchecked' | 'testing' | 'connected' | 'error'>('unchecked');
  const [lanLatency, setLanLatency] = useState<number | null>(null);

  // User Route Preference for internal service cards
  const [routePreference, setRoutePreference] = useState<'tailscale' | 'lan'>('tailscale');

  // Intranet Application View mode ('list' vs 'icons' with localStorage persistence)
  const [intranetViewMode, setIntranetViewMode] = useState<'list' | 'icons'>(() => {
    const cached = localStorage.getItem('seal_intranet_view_mode');
    return (cached as 'list' | 'icons') || 'list';
  });

  const handleIntranetViewModeChange = (mode: 'list' | 'icons') => {
    setIntranetViewMode(mode);
    localStorage.setItem('seal_intranet_view_mode', mode);
  };

  // State to manage collapisble external shortcuts widget in list mode
  const [isExternalShortcutExpanded, setIsExternalShortcutExpanded] = useState<boolean>(() => {
    const cached = localStorage.getItem('seal_external_shortcut_expanded');
    return cached === null ? true : cached === 'true';
  });

  const toggleExternalShortcutExpanded = () => {
    setIsExternalShortcutExpanded(prev => {
      const newVal = !prev;
      localStorage.setItem('seal_external_shortcut_expanded', String(newVal));
      return newVal;
    });
  };

  // Explict three-state theme management: 'light' | 'dark' | 'system'
  type ThemeMode = 'light' | 'dark' | 'system';

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const cached = localStorage.getItem('seal_theme_mode');
    if (cached === 'light' || cached === 'dark' || cached === 'system') {
      return cached;
    }
    return 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('seal_theme_mode', themeMode);

    const checkDark = () => {
      if (themeMode === 'light') return false;
      if (themeMode === 'dark') return true;
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    };

    setIsDarkMode(checkDark());

    if (themeMode === 'system') {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [themeMode]);

  // Apply dark mode class to HTML element on change
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // States & handers for user customizing/uploading external shortcut links
  const [newLinkUseFavicon, setNewLinkUseFavicon] = useState<boolean>(true);
  const [newLinkIconText, setNewLinkIconText] = useState<string>('');
  const [newLinkIconType, setNewLinkIconType] = useState<'favicon' | 'emoji' | 'text'>('favicon');
  const [newLinkEmoji, setNewLinkEmoji] = useState<string>('🚀');
  const [newLinkCustomColor, setNewLinkCustomColor] = useState<string>('teal');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  const [isEditModeActive, setIsEditModeActive] = useState<boolean>(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [isAddingLink, setIsAddingLink] = useState<boolean>(false);
  const [activeAddTab, setActiveAddTab] = useState<'preset' | 'custom'>('preset');
  const [activePresetCategory, setActivePresetCategory] = useState<string>('全部');
  const [presetSearchQuery, setPresetSearchQuery] = useState<string>('');
  const [newLinkName, setNewLinkName] = useState<string>('');
  const [newLinkUrl, setNewLinkUrl] = useState<string>('');
  const [newLinkDesc, setNewLinkDesc] = useState<string>('');

  const handleSaveOrUpdateExternalLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;

    // Smart auto assign icon
    const assignedIcon = autoAssignIcon(newLinkUrl.trim(), newLinkName.trim());
    const finalUrl = newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`;

    const useFavicon = newLinkIconType === 'favicon';
    const isEmoji = newLinkIconType === 'emoji';
    const finalEmoji = isEmoji ? newLinkEmoji : undefined;
    const finalIconText = newLinkIconType === 'text' ? (newLinkIconText.trim() || undefined) : undefined;
    const customColor = (newLinkIconType === 'emoji' || newLinkIconType === 'text') ? newLinkCustomColor : undefined;

    if (editingLinkId) {
      // Update Mode
      setExternalLinks(prev => prev.map(item => {
        if (item.id === editingLinkId) {
          return {
            ...item,
            name: newLinkName.trim(),
            description: newLinkDesc.trim() || '自定义外部快捷访问项目。',
            icon: assignedIcon,
            url: finalUrl,
            useFavicon,
            isEmoji,
            emoji: finalEmoji,
            iconText: finalIconText,
            customColor
          };
        }
        return item;
      }));
      setEditingLinkId(null);
    } else {
      // Create Mode
      const newLink: ExternalLinkAsset = {
        id: `ext-${Date.now()}`,
        name: newLinkName.trim(),
        description: newLinkDesc.trim() || '自定义外部快捷访问项目。',
        icon: assignedIcon,
        url: finalUrl,
        useFavicon,
        isEmoji,
        emoji: finalEmoji,
        iconText: finalIconText,
        customColor
      };
      setExternalLinks(prev => [...prev, newLink]);
    }

    setNewLinkName('');
    setNewLinkUrl('');
    setNewLinkDesc('');
    setNewLinkUseFavicon(true);
    setNewLinkIconText('');
    setNewLinkIconType('favicon');
    setNewLinkEmoji('🚀');
    setNewLinkCustomColor('teal');
    setShowEmojiPicker(false);
    setIsAddingLink(false);
  };

  const handleStartEditExternalLink = (ext: ExternalLinkAsset) => {
    setEditingLinkId(ext.id);
    setNewLinkName(ext.name);
    setNewLinkUrl(ext.url);
    setNewLinkDesc(ext.description);
    
    if (ext.isEmoji) {
      setNewLinkIconType('emoji');
      setNewLinkEmoji(ext.emoji || '🚀');
      setNewLinkUseFavicon(false);
    } else if (ext.useFavicon) {
      setNewLinkIconType('favicon');
      setNewLinkUseFavicon(true);
    } else {
      setNewLinkIconType('text');
      setNewLinkUseFavicon(false);
    }
    
    setNewLinkIconText(ext.iconText || '');
    setNewLinkCustomColor(ext.customColor || 'teal');
    setIsAddingLink(true); // Open the input panel
    setActiveAddTab('custom'); // Switch to custom edit tab
  };

  const handleCancelEdit = () => {
    setEditingLinkId(null);
    setNewLinkName('');
    setNewLinkUrl('');
    setNewLinkDesc('');
    setNewLinkUseFavicon(true);
    setNewLinkIconText('');
    setNewLinkIconType('favicon');
    setNewLinkEmoji('🚀');
    setNewLinkCustomColor('teal');
    setShowEmojiPicker(false);
    setIsAddingLink(false);
  };

  const handleDeleteExternalLink = (id: string, name: string) => {
    if (window.confirm(`确定要移除外部链接 "${name}" 吗？`)) {
      setExternalLinks(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleResetExternalLinks = () => {
    if (window.confirm('确定要重置外部链接至大连海事大学默认列表吗？')) {
      setExternalLinks(DEFAULT_EXTERNAL_LINKS);
    }
  };

  const handleAddPresetLink = (preset: typeof PRESET_EXTERNAL_LINKS[0]) => {
    const urlMatches = (url1: string, url2: string) => {
      try {
        const u1 = url1.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '').toLowerCase();
        const u2 = url2.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '').toLowerCase();
        return u1 === u2;
      } catch {
        return url1.toLowerCase().trim() === url2.toLowerCase().trim();
      }
    };

    const alreadyExists = externalLinks.some(link => urlMatches(link.url, preset.url) || link.name.toLowerCase() === preset.name.toLowerCase());
    if (alreadyExists) return;

    const newLink: ExternalLinkAsset = {
      id: 'ext-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: preset.name,
      description: preset.description,
      icon: 'ExternalLink',
      url: preset.url,
      useFavicon: preset.useFavicon,
      isEmoji: preset.isEmoji,
      emoji: preset.emoji,
      iconText: preset.iconText,
      customColor: preset.customColor
    };

    setExternalLinks(prev => [...prev, newLink]);
  };

  const isPresetAdded = (presetUrl: string, presetName: string) => {
    return externalLinks.some(link => {
      if (link.name.toLowerCase() === presetName.toLowerCase()) return true;
      try {
        const u1 = link.url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '').toLowerCase();
        const u2 = presetUrl.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '').toLowerCase();
        return u1 === u2;
      } catch {
        return link.url.toLowerCase().trim() === presetUrl.toLowerCase().trim();
      }
    });
  };

  // Automatically exit edit mode on switching views, categories, search queries, tags or route preference
  useEffect(() => {
    setIsEditModeActive(false);
    handleCancelEdit();
  }, [activeCategory, searchQuery, selectedTag, intranetViewMode, routePreference, isExternalShortcutExpanded]);

  // Track if user has manually switched the network route preference
  const [hasManuallySwitched, setHasManuallySwitched] = useState<boolean>(false);

  // Auto-switch to successful connection on initial load
  useEffect(() => {
    if (hasManuallySwitched) return;

    if (lanStatus === 'connected') {
      setRoutePreference('lan');
    } else if (tailscaleStatus === 'connected') {
      setRoutePreference('tailscale');
    }
  }, [lanStatus, tailscaleStatus, hasManuallySwitched]);

  // Unified controller for manual route preference switching, which re-checks the target network as requested
  const handleRoutePreferenceChange = (newPref: 'tailscale' | 'lan') => {
    setRoutePreference(newPref);
    setHasManuallySwitched(true);
    if (newPref === 'tailscale') {
      testTailscaleConnection();
    } else {
      testLanConnection();
    }
  };

  // Back to Top button visibility state and scroll handler
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const fetchRemoteMemos = async () => {
    // 1. 定义双路出口：第一条为 Tailscale IP，第二条为物理内网物理 IP（依据你之前提供的 Memos 端口 5230）
    const urls = [
      "http://100.68.153.123:5230/api/v1/memos", // Tailscale 零信任链路
      "http://192.168.31.240:5230/api/v1/memos"  // 物理内网直连链路
    ];

    // 2. 封装单路请求函数，自带 2.5 秒超时控制
    const fetchSinglePath = async (url: string) => {
      const controller = new AbortController();
      const timerId = setTimeout(() => controller.abort(), 2500); // 稍微宽限到 2.5 秒

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timerId);
        if (!response.ok) throw new Error(`HTTP 错误: ${response.status}`);
        return await response.json();
      } catch (e) {
        clearTimeout(timerId);
        throw e; // 抛出错误以供 Promise.any 捕获
      }
    };

    try {
      // 3. 核心：双路竞速！哪一条链路先连上、先返回数据，就直接用谁的成果
      const data = await Promise.any(urls.map(url => fetchSinglePath(url)));

      // 4. 解析数据列表
      const list = Array.isArray(data) ? data : (data.memos || data.data || []);

      if (list && list.length > 0) {
        const mapped: MemoPost[] = list.map((item: any, idx: number) => {
          const content = item.content || '';

          // 5. 极致的数据清洗，彻底封死 toLowerCase 白屏隐患
          let rawTags = item.tags || [];
          // 确保过滤掉 rawTags 里的所有非字符串、undefined 或空值
          let tags: string[] = Array.isArray(rawTags)
            ? rawTags.filter((t: any) => typeof t === 'string' && t.trim() !== '')
            : [];

          if (tags.length === 0) {
            const hashTags = content.match(/#\S+/g);
            if (hashTags) {
              tags = hashTags.map((t: string) => t.replace('#', '').trim());
            }
          }

          // 再次检查，如果是空数组，塞入标准兜底标签
          if (tags.length === 0) {
            tags = ['内网同步'];
          }

          // 1. 获取原始用户名
          let rawAuthor = item.creatorName || item.creatorUsername || item.creator || '内网成员';

          // 2. 简化用户名：如果是 users/NAME，替换为 u/NAME
          if (rawAuthor.startsWith('users/')) {
            rawAuthor = rawAuthor.replace('users/', 'u/');
          }

          // 3. 动态获取 Memos 提供的头像路径 (适配 Memos v1 API 常见结构)
          // Memos 通常把头像存在 item.avatarUrl 或 item.creator?.avatarUrl 中
          const avatarUrl = item.avatarUrl || (item.creator && item.creator.avatarUrl) || '';


          // 时间格式化 (转换为东八区北京时间)
          let tsString = '';

          // 一个小巧的辅助函数，用来把 Date 对象直接转成东八区的 YYYY-MM-DD HH:mm
          const formatToCST = (date: Date) => {
            return new Intl.DateTimeFormat('zh-CN', {
              timeZone: 'Asia/Shanghai',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false // 使用 24 小时制
            })
            .format(date)
            .replace(/\//g, '-')   // 将格式化出来的斜杠 / 替换为短横线 -
            .replace(',', '');     // 兼容某些环境可能产生的逗号
          };

          if (item.createTime) {
            // 如果 item.createTime 已经是带 'T' 的 ISO 字符串（如 "2026-06-18T09:30:00Z"）
            // 必须先送入 new Date() 解析，再用辅助函数转时区。直接 slice 拿到的会是 0 时区。
            const d = new Date(item.createTime);
            tsString = isNaN(d.getTime()) ? item.createTime.replace('T', ' ').slice(0, 16) : formatToCST(d);
          } else if (item.createdTs) {
            // 秒级时间戳转换
            tsString = formatToCST(new Date(item.createdTs * 1000));
          } else {
            // 当前时间转换
            tsString = formatToCST(new Date());
          }

          return {
            id: `remote-${item.id || idx}`,
            rawId: item.name ? item.name.split('/').pop() : String(item.id),               // 新增：保存原始 ID
            author: rawAuthor,                          // 已经是简化后的 u/NAME
            avatarUrl: avatarUrl,                       // 新增字段：传给前端渲染真实头像
            avatarSeed: rawAuthor.replace('u/', '').slice(0, 2), // 如果没头像，用去掉 u/ 后的名字前两位做文字兜底
            content,
            timestamp: tsString,
            tags: tags,
            isPrivate: false
          };
        });

        setMemos(mapped);
      }
    } catch (err) {
      // 只有当 urls 里面的两条路全部挂掉（或者都超时）时，才会走到这里
      console.warn("双路网络（物理内网/Tailscale）均无法联通 Memos 系统，已自动启用内置缓存/模拟数据：", err);
    }
  };

  const testTailscaleConnection = async () => {
    setTailscaleStatus('testing');

    // 找一个绝对存在的内网服务作为靶点（例如你的 Memos 或 AList 节点）
    const targets = [
      "http://100.68.153.123:5230/",   // Tailscale Memos 端口
      "http://100.68.153.123:3000/",   // Tailscale Gitea 端口
      "http://100.68.153.123:5244/"    // Tailscale AList 端口
    ];
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000); // 2.0秒超时保障在不稳定远程链路下的成功率

    const fetchTest = async (url: string) => {
      await fetch(url, { mode: 'no-cors', signal: controller.signal });
      return url;
    };
    const startTime = Date.now();
    try {
      await Promise.any(targets.map(url => fetchTest(url)));
      setLatency(Date.now() - startTime);
      setTailscaleStatus('connected');
    } catch (error) {
      clearTimeout(id);
      setLatency(null);
      setTailscaleStatus('error');
    }
  };

  const testLanConnection = async () => {
    setLanStatus('testing');

    // 以局域网 Memos 端口作为物理内网靶点
    const targetUrl = "http://192.168.31.240:5230/";

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1200); // 1.2秒超时

    const startTime = Date.now();
    try {
      await fetch(targetUrl, { mode: 'no-cors', signal: controller.signal });
      clearTimeout(id);
      setLanLatency(Date.now() - startTime);
      setLanStatus('connected');
    } catch (error) {
      clearTimeout(id);
      setLanLatency(null);
      setLanStatus('error');
    }
  };

  const handleRefreshAndCheck = async () => {
    // 启动 Tailscale 连通性测试、物理局域网连通性测试 与 遥控载入 Memos 双路拉取（相互独立，绝不互相阻塞）
    testTailscaleConnection();
    testLanConnection();
    fetchRemoteMemos();
  };

  useEffect(() => {
    handleRefreshAndCheck();
  }, []);

  // Sync state modifications to localStorage
  useEffect(() => {
    if (ENABLE_CACHE) {
      localStorage.setItem('seal_nav_items', JSON.stringify(navItems));
    }
  }, [navItems, ENABLE_CACHE]);

  useEffect(() => {
    if (ENABLE_CACHE) {
      localStorage.setItem('seal_services', JSON.stringify(services));
    }
  }, [services, ENABLE_CACHE]);

  useEffect(() => {
    localStorage.setItem('seal_external_links', JSON.stringify(externalLinks));
  }, [externalLinks]);

  useEffect(() => {
    if (ENABLE_CACHE) {
      localStorage.setItem('seal_memos', JSON.stringify(memos));
    }
  }, [memos, ENABLE_CACHE]);

  // Utility to copy text to clipboard
  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Icon Matcher helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '环境配置': return <Laptop className="w-5 h-5 text-blue-600" />;
      case '镜像打包': return <Package className="w-5 h-5 text-indigo-600" />;
      case '实验规范': return <Code className="w-5 h-5 text-amber-600" />;
      case '关于本站': return <FileText className="w-5 h-5 text-emerald-600" />;
      case '工具使用': return <Wrench className="w-5 h-5 text-amber-600" />;
      default: return <BookOpen className="w-5 h-5 text-slate-500" />;
    }
  };
  const autoAssignIcon = (url: string = '', name: string = ''): string => {
    const combined = `${url.toLowerCase()} ${name.toLowerCase()}`;
    if (combined.includes('github') || combined.includes('git')) return 'Github';
    if (combined.includes('mail') || combined.includes('email') || combined.includes('coremail') || combined.includes('post') || combined.includes('@') || combined.includes('letter')) return 'Mail';
    if (combined.includes('chat') || combined.includes('gpt') || combined.includes('ai') || combined.includes('spark') || combined.includes('model') || combined.includes('huggingface') || combined.includes('hf')) return 'Sparkles';
    if (combined.includes('yjs') || combined.includes('graduate') || combined.includes('study') || combined.includes('sys') || combined.includes('class') || combined.includes('course') || combined.includes('edu') || combined.includes('university') || combined.includes('school')) return 'Package';
    if (combined.includes('overleaf') || combined.includes('latex') || combined.includes('doc') || combined.includes('paper') || combined.includes('write') || combined.includes('pdf') || combined.includes('text') || combined.includes('book')) return 'FileText';
    if (combined.includes('code') || combined.includes('dev') || combined.includes('build') || combined.includes('program') || combined.includes('compile') || combined.includes('ide')) return 'Code';
    if (combined.includes('gauge') || combined.includes('monitor') || combined.includes('status') || combined.includes('dashboard') || combined.includes('grafana') || combined.includes('metrics')) return 'Gauge';
    if (combined.includes('folder') || combined.includes('drive') || combined.includes('cloud') || combined.includes('box') || combined.includes('pan') || combined.includes('nas')) return 'FolderClosed';
    if (combined.includes('cpu') || combined.includes('gpu') || combined.includes('hardware') || combined.includes('server')) return 'Cpu';
    if (combined.includes('note') || combined.includes('memo') || combined.includes('diary') || combined.includes('todo')) return 'StickyNote';
    return 'ExternalLink';
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'StickyNote': return <StickyNote className="w-7 h-7 text-emerald-600" />;
      case 'FolderClosed': return <FolderClosed className="w-7 h-7 text-sky-600" />;
      case 'Cpu': return <Cpu className="w-7 h-7 text-amber-600" />;
      case 'Code': return <Code className="w-7 h-7 text-indigo-600" />;
      case 'Layers': return <Layers className="w-7 h-7 text-purple-600" />;
      case 'GitBranch': return <GitBranch className="w-7 h-7 text-rose-600" />;
      case 'Gauge': return <Gauge className="w-7 h-7 text-yellow-500" />;
      case 'Github': return <Github className="w-7 h-7 text-slate-700" />;
      case 'Mail': return <Mail className="w-7 h-7 text-sky-500" />;
      case 'Sparkles': return <Sparkles className="w-7 h-7 text-violet-500" />;
      case 'Package': return <Package className="w-7 h-7 text-amber-600" />;
      case 'FileText': return <FileText className="w-7 h-7 text-emerald-600" />;
      case 'ExternalLink': return <ExternalLink className="w-7 h-7 text-teal-600" />;
      default: return <Activity className="w-7 h-7 text-teal-600" />;
    }
  };

  // Filters logic
  const filteredNavItems = navItems.filter(item => {
    const matchesCategory = activeCategory === '全部' || (item.categories && item.categories.includes(activeCategory));
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredMemos = memos.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = !selectedTag || item.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Unique tags across all memo posts
  const allMemoTags = Array.from(new Set(memos.flatMap(m => m.tags)));

  // Dynamic navigation categories generated from actually defined navItems!
  const allNavCategories = ['全部', ...Array.from(new Set(navItems.flatMap(item => item.categories || [])))];

  const handleEmojiPickerClick = (emojiData: { emoji: string }) => {
    setNewLinkEmoji(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const emojiPickerProps = {
    emojiData: zhEmojiData,
    theme: isDarkMode ? Theme.DARK : Theme.LIGHT,
    previewConfig: { showPreview: false },
    skinTonesDisabled: true,
    searchPlaceholder: '搜索 Emoji',
    width: 320,
    height: 380,
    lazyLoadEmojis: true
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 font-sans tech-grid-bg antialiased selection:bg-teal-500 selection:text-white pb-16 transition-colors duration-200">

      {/* <AnnouncementBanner /> */}

      {/* ================================= HEADER BAR ================================= */}
      <header id="main-header" className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-zinc-800/90 shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 grid grid-cols-2 sm:flex sm:flex-row items-center justify-between gap-y-3 gap-x-4">

          <div className="flex items-center gap-2.5 col-span-1 justify-self-start">
            <div className="p-1.5 bg-slate-900 text-teal-400 rounded-lg flex items-center justify-center shrink-0 shadow-xs">
              <Terminal className="w-4 h-4" />
            </div>
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              NNL Group Lab
            </h1>
          </div>

          {/* Dynamic Tailscale Connection diagnostics & quick actions */}
          <div className="contents sm:flex sm:items-center sm:gap-3 sm:gap-4 sm:shrink-0 sm:flex-wrap sm:justify-end">
            {/* Quick Links */}
            <div className="flex items-center gap-1.5 sm:gap-2 col-span-1 justify-self-end">
              <a
                id="btn-link-github"
                href="https://github.com/nnlgroupdmu/welcome"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="访问 GitHub 仓库"
              >
                <Github className="w-5 h-5" />
              </a>
              <button
                id="btn-link-contact"
                onClick={() => handleCopyToClipboard('mistiiixv@gmail.com', 'admin-email')}
                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer relative"
                title={copiedId === 'admin-email' ? '邮箱已复制！' : '复制管理员邮箱 (mistiiixv@gmail.com)'}
              >
                <Mail className="w-5 h-5" />
                {copiedId === 'admin-email' && (
                  <span className="absolute top-full mt-1 right-0 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded shadow-sm whitespace-nowrap z-50">
                    已复制!
                  </span>
                )}
              </button>
              <div className="relative inline-block text-left select-none" id="theme-dropdown-container">
                <button
                  id="btn-toggle-theme"
                  onClick={() => setIsThemeDropdownOpen(prev => !prev)}
                  className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center min-w-[36px] min-h-[36px]"
                  title="主题设置"
                >
                  <motion.div
                     key={themeMode}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {themeMode === 'light' && <Sun className="w-5 h-5 text-amber-500" />}
                    {themeMode === 'dark' && <Moon className="w-5 h-5 text-indigo-400" />}
                    {themeMode === 'system' && <Monitor className="w-5 h-5 text-slate-400 dark:text-slate-300" />}
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isThemeDropdownOpen && (
                    <>
                      {/* Invisible backdrop helper to close on click outside */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsThemeDropdownOpen(false)} 
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl shadow-lg py-1.5 z-50 overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            setThemeMode('light');
                            setIsThemeDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer text-left ${
                            themeMode === 'light'
                              ? 'bg-amber-50/70 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5 shrink-0" />
                          <span>浅色模式</span>
                        </button>
                        <button
                          onClick={() => {
                            setThemeMode('dark');
                            setIsThemeDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer text-left ${
                            themeMode === 'dark'
                              ? 'bg-indigo-50/70 dark:bg-indigo-950/20 text-indigo-400 dark:text-indigo-400'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5 shrink-0" />
                          <span>深色模式</span>
                        </button>
                        <button
                          onClick={() => {
                            setThemeMode('system');
                            setIsThemeDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer text-left ${
                            themeMode === 'system'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <Monitor className="w-3.5 h-3.5 shrink-0" />
                          <span>跟随系统</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>

            {/* Unified Route Selector & Dynamic Diagnostics Dashboard (Highly Organic Capsule Integration) */}
            <div className={`p-1 rounded-full border transition-all duration-350 flex items-center gap-1.5 select-none shadow-xs shrink-0 col-span-2 justify-self-center sm:col-span-1 sm:justify-self-auto ${
              routePreference === 'tailscale'
                ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/15'
                : 'bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/15'
            }`}>
              {/* Part 1: Route Status & Diagnostics Indicator (With Organic Frame-by-Frame Wait Transition) */}
              <AnimatePresence mode="wait">
                {(() => {
                  const isTailscale = routePreference === 'tailscale';
                  const currentStatus = isTailscale ? tailscaleStatus : lanStatus;
                  const currentLatency = isTailscale ? latency : lanLatency;
                  const networkName = isTailscale ? 'Tailscale专网' : '物理内网';

                  if (currentStatus === 'testing') {
                    return (
                      <motion.div 
                        key={`testing-${routePreference}`}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          transition: { duration: 0.6, ease: "easeInOut", delay: 0.2 } 
                        }}
                        exit={{ 
                          opacity: 0, 
                          x: 4,
                          transition: { duration: 0.4, ease: "easeInOut" } 
                        }}
                        className="pl-3 pr-1 py-0.5 text-slate-500 text-[11px] font-bold flex items-center gap-1.5 select-none animate-pulse"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isTailscale ? 'bg-emerald-400' : 'bg-indigo-500'}`}></span>
                        <span>{networkName} 诊断中...</span>
                      </motion.div>
                    );
                  }

                  if (currentStatus === 'connected') {
                    const pingBg = isTailscale ? 'bg-emerald-400' : 'bg-indigo-400';
                    const dotBg = isTailscale ? 'bg-emerald-500' : 'bg-indigo-500';
                    const textClass = isTailscale 
                      ? 'text-emerald-700 hover:text-emerald-800' 
                      : 'text-indigo-700 hover:text-indigo-800';
                    
                    return (
                      <motion.button
                        id="btn-network-status"
                        key={`connected-${routePreference}`}
                        type="button"
                        onClick={handleRefreshAndCheck}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          transition: { duration: 0.6, ease: "easeInOut", delay: 0.2 } 
                        }}
                        exit={{ 
                          opacity: 0, 
                          x: 4,
                          transition: { duration: 0.4, ease: "easeInOut" } 
                        }}
                        className={`pl-3 pr-1.5 py-0.5 ${textClass} hover:bg-black/5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all duration-300 cursor-pointer select-none whitespace-nowrap overflow-hidden`}
                        title={`当前路线 [${networkName}] 已联通。点击重新发起检验网络。`}
                      >
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingBg} opacity-75`}></span>
                          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotBg}`}></span>
                        </span>
                        <span>
                          {networkName}: 已联通 ({currentLatency}ms)
                        </span>
                      </motion.button>
                    );
                  }

                  {/* Error or Unchecked states for the currently selected route */}
                  return (
                    <motion.button
                      id="btn-network-status"
                      key={`error-${routePreference}`}
                      type="button"
                      onClick={handleRefreshAndCheck}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ 
                        opacity: 1, 
                        x: 0,
                        transition: { duration: 0.6, ease: "easeInOut", delay: 0.2 } 
                      }}
                      exit={{ 
                        opacity: 0, 
                        x: 4,
                        transition: { duration: 0.4, ease: "easeInOut" } 
                      }}
                      className="pl-3 pr-1.5 py-0.5 text-rose-700 hover:text-rose-800 hover:bg-black/5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all duration-300 cursor-pointer select-none whitespace-nowrap overflow-hidden"
                      title={`当前路线 [${networkName}] 未联通。点击重试诊断。`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                      <span>
                        {networkName}: 未联通 (点击重测)
                      </span>
                    </motion.button>
                  );
                })()}
              </AnimatePresence>

              {/* Dynamic subtle separator inside the controller */}
              <div className={`h-4.5 w-[1px] transition-colors duration-300 ${
                routePreference === 'tailscale' ? 'bg-emerald-500/20' : 'bg-indigo-500/20'
              }`} />

              {/* Part 2: Pure Capsule Toggle Selector */}
              <button
                id="header-toggle-route-pure-capsule"
                type="button"
                onClick={() => handleRoutePreferenceChange(routePreference === 'tailscale' ? 'lan' : 'tailscale')}
                className="relative w-11 h-5.5 bg-slate-200/80 hover:bg-slate-200 rounded-full cursor-pointer transition-all duration-300 p-0.5 select-none shrink-0 border border-slate-300/30 focus:outline-hidden"
                title={`当前网络连接路由：${routePreference === 'tailscale' ? 'Tailscale 专网 (点击一键切换为物理内网)' : '物理内网直连 (点击一键切换为 Tailscale)'}`}
              >
                <div
                  className={`w-4 h-4 rounded-full shadow-xs transition-all duration-300 transform flex items-center justify-center ${
                    routePreference === 'tailscale'
                      ? 'translate-x-0 bg-emerald-500 text-white shadow-emerald-500/10'
                      : 'translate-x-[20px] bg-indigo-600 text-white shadow-indigo-600/10'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
                </div>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* ================================= INTRO BANNER ================================= */}
      <section id="welcome-banner" className="bg-slate-900 dark:bg-zinc-900 text-white relative pt-12 pb-10 border-b border-slate-800 dark:border-zinc-800 overflow-hidden">
        {/* 背景网格与双色渐变光晕（保留完整氛围感） */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[400px] bg-gradient-to-r from-teal-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* 使用 md:flex 结构，让硬核提示与集群算力挂在右侧，完美结合 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8 lg:gap-12">

            {/* 左侧：保留完整情感和叙事，但压缩了间距 */}
            <div className="max-w-2xl lg:max-w-3xl space-y-2.5 flex-1">
              {/* Slogan Badge */}
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse shrink-0" />
                <span className="font-mono">Move as we wish, shine as we are.</span>
              </div>

              {/* 热血大标题 */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
                在这里，由你来定义你的方向，<br className="hidden sm:inline" />
                即刻闪亮启程。
              </h2>

              {/* 饱满的团队寄语（不删字，保留灵感） */}
              <p className="text-slate-400 dark:text-zinc-400 text-sm leading-relaxed max-w-2xl">
                欢迎加入我们的实验室！科研生活将因你的创造力保持精彩。这是一个为每一位团队成员打造的资源共享中心。无论你在寝室还是在实验室，我们都已为你搭建好畅通无阻的技术桥梁，只为支撑你每一个不设限的奇思妙想。
              </p>
            </div>

            {/* 右侧：融合物理网络直连说明与 GPU 算力监控的高级控制面板挂件 */}
            <div className="w-full md:max-w-[340px] p-4.5 rounded-2xl bg-slate-950/45 dark:bg-zinc-950/45 border border-slate-800/80 dark:border-zinc-800/85 backdrop-blur-md shadow-2xl shrink-0 self-start md:self-center flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-duration-1000"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-400 border border-teal-500/20 shadow-[0_0_6px_rgba(45,212,191,0.5)]"></span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-200 dark:text-zinc-200 tracking-wider uppercase">物理内网 / Tailscale 双路连接</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-400 leading-normal">
                  本站需要物理内网直连或 Tailscale 专网。连接实验室 WiFi 同步内网数据；校外/宿舍请启动 <code className="text-teal-400 font-mono px-1 bg-slate-950 dark:bg-zinc-950 border border-slate-800/80 dark:border-zinc-800 rounded text-[10px]">Tailscale</code> 虚拟专网。
                </p>
              </div>
              <GpuMonitor />
            </div>

          </div>
        </div>
      </section>

      {/* ================================= SEARCH CONTROL BAR ================================= */}
      <section id="search-filter-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-slate-200/90 dark:border-zinc-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-200">

          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-35 top-1/2 -translate-y-1/2" style={{ left: '0.85rem' }} />
            <input
              id="input-global-search"
              type="text"
              placeholder="搜索任何站内指南或备忘内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg text-sm bg-slate-50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-800 dark:text-zinc-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>筛选 Memos 笔记标签:</span>
            {allMemoTags.map(tag => (
              <button
                id={`btn-tag-filter-${tag}`}
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-1 rounded-md border font-medium transition cursor-pointer ${selectedTag === tag
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200/80 dark:hover:bg-zinc-700/85 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800'
                  }`}
              >
                #{tag}
              </button>
            ))}
            {selectedTag && (
              <button
                id="btn-clear-tag"
                onClick={() => setSelectedTag(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium ml-2 transition-colors cursor-pointer inline-flex items-center gap-0.5 bg-transparent border-0 p-0"
              >
                <span className="text-sm leading-none font-bold">&times;</span>
                <span>清除筛选</span>
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ================================= MAIN SECTIONS GRID ================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ================================= 左侧栏目 (Left Columns Container) ================================= */}
        <div className="contents lg:flex lg:flex-col lg:gap-8 lg:col-span-7">

          {/* ----------------- 1. 站内专区 (INTERNAL NAVIGATION) ----------------- */}
          <section id="section-internal-nav" className="bg-gradient-to-b from-white to-slate-50/50 dark:from-zinc-900 dark:to-zinc-900/40 rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-all duration-300 p-6 flex flex-col relative overflow-hidden order-1 lg:order-none">
            <div>
              <div className="flex items-center justify-between mb-5 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 rounded-lg">
                    <Laptop className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">文档教程</h3>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">环境配置、资源使用规则和技术手册</p>
                  </div>
                </div>
              </div>

              {/* Smooth Sliding Subcategories Selector */}
              <div className="flex flex-wrap gap-2 mb-6">
                {allNavCategories.map(tab => {
                  const isActive = activeCategory === tab;
                  return (
                    <button
                      id={`btn-nav-tab-${tab}`}
                      key={tab}
                      onClick={() => setActiveCategory(tab)}
                      className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 overflow-hidden cursor-pointer ${isActive
                          ? 'text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200/50 dark:hover:bg-zinc-700/60 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-slate-100 font-semibold'
                        }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeCategoryBg"
                          className="absolute inset-0 bg-teal-600"
                          transition={{ type: "tween", ease: "easeInOut", duration: 0.22 }}
                        />
                      )}
                      <span className="relative z-10">{tab}</span>
                    </button>
                  );
                })}
              </div>

              {/* Radar Cards Grid with Soft Elevation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredNavItems.length > 0 ? (
                  (isNavExpanded ? filteredNavItems : filteredNavItems.slice(0, 4)).map(item => (
                    <a
                      id={`nav-card-${item.id}`}
                      key={item.id}
                      href={item.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4.5 cursor-pointer bg-gradient-to-br from-white to-slate-50/40 dark:from-zinc-900/85 dark:to-zinc-900/10 hover:from-teal-50/10 hover:to-teal-50/30 hover:border-teal-400/60 dark:hover:border-teal-500/50 hover:shadow-xs transition-all duration-300 flex flex-col justify-between text-left"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3.5">
                          <span className="p-1.5 bg-slate-50 dark:bg-zinc-800 group-hover:bg-teal-100/60 dark:group-hover:bg-teal-950/60 rounded-lg transition-colors">
                            {getCategoryIcon(item.categories?.[0] || '其他')}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-sm group-hover:text-teal-950 dark:group-hover:text-teal-400 transition-colors mb-1.5 line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-semibold text-teal-600 dark:text-teal-400 pt-2 border-t border-slate-100/85 dark:border-zinc-800/85 gap-2">
                        <div className="flex flex-wrap gap-1">
                          {item.categories?.map(cat => (
                            <span key={cat} className="bg-slate-100 dark:bg-zinc-800 group-hover:bg-teal-50/50 dark:group-hover:bg-teal-950/50 text-slate-600 dark:text-zinc-400 group-hover:text-teal-800 dark:group-hover:text-teal-300 rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap transition-colors">{cat}</span>
                          ))}
                        </div>
                        <span className="flex items-center gap-0.5 font-mono group-hover:translate-x-0.5 transition-transform shrink-0">
                          阅读指南 <ChevronRight className="w-3 h-3 text-teal-500" />
                        </span>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-zinc-900/60 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 dark:text-zinc-405">没有检索到相应的直达雷达文档</p>
                  </div>
                )}
              </div>

              {/* Fold & Align Button Mechanism for Internal Navigation */}
              {filteredNavItems.length > 4 && (
                <div className="flex justify-center mt-5 pt-4 border-t border-slate-100/80 dark:border-zinc-800">
                  <button
                    id="btn-toggle-nav-expand"
                    onClick={() => setIsNavExpanded(!isNavExpanded)}
                    className="px-4 py-1.5 bg-slate-50 dark:bg-zinc-900 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-slate-200 dark:border-zinc-800 hover:border-teal-300/80 dark:hover:border-teal-500/50 text-teal-700 dark:text-teal-400 hover:text-teal-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    {isNavExpanded ? '收起部分指南' : `展开更多指南 (还有 ${filteredNavItems.length - 4} 篇)`}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ----------------- 3. 资讯专区 (INFORMATION FEED - MEMOS) ----------------- */}
          <section id="section-memos-feed" className="bg-gradient-to-b from-white to-slate-50/50 dark:from-zinc-900 dark:to-zinc-900/40 rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-all duration-300 p-6 flex flex-col relative overflow-hidden order-3 lg:order-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg">
                  <StickyNote className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">Memos 速递</h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">在这里速览 Memos 笔记最新发布的内容</p>
                </div>
              </div>

              <a
                id="btn-post-new-memo"
                href={routePreference === 'tailscale' ? "http://100.68.153.123:5230" : "http://192.168.31.240:5230"}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full sm:w-auto active:scale-95 duration-100 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer text-center ${
                  routePreference === 'tailscale'
                    ? 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-100/50 border border-emerald-500/10'
                    : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-100/50 border border-indigo-500/10'
                }`}
              >
                <Send className="w-3.5 h-3.5" /> 发布一条笔记
              </a>
            </div>

            {/* Memos List Stream */}
            <div id="memos-feed-stream" className="space-y-5 w-full">
              {filteredMemos.length > 0 ? (
                filteredMemos.slice(0, visibleMemosCount).map((memo, index) => {
                  return (
                    <motion.div
                      id={`memo-card-${memo.id}`}
                      key={memo.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="group relative bg-gradient-to-br from-white to-slate-50/35 dark:from-zinc-900/85 dark:to-zinc-900/10 hover:from-white hover:to-teal-50/10 dark:hover:from-zinc-900 dark:hover:to-teal-950/10 border border-slate-200/80 dark:border-zinc-800 hover:border-teal-200/80 dark:hover:border-teal-500/50 rounded-2xl p-4.5 sm:p-5 transition-all duration-300 hover:shadow-sm overflow-hidden flex flex-col sm:flex-row gap-4.5 items-start"
                    >
                      {/* Left glowing marker */}
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-teal-400 to-emerald-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />

                      {/* Author block */}
                      <div className="flex sm:flex-col items-center gap-2.5 w-full sm:w-28 shrink-0 text-left sm:text-center">
                        {/* 判断是否有 Memos 的真实头像，如果有就用 <img>，没有或者加载失败就自动退回到文字头像 */}
                        {memo.avatarUrl ? (
                          <img
                            src={
                              // 自动适配双路网络环境：如果头像地址是相对路径（如 /assets/...），补全为当前正确的内网网关
                              memo.avatarUrl.startsWith('http')
                                ? memo.avatarUrl
                                : `${routePreference === 'tailscale' ? "http://100.68.153.123:5230" : "http://192.168.31.240:5230"}${memo.avatarUrl}`
                            }
                            alt={memo.author}
                            onError={(e) => {
                              // 防止图片挂掉导致白屏，挂掉时隐藏图片并显示文字兜底（可选）
                              e.currentTarget.style.display = 'none';
                            }}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200/80 dark:border-zinc-800/85 sm:mx-auto shadow-xs"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-zinc-800 text-teal-400 font-bold border border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-center text-sm font-mono sm:mx-auto shadow-xs">
                            {memo.avatarSeed.toUpperCase()}
                          </div>
                        )}

                        <a
                           href={`${routePreference === 'tailscale' ? "http://100.68.153.123:5230" : "http://192.168.31.240:5230"}/${memo.author}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-left sm:text-center flex-1 sm:flex-initial group/author hover:opacity-80 transition"
                           title="打开作者 Memos 主页"
                        >
                          {/* 鼠标悬停名字时加一个下划线提示 */}
                          <h4 className="font-bold text-xs text-slate-950 dark:text-zinc-200 line-clamp-1 group-hover/author:underline group-hover/author:text-teal-600 dark:group-hover/author:text-teal-400">
                            {memo.author}
                          </h4>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono flex items-center justify-start sm:justify-center gap-0.5 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {memo.timestamp}
                          </span>
                        </a>
                      </div>

                      {/* Memo content body */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {memo.tags.map(tag => (
                              <span
                                key={tag}
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition ${selectedTag === tag
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-teal-50/65 dark:bg-teal-950/30 text-teal-800 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-teal-100/50 dark:border-teal-900/50'
                                  }`}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <a
                            href={`${routePreference === 'tailscale' ? "http://100.68.153.123:5230" : "http://192.168.31.240:5230"}/memos/${memo.rawId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            // 【新样式】：彻底打破原有 Tag 的高圆角和背景，变成半透明、低调的小方角气泡
                            className={`transition-all duration-200 px-2 py-0.5 rounded-md flex items-center gap-1 text-[10px] font-semibold border border-transparent hover:shadow-xs active:scale-95 ${
                              routePreference === 'tailscale'
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/40 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                                : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/40 hover:bg-indigo-500 hover:text-white hover:border-indigo-500'
                            }`}
                            title={`查看原站详情 (${routePreference === 'tailscale' ? 'Tailscale 专网' : '物理局域网'})`}
                          >
                            查看详情
                            <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                          </a>
                        </div>

                        {/* Content text with toggleable height limit for long memos */}
                        <MemoContent content={memo.content} memoId={memo.id} />
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div id="no-memos-fallback" className="py-16 text-center bg-white dark:bg-zinc-900/40 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                  <StickyNote className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">目前没有相关的实验室备忘随笔。</p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto mt-1">
                    您可以使用上方的“发布一条笔记”发布关于您最新调试项目跑通的好消息或需要求助的信息。
                  </p>
                </div>
              )}

              {/* Load More Button or All Loaded Status Indicator */}
              {filteredMemos.length > 5 && (
                <div className="flex flex-col items-center justify-center pt-4 border-t border-slate-100/80 dark:border-zinc-800">
                  {filteredMemos.length > visibleMemosCount ? (
                    <button
                      id="btn-load-more-memos"
                      key="load-more-btn"
                      onClick={() => setVisibleMemosCount(prev => prev + 5)}
                      className="px-6 py-2 bg-slate-50 dark:bg-zinc-900 hover:bg-teal-50 dark:hover:bg-teal-950/30 border border-slate-200 dark:border-zinc-800 hover:border-teal-300/80 dark:hover:border-teal-500/50 text-teal-700 dark:text-teal-400 hover:text-teal-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs shrink-0 active:scale-98"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      加载更多笔记 (还有 {filteredMemos.length - visibleMemosCount} 条)
                    </button>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium flex items-center gap-1 py-1">
                      <Check className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                      已加载全部共 {filteredMemos.length} 条笔记
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

        </div>

        {/* ================================= 右侧栏目 (Right Column Container) ================================= */}
        <div className="w-full lg:col-span-5 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:flex lg:flex-col">

          {/* 内部滚动壳：负责在高度不够时提供滚动，pr-2 为右侧滚动条留出空隙防止挤压内容 */}
          <div className="w-full h-full lg:overflow-y-auto lg:pr-2 flex flex-col lg:gap-8 scrollbar-container">

            {/* ----------------- 2. 内网专区 (DIGITAL ASSETS - APP-LIKE LAUNCHERS) ----------------- */}
            <section id="section-digital-assets" className="bg-gradient-to-b from-white to-slate-50/50 dark:from-zinc-900 dark:to-zinc-900/40 rounded-2xl border border-slate-200/60 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-all duration-300 p-6 flex flex-col relative overflow-visible order-2 lg:order-none shrink-0">
              <div>
                <div className="flex items-start justify-between mb-5 pb-2.5 border-b border-slate-100 dark:border-zinc-800 gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-lg shrink-0">
                      <Layers className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">快捷应用</h3>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 truncate md:whitespace-normal">切换内网类型开关，一键跳转内网、外部应用。</p>
                    </div>
                  </div>

                  {/* Mode switch helper buttons */}
                  <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200/50 dark:border-zinc-800/85 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleIntranetViewModeChange('list')}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        intranetViewMode === 'list'
                          ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-xs font-semibold'
                          : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200'
                      }`}
                      title="列表视图"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIntranetViewModeChange('icons')}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        intranetViewMode === 'icons'
                          ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-xs font-semibold'
                          : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200'
                      }`}
                      title="紧凑图标视图"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dynamic Sliding Route Preference Switcher */}
                <div className="mb-5 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center gap-1 border border-slate-200/50 dark:border-zinc-800/85 relative overflow-hidden">
                  {/* Dynamic sliding indicator background */}
                  <div
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-out pointer-events-none z-0 ${routePreference === 'tailscale'
                        ? 'left-1 bg-emerald-600'
                        : 'left-[calc(50%+2px)] bg-indigo-600'
                      }`}
                  />

                  <button
                    id="btn-toggle-route-ts"
                    type="button"
                    onClick={() => handleRoutePreferenceChange('tailscale')}
                    className={`relative flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300 flex items-center justify-center gap-1.5 select-none cursor-pointer overflow-hidden z-10 ${routePreference === 'tailscale'
                        ? 'text-white'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-zinc-200 font-semibold'
                      }`}
                    title="默认首选：通过 Tailscale 零信任网络访问"
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${routePreference === 'tailscale' ? 'bg-white' : 'bg-emerald-500'}`}></span>
                      <span>Tailscale 专网</span>
                    </span>
                  </button>
                  <button
                    id="btn-toggle-route-lan"
                    type="button"
                    onClick={() => handleRoutePreferenceChange('lan')}
                    className={`relative flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300 flex items-center justify-center gap-1.5 select-none cursor-pointer overflow-hidden z-10 ${routePreference === 'lan'
                        ? 'text-white'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-zinc-200 font-semibold'
                      }`}
                    title="实验室局域网直连测试"
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-350 ${routePreference === 'lan' ? 'bg-white' : 'bg-indigo-500'}`}></span>
                      <span>物理局域网</span>
                    </span>
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={intranetViewMode}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {intranetViewMode === 'icons' ? (
                      /* Compact App Launcher Partitioned Grid */
                      <div className="flex flex-col gap-2.5">
                        {/* Intranet Services Grid */}
                        <div id="digital-assets-app-grid-icons" className="grid grid-cols-4 gap-y-3 gap-x-3 pt-1.5 pb-0.5">
                          {services.map(srv => {
                            const activeUrl = routePreference === 'tailscale' ? srv.tailscaleUrl : srv.localUrl;
                            const activeBgHover = routePreference === 'tailscale'
                              ? 'group-hover:border-emerald-400/80 group-hover:bg-emerald-50/15 dark:group-hover:bg-emerald-950/40 group-hover:shadow-emerald-100/20'
                              : 'group-hover:border-indigo-400/80 group-hover:bg-indigo-50/15 dark:group-hover:bg-indigo-950/40 group-hover:shadow-indigo-100/20';
                            const activeTextColor = routePreference === 'tailscale' ? 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400';

                            return (
                              <a
                                id={`service-icon-card-${srv.id}`}
                                key={srv.id}
                                href={activeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center justify-start text-center cursor-pointer min-w-0 p-0.5"
                                title={`${srv.name}\n${srv.description}\n\n点击立即跳转: ${activeUrl}`}
                              >
                                {/* Circular/Squirclish App Icon Frame with strict dimensions */}
                                <div className={`w-[68px] h-[68px] rounded-[20px] bg-gradient-to-br from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-950 border border-slate-200/80 dark:border-zinc-800 transition-all duration-300 flex items-center justify-center relative shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.03)] ${activeBgHover}`}>
                                  {/* Inner Icon */}
                                  <div className="transition-transform duration-300 group-hover:scale-110 flex items-center justify-center [&_svg]:w-7 [&_svg]:h-7 [&_img]:w-7 [&_img]:h-7">
                                    {getServiceIcon(srv.icon)}
                                  </div>
                                </div>

                                {/* Text label underneath */}
                                <span className={`text-[11px] text-slate-500 dark:text-zinc-400 font-bold mt-2 tracking-tight truncate max-w-full leading-tight transition-colors duration-300 ${activeTextColor}`}>
                                  {srv.name.replace(' Memos', '').replace('轻笔记动态广场', '').replace('代码托管平台', '').replace('镜像打包', '').split(' ')[0]}
                                </span>
                              </a>
                            );
                          })}
                        </div>

                        {/* Subtle Divider between Intranet Services and External Tools */}
                        <div className="flex items-center justify-between mt-1 mb-0.5 px-1 select-none">
                          <button
                            type="button"
                            onClick={toggleExternalShortcutExpanded}
                            className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer text-left focus:outline-hidden"
                          >
                            <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isExternalShortcutExpanded ? 'rotate-90' : ''}`} />
                            <span className="text-[10px] font-extrabold text-slate-400/95 tracking-wide uppercase shrink-0 cursor-pointer">外部工具</span>
                          </button>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            {externalLinks.length !== DEFAULT_EXTERNAL_LINKS.length && (
                              <button
                                type="button"
                                onClick={handleResetExternalLinks}
                                className="text-[10px] font-medium text-slate-400 hover:text-indigo-600 transition cursor-pointer px-1"
                                title="重置外部快捷链接至学校默认"
                              >
                                重置
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditModeActive(!isEditModeActive);
                                if (!isEditModeActive) {
                                  setIsExternalShortcutExpanded(true);
                                }
                              }}
                              className={`p-1 rounded-md transition cursor-pointer flex items-center justify-center ${isEditModeActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
                              title={isEditModeActive ? "退出编辑与删除模式" : "进入编辑与删除模式"}
                            >
                              <SquarePen className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const nextState = !isAddingLink;
                                setIsAddingLink(nextState);
                                if (nextState) {
                                  setActiveAddTab('preset');
                                  setIsExternalShortcutExpanded(true);
                                }
                                setEditingLinkId(null);
                                setNewLinkName('');
                                setNewLinkUrl('');
                                setNewLinkDesc('');
                              }}
                              className={`p-1 hover:bg-slate-200/50 dark:hover:bg-zinc-800 rounded-md transition cursor-pointer focus:outline-hidden ${isAddingLink ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-indigo-600'}`}
                              title={isAddingLink ? "收起面板" : "添加与推荐预设应用库"}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Dynamic Client Link Addition & Preset App Library Panel */}
                        <AnimatePresence>
                          {isAddingLink && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                              animate={{ opacity: 1, height: 'auto', marginBottom: 10, transitionEnd: { overflow: 'visible' } }}
                              exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                              className="bg-slate-100/65 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 rounded-xl p-3.5 flex flex-col gap-3 my-1 text-left transition-colors duration-200 shadow-[inset_0_1px_2px_rgba(99,102,241,0.02)]"
                            >
                              {/* Seamless Header Tabs */}
                              <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2">
                                <div className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-zinc-800 p-0.5 rounded-lg select-none">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveAddTab('preset');
                                      setEditingLinkId(null);
                                    }}
                                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                                      activeAddTab === 'preset'
                                        ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                                    }`}
                                  >
                                    推荐预设应用库
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveAddTab('custom')}
                                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                                      activeAddTab === 'custom'
                                        ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                                    }`}
                                  >
                                    {editingLinkId ? '编辑自定义链接' : '新增自定义链接'}
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAddingLink(false);
                                    handleCancelEdit();
                                  }}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer p-1 rounded-md hover:bg-slate-200/40 dark:hover:bg-zinc-800"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {activeAddTab === 'preset' ? (
                                /* Preset App Library View */
                                <div className="flex flex-col gap-3 animate-fade-in pb-1 text-left">
                                  {/* Category Selectors & Search Input */}
                                  <div className="flex flex-col gap-2">
                                    {/* Search Input bar */}
                                    <div className="relative">
                                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                        <Search className="w-3 h-3 text-slate-400" />
                                      </span>
                                      <input
                                        type="text"
                                        placeholder="在推荐预设库中搜索..."
                                        value={presetSearchQuery}
                                        onChange={(e) => setPresetSearchQuery(e.target.value)}
                                        className="w-full text-[10.5px] pl-7.5 pr-8 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                                      />
                                      {presetSearchQuery && (
                                        <button
                                          type="button"
                                          onClick={() => setPresetSearchQuery('')}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-0.5 rounded-md hover:bg-slate-105 dark:hover:bg-zinc-800 cursor-pointer"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>

                                    {/* Category Selectors */}
                                    <div className="flex flex-wrap gap-1">
                                      {['全部', 'AI 智能助手', '学术/科研检索', '实用绘图/效率', '开发辅助/分享'].map((cat) => (
                                        <button
                                          key={cat}
                                          type="button"
                                          onClick={() => setActivePresetCategory(cat)}
                                          className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition cursor-pointer select-none ${
                                            activePresetCategory === cat
                                              ? 'bg-indigo-600 text-white border border-indigo-600 shadow-xs'
                                              : 'bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400'
                                          }`}
                                        >
                                          {cat}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* List of Preset Apps (one app per line) */}
                                  <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                                    {(() => {
                                      const filteredList = PRESET_EXTERNAL_LINKS.filter(p => {
                                        const matchesCat = activePresetCategory === '全部' || p.category === activePresetCategory;
                                        const query = presetSearchQuery.trim().toLowerCase();
                                        const matchesSearch = !query || 
                                          p.name.toLowerCase().includes(query) || 
                                          (p.description && p.description.toLowerCase().includes(query)) ||
                                          p.category.toLowerCase().includes(query) ||
                                          p.url.toLowerCase().includes(query);
                                        return matchesCat && matchesSearch;
                                      });

                                      if (filteredList.length === 0) {
                                        return (
                                          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/20 dark:bg-zinc-900/10">
                                            <Search className="w-5 h-5 text-slate-350 dark:text-zinc-650 mb-1" />
                                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold">没有匹配的预设应用</p>
                                            {(presetSearchQuery || activePresetCategory !== '全部') && (
                                              <button
                                                type="button"
                                                onClick={() => { setPresetSearchQuery(''); setActivePresetCategory('全部'); }}
                                                className="text-[9px] text-indigo-600 dark:text-indigo-400 hover:underline mt-1 font-bold cursor-pointer"
                                              >
                                                重置筛选条件
                                              </button>
                                            )}
                                          </div>
                                        );
                                      }

                                      return filteredList.map((preset, index) => {
                                        const added = isPresetAdded(preset.url, preset.name);
                                        return (
                                          <div 
                                            key={index}
                                            className="flex items-start justify-between gap-3 p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xs hover:border-indigo-200/65 dark:hover:border-indigo-900/50 transition-all min-w-0"
                                          >
                                            <div className="flex items-start gap-2.5 min-w-0 flex-1 text-left">
                                              <div className="p-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700/65 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                                                <ExternalFavicon
                                                  url={preset.url}
                                                  name={preset.name}
                                                  size="sm"
                                                  useFavicon={preset.useFavicon !== false}
                                                  isEmoji={preset.isEmoji}
                                                  emoji={preset.emoji}
                                                  iconText={preset.iconText}
                                                  customColor={preset.customColor}
                                                  icon="ExternalLink"
                                                />
                                              </div>
                                              <div className="min-w-0 flex-1 flex flex-col pt-0.5 text-left">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                  <a 
                                                    href={preset.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-[11.5px] font-bold text-slate-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer group/preset-lbl truncate leading-tight"
                                                    title={`在浏览器中打开: ${preset.url}`}
                                                  >
                                                    <span className="truncate group-hover/preset-lbl:underline">{preset.name}</span>
                                                    <ExternalLink className="w-2.5 h-2.5 text-slate-450 dark:text-zinc-500 shrink-0 opacity-60 group-hover/preset-lbl:opacity-100 transition-opacity" />
                                                  </a>
                                                  <span className="text-[8px] px-1 py-0.2 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-550 rounded-xs shrink-0 font-medium">{preset.category}</span>
                                                </div>
                                                <span className="text-[9.5px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed" title={preset.description}>
                                                  {preset.description}
                                                </span>
                                              </div>
                                            </div>
                                            <button
                                              type="button"
                                              disabled={added}
                                              onClick={() => handleAddPresetLink(preset)}
                                              className={`shrink-0 p-1.5 rounded-lg cursor-pointer transition select-none flex items-center justify-center mt-1 ${
                                                added
                                                  ? 'bg-slate-50 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border border-transparent cursor-not-allowed opacity-80'
                                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-755 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/30 shadow-2xs hover:scale-105 active:scale-95'
                                              }`}
                                              title={added ? "已添加" : "一键添加外部链接"}
                                            >
                                              {added ? (
                                                <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                              ) : (
                                                <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
                                              )}
                                            </button>
                                          </div>
                                        );
                                      });
                                    })()}
                                  </div>
                                </div>
                              ) : (
                                /* Custom Add Link Form */
                                <form onSubmit={handleSaveOrUpdateExternalLink} className="flex flex-col gap-2.5 w-full">

                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400">名称 *</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="比如: 百度学术"
                                    value={newLinkName}
                                    onChange={(e) => setNewLinkName(e.target.value)}
                                    className="w-full text-xs px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400">网址 *</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="baidu.com"
                                    value={newLinkUrl}
                                    onChange={(e) => setNewLinkUrl(e.target.value)}
                                    className="w-full text-xs px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-mono placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400">简短说明 (可选)</label>
                                <input
                                  type="text"
                                  placeholder="对该外部快捷工具的描述..."
                                  value={newLinkDesc}
                                  onChange={(e) => setNewLinkDesc(e.target.value)}
                                  className="w-full text-xs px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5 mt-0.5 pb-1 border-b border-slate-200/45 dark:border-slate-800 border-dashed">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">图标展示方式:</span>
                                <div className="grid grid-cols-3 gap-1 bg-slate-50/80 dark:bg-slate-950 p-1 border border-slate-200/50 dark:border-slate-800 rounded-lg">
                                  {[
                                    { key: 'favicon', label: '网站 Favicon' },
                                    { key: 'emoji', label: 'Emoji 图标' },
                                    { key: 'text', label: '自定义文字' }
                                  ].map((tab) => (
                                    <button
                                      key={tab.key}
                                      type="button"
                                      onClick={() => setNewLinkIconType(tab.key as any)}
                                      className={`py-1 text-[10px] font-bold rounded-md transition cursor-pointer text-center ${
                                        newLinkIconType === tab.key
                                          ? 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-extrabold shadow-2xs'
                                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                      }`}
                                    >
                                      {tab.label}
                                    </button>
                                  ))}
                                </div>

                                {newLinkIconType === 'emoji' && (
                                  <div className="flex flex-col gap-1.5 mt-1 animate-fade-in relative">
                                    <div className="flex flex-row items-center gap-2">
                                      <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 shrink-0">输入或选择 Emoji:</span>
                                      <input
                                        type="text"
                                        maxLength={2}
                                        placeholder="🚀"
                                        value={newLinkEmoji}
                                        onChange={(e) => {
                                          setNewLinkEmoji(e.target.value);
                                          setShowEmojiPicker(false);
                                        }}
                                        className="w-12 text-xs px-2 py-0.5 text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-100 font-medium font-emoji"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-650 dark:text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-100/40 dark:border-indigo-900/30 transition cursor-pointer flex items-center justify-center gap-1 select-none active:scale-95"
                                      >
                                        <span>🤩 更多 Emoji 表情</span>
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${showEmojiPicker ? 'rotate-180' : ''}`} />
                                      </button>
                                    </div>

                                    {showEmojiPicker && (
                                      <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                                        <div className="absolute right-0 top-full mt-2 z-50 shadow-2xl border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden emoji-picker-container bg-white dark:bg-zinc-950">
                                          <EmojiPicker
                                            {...emojiPickerProps}
                                            onEmojiClick={handleEmojiPickerClick}
                                          />
                                        </div>
                                      </>
                                    )}

                                    <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-1.5 rounded-lg max-h-[72px] overflow-y-auto w-full">
                                      {['🚀', '💻', '🧠', '📊', '📧', '🌐', '📚', '💡', '🛠️', '🔬', '🎓', '🪐', '🎨', '🔥', '⚙️', '🔍'].map((em) => (
                                        <button
                                          key={em}
                                          type="button"
                                          onClick={() => {
                                            setNewLinkEmoji(em);
                                            setShowEmojiPicker(false);
                                          }}
                                          className={`w-7 h-7 text-sm rounded-md transition cursor-pointer flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 border ${
                                            newLinkEmoji === em 
                                              ? 'bg-white dark:bg-slate-900 border-indigo-500/70 scale-105 shadow-2xs' 
                                              : 'border-transparent'
                                          }`}
                                        >
                                          {em}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {newLinkIconType === 'text' && (
                                  <div className="flex flex-col gap-1.5 mt-1 animate-fade-in">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">文字内容:</span>
                                      <input
                                        type="text"
                                        maxLength={4}
                                        placeholder="例：学术, AI"
                                        value={newLinkIconText}
                                        onChange={(e) => setNewLinkIconText(e.target.value)}
                                        className="flex-1 text-[11px] px-2 py-0.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400"
                                      />
                                    </div>
                                  </div>
                                )}

                                {newLinkIconType === 'text' && (
                                  <div className="flex flex-col gap-1.5 mt-1.5 animate-fade-in">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">选择图标配色:</span>
                                    <div className="flex flex-wrap gap-2 mt-0.5">
                                      {Object.entries({
                                        teal: { label: '青绿', bg: 'bg-gradient-to-br from-teal-500 to-emerald-600' },
                                        indigo: { label: '靛蓝', bg: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
                                        blue: { label: '蓝色', bg: 'bg-gradient-to-br from-blue-500 to-cyan-600' },
                                        rose: { label: '玫瑰', bg: 'bg-gradient-to-br from-rose-500 to-pink-600' },
                                        amber: { label: '琥珀', bg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
                                        violet: { label: '紫色', bg: 'bg-gradient-to-br from-violet-500 to-fuchsia-600' },
                                        emerald: { label: '硬绿', bg: 'bg-gradient-to-br from-emerald-500 to-green-600' },
                                        slate: { label: '石板', bg: 'bg-gradient-to-br from-slate-500 to-slate-600' },
                                      }).map(([colorKey, info]) => (
                                        <button
                                          key={colorKey}
                                          type="button"
                                          onClick={() => setNewLinkCustomColor(colorKey)}
                                          className={`w-5.5 h-5.5 rounded-full ${info.bg} relative transition-all duration-200 cursor-pointer shadow-xs border focus:outline-hidden ${
                                            newLinkCustomColor === colorKey 
                                              ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950 scale-110 border-white dark:border-zinc-900' 
                                              : 'hover:scale-105 border-transparent'
                                          }`}
                                          title={info.label}
                                        >
                                          {newLinkCustomColor === colorKey && (
                                            <span className="absolute inset-0 flex items-center justify-center">
                                              <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                                            </span>
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between gap-1.5 mt-1 p-1 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate shrink-0">图标实时匹配及预览：</span>
                                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                                    <ExternalFavicon
                                      url={newLinkUrl}
                                      name={newLinkName || '新'}
                                      size="sm"
                                      useFavicon={newLinkIconType === 'favicon'}
                                      iconText={newLinkIconType === 'text' ? newLinkIconText : ''}
                                      isEmoji={newLinkIconType === 'emoji'}
                                      emoji={newLinkEmoji}
                                      icon={autoAssignIcon(newLinkUrl, newLinkName)}
                                      customColor={newLinkCustomColor}
                                    />
                                  </div>
                                  <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 px-1 py-0.5 rounded-sm truncate">
                                    {autoAssignIcon(newLinkUrl, newLinkName)}
                                  </span>
                                </div>
                                <button
                                  type="submit"
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-md transition-all shadow-xs cursor-pointer shrink-0"
                                >
                                  {editingLinkId ? "保存修改" : "录入"}
                                </button>
                              </div>
                            </form>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                        {/* Collapsible External Links Grid in Icons Mode */}
                        <AnimatePresence initial={false}>
                          {isExternalShortcutExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                              animate={{ height: 'auto', opacity: 1, marginTop: 4, transitionEnd: { overflow: 'visible' } }}
                              exit={{ height: 0, opacity: 0, marginTop: 0, overflow: 'hidden' }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                              <div id="external-tools-grid-icons" className="grid grid-cols-4 gap-y-3 gap-x-3 pt-2 pb-1.5 px-1.5">
                                {externalLinks.map((ext, idx) => {
                                  const activeBgHover = 'group-hover:border-indigo-400 group-hover:bg-indigo-50/15 dark:group-hover:bg-indigo-950/40 group-hover:shadow-indigo-100/15';
                                  const activeTextColor = 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400';

                                  return (
                                    <div key={ext.id} className="relative group/parent">
                                      <a
                                        id={`external-icon-card-${ext.id}`}
                                        href={isEditModeActive ? undefined : ext.url}
                                        target={isEditModeActive ? undefined : "_blank"}
                                        rel="noopener noreferrer"
                                        onClick={isEditModeActive ? (e) => { e.preventDefault(); handleStartEditExternalLink(ext); } : undefined}
                                        className="group flex flex-col items-center justify-start text-center cursor-pointer min-w-0 p-0.5"
                                        title={isEditModeActive ? `编辑: ${ext.name}` : `${ext.name}\n${ext.description}\n\n点击立即跳转: ${ext.url}`}
                                      >
                                        <motion.div
                                          className={`w-[68px] h-[68px] rounded-[20px] bg-gradient-to-br from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-950 border border-slate-200/80 dark:border-zinc-800 ${isEditModeActive ? 'transition-none' : 'transition-all duration-300'} flex items-center justify-center relative shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.03)] ${activeBgHover}`}
                                          animate={isEditModeActive ? {
                                            rotate: idx % 2 === 0 ? [-1.2, 1.2, -1.2] : [1.2, -1.2, 1.2],
                                            y: idx % 2 === 0 ? [-0.6, 0.6, -0.6] : [0.6, -0.6, 0.6],
                                          } : { rotate: 0, y: 0 }}
                                          transition={isEditModeActive ? {
                                            duration: 0.18 + (idx % 3) * 0.04,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                          } : { duration: 0.2 }}
                                        >
                                          {/* Inner Icon */}
                                          <div className="transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                                            <ExternalFavicon
                                              url={ext.url}
                                              name={ext.name}
                                              size="lg"
                                              useFavicon={ext.useFavicon !== false}
                                              iconText={ext.iconText}
                                              isEmoji={ext.isEmoji}
                                              emoji={ext.emoji}
                                              icon={ext.icon}
                                              customColor={ext.customColor}
                                            />
                                          </div>

                                          {/* Edit Mode Overlay directly on the icon box */}
                                          {isEditModeActive && (
                                            <div className="absolute inset-0 bg-slate-900/40 rounded-[20px] backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200 z-10 animate-fade-in">
                                              <SquarePen className="w-5.5 h-5.5 text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
                                            </div>
                                          )}

                                          {/* Phone-style Delete button overlay at TOP-RIGHT (右上角) of the icon square */}
                                          {isEditModeActive && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDeleteExternalLink(ext.id, ext.name);
                                              }}
                                              className="absolute -top-1.5 -right-1.5 w-5.5 h-5.5 bg-rose-500 hover:bg-rose-600 active:scale-90 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer z-20 transition-all border border-white"
                                              title={`删除 ${ext.name}`}
                                            >
                                              <X className="w-3.5 h-3.5 text-white font-bold" />
                                            </button>
                                          )}
                                        </motion.div>

                                        {/* Text label underneath */}
                                        <span className={`text-[11px] text-slate-500 dark:text-zinc-400 font-bold mt-2 tracking-tight truncate max-w-full leading-tight transition-colors duration-300 ${activeTextColor}`}>
                                          {ext.name}
                                        </span>
                                      </a>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      /* Classic App Launcher List */
                      <div className="flex flex-col gap-4">
                        <div id="digital-assets-app-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-4">
                          {services.map(srv => {
                            const activeUrl = routePreference === 'tailscale' ? srv.tailscaleUrl : srv.localUrl;
                            const activeBgHover = routePreference === 'tailscale'
                              ? 'hover:border-emerald-400/60 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/20 hover:shadow-emerald-100/20'
                              : 'hover:border-indigo-400/60 hover:bg-indigo-50/10 dark:hover:bg-indigo-950/20 hover:shadow-indigo-100/20';
                            const pulseDotColor = routePreference === 'tailscale'
                              ? 'bg-emerald-500'
                              : 'bg-indigo-500';

                            return (
                              <a
                                id={`service-card-${srv.id}`}
                                key={srv.id}
                                href={activeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group relative border border-slate-200/80 dark:border-zinc-800/85 bg-gradient-to-br from-white to-slate-50/30 dark:from-zinc-900 dark:to-zinc-900/10 rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm flex items-center justify-between gap-4 text-left cursor-pointer ${activeBgHover}`}
                                title={`点击快捷跳转：${activeUrl}`}
                              >
                                {/* Subtle side glow indicator matching active route preference */}
                                <div className={`absolute left-0 top-3 bottom-3 w-[2.5px] rounded-r scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300 ${
                                  routePreference === 'tailscale' ? 'bg-emerald-500' : 'bg-indigo-500'
                                }`} />

                                <div className="flex items-start gap-3.5 min-w-0">
                                  {/* Richer app icon frame with matching color feedback on group hover */}
                                  <div className={`p-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-700/60 group-hover:scale-105 rounded-xl transition-all flex items-center justify-center shrink-0 ${
                                    routePreference === 'tailscale'
                                      ? 'group-hover:bg-emerald-50/55 dark:group-hover:bg-emerald-950/60 group-hover:border-emerald-200 dark:group-hover:border-emerald-800/70'
                                      : 'group-hover:bg-indigo-50/55 dark:group-hover:bg-indigo-950/60 group-hover:border-indigo-200 dark:group-hover:border-indigo-800/70'
                                  }`}>
                                    {getServiceIcon(srv.icon)}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-xs sm:text-sm tracking-tight leading-snug group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                        {srv.name}
                                      </h4>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-1 leading-normal">
                                      {srv.description}
                                    </p>

                                    {/* Selected route destination label with coordinated text colors */}
                                    <div className="mt-1.5 flex items-center gap-1.5">
                                      <span className={`w-1.5 h-1.5 rounded-full ${pulseDotColor} animate-pulse shrink-0`}></span>
                                      <span className={`text-[10px] font-mono truncate max-w-[200px] transition-colors duration-300 ${
                                        routePreference === 'tailscale' 
                                          ? 'text-emerald-600 dark:text-emerald-400 font-medium' 
                                          : 'text-indigo-600 dark:text-indigo-400 font-medium'
                                      }`}>
                                        {routePreference === 'tailscale' ? 'TS 专网 ' : '物理内网 '}: {activeUrl.replace(/^https?:\/\//i, '')}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Action arrow with dynamic route preference colors */}
                                <div className={`p-2 rounded-lg transition duration-150 shrink-0 ${
                                  routePreference === 'tailscale'
                                    ? 'text-slate-400 dark:text-zinc-400 bg-slate-50/60 dark:bg-zinc-800/80 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 group-hover:bg-emerald-100/60 dark:group-hover:bg-emerald-950/40'
                                    : 'text-slate-400 dark:text-zinc-400 bg-slate-50/60 dark:bg-zinc-800/80 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 group-hover:bg-indigo-100/60 dark:group-hover:bg-indigo-950/40'
                                }`}>
                                  <ArrowUpRight className="w-4 h-4" />
                                </div>
                              </a>
                            );
                          })}
                        </div>

                        {/* Collapsible Widget: 外部快捷通道 */}
                        <div className="border border-slate-200/70 dark:border-zinc-800 bg-slate-50/45 dark:bg-zinc-900/30 hover:bg-slate-50/80 dark:hover:bg-zinc-900/55 rounded-xl p-3.5 transition-all">
                          <div className="w-full flex items-center justify-between text-left">
                            <button
                              type="button"
                              onClick={toggleExternalShortcutExpanded}
                              className="flex items-center gap-2.5 min-w-0 flex-1 focus:outline-hidden cursor-pointer text-left"
                            >
                              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0 flex items-center justify-center">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex flex-col justify-center">
                                <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 tracking-tight leading-none">外部快捷通道</span>
                                <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 leading-none">一键直达公共学术及辅助工具项目</span>
                              </div>
                            </button>
 
                            <div className="flex items-center gap-2 shrink-0 select-none">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-sm">
                                {externalLinks.length} 个工具
                              </span>
                              {externalLinks.length !== DEFAULT_EXTERNAL_LINKS.length && (
                                <button
                                  type="button"
                                  onClick={handleResetExternalLinks}
                                  className="text-[10px] font-extrabold text-slate-400 dark:text-zinc-500 hover:text-indigo-650 transition cursor-pointer px-1"
                                >
                                  重置
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setIsEditModeActive(!isEditModeActive);
                                  if (!isEditModeActive) {
                                    setIsExternalShortcutExpanded(true);
                                  }
                                }}
                                className={`p-1 rounded-md transition cursor-pointer flex items-center justify-center ${isEditModeActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-200/50'}`}
                                title={isEditModeActive ? "退出编辑与删除模式" : "进入编辑与删除模式"}
                              >
                                <SquarePen className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextState = !isAddingLink;
                                  setIsAddingLink(nextState);
                                  if (nextState) {
                                    setActiveAddTab('preset');
                                    setIsExternalShortcutExpanded(true);
                                  }
                                  setEditingLinkId(null);
                                  setNewLinkName('');
                                  setNewLinkUrl('');
                                  setNewLinkDesc('');
                                }}
                                className={`p-1 hover:bg-slate-200/50 rounded-md transition cursor-pointer focus:outline-hidden ${isAddingLink ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-indigo-600'}`}
                                title={isAddingLink ? "收起面板" : "添加与推荐预设应用库"}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                           {/* Expansion wrapper for management form and grid list */}
                           <AnimatePresence initial={false}>
                             {isExternalShortcutExpanded && (
                               <motion.div
                                 initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                 animate={{ height: 'auto', opacity: 1, marginTop: 12, transitionEnd: { overflow: 'visible' } }}
                                 exit={{ height: 0, opacity: 0, marginTop: 0, overflow: 'hidden' }}
                                 transition={{ duration: 0.2, ease: "easeInOut" }}
                                 className=""
                               >
                                  <AnimatePresence initial={false}>
                                    {isAddingLink && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                                        animate={{ height: 'auto', opacity: 1, marginBottom: 12, transitionEnd: { overflow: 'visible' } }}
                                        exit={{ height: 0, opacity: 0, marginBottom: 0, overflow: 'hidden' }}
                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                        className="border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-3.5 rounded-xl mb-3 shadow-[inset_0_1px_2px_rgba(99,102,241,0.02)] flex flex-col gap-3 text-left"
                                      >
                                      {/* Seamless Header Tabs */}
                                      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2">
                                        <div className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-zinc-800 p-0.5 rounded-lg select-none">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setActiveAddTab('preset');
                                              setEditingLinkId(null);
                                            }}
                                            className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                                              activeAddTab === 'preset'
                                                ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                                            }`}
                                          >
                                            推荐预设应用库
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setActiveAddTab('custom')}
                                            className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                                              activeAddTab === 'custom'
                                                ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                                            }`}
                                          >
                                            {editingLinkId ? '编辑自定义链接' : '新增自定义链接'}
                                          </button>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setIsAddingLink(false);
                                            handleCancelEdit();
                                          }}
                                          className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 transition cursor-pointer p-1 rounded-md hover:bg-slate-200/40 dark:hover:bg-zinc-800"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      {activeAddTab === 'preset' ? (
                                        /* Preset App Library View */
                                        <div className="flex flex-col gap-3 animate-fade-in pb-1 text-left">
                                          {/* Category Selectors & Search Input */}
                                          <div className="flex flex-col gap-2">
                                            {/* Search Input bar */}
                                            <div className="relative">
                                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                                <Search className="w-3 h-3 text-slate-400" />
                                              </span>
                                              <input
                                                type="text"
                                                placeholder="在推荐预设库中搜索..."
                                                value={presetSearchQuery}
                                                onChange={(e) => setPresetSearchQuery(e.target.value)}
                                                className="w-full text-[10.5px] pl-7.5 pr-8 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                                              />
                                              {presetSearchQuery && (
                                                <button
                                                  type="button"
                                                  onClick={() => setPresetSearchQuery('')}
                                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-0.5 rounded-md hover:bg-slate-105 dark:hover:bg-zinc-800 cursor-pointer"
                                                >
                                                  <X className="w-3 h-3" />
                                                </button>
                                              )}
                                            </div>

                                            {/* Category Selectors */}
                                            <div className="flex flex-wrap gap-1">
                                              {['全部', 'AI 智能助手', '学术/科研检索', '实用绘图/效率', '开发辅助/分享'].map((cat) => (
                                                <button
                                                  key={cat}
                                                  type="button"
                                                  onClick={() => setActivePresetCategory(cat)}
                                                  className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition cursor-pointer select-none ${
                                                    activePresetCategory === cat
                                                      ? 'bg-indigo-600 text-white border border-indigo-600 shadow-xs'
                                                      : 'bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400'
                                                  }`}
                                                >
                                                  {cat}
                                                </button>
                                              ))}
                                            </div>
                                          </div>

                                          {/* List of Preset Apps (one app per line) */}
                                          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                                            {(() => {
                                              const filteredList = PRESET_EXTERNAL_LINKS.filter(p => {
                                                const matchesCat = activePresetCategory === '全部' || p.category === activePresetCategory;
                                                const query = presetSearchQuery.trim().toLowerCase();
                                                const matchesSearch = !query || 
                                                  p.name.toLowerCase().includes(query) || 
                                                  (p.description && p.description.toLowerCase().includes(query)) ||
                                                  p.category.toLowerCase().includes(query) ||
                                                  p.url.toLowerCase().includes(query);
                                                return matchesCat && matchesSearch;
                                              });

                                              if (filteredList.length === 0) {
                                                return (
                                                  <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/20 dark:bg-zinc-900/10">
                                                    <Search className="w-5 h-5 text-slate-350 dark:text-zinc-650 mb-1" />
                                                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold">没有匹配的预设应用</p>
                                                    {(presetSearchQuery || activePresetCategory !== '全部') && (
                                                      <button
                                                        type="button"
                                                        onClick={() => { setPresetSearchQuery(''); setActivePresetCategory('全部'); }}
                                                        className="text-[9px] text-indigo-600 dark:text-indigo-400 hover:underline mt-1 font-bold cursor-pointer"
                                                      >
                                                        重置筛选条件
                                                      </button>
                                                    )}
                                                  </div>
                                                );
                                              }

                                              return filteredList.map((preset, index) => {
                                                const added = isPresetAdded(preset.url, preset.name);
                                                return (
                                                  <div 
                                                    key={index}
                                                    className="flex items-start justify-between gap-3 p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xs hover:border-indigo-200/65 dark:hover:border-indigo-900/50 transition-all min-w-0"
                                                  >
                                                    <div className="flex items-start gap-2.5 min-w-0 flex-1 text-left">
                                                      <div className="p-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700/65 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                                                        <ExternalFavicon
                                                          url={preset.url}
                                                          name={preset.name}
                                                          size="sm"
                                                          useFavicon={preset.useFavicon !== false}
                                                          isEmoji={preset.isEmoji}
                                                          emoji={preset.emoji}
                                                          iconText={preset.iconText}
                                                          customColor={preset.customColor}
                                                          icon="ExternalLink"
                                                        />
                                                      </div>
                                                      <div className="min-w-0 flex-1 flex flex-col pt-0.5 text-left">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                          <a 
                                                            href={preset.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-[11.5px] font-bold text-slate-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer group/preset-lbl truncate leading-tight"
                                                            title={`在浏览器中打开: ${preset.url}`}
                                                          >
                                                            <span className="truncate group-hover/preset-lbl:underline">{preset.name}</span>
                                                            <ExternalLink className="w-2.5 h-2.5 text-slate-450 dark:text-zinc-500 shrink-0 opacity-60 group-hover/preset-lbl:opacity-100 transition-opacity" />
                                                          </a>
                                                          <span className="text-[8px] px-1 py-0.2 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-550 rounded-xs shrink-0 font-medium">{preset.category}</span>
                                                        </div>
                                                        <span className="text-[9.5px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed" title={preset.description}>
                                                          {preset.description}
                                                        </span>
                                                      </div>
                                                    </div>
                                                    <button
                                                      type="button"
                                                      disabled={added}
                                                      onClick={() => handleAddPresetLink(preset)}
                                                      className={`shrink-0 p-1.5 rounded-lg cursor-pointer transition select-none flex items-center justify-center mt-1 ${
                                                        added
                                                          ? 'bg-slate-50 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border border-transparent cursor-not-allowed opacity-80'
                                                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-755 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/30 shadow-2xs hover:scale-105 active:scale-95'
                                                      }`}
                                                      title={added ? "已添加" : "一键添加外部链接"}
                                                    >
                                                      {added ? (
                                                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                                      ) : (
                                                        <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
                                                      )}
                                                    </button>
                                                  </div>
                                                );
                                              });
                                            })()}
                                          </div>
                                        </div>
                                      ) : (
                                        /* Custom Add Link Form */
                                        <form onSubmit={handleSaveOrUpdateExternalLink} className="flex flex-col gap-2.5 w-full">

                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400">名称 *</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="比如: 百度学术"
                                      value={newLinkName}
                                      onChange={(e) => setNewLinkName(e.target.value)}
                                      className="w-full text-xs px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400">网址 *</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="baidu.com"
                                      value={newLinkUrl}
                                      onChange={(e) => setNewLinkUrl(e.target.value)}
                                      className="w-full text-xs px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-mono placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400">简短说明 (可选)</label>
                                  <input
                                    type="text"
                                    placeholder="对该外部快捷工具的描述..."
                                    value={newLinkDesc}
                                    onChange={(e) => setNewLinkDesc(e.target.value)}
                                    className="w-full text-xs px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                                  />
                                </div>

                                <div className="flex flex-col gap-1.5 mt-0.5 pb-1 border-b border-slate-200/45 dark:border-slate-800 border-dashed">
                                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">图标展示方式:</span>
                                  <div className="grid grid-cols-3 gap-1 bg-slate-50/80 dark:bg-slate-950 p-1 border border-slate-200/50 dark:border-slate-800 rounded-lg">
                                    {[
                                      { key: 'favicon', label: '网站 Favicon' },
                                      { key: 'emoji', label: 'Emoji 图标' },
                                      { key: 'text', label: '自定义文字' }
                                    ].map((tab) => (
                                      <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setNewLinkIconType(tab.key as any)}
                                        className={`py-1 text-[10px] font-bold rounded-md transition cursor-pointer text-center ${
                                          newLinkIconType === tab.key
                                            ? 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-extrabold shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                        }`}
                                      >
                                        {tab.label}
                                      </button>
                                    ))}
                                  </div>

                                  {newLinkIconType === 'emoji' && (
                                    <div className="flex flex-col gap-1.5 mt-1 animate-fade-in relative">
                                      <div className="flex flex-row items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 shrink-0">输入或选择 Emoji:</span>
                                        <input
                                          type="text"
                                          maxLength={2}
                                          placeholder="🚀"
                                          value={newLinkEmoji}
                                          onChange={(e) => {
                                            setNewLinkEmoji(e.target.value);
                                            setShowEmojiPicker(false);
                                          }}
                                          className="w-12 text-xs px-2 py-0.5 text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-zinc-100 font-medium font-emoji"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                          className="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-650 dark:text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-100/40 dark:border-indigo-900/30 transition cursor-pointer flex items-center justify-center gap-1 select-none active:scale-95"
                                        >
                                          <span>🤩 弹出完整表情库</span>
                                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${showEmojiPicker ? 'rotate-180' : ''}`} />
                                        </button>
                                      </div>

                                      {showEmojiPicker && (
                                        <>
                                          <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                                          <div className="absolute right-0 top-full mt-2 z-50 shadow-2xl border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden emoji-picker-container bg-white dark:bg-zinc-950">
                                            <EmojiPicker
                                              {...emojiPickerProps}
                                              onEmojiClick={handleEmojiPickerClick}
                                            />
                                          </div>
                                        </>
                                      )}

                                      <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-1.5 rounded-lg max-h-[72px] overflow-y-auto w-full">
                                        {['🚀', '💻', '🧠', '📊', '📧', '🌐', '📚', '💡', '🛠️', '🔬', '🎓', '🪐', '🎨', '🔥', '⚙️', '🔍'].map((em) => (
                                          <button
                                            key={em}
                                            type="button"
                                            onClick={() => {
                                              setNewLinkEmoji(em);
                                              setShowEmojiPicker(false);
                                            }}
                                            className={`w-7 h-7 text-sm rounded-md transition cursor-pointer flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 border ${
                                              newLinkEmoji === em 
                                                ? 'bg-white dark:bg-slate-900 border-indigo-500/70 scale-105 shadow-2xs' 
                                                : 'border-transparent'
                                            }`}
                                          >
                                            {em}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {newLinkIconType === 'text' && (
                                    <div className="flex flex-col gap-1.5 mt-1 animate-fade-in">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">文字内容:</span>
                                        <input
                                          type="text"
                                          maxLength={4}
                                          placeholder="例：学术, AI"
                                          value={newLinkIconText}
                                          onChange={(e) => setNewLinkIconText(e.target.value)}
                                          className="flex-1 text-[11px] px-2 py-0.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {(newLinkIconType === 'emoji' || newLinkIconType === 'text') && (
                                    <div className="flex flex-col gap-1.5 mt-1.5 animate-fade-in">
                                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">选择图标配色:</span>
                                      <div className="flex flex-wrap gap-2 mt-0.5">
                                        {Object.entries({
                                          teal: { label: '青绿', bg: 'bg-gradient-to-br from-teal-500 to-emerald-600' },
                                          indigo: { label: '靛蓝', bg: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
                                          blue: { label: '蓝色', bg: 'bg-gradient-to-br from-blue-500 to-cyan-600' },
                                          rose: { label: '玫瑰', bg: 'bg-gradient-to-br from-rose-500 to-pink-600' },
                                          amber: { label: '琥珀', bg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
                                          violet: { label: '紫色', bg: 'bg-gradient-to-br from-violet-500 to-fuchsia-600' },
                                          emerald: { label: '硬绿', bg: 'bg-gradient-to-br from-emerald-500 to-green-600' },
                                          slate: { label: '石板', bg: 'bg-gradient-to-br from-slate-500 to-slate-600' },
                                        }).map(([colorKey, info]) => (
                                          <button
                                            key={colorKey}
                                            type="button"
                                            onClick={() => setNewLinkCustomColor(colorKey)}
                                            className={`w-5.5 h-5.5 rounded-full ${info.bg} relative transition-all duration-200 cursor-pointer shadow-xs border focus:outline-hidden ${
                                              newLinkCustomColor === colorKey 
                                                ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950 scale-110 border-white dark:border-zinc-900' 
                                                : 'hover:scale-105 border-transparent'
                                            }`}
                                            title={info.label}
                                          >
                                            {newLinkCustomColor === colorKey && (
                                              <span className="absolute inset-0 flex items-center justify-center">
                                                <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                                              </span>
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between gap-1.5 mt-1 p-1 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate shrink-0">图标实时匹配及预览：</span>
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 flex items-center justify-center shrink-0">
                                      <ExternalFavicon
                                        url={newLinkUrl}
                                        name={newLinkName || '新'}
                                        size="sm"
                                        useFavicon={newLinkIconType === 'favicon'}
                                        iconText={newLinkIconType === 'text' ? newLinkIconText : ''}
                                        isEmoji={newLinkIconType === 'emoji'}
                                        emoji={newLinkEmoji}
                                        icon={autoAssignIcon(newLinkUrl, newLinkName)}
                                        customColor={newLinkCustomColor}
                                      />
                                    </div>
                                    <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 px-1 py-0.5 rounded-sm truncate">
                                      {autoAssignIcon(newLinkUrl, newLinkName)}
                                    </span>
                                  </div>
                                            <button
                                              type="submit"
                                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-755 text-white text-[10px] font-bold rounded-md transition-all shadow-xs cursor-pointer shrink-0"
                                            >
                                              {editingLinkId ? "保存修改" : "录入"}
                                            </button>
                                          </div>
                                        </form>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                <div className="grid grid-cols-2 gap-3 pt-0.5">
                                  {externalLinks.map(ext => (
                                    <div key={ext.id} className="relative group/parent">
                                      <a
                                        href={isEditModeActive ? undefined : ext.url}
                                        target={isEditModeActive ? undefined : "_blank"}
                                        rel="noopener noreferrer"
                                        onClick={isEditModeActive ? (e) => { e.preventDefault(); handleStartEditExternalLink(ext); } : undefined}
                                        className={`group/ext flex items-center gap-2.5 p-2.5 bg-white dark:bg-zinc-900/50 hover:bg-slate-50 dark:hover:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-500 rounded-xl transition-all duration-200 cursor-pointer text-left min-w-0 ${isEditModeActive ? 'pr-20' : ''}`}
                                        title={isEditModeActive ? `编辑: ${ext.name}` : `点击跳转至: ${ext.url}\n${ext.description}`}
                                      >
                                        <div className="p-1.5 bg-slate-50 dark:bg-zinc-800/85 border border-slate-100 dark:border-zinc-700/65 rounded-lg group-hover/ext:bg-indigo-50/55 dark:group-hover:bg-indigo-950/40 group-hover/ext:border-indigo-100 dark:group-hover:border-indigo-800 transition-colors flex items-center justify-center shrink-0">
                                          <ExternalFavicon
                                            url={ext.url}
                                            name={ext.name}
                                            size="md"
                                            useFavicon={ext.useFavicon !== false}
                                            iconText={ext.iconText}
                                            isEmoji={ext.isEmoji}
                                            emoji={ext.emoji}
                                            icon={ext.icon}
                                            customColor={ext.customColor}
                                          />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover/ext:text-indigo-600 dark:group-hover/ext:text-indigo-400 transition-colors tracking-tight flex items-center gap-0.5">
                                            <span className="truncate">{ext.name}</span>
                                            {!isEditModeActive && <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-0 group-hover/ext:opacity-100 transition-opacity shrink-0" />}
                                          </div>
                                          <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate leading-tight mt-0.5">{ext.description}</p>
                                        </div>
                                      </a>
 
                                      {/* Deletion and Edit overlay for list mode */}
                                      {isEditModeActive ? (
                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10 animate-fade-in">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              handleStartEditExternalLink(ext);
                                            }}
                                            className="p-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition shadow-xs cursor-pointer flex items-center justify-center"
                                            title={`编辑 ${ext.name}`}
                                          >
                                            <SquarePen className="w-3 h-3 text-white" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              handleDeleteExternalLink(ext.id, ext.name);
                                            }}
                                            className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition shadow-xs cursor-pointer flex items-center justify-center"
                                            title={`删除 ${ext.name}`}
                                          >
                                            <X className="w-3 h-3 text-white" />
                                          </button>
                                        </div>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* 地址转换回到内网专区底部 */}
                <div className="mt-5 pt-4 border-t border-slate-100/80 dark:border-zinc-800">
                  <DualRouteConverter isCompact={intranetViewMode === 'icons'} />
                </div>
              </div>
            </section>

          </div>
        </div>

      </main>



      {/* ================================= FOOTER ================================= */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center text-slate-400 dark:text-zinc-500 text-xs">
        <div className="border-t border-slate-200 dark:border-zinc-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-slate-400 dark:text-zinc-500">
            © 2026 NNL Group Lab | nnlgroupdmu
          </p>
          <div className="flex gap-4">
            {/* <span className="text-[11px] text-slate-400">网络架构: 局域寻址网 & Tailscale Overlay 零信任接入</span> */}
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">版本: v3.3.2-Build</span>
          </div>
        </div>
      </footer>

      {/* ================================= RETURN TO TOP ================================= */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            id="btn-back-to-top"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 p-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-full shadow-lg hover:shadow-teal-650/20 hover:shadow-xl transition-all duration-300 group cursor-pointer border border-teal-500/30 flex items-center justify-center focus:outline-none"
            title="返回顶部"
          >
            <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
