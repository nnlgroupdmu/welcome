import { AnimatePresence, motion } from 'motion/react';
import EmojiPicker from 'emoji-picker-react';
import { ArrowUpRight, Check, ChevronDown, ChevronRight, ExternalLink, Layers, LayoutGrid, List, Plus, Search, SquarePen, X } from 'lucide-react';
import type { ComponentProps, Dispatch, FormEvent, ReactNode, SetStateAction } from 'react';
import { DEFAULT_EXTERNAL_LINKS, PRESET_EXTERNAL_LINKS } from '../data';
import type { PresetLink } from '../data';
import type { ExternalLinkAsset, ServiceAsset } from '../types';
import { ExternalFavicon } from './ExternalFavicon';
import DualRouteConverter from './DualRouteConverter';

type RoutePreference = 'tailscale' | 'lan';
type IntranetViewMode = 'list' | 'icons';
type AddTab = 'preset' | 'custom';
type LinkIconType = 'favicon' | 'emoji' | 'text';
type EmojiPickerProps = Omit<ComponentProps<typeof EmojiPicker>, 'onEmojiClick'>;

type AppDigitalAssetsSectionProps = {
  activeAddTab: AddTab;
  activePresetCategory: string;
  autoAssignIcon: (url?: string, name?: string) => string;
  editingLinkId: string | null;
  emojiPickerProps: EmojiPickerProps;
  externalLinks: ExternalLinkAsset[];
  getServiceIcon: (iconName: string) => ReactNode;
  handleAddPresetLink: (preset: PresetLink) => void;
  handleCancelEdit: () => void;
  handleDeleteExternalLink: (id: string, name: string) => void;
  handleEmojiPickerClick: ComponentProps<typeof EmojiPicker>['onEmojiClick'];
  handleIntranetViewModeChange: (mode: IntranetViewMode) => void;
  handleResetExternalLinks: () => void;
  handleRoutePreferenceChange: (newPref: RoutePreference) => void;
  handleSaveOrUpdateExternalLink: (e: FormEvent<HTMLFormElement>) => void;
  handleStartEditExternalLink: (ext: ExternalLinkAsset) => void;
  intranetViewMode: IntranetViewMode;
  isAddingLink: boolean;
  isEditModeActive: boolean;
  isExternalShortcutExpanded: boolean;
  isPresetAdded: (presetUrl: string, presetName: string) => boolean;
  newLinkCustomColor: string;
  newLinkDesc: string;
  newLinkEmoji: string;
  newLinkIconText: string;
  newLinkIconType: LinkIconType;
  newLinkUseMatchedLucide: boolean;
  newLinkName: string;
  newLinkUrl: string;
  presetSearchQuery: string;
  routePreference: RoutePreference;
  services: ServiceAsset[];
  setActiveAddTab: Dispatch<SetStateAction<AddTab>>;
  setActivePresetCategory: Dispatch<SetStateAction<string>>;
  setEditingLinkId: Dispatch<SetStateAction<string | null>>;
  setIsAddingLink: Dispatch<SetStateAction<boolean>>;
  setIsEditModeActive: Dispatch<SetStateAction<boolean>>;
  setIsExternalShortcutExpanded: Dispatch<SetStateAction<boolean>>;
  setNewLinkCustomColor: Dispatch<SetStateAction<string>>;
  setNewLinkDesc: Dispatch<SetStateAction<string>>;
  setNewLinkEmoji: Dispatch<SetStateAction<string>>;
  setNewLinkIconText: Dispatch<SetStateAction<string>>;
  setNewLinkIconType: Dispatch<SetStateAction<LinkIconType>>;
  setNewLinkUseMatchedLucide: Dispatch<SetStateAction<boolean>>;
  setNewLinkName: Dispatch<SetStateAction<string>>;
  setNewLinkUrl: Dispatch<SetStateAction<string>>;
  setPresetSearchQuery: Dispatch<SetStateAction<string>>;
  setShowEmojiPicker: Dispatch<SetStateAction<boolean>>;
  showEmojiPicker: boolean;
  toggleExternalShortcutExpanded: () => void;
};

const ICON_TYPE_OPTIONS: Array<{ key: LinkIconType; label: string }> = [
  { key: 'favicon', label: '网站 Favicon' },
  { key: 'emoji', label: 'Emoji 图标' },
  { key: 'text', label: '智能文字' },
];

