export const ROUTE_LABELS = {
  tailscale: 'Tailscale 专网',
  lan: '物理局域网',
} as const;

export type RoutePreference = keyof typeof ROUTE_LABELS;

export const NETWORK_ENDPOINTS = {
  lanHost: '192.168.31.240',
  tailscaleHost: '100.68.153.123',
  ports: {
    memos: 5230,
    alist: 5244,
    gitea: 3000,
    grafana: 3999,
    prometheus: 9091,
  },
  timeouts: {
    memosMs: 2500,
    tailscaleProbeMs: 2000,
    lanProbeMs: 1200,
    gpuMs: 1800,
  },
} as const;

const httpUrl = (host: string, port: number, path = '') => `http://${host}:${port}${path}`;

export const INTERNAL_ROUTES = {
  tailscale: {
    memos: httpUrl(NETWORK_ENDPOINTS.tailscaleHost, NETWORK_ENDPOINTS.ports.memos),
    memosExplore: httpUrl(NETWORK_ENDPOINTS.tailscaleHost, NETWORK_ENDPOINTS.ports.memos, '/explore'),
    memosApi: httpUrl(NETWORK_ENDPOINTS.tailscaleHost, NETWORK_ENDPOINTS.ports.memos, '/api/v1/memos'),
    alist: httpUrl(NETWORK_ENDPOINTS.tailscaleHost, NETWORK_ENDPOINTS.ports.alist),
    giteaExplore: httpUrl(NETWORK_ENDPOINTS.tailscaleHost, NETWORK_ENDPOINTS.ports.gitea, '/explore/repos'),
    grafanaGpu: httpUrl(
      NETWORK_ENDPOINTS.tailscaleHost,
      NETWORK_ENDPOINTS.ports.grafana,
      '/d/adfcnh6/nvidia-dcgm-exporter?orgId=1&from=now-3h&to=now&timezone=browser&var-instance=localhost:9400&var-gpu=$__all&refresh=5s'
    ),
    prometheusApi: httpUrl(NETWORK_ENDPOINTS.tailscaleHost, NETWORK_ENDPOINTS.ports.prometheus, '/api/v1/query'),
  },
  lan: {
    memos: httpUrl(NETWORK_ENDPOINTS.lanHost, NETWORK_ENDPOINTS.ports.memos),
    memosExplore: httpUrl(NETWORK_ENDPOINTS.lanHost, NETWORK_ENDPOINTS.ports.memos, '/explore'),
    memosApi: httpUrl(NETWORK_ENDPOINTS.lanHost, NETWORK_ENDPOINTS.ports.memos, '/api/v1/memos'),
    alist: httpUrl(NETWORK_ENDPOINTS.lanHost, NETWORK_ENDPOINTS.ports.alist),
    giteaExplore: httpUrl(NETWORK_ENDPOINTS.lanHost, NETWORK_ENDPOINTS.ports.gitea, '/explore/repos'),
    grafanaGpu: httpUrl(
      NETWORK_ENDPOINTS.lanHost,
      NETWORK_ENDPOINTS.ports.grafana,
      '/d/adfcnh6/nvidia-dcgm-exporter?orgId=1&from=now-3h&to=now&timezone=browser&var-instance=localhost:9400&var-gpu=$__all&refresh=5s'
    ),
    prometheusApi: httpUrl(NETWORK_ENDPOINTS.lanHost, NETWORK_ENDPOINTS.ports.prometheus, '/api/v1/query'),
  },
} as const;

export const NETWORK_HELP_TEXT =
  '本页部署在 GitHub Pages，实时数据由你的浏览器直连 HTTP 内网服务。请先接入实验室 WiFi 或 Tailscale；部分浏览器可能因安全策略阻止直连，页面会自动降级。';
