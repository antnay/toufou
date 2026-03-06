import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    },
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['**/*.{png,jpg,jpeg,svg,txt}'],
            manifest: false, // Not using it as installable app right now, just caching
            workbox: {
                globPatterns: ['**/*.{js,css,html,png,svg,txt}'],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB limit
            }
        })
    ]
});
