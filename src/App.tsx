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
  Mail
} from 'lucide-react';
import { NavItem, ServiceAsset, MemoPost } from './types';
import { DEFAULT_NAV_ITEMS, DEFAULT_SERVICES, DEFAULT_MEMOS } from './data';

export default function App() {
  // Core Data States (Initialized from Default Data, synced with localStorage)
  const [navItems, setNavItems] = useState<NavItem[]>(() => {
    const cached = localStorage.getItem('seal_nav_items');
    return cached ? JSON.parse(cached) : DEFAULT_NAV_ITEMS;
  });
  const [services, setServices] = useState<ServiceAsset[]>(() => {
    const cached = localStorage.getItem('seal_services');
    return cached ? JSON.parse(cached) : DEFAULT_SERVICES;
  });
  const [memos, setMemos] = useState<MemoPost[]>(() => {
    const cached = localStorage.getItem('seal_memos');
    return cached ? JSON.parse(cached) : DEFAULT_MEMOS;
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

  const fetchRemoteMemos = async () => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000); // 2秒超时
      
      const response = await fetch("http://100.68.153.123:5230/api/v1/memos", {
        signal: controller.signal
      });
      clearTimeout(id);
      
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.memos || data.data || []);
        if (list && list.length > 0) {
          const mapped: MemoPost[] = list.map((item: any, idx: number) => {
            const content = item.content || '';
            let tags = item.tags || [];
            if (tags.length === 0) {
              const hashTags = content.match(/#\S+/g);
              if (hashTags) {
                tags = hashTags.map((t: string) => t.replace('#', ''));
              }
            }
            if (tags.length === 0) {
              tags = ['内网同步'];
            }
            const author = item.creatorName || item.creatorUsername || item.creator || '内网成员';
            
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
              tags,
              isPrivate: false
            };
          });
          setMemos(mapped);
        }
      }
    } catch (err) {
      console.warn("无法从内网 Memos 系统同步数据，已使用本地或内置备忘数据进行兼容显示：", err);
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
      fetchRemoteMemos();
    } catch (error) {
      clearTimeout(id);
      setTailscaleStatus('error');
    }
  };

  useEffect(() => {
    testTailscaleConnection();
  }, []);

  // Sync state modifications to localStorage
  useEffect(() => {
    localStorage.setItem('seal_nav_items', JSON.stringify(navItems));
  }, [navItems]);

  useEffect(() => {
    localStorage.setItem('seal_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('seal_memos', JSON.stringify(memos));
  }, [memos]);

  // Utility to copy text to clipboard
  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Icon Matcher helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '环境配置': return <Laptop className="w-5 h-5 text-teal-600" />;
      case '镜像打包': return <Package className="w-5 h-5 text-indigo-600" />;
      case '实验规范': return <Code className="w-5 h-5 text-amber-600" />;
      case '关于本站': return <FileText className="w-5 h-5 text-emerald-600" />;
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
      default: return <Activity className="w-7 h-7 text-teal-600" />;
    }
  };

  // Filters logic
  const filteredNavItems = navItems.filter(item => {
    const matchesCategory = activeCategory === '全部' || item.category === activeCategory;
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans tech-grid-bg antialiased selection:bg-teal-500 selection:text-white pb-16">
      
      {/* ================================= HEADER BAR ================================= */}
      <header id="main-header" className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-900 text-teal-400 rounded-lg flex items-center justify-center shrink-0 shadow-xs">
              <Terminal className="w-4 h-4" />
            </div>
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight">
              软件工程与大语言模型协作实验室
            </h1>
          </div>

          {/* Dynamic Tailscale Connection diagnostics & quick actions */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Quick Links */}
            <div className="flex items-center gap-1.5">
              <a 
                id="btn-link-github"
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="访问 GitHub 仓库"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                id="btn-link-contact"
                href="mailto:mistiiixv@gmail.com" 
                className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                title="发送邮件联系实验室"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>

            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>

            {tailscaleStatus === 'testing' && (
              <div className="px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 select-none animate-pulse">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>正在诊断隧道...</span>
              </div>
            )}

            {tailscaleStatus === 'connected' && (
              <button 
                id="btn-tailscale-status-connected"
                onClick={testTailscaleConnection}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer select-none"
                title="已连接虚拟专网。点击可重测状态。"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Tailscale 已联通 ({latency}ms)</span>
              </button>
            )}

            {(tailscaleStatus === 'error' || tailscaleStatus === 'unchecked') && (
              <button 
                id="btn-tailscale-status-retry"
                onClick={testTailscaleConnection}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100/50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer select-none"
                title="未能自动接入虚拟网段。请配置客户端。点击重新测试。"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Tailscale 离线 (未配置双路)</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ================================= INTRO BANNER ================================= */}
      <section id="welcome-banner" className="bg-slate-900 text-white relative py-12 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:28px_28px]"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-3 py-1 text-xs text-teal-300 mb-3 font-mono">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>实验室极速中转空间</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">
              研发算力中枢与知识互联雷达
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
              这里是软件实验室日常开发、文件存取与随手记的极速跳板。本站内置双路中转地址，使用 <strong>Tailscale 虚拟专网</strong> 即可在宿主外部或宿舍中安全秒连内网资产。
            </p>
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
            <span>筛选备忘标签:</span>
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
                className="text-rose-600 hover:underline hover:text-rose-700 font-semibold ml-1"
              >
                清空过滤
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ================================= MAIN SECTIONS GRID ================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ----------------- 1. 站内专区 (INTERNAL NAVIGATION) - 7 Columns ----------------- */}
        <section id="section-internal-nav" className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                  <Laptop className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">站内专区</h3>
                  <p className="text-xs text-slate-400">一键配置、镜像打包、SLURM集群规则技术手册</p>
                </div>
              </div>
            </div>

            {/* Subcategories Selector */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {['全部', '环境配置', '镜像打包', '实验规范', '关于本站'].map(tab => (
                <button
                  id={`btn-nav-tab-${tab}`}
                  key={tab}
                  onClick={() => setActiveCategory(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeCategory === tab 
                      ? 'bg-teal-600 text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Radar Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredNavItems.length > 0 ? (
                (isNavExpanded ? filteredNavItems : filteredNavItems.slice(0, 4)).map(item => (
                  <a
                    id={`nav-card-${item.id}`}
                    key={item.id}
                    href={item.linkUrl}
                    target={item.linkUrl.startsWith('http') ? '_blank' : undefined}
                    rel={item.linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="group border border-slate-200 rounded-xl p-4 cursor-pointer bg-white hover:bg-teal-50/20 hover:border-teal-300 transition-all hover:shadow-xs flex flex-col justify-between text-left"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <span className="p-1.5 bg-slate-50 group-hover:bg-teal-100/60 rounded-lg transition-colors">
                          {getCategoryIcon(item.category)}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-teal-950 transition-colors mb-1 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-teal-600 pt-2 border-t border-slate-100">
                      <span className="bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">{item.category}</span>
                      <span className="flex items-center gap-0.5 font-mono group-hover:translate-x-0.5 transition-transform">
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
              <div className="flex justify-center mt-4 pt-4 border-t border-slate-100">
                <button
                  id="btn-toggle-nav-expand"
                  onClick={() => setIsNavExpanded(!isNavExpanded)}
                  className="px-3.5 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-teal-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                >
                  {isNavExpanded ? '收起部分指南' : `展开更多指南 (还有 ${filteredNavItems.length - 4} 篇)`}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ----------------- 2. 内网专区 (DIGITAL ASSETS - APP-LIKE LAUNCHERS) - 5 Columns ----------------- */}
        <section id="section-digital-assets" className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                  <Layers className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">内网专区</h3>
                  <p className="text-xs text-slate-400">已部署工具，点击一键跳转至物理中转页</p>
                </div>
              </div>
            </div>

            {/* iOS/SaaS App Launcher Style Grid (Always uncollapsed and便捷 to access) */}
            <div id="digital-assets-app-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-3.5">
              {services.map(srv => {
                return (
                  <div 
                    id={`service-card-${srv.id}`}
                    key={srv.id}
                    className="group relative border border-slate-200 bg-white hover:bg-slate-50/40 rounded-xl p-4 transition-all hover:shadow-xs flex flex-col gap-4 text-left"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* App icon frame */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
                        {getServiceIcon(srv.icon)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-800 text-sm tracking-tight leading-snug group-hover:text-teal-950 transition-colors">
                            {srv.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {srv.description}
                        </p>
                      </div>
                    </div>

                    {/* Twin Launch Actions - layout updated to bottom row */}
                    <div className="grid grid-cols-2 gap-2.5 w-full pt-3 border-t border-slate-100">
                      {/* Tailscale Route Anchor */}
                      <a
                        id={`btn-route-ts-${srv.id}`}
                        href={srv.tailscaleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-lg text-emerald-700 transition shadow-xs flex items-center justify-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                        title="通过 Tailscale 连接接入服务"
                      >
                        <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Tailscale</span>
                      </a>

                      {/* Local Lan Route Anchor */}
                      <a
                        id={`btn-route-local-${srv.id}`}
                        href={srv.localUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg text-indigo-700 transition shadow-xs flex items-center justify-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                        title="通过实验室物理局域网连接"
                      >
                        <Home className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>物理内网</span>
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>

      {/* ================================= 3. 资讯专区 (INFORMATION FEED - MEMOS) ================================= */}
      <section id="section-memos-feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <StickyNote className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">最新 Memos 精选备忘流</h3>
                <p className="text-xs text-slate-400">实时展示 5 条左右跑通的新模型评测及数据集发布速递</p>
              </div>
            </div>

            <a
              id="btn-post-new-memo"
              href="http://100.68.153.123:5230"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 active:scale-95 duration-100 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow text-center"
            >
              <Send className="w-3.5 h-3.5" /> 发起备忘随手记
            </a>
          </div>

          {/* Memos List Stream */}
          <div id="memos-feed-stream" className="space-y-4 max-w-4xl mx-auto">
            {filteredMemos.length > 0 ? (
              filteredMemos.slice(0, 5).map((memo, index) => {
                return (
                  <motion.div
                    id={`memo-card-${memo.id}`}
                    key={memo.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="group bg-white hover:bg-teal-50/10 border border-slate-200 hover:border-teal-200 rounded-2xl p-4 sm:p-5 transition-all hover:shadow-sm relative overflow-hidden flex flex-col sm:flex-row gap-4 items-start"
                  >
                    
                    {/* Author block */}
                    <div className="flex sm:flex-col items-center gap-2.5 w-full sm:w-28 shrink-0 text-left sm:text-center">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-teal-400 font-bold border border-slate-200 flex items-center justify-center text-sm font-mono sm:mx-auto">
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
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition ${
                                selectedTag === tag 
                                  ? 'bg-teal-600 text-white font-bold' 
                                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-100/50'
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>


                      </div>

                      {/* Content text */}
                      <div id={`memo-content-text-${memo.id}`} className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed mt-1">
                        {memo.content}
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
                  您可以使用上方的“发起备忘随手记”发布关于您最新调试项目跑通的好消息或需要求助的信息。
                </p>
              </div>
            )}
          </div>

        </div>
      </section>



      {/* ================================= FOOTER ================================= */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center text-slate-400 text-xs">
        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono">
            © 2026 软件工程与大语言模型协作实验室 (SEAL)
          </p>
          <div className="flex gap-4">
            <span className="text-[11px] text-slate-400">网络架构: 局域寻址网 & Tailscale Overlay 零信任接入</span>
            <span className="text-[11px] text-slate-400">版本: v3.2.0-STABLE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
