import { defineConfig } from 'vite';

export default defineConfig({
    // If you deploy to https://<USERNAME>.github.io/<REPO>/, set base to '/<REPO>/'
    // base: '/toufou/', 
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    }
});
