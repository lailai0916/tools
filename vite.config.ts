import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { toolRouteManifest } from './scripts/tool-route-manifest';

export default defineConfig({
  plugins: [react(), toolRouteManifest()],
  build: {
    manifest: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
