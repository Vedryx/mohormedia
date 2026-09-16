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
  "/api/admin/login": () => import("./api/admin/login.js"),
  "/api/admin/logout": () => import("./api/admin/logout.js"),
  "/api/admin/content": () => import("./api/admin/content.js"),
  "/api/admin/uploads": () => import("./api/admin/uploads.js"),
  "/api/content": () => import("./api/content.js"),
  "/api/media": () => import("./api/media.js"),
  "/api/book": () => import("./api/book.js"),
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
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(payload));
    return res;
  };
  return res;
}

export function devApi() {
  return {
    name: "mm-dev-api",
    apply: "serve",
    configureServer(server) {
      for (const [route, load] of Object.entries(ROUTES)) {
        server.middlewares.use(route, async (req, res, next) => {
          try {
            // Run the same handler exported to Vercel. Restart Vite after backend edits.
            const mod = await load();
            if (req.url.split("?")[0] !== "/" && req.url.split("?")[0] !== "")
              return next();
            // Connect strips the mount path; restore it for query parsing.
            const relativeUrl = req.url;
            req.url =
              route +
              (relativeUrl.startsWith("/?")
                ? relativeUrl.slice(1)
                : relativeUrl === "/"
                  ? ""
                  : relativeUrl);
            await mod.default(req, shimResponse(res));
            req.url = relativeUrl;
          } catch (error) {
            server.config.logger.error(
              `[dev-api] ${route} failed: ${error.stack}`,
            );
            if (!res.headersSent) {
              shimResponse(res)
                .status(500)
                .json({ error: "Dev API handler threw" });
            } else {
              next(error);
            }
          }
        });
      }
    },
  };
}
