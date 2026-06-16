/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface MemoContentProps {
  content: string;
  memoId: string;
}

export default function MemoContent({ content, memoId }: MemoContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Use ResizeObserver for accurate and dynamic measuring
    const observer = new ResizeObserver(() => {
      const MAX_HEIGHT = 240; // matches max-h-60 (15rem = 240px)
      
      // scrollHeight represents the full, unconstrained height of the content.
      // We add a tiny buffer (e.g. 8px) to prevent zoom/subpixel issues from triggering a false positive collapse button.
      if (el.scrollHeight > MAX_HEIGHT + 8) {
        setNeedsCollapse(true);
      } else {
        setNeedsCollapse(false);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [content]);

  // Automatically reset collapse state when content changes to stay in sync
  useEffect(() => {
    setIsExpanded(false);
  }, [content]);

  return (
    <div>
      <div
        id={`memo-content-text-${memoId}`}
        ref={containerRef}
        className={`relative text-slate-700 dark:text-zinc-300 text-sm leading-relaxed mt-1 transition-all duration-300 ${
          needsCollapse && !isExpanded ? 'max-h-60 overflow-hidden' : ''
        }`}
      >
        <Markdown
          components={{
            h1: (props) => <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100 mt-3 mb-1.5" {...props} />,
            h2: (props) => <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-2.5 mb-1.25" {...props} />,
            p: (props) => <p className="mb-2 break-all text-slate-700 dark:text-zinc-300" {...props} />,
            ul: (props) => <ul className="list-disc pl-5 mb-2 mt-1 space-y-1.5 text-slate-700 dark:text-zinc-300" {...props} />,
            ol: (props) => <ol className="list-decimal pl-5 mb-2 mt-1 space-y-1.5 text-slate-700 dark:text-zinc-300" {...props} />,
            li: (props) => <li className="text-sm text-slate-600 dark:text-zinc-400 pl-0.5 leading-relaxed" {...props} />,
            code: ({ node, className, children, ...props }: any) => (
              <code className="font-mono text-[0.875em] bg-slate-100/100 dark:bg-zinc-800 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded border border-slate-200/40 dark:border-zinc-700/50" {...props}>
                {children}
              </code>
            ),
            strong: (props) => <strong className="font-bold text-slate-950 dark:text-white bg-amber-50/50 dark:bg-amber-950/20 px-1 rounded" {...props} />,
            a: (props) => <a className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline font-semibold" target="_blank" rel="noreferrer" {...props} />,
            blockquote: (props) => <blockquote className="border-l-4 border-slate-200 dark:border-zinc-700 pl-3 italic my-2 text-slate-500 dark:text-zinc-400" {...props} />
          }}
        >
          {content}
        </Markdown>

        {/* Fading overlay ONLY at the bottom of the text block itself if collapsed */}
        {needsCollapse && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-zinc-900 dark:via-zinc-900/90 dark:to-transparent pointer-events-none" />
        )}
      </div>

      {/* Action expand/collapse button */}
      {needsCollapse && (
        <button
          id={`btn-toggle-expand-${memoId}`}
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
        >
          {isExpanded ? (
            <>
              <span>收起内容</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>展开全文</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
