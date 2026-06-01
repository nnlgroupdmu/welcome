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
  Send,
  Trash2,
  PlusCircle,
  ArrowUpRight,
  Menu,
  Github,
  Mail,
  Wrench,
  GitBranch,
  Gauge
} from 'lucide-react';
import { NavItem, ServiceAsset, MemoPost } from './types';
import { DEFAULT_NAV_ITEMS, DEFAULT_SERVICES, DEFAULT_MEMOS } from './data';

import AnnouncementBanner from './components/AnnouncementBanner'; // 🌟 引入公告
import DualRouteConverter from './components/DualRouteConverter'; // 🌟 引入双路地址智能转换小工具
import Markdown from 'react-markdown';


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

          const author = item.creatorName || item.creatorUsername || item.creator || '内网成员';
          
          // 时间格式化
          let tsString = '';
          if (item.createTime) {
            tsString = item.createTime.replace('T', ' ').slice(0, 16);
          } else if (item.createdTs) {
            tsString = new Date(item.createdTs * 1000).toISOString().replace('T', ' ').slice(0, 16);
          } else {
            tsString = new Date().toISOString().replace('T', ' ').slice(0, 16);
          }

          return {
            id: `remote-${item.id || idx}`,
            author,
            avatarSeed: author.slice(0, 2),
            content,
            timestamp: tsString,
            tags: tags, // 此时的 tags 内部全都是干净、健康的纯字符串
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
    const targetUrl = "https://yf5090.tail51c3b9.ts.net:8443/"; 
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500); // 1.5秒超时

    const startTime = Date.now();
    try {
      await fetch(targetUrl, { mode: 'no-cors', signal: controller.signal });
      clearTimeout(id);
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
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'StickyNote': return <StickyNote className="w-7 h-7 text-emerald-600" />;
      case 'FolderClosed': return <FolderClosed className="w-7 h-7 text-sky-600" />;
      case 'Cpu': return <Cpu className="w-7 h-7 text-amber-600" />;
      case 'Code': return <Code className="w-7 h-7 text-indigo-600" />;
      case 'Layers': return <Layers className="w-7 h-7 text-purple-600" />;
      case 'GitBranch': return <GitBranch className="w-7 h-7 text-rose-600" />;
      case 'Gauge': return <Gauge className="w-7 h-7 text-yellow-500" />;
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans tech-grid-bg antialiased selection:bg-teal-500 selection:text-white pb-16">
      
      {/* <AnnouncementBanner /> */}

      {/* ================================= HEADER BAR ================================= */}
      <header id="main-header" className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-900 text-teal-400 rounded-lg flex items-center justify-center shrink-0 shadow-xs">
              <Terminal className="w-4 h-4" />
            </div>
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight">
              NNL Group Lab
            </h1>
          </div>

          {/* Dynamic Tailscale Connection diagnostics & quick actions */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Quick Links */}
            <div className="flex items-center gap-1.5">
              <a 
                id="btn-link-github"
                href="https://github.com/nnlgroupdmu/welcome" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="访问 GitHub 仓库"
              >
                <Github className="w-5 h-5" />
              </a>
              <button 
                id="btn-link-contact"
                onClick={() => handleCopyToClipboard('mistiiixv@gmail.com', 'admin-email')}
                className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer relative"
                title={copiedId === 'admin-email' ? '邮箱已复制！' : '复制管理员邮箱 (mistiiixv@gmail.com)'}
              >
                <Mail className="w-5 h-5" />
                {copiedId === 'admin-email' && (
                  <span className="absolute top-full mt-1 right-0 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded shadow-sm whitespace-nowrap z-50">
                    已复制!
                  </span>
                )}
              </button>
            </div>

            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center">
              {/* 统一单路网络状态显示按钮 */}
              {(() => {
                const isTesting = tailscaleStatus === 'testing' || lanStatus === 'testing';
                const isTailscaleConnected = tailscaleStatus === 'connected';
                const isLanConnected = lanStatus === 'connected';

                if (isTesting) {
                  return (
                    <div className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 select-none animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      <span>正在诊断网络...</span>
                    </div>
                  );
                }

                if (isTailscaleConnected) {
                  return (
                    <button 
                      id="btn-network-status"
                      onClick={handleRefreshAndCheck}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer select-none whitespace-nowrap"
                      title="已连接 Tailscale 零信任链路。点击重新探测或刷新。"
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      <span>Tailscale 已联通 ({latency}ms)</span>
                    </button>
                  );
                }

                if (isLanConnected) {
                  return (
                    <button 
                      id="btn-network-status"
                      onClick={handleRefreshAndCheck}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer select-none whitespace-nowrap"
                      title="已直连物理局域网。点击重新探测或刷新。"
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                      </span>
                      <span>物理内网已联通 ({lanLatency}ms)</span>
                    </button>
                  );
                }

                return (
                  <button 
                    id="btn-network-status"
                    onClick={handleRefreshAndCheck}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100/60 text-slate-400 border border-slate-200/70 rounded-lg text-xs font-normal flex items-center gap-1.5 transition cursor-pointer select-none whitespace-nowrap"
                    title="未检测到任何连接，如果是校外请确保 Tailscale 运行；如果是校内请连接实验室 WiFi。点击重试。"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse"></span>
                    <span>网络连接未就绪 (点击重试)</span>
                  </button>
                );
              })()}
            </div>
          </div>

        </div>
      </header>

      {/* ================================= INTRO BANNER ================================= */}
      <section id="welcome-banner" className="bg-slate-900 text-white relative pt-12 pb-10 border-b border-slate-800 overflow-hidden">
        {/* 背景网格与双色渐变光晕（保留完整氛围感） */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[400px] bg-gradient-to-r from-teal-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* 使用 md:flex 结构，让硬核提示挂在右侧，从而释放下方的纵向空间 */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            
            {/* 左侧：保留完整情感和叙事，但压缩了间距（space-y-4 改为 space-y-2.5） */}
            <div className="max-w-3xl space-y-2.5">
              {/* Slogan Badge */}
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse shrink-0" />
                <span className="font-mono">Move as we wish, shine as we are.</span>
              </div>
              
              {/* 热血大标题 */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
                在这里，由你来定义你的方向，<br className="hidden sm:inline" />
                用本真照亮科研生活。
              </h2>
              
              {/* 饱满的团队寄语（不删字，保留灵感） */}
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                欢迎来到我们的灵感主场。这是一个为每一位团队成员打造的开源资源与共享中心。无论你在寝室还是在实验室，我们都已为你搭建好畅通无阻的技术桥梁，只为支撑你每一个不设限的奇思妙想。
              </p>
            </div>

            {/* 右侧：将硬核的技术说明“挂”起来，成为不占下方高度的独立挂件 */}
            <div className="md:max-w-xs p-3 rounded-xl bg-slate-800/30 border border-slate-800/60 backdrop-blur-sm shrink-0 self-start md:self-end">
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-400"></span>
                </span>
                <span className="text-[11px] font-semibold text-slate-300 tracking-wide uppercase">物理内网 / Tailscale 双路连接</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                连接实验室 WiFi 以加载网站的完整资源，校外/宿舍请启动 <code className="text-teal-400 font-mono px-1 bg-slate-900 rounded text-[11px]">Tailscale</code> 虚拟专网以加载和使用内网资源。
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================================= SEARCH CONTROL BAR ================================= */}
      <section id="search-filter-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-35 top-1/2 -translate-y-1/2" style={{ left: '0.85rem' }} />
            <input 
              id="input-global-search"
              type="text"
              placeholder="搜索任何站内指南、服务应用名称或备忘内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>筛选 Memos 笔记标签:</span>
            {allMemoTags.map(tag => (
              <button
                id={`btn-tag-filter-${tag}`}
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-1 rounded-md border font-medium transition ${
                  selectedTag === tag 
                    ? 'bg-teal-600 border-teal-600 text-white' 
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 border-slate-200'
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================================= 左侧栏目 (Left Columns Container) ================================= */}
        <div className="contents lg:flex lg:flex-col lg:gap-8 lg:col-span-7">
          
          {/* ----------------- 1. 站内专区 (INTERNAL NAVIGATION) ----------------- */}
          <section id="section-internal-nav" className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-sm transition-all duration-300 p-6 flex flex-col relative overflow-hidden order-1 lg:order-none">
            <div>
              <div className="flex items-center justify-between mb-5 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                    <Laptop className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">站内专区</h3>
                    <p className="text-xs text-slate-400">环境配置、资源使用规则和技术手册</p>
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
                      className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 overflow-hidden cursor-pointer ${
                        isActive 
                          ? 'text-white shadow-xs' 
                          : 'bg-slate-100 hover:bg-slate-200/50 text-slate-600 hover:text-slate-900 font-semibold'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeCategoryBg"
                          className="absolute inset-0 bg-teal-600 rounded-lg"
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
                      target={item.linkUrl.startsWith('http') ? '_blank' : undefined}
                      rel={item.linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="group relative border border-slate-200/80 rounded-xl p-4.5 cursor-pointer bg-gradient-to-br from-white to-slate-50/40 hover:from-teal-50/10 hover:to-teal-50/30 hover:border-teal-400/60 hover:shadow-xs transition-all duration-300 flex flex-col justify-between text-left"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3.5">
                          <span className="p-1.5 bg-slate-50 group-hover:bg-teal-100/60 rounded-lg transition-colors">
                            {getCategoryIcon(item.categories?.[0] || '其他')}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-teal-950 transition-colors mb-1.5 line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-semibold text-teal-600 pt-2 border-t border-slate-100/80 gap-2">
                        <div className="flex flex-wrap gap-1">
                          {item.categories?.map(cat => (
                            <span key={cat} className="bg-slate-100 group-hover:bg-teal-50/50 text-slate-600 group-hover:text-teal-800 rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap transition-colors">{cat}</span>
                          ))}
                        </div>
                        <span className="flex items-center gap-0.5 font-mono group-hover:translate-x-0.5 transition-transform shrink-0">
                          阅读指南 <ChevronRight className="w-3 h-3 text-teal-500" />
                        </span>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">没有检索到相应的直达雷达文档</p>
                  </div>
                )}
              </div>

              {/* Fold & Align Button Mechanism for Internal Navigation */}
              {filteredNavItems.length > 4 && (
                <div className="flex justify-center mt-5 pt-4 border-t border-slate-100/80">
                  <button
                    id="btn-toggle-nav-expand"
                    onClick={() => setIsNavExpanded(!isNavExpanded)}
                    className="px-4 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300/80 text-teal-700 hover:text-teal-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    {isNavExpanded ? '收起部分指南' : `展开更多指南 (还有 ${filteredNavItems.length - 4} 篇)`}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* ----------------- 3. 资讯专区 (INFORMATION FEED - MEMOS) ----------------- */}
          <section id="section-memos-feed" className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-sm transition-all duration-300 p-6 flex flex-col relative overflow-hidden order-3 lg:order-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <StickyNote className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Memos 速递</h3>
                  <p className="text-xs text-slate-400">在这里速览 Memos 笔记最新发布的内容</p>
                </div>
              </div>

              <a
                id="btn-post-new-memo"
                href={routePreference === 'tailscale' ? "http://100.68.153.123:5230" : "http://192.168.31.240:5230"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 active:scale-95 duration-100 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow cursor-pointer text-center"
              >
                <Send className="w-3.5 h-3.5" /> 发布一条笔记
              </a>
            </div>

            {/* Memos List Stream */}
            <div id="memos-feed-stream" className="space-y-5 w-full">
              {filteredMemos.length > 0 ? (
                filteredMemos.slice(0, 5).map((memo, index) => {
                  return (
                    <motion.div
                      id={`memo-card-${memo.id}`}
                      key={memo.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="group relative bg-gradient-to-br from-white to-slate-50/35 hover:from-white hover:to-teal-50/10 border border-slate-200/80 hover:border-teal-200/80 rounded-2xl p-4.5 sm:p-5 transition-all duration-300 hover:shadow-sm overflow-hidden flex flex-col sm:flex-row gap-4.5 items-start"
                    >
                      {/* Left glowing marker */}
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-teal-400 to-emerald-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300" />
                      
                      {/* Author block */}
                      <div className="flex sm:flex-col items-center gap-2.5 w-full sm:w-28 shrink-0 text-left sm:text-center">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-teal-400 font-bold border border-slate-200/80 flex items-center justify-center text-sm font-mono sm:mx-auto shadow-xs">
                          {memo.avatarSeed.toUpperCase()}
                        </div>
                        
                        <div className="text-left sm:text-center flex-1 sm:flex-initial">
                          <h4 className="font-bold text-xs text-slate-950 line-clamp-1">{memo.author}</h4>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center justify-start sm:justify-center gap-0.5 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {memo.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Memo content body */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {memo.tags.map(tag => (
                              <span 
                                key={tag} 
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition ${
                                  selectedTag === tag 
                                    ? 'bg-teal-600 text-white' 
                                    : 'bg-teal-50/60 text-teal-800 hover:bg-teal-100 border border-teal-100/50'
                                }`}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Content text */}
                        <div id={`memo-content-text-${memo.id}`} className="text-slate-700 text-sm leading-relaxed mt-1">
                          <Markdown
                            components={{
                              h1: (props) => <h1 className="text-base font-bold text-slate-900 mt-3 mb-1.5" {...props} />,
                              h2: (props) => <h2 className="text-sm font-bold text-slate-900 mt-2.5 mb-1.25" {...props} />,
                              p: (props) => <p className="mb-2 break-all" {...props} />,
                              ul: (props) => <ul className="list-disc pl-5 mb-2 mt-1 space-y-1.5" {...props} />,
                              ol: (props) => <ol className="list-decimal pl-5 mb-2 mt-1 space-y-1.5" {...props} />,
                              li: (props) => <li className="text-sm text-slate-600 pl-0.5 leading-relaxed" {...props} />,
                              code: ({node, className, children, ...props} : any) => (
                                <code className="font-mono text-[0.875em] bg-slate-100/80 text-teal-600 px-1.5 py-0.5 rounded border border-slate-200/40" {...props}>
                                  {children}
                                </code>
                              ),
                              strong: (props) => <strong className="font-bold text-slate-950 bg-amber-50/50 px-1 rounded" {...props} />,
                              a: (props) => <a className="text-teal-600 hover:text-teal-700 underline font-semibold" target="_blank" rel="noreferrer" {...props} />,
                              blockquote: (props) => <blockquote className="border-l-4 border-slate-200 pl-3 italic my-2 text-slate-500" {...props} />
                            }}
                          >
                            {memo.content}
                          </Markdown>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div id="no-memos-fallback" className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
                  <StickyNote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-600">目前没有相关的实验室备忘随笔。</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    您可以使用上方的“发布一条笔记”发布关于您最新调试项目跑通的好消息或需要求助的信息。
                  </p>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* ================================= 右侧栏目 (Right Column Container) ================================= */}
        <div className="contents lg:flex lg:flex-col lg:gap-8 lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
          
          {/* ----------------- 2. 内网专区 (DIGITAL ASSETS - APP-LIKE LAUNCHERS) ----------------- */}
          <section id="section-digital-assets" className="bg-gradient-to-b from-white to-slate-50/50 rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-sm transition-all duration-300 p-6 flex flex-col relative overflow-hidden order-2 lg:order-none">
            <div>
              <div className="flex items-center justify-between mb-5 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                    <Layers className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">内网专区</h3>
                    <p className="text-xs text-slate-400">服务器已部署的工具，点击一键跳转</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Sliding Route Preference Switcher */}
              <div className="mb-5 p-1 bg-slate-100 rounded-xl flex items-center gap-1 border border-slate-200/50 relative overflow-hidden">
                {/* Dynamic sliding indicator background */}
                <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-out pointer-events-none z-0 ${
                    routePreference === 'tailscale' 
                      ? 'left-1 bg-emerald-600' 
                      : 'left-[calc(50%+2px)] bg-indigo-600'
                  }`}
                />

                <button
                  id="btn-toggle-route-ts"
                  type="button"
                  onClick={() => setRoutePreference('tailscale')}
                  className={`relative flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300 flex items-center justify-center gap-1.5 select-none cursor-pointer overflow-hidden z-10 ${
                    routePreference === 'tailscale'
                      ? 'text-white'
                      : 'text-slate-600 hover:text-slate-950 font-semibold'
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
                  onClick={() => setRoutePreference('lan')}
                  className={`relative flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300 flex items-center justify-center gap-1.5 select-none cursor-pointer overflow-hidden z-10 ${
                    routePreference === 'lan'
                      ? 'text-white'
                      : 'text-slate-600 hover:text-slate-950 font-semibold'
                  }`}
                  title="实验室局域网直连测试"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${routePreference === 'lan' ? 'bg-white' : 'bg-indigo-500'}`}></span>
                    <span>物理局域网</span>
                  </span>
                </button>
              </div>

              {/* iOS/SaaS App Launcher Style Grid with Modern Shadow Lift */}
              <div id="digital-assets-app-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-4">
                {services.map(srv => {
                  const activeUrl = routePreference === 'tailscale' ? srv.tailscaleUrl : srv.localUrl;
                  const activeBgHover = routePreference === 'tailscale'
                    ? 'hover:border-emerald-400/60 hover:bg-emerald-50/10 hover:shadow-emerald-100/20'
                    : 'hover:border-indigo-400/60 hover:bg-indigo-50/10 hover:shadow-indigo-100/20';
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
                      className={`group relative border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/30 rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm flex items-center justify-between gap-4 text-left cursor-pointer ${activeBgHover}`}
                      title={`点击快捷跳转：${activeUrl}`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        {/* App icon frame */}
                        <div className="p-3 bg-slate-50 border border-slate-100 group-hover:scale-105 rounded-xl transition-all flex items-center justify-center shrink-0">
                          {getServiceIcon(srv.icon)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-800 text-xs sm:text-sm tracking-tight leading-snug group-hover:text-slate-900 transition-colors">
                              {srv.name}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 leading-normal">
                            {srv.description}
                          </p>
                          
                          {/* Selected route destination label */}
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${pulseDotColor} animate-pulse shrink-0`}></span>
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                              {routePreference === 'tailscale' ? 'TS 专网 ' : '物理内网 '}: {activeUrl.replace(/^https?:\/\//i, '')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action arrow */}
                      <div className="p-2 rounded-lg text-slate-400 group-hover:text-slate-750 bg-slate-50/60 group-hover:bg-slate-100 transition duration-150 shrink-0">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* 地址转换回到内网专区底部 */}
              <div className="mt-5 pt-4 border-t border-slate-100/80">
                <DualRouteConverter />
              </div>
            </div>
          </section>

        </div>

      </main>



      {/* ================================= FOOTER ================================= */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center text-slate-400 text-xs">
        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono">
            © 2026 NNL Group Lab | nnlgroupdmu
          </p>
          <div className="flex gap-4">
            {/* <span className="text-[11px] text-slate-400">网络架构: 局域寻址网 & Tailscale Overlay 零信任接入</span> */}
            <span className="text-[11px] text-slate-400">版本: v3.3.2-Build</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
