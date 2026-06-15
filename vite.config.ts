import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(() => {
  return {
    base: '/welcome/',
    plugins: [
      react(), 
      tailwindcss(), 
      visualizer({
        open: false,            // 既然已经成功看过了，可以改为 false，避免每次 build 都弹窗打扰
        filename: 'stats.html', 
        gzipSize: true,      
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // 👇 新增：精准的手术式拆包配置
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 1. 把最胖的 react 和 react-dom 单独打包
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            // 2. 把动画库 framer-motion 单独打包
            if (id.includes('node_modules/framer-motion/')) {
              return 'vendor-motion';
            }
            // 3. 把图标库、markdown解析库等（根据你图中的方块）单独打包
            if (id.includes('node_modules/lucide-react/') || id.includes('node_modules/micromark/')) {
              return 'vendor-utils';
            }
          }
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});