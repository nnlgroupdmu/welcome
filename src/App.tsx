/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  BookOpen,
  Code,
  Cpu,
  ExternalLink,
  FileText,
  FolderClosed,
  Gauge,
  GitBranch,
  Github,
  Laptop,
  Layers,
  Mail,
  Package,
  Sparkles,
  StickyNote,
  Wrench
} from 'lucide-react';
import { NavItem, ServiceAsset, MemoPost, ExternalLinkAsset, CachedMemosPayload, MemosCacheSource, MemosSyncStatus } from './types';
import { DEFAULT_NAV_ITEMS, DEFAULT_SERVICES, DEFAULT_MEMOS, DEFAULT_EXTERNAL_LINKS, PRESET_EXTERNAL_LINKS } from './data';
import { Theme } from 'emoji-picker-react';
import zhEmojiData from 'emoji-picker-react/dist/data/emojis-zh';
import { AppHeaderBar } from './components/AppHeaderBar';
import { AppWelcomeBanner } from './components/AppWelcomeBanner';
import { AppSearchFilterSection } from './components/AppSearchFilterSection';
import { AppInternalNavSection } from './components/AppInternalNavSection';
import { AppMemosFeedSection } from './components/AppMemosFeedSection';
import { AppDigitalAssetsSection } from './components/AppDigitalAssetsSection';
import { AppFooter } from './components/AppFooter';
import { AppBackToTopButton } from './components/AppBackToTopButton';
import { INTERNAL_ROUTES, NETWORK_ENDPOINTS, type RoutePreference } from './appConfig';
import { CACHE_MEMOS, CACHE_USER_LINKS, MEMOS_CACHE_TTL_MS, MEMOS_REFRESH_INTERVAL_MS, STORAGE_KEYS } from './cachePolicy';
import { copyText, fetchWithTimeout, readBooleanStorage, readEnumStorage, readJsonStorage, writeJsonStorage, writeStorage } from './clientUtils';

const isMemosCacheSource = (value: unknown): value is MemosCacheSource => value === 'tailscale' || value === 'lan';

const isMemoPostArray = (value: unknown): value is MemoPost[] => Array.isArray(value);

const readCachedMemos = (): CachedMemosPayload | null => {
  const cached = readJsonStorage<unknown>(STORAGE_KEYS.memos, null);
  if (!cached) return null;

  if (isMemoPostArray(cached)) {
    return {
      items: cached,
      fetchedAt: 0,
      source: 'tailscale',
    };
  }

  if (typeof cached !== 'object') return null;
  const payload = cached as Partial<CachedMemosPayload>;
  if (!isMemoPostArray(payload.items)) return null;
  if (typeof payload.fetchedAt !== 'number') return null;
  if (!isMemosCacheSource(payload.source)) return null;

  return {
    items: payload.items,
    fetchedAt: payload.fetchedAt,
    source: payload.source,
  };
};

const isMemosCacheStale = (payload: CachedMemosPayload) => Date.now() - payload.fetchedAt > MEMOS_CACHE_TTL_MS;

