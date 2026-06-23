/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  StickyNote,
  FolderClosed,
  Cpu,
  Code,
  Layers,
  GitBranch,
  Gauge,
  Github,
  Mail,
  Sparkles,
  Package,
  FileText,
  ExternalLink,
  Activity,
  Brain,
  Languages,
  Network,
  Search,
  Database,
  Workflow,
  Image,
  PenTool,
  PanelsTopLeft,
  Video,
  GraduationCap
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  StickyNote,
  FolderClosed,
  Cpu,
  Code,
  Layers,
  GitBranch,
  Gauge,
  Github,
  Mail,
  Sparkles,
  Package,
  FileText,
  ExternalLink,
  Activity,
  Brain,
  Languages,
  Network,
  Search,
  Database,
  Workflow,
  Image,
  PenTool,
  PanelsTopLeft,
  Video,
  GraduationCap
};

const ENABLE_THIRD_PARTY_FAVICONS = (import.meta as any).env?.VITE_ENABLE_THIRD_PARTY_FAVICONS === 'true';

export const getLucideIconElement = (iconName: string, className: string) => {
  const IconComponent = iconMap[iconName] || ExternalLink;
  return <IconComponent className={className} />;
};

interface ExternalFaviconProps {
  url: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  useFavicon?: boolean;
  iconText?: string;
  isEmoji?: boolean;
  emoji?: string;
  icon?: string;
  customColor?: string;
}

/**
 * Extracts 1 or 2 elegant characters from the link name as fallback.
 */
export const getFallbackText = (name: string): string => {
  if (!name) return 'EX';
  const trimmed = name.trim();

  // 1. Check Chinese characters at the beginning
  const chineseRegex = /^[\u4e00-\u9fa5]+/;
  const chineseMatch = trimmed.match(chineseRegex);
  if (chineseMatch) {
    // Return first 1-2 Chinese characters (e.g., "学校", "海大")
    return chineseMatch[0].slice(0, 2);
  }

  // 2. Multi-word English: e.g. "Google Scholar" -> "GS"
  const words = trimmed.split(/[\s-_]+/);
  if (words.length >= 2) {
    const first = words[0][0] || '';
    const second = words[1][0] || '';
    return (first + second).toUpperCase();
  }

  // 3. PascalCase or CamelCase words: e.g. "ChatGPT" -> "CG"
  const upperLetters = trimmed.replace(/[^A-Z]/g, '');
  if (upperLetters.length >= 2) {
    return upperLetters.slice(0, 2);
  }

  // 4. Fallback: slice first 2 characters of string and uppercase (e.g. "Overleaf" -> "OV")
  return trimmed.slice(0, 2).toUpperCase();
};

/**
 * Generates a consistent, visually distinctive modern gradient and shadow configuration
 * based on the hash value of the site's name or a custom chosen color key.
 */
