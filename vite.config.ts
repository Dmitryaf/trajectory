import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.GITHUB_PAGES === 'true' ? '/trajectory/' : '/';

export default defineConfig({
  base,
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Траектория',
        short_name: 'Траектория',
        description: 'Локальные записи, недельные обзоры и персональная аналитика',
        theme_color: '#11182b',
        background_color: '#f4f6fb',
        display: 'standalone',
        start_url: base,
        scope: base,
        lang: 'ru',
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${base}icons/icon-512-maskable.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: `${base}index.html`,
        navigateFallbackDenylist: [/\/api(?:\/|$)/, /\/assets(?:\/|$)/],
        globPatterns: ['**/*.{js,css,html,json,svg,png,woff2}'],
      },
    }),
  ],
});
