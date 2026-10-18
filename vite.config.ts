import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const mapLibreWorkerFiles = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'];
const mapLibreDist = new URL('./node_modules/maplibre-gl/dist/', import.meta.url);

const mapLibreWorkerAssets: Plugin = {
  name: 'maplibre-worker-assets',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const fileName = new URL(request.url ?? '/', 'http://localhost').pathname.slice(1);
      if (!mapLibreWorkerFiles.includes(fileName)) {
        next();
        return;
      }

      response.setHeader('Content-Type', 'text/javascript');
      response.end(readFileSync(new URL(fileName, mapLibreDist)));
    });
  },
  buildStart() {
    for (const fileName of mapLibreWorkerFiles) {
      this.emitFile({
        type: 'asset',
        fileName,
        source: readFileSync(new URL(fileName, mapLibreDist)),
      });
    }
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), mapLibreWorkerAssets],
  server: {
    host: true, // Binds to 0.0.0.0 to make server accessible publicly across LAN / Wi-Fi
    port: 5173,
  },
});