export default function App() {
  const [initialCachedMemos] = useState<CachedMemosPayload | null>(() => (CACHE_MEMOS ? readCachedMemos() : null));

  // Site configuration always comes from the bundled code, never localStorage.
  const [navItems] = useState<NavItem[]>(DEFAULT_NAV_ITEMS);
  const [services] = useState<ServiceAsset[]>(DEFAULT_SERVICES);
  const [externalLinks, setExternalLinks] = useState<ExternalLinkAsset[]>(() => {
    return CACHE_USER_LINKS ? readJsonStorage(STORAGE_KEYS.externalLinks, DEFAULT_EXTERNAL_LINKS) : DEFAULT_EXTERNAL_LINKS;
  });
  const [memos, setMemos] = useState<MemoPost[]>(() => {
    return initialCachedMemos?.items.length ? initialCachedMemos.items : DEFAULT_MEMOS;
  });
  const [memosFetchedAt, setMemosFetchedAt] = useState<number | null>(() => initialCachedMemos?.fetchedAt || null);
  const [memosSource, setMemosSource] = useState<MemosCacheSource | null>(() => initialCachedMemos?.source || null);
  const [memosSyncStatus, setMemosSyncStatus] = useState<MemosSyncStatus>(() => {
    if (!initialCachedMemos?.items.length) return 'default';
    return isMemosCacheStale(initialCachedMemos) ? 'cached-stale' : 'cached-fresh';
  });
  const [isMemosRefreshing, setIsMemosRefreshing] = useState<boolean>(false);

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
  const [routePreference, setRoutePreference] = useState<RoutePreference>('tailscale');

  // Intranet Application View mode ('list' vs 'icons' with localStorage persistence)
  const [intranetViewMode, setIntranetViewMode] = useState<'list' | 'icons'>(() => {
    return readEnumStorage(STORAGE_KEYS.intranetViewMode, ['list', 'icons'], 'list');
  });

  const handleIntranetViewModeChange = (mode: 'list' | 'icons') => {
    setIntranetViewMode(mode);
    writeStorage(STORAGE_KEYS.intranetViewMode, mode);
  };

  // State to manage collapisble external shortcuts widget in list mode
  const [isExternalShortcutExpanded, setIsExternalShortcutExpanded] = useState<boolean>(() => {
    return readBooleanStorage(STORAGE_KEYS.externalShortcutExpanded, true);
  });

  const toggleExternalShortcutExpanded = () => {
    setIsExternalShortcutExpanded(prev => {
      const newVal = !prev;
      writeStorage(STORAGE_KEYS.externalShortcutExpanded, String(newVal));
      return newVal;
    });
  };

  // Explict three-state theme management: 'light' | 'dark' | 'system'
  type ThemeMode = 'light' | 'dark' | 'system';

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return readEnumStorage(STORAGE_KEYS.themeMode, ['light', 'dark', 'system'], 'system');
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.themeMode, themeMode);

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
  const [newLinkUseMatchedLucide, setNewLinkUseMatchedLucide] = useState<boolean>(false);
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
    const matchedIcon = autoAssignIcon(newLinkUrl.trim(), newLinkName.trim());
    const assignedIcon = newLinkIconType === 'favicon' || (newLinkIconType === 'text' && newLinkUseMatchedLucide)
      ? matchedIcon
      : '';
    const finalUrl = newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`;

    const useFavicon = newLinkIconType === 'favicon';
    const isEmoji = newLinkIconType === 'emoji';
    const finalEmoji = isEmoji ? newLinkEmoji : undefined;
    const finalIconText = newLinkIconType === 'text' && !newLinkUseMatchedLucide ? (newLinkIconText.trim() || undefined) : undefined;
    const customColor = newLinkIconType === 'text' ? newLinkCustomColor : undefined;

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
      setIsEditModeActive(false);
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
    setNewLinkUseMatchedLucide(false);
    setNewLinkEmoji('🚀');
    setNewLinkCustomColor('teal');
    setShowEmojiPicker(false);
    setIsAddingLink(false);
  };

  const handleReorderExternalLinks = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    setExternalLinks(prev => {
      const draggedIndex = prev.findIndex(item => item.id === draggedId);
      const targetIndex = prev.findIndex(item => item.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const next = [...prev];
      const [draggedItem] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, draggedItem);
      return next;
    });
  };

  const handleStartEditExternalLink = (ext: ExternalLinkAsset) => {
    setEditingLinkId(ext.id);
    setNewLinkName(ext.name);
    setNewLinkUrl(ext.url);
    setNewLinkDesc(ext.description);
    
    if (ext.isEmoji) {
      setNewLinkIconType('emoji');
      setNewLinkEmoji(ext.emoji || '🚀');
      setNewLinkUseMatchedLucide(false);
      setNewLinkUseFavicon(false);
    } else if (ext.iconText) {
      setNewLinkIconType('text');
      setNewLinkUseMatchedLucide(false);
      setNewLinkUseFavicon(false);
    } else if (ext.useFavicon) {
      setNewLinkIconType('favicon');
      setNewLinkUseMatchedLucide(false);
      setNewLinkUseFavicon(true);
    } else {
      setNewLinkIconType('text');
      setNewLinkUseMatchedLucide(Boolean(ext.icon));
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
    setNewLinkUseMatchedLucide(false);
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
      icon: preset.icon ?? autoAssignIcon(preset.url, preset.name),
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
  const handleRoutePreferenceChange = (newPref: RoutePreference) => {
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

  const fetchRemoteMemos = useCallback(async (options: { silent?: boolean } = {}) => {
    if (!options.silent) {
      setMemosSyncStatus('syncing');
    }
    setIsMemosRefreshing(true);

    const targets: Array<{ source: MemosCacheSource; url: string }> = [
      { source: 'tailscale', url: INTERNAL_ROUTES.tailscale.memosApi },
      { source: 'lan', url: INTERNAL_ROUTES.lan.memosApi }
    ];

    const fetchSinglePath = async ({ source, url }: { source: MemosCacheSource; url: string }) => {
      const response = await fetchWithTimeout(url, {}, NETWORK_ENDPOINTS.timeouts.memosMs);
      if (!response.ok) throw new Error(`HTTP 错误: ${response.status}`);
      const data = await response.json();
      return { data, source };
    };

    try {
      const { data, source } = await Promise.any(targets.map(target => fetchSinglePath(target)));
      const list = Array.isArray(data) ? data : (data.memos || data.data || []);
      if (!list || list.length === 0) throw new Error('No memos returned');

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

        const fetchedAt = Date.now();
        setMemos(mapped);
        setMemosFetchedAt(fetchedAt);
        setMemosSource(source);
        setMemosSyncStatus('live');

        if (CACHE_MEMOS) {
          writeJsonStorage(STORAGE_KEYS.memos, {
            items: mapped,
            fetchedAt,
            source,
          } satisfies CachedMemosPayload);
        }
      }
    } catch {
      setMemos(prev => {
        if (prev.length > 0 && memosFetchedAt !== null) {
          setMemosSyncStatus('offline-cache');
          return prev;
        }
        setMemosSyncStatus('error');
        return DEFAULT_MEMOS;
      });
    } finally {
      setIsMemosRefreshing(false);
    }
  }, [memosFetchedAt]);

  const testTailscaleConnection = async () => {
    setTailscaleStatus('testing');

    const targets = [
      INTERNAL_ROUTES.tailscale.memos,
      INTERNAL_ROUTES.tailscale.giteaExplore,
      INTERNAL_ROUTES.tailscale.alist
    ];

    const fetchTest = async (url: string) => {
      await fetchWithTimeout(url, { mode: 'no-cors' }, NETWORK_ENDPOINTS.timeouts.tailscaleProbeMs);
      return url;
    };
    const startTime = Date.now();
    try {
      await Promise.any(targets.map(url => fetchTest(url)));
      setLatency(Date.now() - startTime);
      setTailscaleStatus('connected');
    } catch {
      setLatency(null);
      setTailscaleStatus('error');
    }
  };

  const testLanConnection = async () => {
    setLanStatus('testing');

    const targetUrl = INTERNAL_ROUTES.lan.memos;

    const startTime = Date.now();
    try {
      await fetchWithTimeout(targetUrl, { mode: 'no-cors' }, NETWORK_ENDPOINTS.timeouts.lanProbeMs);
      setLanLatency(Date.now() - startTime);
      setLanStatus('connected');
    } catch {
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

  useEffect(() => {
    const refreshVisibleMemos = () => {
      if (document.visibilityState === 'visible') {
        fetchRemoteMemos({ silent: true });
      }
    };

    const timerId = window.setInterval(refreshVisibleMemos, MEMOS_REFRESH_INTERVAL_MS);
    document.addEventListener('visibilitychange', refreshVisibleMemos);

    return () => {
      window.clearInterval(timerId);
      document.removeEventListener('visibilitychange', refreshVisibleMemos);
    };
  }, [fetchRemoteMemos]);

  useEffect(() => {
    if (CACHE_USER_LINKS) {
      writeJsonStorage(STORAGE_KEYS.externalLinks, externalLinks);
    }
  }, [externalLinks]);

  // Utility to copy text to clipboard
  const handleCopyToClipboard = async (text: string, id: string) => {
    const copied = await copyText(text);
    setCopiedId(copied ? id : 'copy-error');
    window.setTimeout(() => setCopiedId(null), 1800);
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
    const normalizeUrl = (value: string) => {
      try {
        const withProtocol = value.trim().match(/^https?:\/\//i) ? value.trim() : `https://${value.trim()}`;
        const parsed = new URL(withProtocol);
        return `${parsed.hostname.replace(/^www\./i, '')}${parsed.pathname.replace(/\/+$/, '')}`.toLowerCase();
      } catch {
        return value.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/+$/, '').toLowerCase().trim();
      }
    };

    const normalizedUrl = normalizeUrl(url);
    const normalizedName = name.toLowerCase().trim();
    const combined = `${normalizedUrl} ${normalizedName}`;
    const hasUrlInput = normalizedUrl.length > 0;
    const hasNameInput = normalizedName.length > 0;
    const knownLinks = [...DEFAULT_EXTERNAL_LINKS, ...PRESET_EXTERNAL_LINKS];
    const knownMatch = knownLinks.find(item => {
      const itemUrl = normalizeUrl(item.url);
      const itemName = item.name.toLowerCase();
      return Boolean(item.icon) && (
        (hasUrlInput && (
          normalizedUrl === itemUrl ||
          normalizedUrl.startsWith(itemUrl) ||
          itemUrl.startsWith(normalizedUrl)
        )) ||
        (hasNameInput && (
          normalizedName === itemName ||
          normalizedName.includes(itemName) ||
          itemName.includes(normalizedName)
        ))
      );
    });
    if (knownMatch?.icon) return knownMatch.icon;

    const hasAny = (keywords: string[]) => keywords.some(keyword => combined.includes(keyword));

    if (hasAny(['deepseek', 'claude', 'anthropic', 'kimi', 'moonshot', 'chatgpt', 'openai', 'gpt', 'gemini', 'copilot', 'perplexity', 'huggingface', 'modelscope', '大模型', '模型'])) return 'Sparkles';
    if (hasAny(['ai', 'assistant', 'bot', 'chat', '智能助手', '助手'])) return 'Sparkles';
    if (hasAny(['translate', 'translator', 'deepl', 'youdao', 'google translate', 'fanyi', '翻译', '词典', '语言'])) return 'Languages';
    if (hasAny(['scholar', 'semantic', 'pubmed', 'arxiv', 'research', 'search', '检索', '搜索', '学术'])) return 'Search';
    if (hasAny(['connectedpapers', 'citation', 'cite', 'graph', 'network', 'references', '引用', '关联', '图谱'])) return 'Network';
    if (hasAny(['dblp', 'database', 'dataset', 'kaggle', 'sql', 'db', '数据库', '数据集', '数据'])) return 'Database';
    if (hasAny(['overleaf', 'latex', 'paper', 'pdf', 'doc', 'docs', 'document', 'write', 'markdown', 'notion', 'yuque', 'wolai', '论文', '文档', '写作', '笔记'])) return 'FileText';
    if (hasAny(['github', 'gitlab', 'gitea', 'git', 'repo', 'repository', '代码托管', '仓库'])) return 'Github';
    if (hasAny(['stackoverflow', 'stack overflow', 'codepen', 'codesandbox', 'carbon', 'dev', 'developer', 'code', 'program', 'compile', 'ide', 'api', 'sdk', '开发', '编程', '代码'])) return 'Code';
    if (hasAny(['mdn', 'web.dev', 'frontend', 'html', 'css', 'javascript', 'typescript', 'react', 'vue', '前端', '网页', '网站'])) return 'PanelsTopLeft';
    if (hasAny(['processon', 'draw.io', 'diagrams', 'diagram', 'flowchart', 'workflow', 'mindmap', 'xmind', '流程图', '脑图', '导图'])) return 'Workflow';
    if (hasAny(['excalidraw', 'figma', 'sketch', 'draw', 'whiteboard', 'canvas', 'design', '白板', '绘图', '设计'])) return 'PenTool';
    if (hasAny(['tinypng', 'image', 'photo', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'compress', 'squoosh', '图片', '图像', '压图'])) return 'Image';
    if (hasAny(['bilibili', 'youtube', 'video', 'media', 'movie', 'course', 'lecture', '视频', '课程', '讲座'])) return 'Video';
    if (hasAny(['mail', 'email', 'coremail', 'webmail', 'post', '@', 'letter', '邮箱', '邮件'])) return 'Mail';
    if (hasAny(['yjs', 'graduate', 'study', 'class', 'course', 'edu', 'university', 'school', 'portal', '教务', '研究生', '学校', '课程'])) return 'Package';
    if (hasAny(['grafana', 'prometheus', 'metrics', 'monitor', 'dashboard', 'status', 'gauge', 'uptime', '监控', '仪表盘', '状态'])) return 'Gauge';
    if (hasAny(['alist', 'folder', 'drive', 'cloud', 'box', 'pan', 'nas', 'storage', 'file', '网盘', '云盘', '文件', '存储'])) return 'FolderClosed';
    if (hasAny(['cpu', 'gpu', 'nvidia', 'hardware', 'server', 'cuda', '服务器', '显卡', '硬件'])) return 'Cpu';
    if (hasAny(['memos', 'memo', 'note', 'diary', 'todo', 'sticky', '便签', '备忘', '日记', '待办'])) return 'StickyNote';
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
      <AppHeaderBar
        copiedId={copiedId}
        handleCopyToClipboard={handleCopyToClipboard}
        handleRefreshAndCheck={handleRefreshAndCheck}
        handleRoutePreferenceChange={handleRoutePreferenceChange}
        isThemeDropdownOpen={isThemeDropdownOpen}
        lanLatency={lanLatency}
        lanStatus={lanStatus}
        latency={latency}
        routePreference={routePreference}
        setIsThemeDropdownOpen={setIsThemeDropdownOpen}
        setThemeMode={setThemeMode}
        tailscaleStatus={tailscaleStatus}
        themeMode={themeMode}
      />

      {/* ================================= INTRO BANNER ================================= */}
      <AppWelcomeBanner />

      {/* ================================= SEARCH CONTROL BAR ================================= */}
      <AppSearchFilterSection
        allMemoTags={allMemoTags}
        searchQuery={searchQuery}
        selectedTag={selectedTag}
        setSearchQuery={setSearchQuery}
        setSelectedTag={setSelectedTag}
      />

      {/* ================================= MAIN SECTIONS GRID ================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ================================= 左侧栏目 (Left Columns Container) ================================= */}
        <div className="contents lg:flex lg:flex-col lg:gap-8 lg:col-span-7">

          {/* ----------------- 1. 站内专区 (INTERNAL NAVIGATION) ----------------- */}
          <AppInternalNavSection
            activeCategory={activeCategory}
            allNavCategories={allNavCategories}
            filteredNavItems={filteredNavItems}
            getCategoryIcon={getCategoryIcon}
            isNavExpanded={isNavExpanded}
            setActiveCategory={setActiveCategory}
            setIsNavExpanded={setIsNavExpanded}
          />

          {/* ----------------- 3. 资讯专区 (INFORMATION FEED - MEMOS) ----------------- */}
          <AppMemosFeedSection
            filteredMemos={filteredMemos}
            isMemosRefreshing={isMemosRefreshing}
            memosFetchedAt={memosFetchedAt}
            memosSource={memosSource}
            memosSyncStatus={memosSyncStatus}
            routePreference={routePreference}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            setVisibleMemosCount={setVisibleMemosCount}
            visibleMemosCount={visibleMemosCount}
          />

        </div>

        {/* ================================= 右侧栏目 (Right Column Container) ================================= */}
        <div className="w-full lg:col-span-5 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:flex lg:flex-col">

          {/* 内部滚动壳：负责在高度不够时提供滚动，pr-2 为右侧滚动条留出空隙防止挤压内容 */}
          <div className="w-full h-full lg:overflow-y-auto lg:pr-2 flex flex-col lg:gap-8 scrollbar-container">

            {/* ----------------- 2. 内网专区 (DIGITAL ASSETS - APP-LIKE LAUNCHERS) ----------------- */}
            <AppDigitalAssetsSection
              activeAddTab={activeAddTab}
              activePresetCategory={activePresetCategory}
              autoAssignIcon={autoAssignIcon}
              editingLinkId={editingLinkId}
              emojiPickerProps={emojiPickerProps}
              externalLinks={externalLinks}
              getServiceIcon={getServiceIcon}
              handleAddPresetLink={handleAddPresetLink}
              handleCancelEdit={handleCancelEdit}
              handleDeleteExternalLink={handleDeleteExternalLink}
              handleEmojiPickerClick={handleEmojiPickerClick}
              handleIntranetViewModeChange={handleIntranetViewModeChange}
              handleResetExternalLinks={handleResetExternalLinks}
              handleReorderExternalLinks={handleReorderExternalLinks}
              handleRoutePreferenceChange={handleRoutePreferenceChange}
              handleSaveOrUpdateExternalLink={handleSaveOrUpdateExternalLink}
              handleStartEditExternalLink={handleStartEditExternalLink}
              intranetViewMode={intranetViewMode}
              isAddingLink={isAddingLink}
              isEditModeActive={isEditModeActive}
              isExternalShortcutExpanded={isExternalShortcutExpanded}
              isPresetAdded={isPresetAdded}
              newLinkCustomColor={newLinkCustomColor}
              newLinkDesc={newLinkDesc}
              newLinkEmoji={newLinkEmoji}
              newLinkIconText={newLinkIconText}
              newLinkIconType={newLinkIconType}
              newLinkUseMatchedLucide={newLinkUseMatchedLucide}
              newLinkName={newLinkName}
              newLinkUrl={newLinkUrl}
              presetSearchQuery={presetSearchQuery}
              routePreference={routePreference}
              services={services}
              setActiveAddTab={setActiveAddTab}
              setActivePresetCategory={setActivePresetCategory}
              setEditingLinkId={setEditingLinkId}
              setIsAddingLink={setIsAddingLink}
              setIsEditModeActive={setIsEditModeActive}
              setIsExternalShortcutExpanded={setIsExternalShortcutExpanded}
              setNewLinkCustomColor={setNewLinkCustomColor}
              setNewLinkDesc={setNewLinkDesc}
              setNewLinkEmoji={setNewLinkEmoji}
              setNewLinkIconText={setNewLinkIconText}
              setNewLinkIconType={setNewLinkIconType}
              setNewLinkUseMatchedLucide={setNewLinkUseMatchedLucide}
              setNewLinkName={setNewLinkName}
              setNewLinkUrl={setNewLinkUrl}
              setPresetSearchQuery={setPresetSearchQuery}
              setShowEmojiPicker={setShowEmojiPicker}
              showEmojiPicker={showEmojiPicker}
              toggleExternalShortcutExpanded={toggleExternalShortcutExpanded}
            />

          </div>
        </div>

      </main>



      {/* ================================= FOOTER ================================= */}
      <AppFooter />

      {/* ================================= RETURN TO TOP ================================= */}
      <AppBackToTopButton scrollToTop={scrollToTop} showScrollTop={showScrollTop} />

    </div>
  );
}
