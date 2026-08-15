import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: {
    rollupOptions: {
      input: {
        // main marketing site (mohormedia.com)
        main: resolve(__dirname, 'index.html'),
        // contact / link-in-bio landing (contact.mohormedia.com)
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
});