export const getGradientForText = (name: string, customColor?: string): string => {
  const gradientMap: Record<string, string> = {
    teal: 'from-teal-500 to-emerald-600 text-teal-50 shadow-xs ring-1 ring-teal-500/20',
    indigo: 'from-indigo-500 to-purple-600 text-indigo-50 shadow-xs ring-1 ring-indigo-500/20',
    blue: 'from-blue-500 to-cyan-600 text-blue-50 shadow-xs ring-1 ring-blue-500/20',
    rose: 'from-rose-500 to-pink-600 text-rose-50 shadow-xs ring-1 ring-rose-500/20',
    amber: 'from-amber-500 to-orange-600 text-amber-50 shadow-xs ring-1 ring-amber-500/20',
    violet: 'from-violet-500 to-fuchsia-600 text-violet-50 shadow-xs ring-1 ring-violet-500/20',
    emerald: 'from-emerald-500 to-green-600 text-emerald-50 shadow-xs ring-1 ring-emerald-500/20',
    slate: 'from-slate-500 to-slate-600 text-slate-50 shadow-xs ring-1 ring-slate-500/20',
  };

  if (customColor && gradientMap[customColor]) {
    return gradientMap[customColor];
  }

  const gradients = [
    'from-teal-500 to-emerald-600 text-teal-50 shadow-xs ring-1 ring-teal-500/20',
    'from-indigo-500 to-purple-600 text-indigo-50 shadow-xs ring-1 ring-indigo-500/20',
    'from-blue-500 to-cyan-600 text-blue-50 shadow-xs ring-1 ring-blue-500/20',
    'from-rose-500 to-pink-600 text-rose-50 shadow-xs ring-1 ring-rose-500/20',
    'from-amber-500 to-orange-600 text-amber-50 shadow-xs ring-1 ring-amber-500/20',
    'from-violet-500 to-fuchsia-600 text-violet-50 shadow-xs ring-1 ring-violet-500/20',
    'from-emerald-500 to-green-600 text-emerald-50 shadow-xs ring-1 ring-emerald-500/20',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export const ExternalFavicon: React.FC<ExternalFaviconProps> = ({
  url,
  name,
  size = 'md',
  useFavicon = true,
  iconText,
  isEmoji = false,
  emoji,
  icon,
  customColor
}) => {
  const [attempt, setAttempt] = useState(0);
  const [domain, setDomain] = useState('');

  useEffect(() => {
    try {
      let sanitized = url.trim();
      if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
        sanitized = 'https://' + sanitized;
      }
      const parsedUrl = new URL(sanitized);
      const hostname = parsedUrl.hostname.replace(/^www\./i, '');
      setDomain(hostname);
    } catch {
      setDomain('');
    }
    setAttempt(0);
  }, [url]);

  const fallbackText = iconText && iconText.trim() ? iconText.trim().slice(0, 4) : getFallbackText(name);
  const bgGradientClass = getGradientForText(name, customColor);

  const sizeClasses = {
    lg: {
      wrapper: 'w-10 h-10 flex items-center justify-center shrink-0',
      img: 'w-10 h-10 object-contain rounded-xl',
      text: 'w-10 h-10 text-xs font-sans font-black tracking-normal flex items-center justify-center rounded-xl select-none',
      icon: 'w-5.5 h-5.5 text-white'
    },
    md: {
      wrapper: 'w-8 h-8 flex items-center justify-center shrink-0',
      img: 'w-8 h-8 object-contain rounded-lg',
      text: 'w-8 h-8 text-[11px] font-sans font-black tracking-tighter flex items-center justify-center rounded-lg select-none',
      icon: 'w-4.5 h-4.5 text-white'
    },
    sm: {
      wrapper: 'w-6 h-6 flex items-center justify-center shrink-0',
      img: 'w-6 h-6 object-contain rounded-md',
      text: 'w-6 h-6 text-[8px] font-sans font-black tracking-tighter flex items-center justify-center rounded-md select-none',
      icon: 'w-3.5 h-3.5 text-white'
    }
  };

  const activeSize = sizeClasses[size];

  // Render Emoji directly when isEmoji is true, bypassing favicon loading and without colored background
  if (isEmoji && emoji) {
    const emojiSizes = {
      lg: 'text-[32px] leading-none',
      md: 'text-[24px] leading-none',
      sm: 'text-[18px] leading-none'
    };
    const emojiSizeClass = emojiSizes[size] || 'text-[24px] leading-none';
    return (
      <div className={`${activeSize.wrapper} bg-transparent border-0 select-none flex items-center justify-center font-emoji`}>
        <span className={emojiSizeClass}>
          {emoji}
        </span>
      </div>
    );
  }

  // Helper to render beautiful colored text fallback or fallback icon (Emoji, Lucide)
  const renderFallback = () => {
    // 1. Emoji Mode
    if (isEmoji && emoji) {
      return (
        <div className={`${activeSize.text} bg-gradient-to-br ${bgGradientClass}`}>
          <span className={size === 'lg' ? 'text-lg' : size === 'md' ? 'text-base' : 'text-xs'}>
            {emoji}
          </span>
        </div>
      );
    }

    // 2. Custom initials if iconText exists
    if (iconText && iconText.trim()) {
      return (
        <div className={`${activeSize.text} bg-gradient-to-br ${bgGradientClass}`}>
          {iconText.trim().slice(0, 4)}
        </div>
      );
    }

    // 3. Preset, selected, or automatically matched Lucide icon
    if (icon) {
      return (
        <div className={`${activeSize.text} bg-gradient-to-br ${bgGradientClass}`}>
          {getLucideIconElement(icon, activeSize.icon)}
        </div>
      );
    }

    return (
      <div className={`${activeSize.text} bg-gradient-to-br ${bgGradientClass}`}>
        {fallbackText}
      </div>
    );
  };

  // If useFavicon is false or domain couldn't be parsed, use fallback immediately.
  // Direct site favicon loading stays enabled by default; third-party favicon proxies
  // are optional to avoid extra external requests.
  if (!useFavicon || !domain) {
    return renderFallback();
  }

  // Favicon URLs sourcing algorithm
  const getFaviconUrl = (index: number): string => {
    switch (index) {
      case 0:
        return `https://${domain}/favicon.ico`;
      case 1:
        return ENABLE_THIRD_PARTY_FAVICONS ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : '';
      case 2:
        return ENABLE_THIRD_PARTY_FAVICONS ? `https://favicon.duckduckgo.com/ip2/${domain}.ico` : '';
      case 3:
        return ENABLE_THIRD_PARTY_FAVICONS ? `https://icon.horse/icon/${domain}` : '';
      default:
        return '';
    }
  };

  const currentSrc = getFaviconUrl(attempt);

  // If we exhausted all sources, use fallback rendering
  if (attempt >= (ENABLE_THIRD_PARTY_FAVICONS ? 4 : 1) || !currentSrc) {
    return renderFallback();
  }

  const handleImgError = () => {
    setAttempt(prev => prev + 1);
  };

  return (
    <div className={activeSize.wrapper}>
      <img
        src={currentSrc}
        alt={name}
        onError={handleImgError}
        className={activeSize.img}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
