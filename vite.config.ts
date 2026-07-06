/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

// GitHub Pages, projeyi https://<kullanıcı>.github.io/<repo-adı>/ altında
// sunar (kök domain değil); GitHub Actions build'inde GITHUB_REPOSITORY
// otomatik sağlanır, buradan repo adını alıp base path'i ayarlıyoruz.
// Yerel geliştirmede bu değişken yok, base '/' kalır.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = repoName ? `/${repoName}/` : '/';

// https://vite.dev/config/
export default defineConfig({
  base,
  // Telefon üzerinden LAN testi için HTTPS (self-signed sertifika).
  // PWA "Yükle" davranışı yalnızca güvenli bağlamda (HTTPS/localhost) çalışır.
  server: { host: true },
  preview: { host: true },
  plugins: [
    basicSsl(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'YAP - Yazılı Analiz Programı',
        short_name: 'YAP',
        description: 'Yazılı sınav sonuçlarını analiz eden ve telafi planlaması yapan offline-first öğretmen aracı.',
        theme_color: '#1565C0',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: base,
        scope: base,
        lang: 'tr',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Uygulama tamamen istemci tarafında (IndexedDB) çalışır; ağ isteği
        // yapılmadığı için runtimeCaching gerekmez, yalnızca build çıktısı
        // önceden önbelleğe alınır. Ana JS paketi (~3MB, PDF/Excel/Chart
        // kütüphaneleri dahil) varsayılan 2MB sınırını aştığı için yükseltildi.
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2,ttf}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
})