const PRESET_EMOJI_OPTIONS = [
  // 科技、开发、AI 工具
  '🚀', '💻', '🧠', '🌐', '🛠️', '⚙️', '🔍', '⚡', '🔒', '🤖', '📦', '🖥️',
  // 数据、办公、文档
  '📊', '📧', '📚', '💡', '📑', '📅', '🍵', '📶', '📱', '📵', '📜', '⌨️',
  // 娱乐、媒体、设计
  '🎨', '🔥', '🎀', '🎍', '🎃', '📙', '💬', '✨', '❤️', '🍖', '📳', '🙵',
  // 学习、生活、综合
  '🔬', '🎓', '🪐', '🏔', '🛹', '💸', '🏳', '🗇', '☁', '🌡', '👃', 'ℹ️',
];

export function AppDigitalAssetsSection({
  activeAddTab,
  activePresetCategory,
  autoAssignIcon,
  editingLinkId,
  emojiPickerProps,
  externalLinks,
  getServiceIcon,
  handleAddPresetLink,
  handleCancelEdit,
  handleDeleteExternalLink,
  handleEmojiPickerClick,
  handleIntranetViewModeChange,
  handleResetExternalLinks,
  handleRoutePreferenceChange,
  handleSaveOrUpdateExternalLink,
  handleStartEditExternalLink,
  intranetViewMode,
  isAddingLink,
  isEditModeActive,
  isExternalShortcutExpanded,
  isPresetAdded,
  newLinkCustomColor,
  newLinkDesc,
  newLinkEmoji,
  newLinkIconText,
  newLinkIconType,
  newLinkUseMatchedLucide,
  newLinkName,
  newLinkUrl,
  presetSearchQuery,
  routePreference,
  services,
  setActiveAddTab,
  setActivePresetCategory,
  setEditingLinkId,
  setIsAddingLink,
  setIsEditModeActive,
  setIsExternalShortcutExpanded,
  setNewLinkCustomColor,
  setNewLinkDesc,
  setNewLinkEmoji,
  setNewLinkIconText,
  setNewLinkIconType,
  setNewLinkUseMatchedLucide,
  setNewLinkName,
  setNewLinkUrl,
  setPresetSearchQuery,
  setShowEmojiPicker,
  showEmojiPicker,
  toggleExternalShortcutExpanded,
}: AppDigitalAssetsSectionProps) {
  const matchedLucideIcon = autoAssignIcon(newLinkUrl, newLinkName);
  const previewIcon = newLinkIconType === 'favicon' || (newLinkIconType === 'text' && newLinkUseMatchedLucide)
    ? matchedLucideIcon
    : '';

  return (
    <>
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
                className={`p-1.5 rounded-md transition-all cursor-pointer ${intranetViewMode === 'list'
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
                className={`p-1.5 rounded-md transition-all cursor-pointer ${intranetViewMode === 'icons'
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
                              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${activeAddTab === 'preset'
                                  ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-sm'
                                  : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                            >
                              推荐预设应用库
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveAddTab('custom')}
                              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${activeAddTab === 'custom'
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
                                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition cursor-pointer select-none ${activePresetCategory === cat
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
                                            icon={preset.icon ?? autoAssignIcon(preset.url, preset.name)}
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
                                        className={`shrink-0 p-1.5 rounded-lg cursor-pointer transition select-none flex items-center justify-center mt-1 ${added
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
                                {ICON_TYPE_OPTIONS.map((tab) => (
                                  <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setNewLinkIconType(tab.key)}
                                    className={`py-1 text-[10px] font-bold rounded-md transition cursor-pointer text-center ${newLinkIconType === tab.key
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
                                    {PRESET_EMOJI_OPTIONS.map((em) => (
                                      <button
                                        key={em}
                                        type="button"
                                        onClick={() => {
                                          setNewLinkEmoji(em);
                                          setShowEmojiPicker(false);
                                        }}
                                        className={`w-7 h-7 text-sm rounded-md transition cursor-pointer flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 border ${newLinkEmoji === em
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
                                      disabled={newLinkUseMatchedLucide}
                                      className={`flex-1 text-[11px] px-2 py-0.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 ${newLinkUseMatchedLucide ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                  </div>
                                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={newLinkUseMatchedLucide}
                                      onChange={(e) => setNewLinkUseMatchedLucide(e.target.checked)}
                                      className="w-3 h-3 accent-indigo-600 cursor-pointer"
                                    />
                                    <span>自动匹配 Lucide icon ({matchedLucideIcon})</span>
                                  </label>
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
                                        className={`w-5.5 h-5.5 rounded-full ${info.bg} relative transition-all duration-200 cursor-pointer shadow-xs border focus:outline-hidden ${newLinkCustomColor === colorKey
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
                                    iconText={newLinkIconType === 'text' && !newLinkUseMatchedLucide ? newLinkIconText : ''}
                                    isEmoji={newLinkIconType === 'emoji'}
                                    emoji={newLinkEmoji}
                                    icon={previewIcon}
                                    customColor={newLinkIconType === 'text' ? newLinkCustomColor : undefined}
                                  />
                                </div>
                                <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 px-1 py-0.5 rounded-sm truncate">
                                  {previewIcon || 'Text'}
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
                                        icon={ext.icon ?? autoAssignIcon(ext.url, ext.name)}
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
                          <div className={`absolute left-0 top-3 bottom-3 w-[2.5px] rounded-r scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300 ${routePreference === 'tailscale' ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`} />

                          <div className="flex items-start gap-3.5 min-w-0">
                            {/* Richer app icon frame with matching color feedback on group hover */}
                            <div className={`p-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-700/60 group-hover:scale-105 rounded-xl transition-all flex items-center justify-center shrink-0 ${routePreference === 'tailscale'
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
                                <span className={`text-[10px] font-mono truncate max-w-[200px] transition-colors duration-300 ${routePreference === 'tailscale'
                                    ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                                    : 'text-indigo-600 dark:text-indigo-400 font-medium'
                                  }`}>
                                  {routePreference === 'tailscale' ? 'TS 专网 ' : '物理内网 '}: {activeUrl.replace(/^https?:\/\//i, '')}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action arrow with dynamic route preference colors */}
                          <div className={`p-2 rounded-lg transition duration-150 shrink-0 ${routePreference === 'tailscale'
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
                                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${activeAddTab === 'preset'
                                          ? 'bg-white dark:bg-zinc-700 text-slate-800 dark:text-zinc-100 shadow-sm'
                                          : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                                        }`}
                                    >
                                      推荐预设应用库
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setActiveAddTab('custom')}
                                      className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${activeAddTab === 'custom'
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
                                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition cursor-pointer select-none ${activePresetCategory === cat
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
                                                    icon={preset.icon ?? autoAssignIcon(preset.url, preset.name)}
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
                                                className={`shrink-0 p-1.5 rounded-lg cursor-pointer transition select-none flex items-center justify-center mt-1 ${added
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
                                        {ICON_TYPE_OPTIONS.map((tab) => (
                                          <button
                                            key={tab.key}
                                            type="button"
                                            onClick={() => setNewLinkIconType(tab.key)}
                                            className={`py-1 text-[10px] font-bold rounded-md transition cursor-pointer text-center ${newLinkIconType === tab.key
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
                                            {PRESET_EMOJI_OPTIONS.map((em) => (
                                              <button
                                                key={em}
                                                type="button"
                                                onClick={() => {
                                                  setNewLinkEmoji(em);
                                                  setShowEmojiPicker(false);
                                                }}
                                                className={`w-7 h-7 text-sm rounded-md transition cursor-pointer flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 border ${newLinkEmoji === em
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
                                              disabled={newLinkUseMatchedLucide}
                                              className={`flex-1 text-[11px] px-2 py-0.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 ${newLinkUseMatchedLucide ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            />
                                          </div>
                                          <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                                            <input
                                              type="checkbox"
                                              checked={newLinkUseMatchedLucide}
                                              onChange={(e) => setNewLinkUseMatchedLucide(e.target.checked)}
                                              className="w-3 h-3 accent-indigo-600 cursor-pointer"
                                            />
                                            <span>自动匹配 Lucide icon ({matchedLucideIcon})</span>
                                          </label>
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
                                                className={`w-5.5 h-5.5 rounded-full ${info.bg} relative transition-all duration-200 cursor-pointer shadow-xs border focus:outline-hidden ${newLinkCustomColor === colorKey
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
                                            iconText={newLinkIconType === 'text' && !newLinkUseMatchedLucide ? newLinkIconText : ''}
                                            isEmoji={newLinkIconType === 'emoji'}
                                            emoji={newLinkEmoji}
                                            icon={previewIcon}
                                            customColor={newLinkIconType === 'text' ? newLinkCustomColor : undefined}
                                          />
                                        </div>
                                        <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 px-1 py-0.5 rounded-sm truncate">
                                          {previewIcon || 'Text'}
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
                                      icon={ext.icon ?? autoAssignIcon(ext.url, ext.name)}
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
    </>
  );
}
