/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

interface ExternalFaviconProps {
  url: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  useFavicon?: boolean;
  iconText?: string;
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
    // Return first 2 Chinese characters (e.g., "学校", "海大")
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
 * based on the hash value of the site's name.
 */
export const getGradientForText = (name: string): string => {
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

export const ExternalFavicon: React.FC<ExternalFaviconProps> = ({ url, name, size = 'md', useFavicon = true, iconText }) => {
  const [attempt, setAttempt] = useState(0);
  const [domain, setDomain] = useState('');

  useEffect(() => {
    try {
      let sanitized = url.trim();
      if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
        sanitized = 'https://' + sanitized;
      }
      const parsedUrl = new URL(sanitized);
      // Remove www.
      const hostname = parsedUrl.hostname.replace(/^www\./i, '');
      setDomain(hostname);
    } catch {
      setDomain('');
    }
    // Reset attempt whenever url/domain changes to re-fetch
    setAttempt(0);
  }, [url]);

  const fallbackText = iconText && iconText.trim() ? iconText.trim().slice(0, 4) : getFallbackText(name);
  const bgGradientClass = getGradientForText(name);

  // Match sizes to existing custom styles (with Inter / Mono modern feeling, uppercase characters)
  const sizeClasses = {
    lg: {
      wrapper: 'w-7.5 h-7.5 flex items-center justify-center shrink-0',
      img: 'w-7.5 h-7.5 object-contain rounded-md',
      text: 'w-7.5 h-7.5 text-[10px] font-sans font-black tracking-tight flex items-center justify-center rounded-md select-none'
    },
    md: {
      wrapper: 'w-4.5 h-4.5 flex items-center justify-center shrink-0',
      img: 'w-4.5 h-4.5 object-contain rounded-sm',
      text: 'w-4.5 h-4.5 text-[8px] font-sans font-black tracking-tighter flex items-center justify-center rounded-xs select-none'
    },
    sm: {
      wrapper: 'w-3.5 h-3.5 flex items-center justify-center shrink-0',
      img: 'w-3.5 h-3.5 object-contain rounded-xs',
      text: 'w-3.5 h-3.5 text-[7px] font-sans font-black tracking-tighter flex items-center justify-center rounded-2xs select-none'
    }
  };

  const activeSize = sizeClasses[size];

  // If we shouldn't use external favicons, or if there's no valid domain name extracted, show text fallback immediately
  if (!useFavicon || !domain) {
    return (
      <div className={`${activeSize.text} bg-gradient-to-br ${bgGradientClass}`}>
        {fallbackText}
      </div>
    );
  }

  // Favicon URLs sourcing algorithm
  const getFaviconUrl = (index: number): string => {
    switch (index) {
      case 0:
        // 1. Direct fetch to domain's root favicon file – highly accurate for intranet subdomains or VPN services
        return `https://${domain}/favicon.ico`;
      case 1:
        // 2. Google's secure high-fidelity s2 favicon indexer
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      case 2:
        // 3. DuckDuckGo API
        return `https://favicon.duckduckgo.com/ip2/${domain}.ico`;
      case 3:
        // 4. Icon Horse API
        return `https://icon.horse/icon/${domain}`;
      default:
        return '';
    }
  };

  const currentSrc = getFaviconUrl(attempt);

  // If we exhausted all 4 favicon sources, fall back to the text component
  if (attempt >= 4 || !currentSrc) {
    return (
      <div className={`${activeSize.text} bg-gradient-to-br ${bgGradientClass}`}>
        {fallbackText}
      </div>
    );
  }

  const handleImgError = () => {
    // Failover: Increment attempts to try subsequent URL
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
