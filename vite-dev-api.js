/**
 * Runs the /api functions inside `npm run dev`.
 *
 * Vite's dev server serves static assets and does not know about Vercel
 * Functions, so without this a submit on localhost:5173 gets no endpoint at
 * all. This mounts the same handler files the platform deploys, so the local
 * form exercises the real code path — including the live Google Sheets write.
 *
 * Dev only (`apply: 'serve'`). In production Vercel runs api/ itself and this
 * plugin is never involved.
 */
const ROUTES = {
  '/api/book': () => import('./api/book.js'),
};

/**
 * Vercel's Node runtime gives handlers Express-style `res.status().json()`.
 * A raw Node ServerResponse has neither, so add them.
 */
function shimResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(payload));
    return res;
  };
  return res;
}

export function devApi() {
  return {
    name: 'mm-dev-api',
    apply: 'serve',
    configureServer(server) {
      for (const [route, load] of Object.entries(ROUTES)) {
        server.middlewares.use(route, async (req, res, next) => {
          try {
            // Imported per request so edits to the handler take effect without
            // restarting the dev server.
            const mod = await load();
            await mod.default(req, shimResponse(res));
          } catch (error) {
            server.config.logger.error(`[dev-api] ${route} failed: ${error.stack}`);
            if (!res.headersSent) {
              shimResponse(res).status(500).json({ error: 'Dev API handler threw' });
            } else {
              next(error);
            }
          }
        });
      }
    },
  };
}
