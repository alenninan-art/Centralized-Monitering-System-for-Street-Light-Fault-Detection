import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Binds to 0.0.0.0 to make server accessible publicly across LAN / Wi-Fi
    port: 5173,
  },
});
