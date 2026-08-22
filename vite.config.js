import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { devApi } from './vite-dev-api.js';

export default defineConfig(({ mode }) => {
  // Load .env.local into process.env so the dev-only API middleware can read
  // the same variables Vercel injects in production.
  //
  // The empty prefix means every key is loaded, secrets included. That is safe
  // only because these land in process.env, which is server-side. Never put
  // them in `define` — that would inline them into the client bundle.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [react(), devApi()],
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
  };
});
