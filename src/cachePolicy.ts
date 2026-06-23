export const CACHE_MEMOS = true;
export const CACHE_USER_LINKS = true;

export const MEMOS_CACHE_TTL_MS = 5 * 60 * 1000;
export const MEMOS_REFRESH_INTERVAL_MS = 45 * 1000;

export const STORAGE_KEYS = {
  memos: 'seal_memos',
  externalLinks: 'seal_external_links',
  intranetViewMode: 'seal_intranet_view_mode',
  externalShortcutExpanded: 'seal_external_shortcut_expanded',
  themeMode: 'seal_theme_mode',
} as const;
