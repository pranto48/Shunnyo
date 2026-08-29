import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png', 'robots.txt'],
      manifest: {
        name: 'Shunnyo - Ultra-Modern Messaging',
        short_name: 'Shunnyo',
        description: 'Next-generation encrypted, lightning-fast dark mode messaging and video call application.',
        theme_color: '#090d16',
        background_color: '#070a12',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2}']
      }
    })
  ],
  server: {
    port: 3000,
    host: true
  }
});
