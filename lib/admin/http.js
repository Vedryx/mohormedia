export class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
export function method(req, res, allowed) {
  if (!allowed.includes(req.method)) {
    res.setHeader("Allow", allowed.join(", "));
    throw new HttpError("Method not allowed.", 405);
  }
}
export function sameOrigin(req) {
  const expected = process.env.APP_ORIGIN;
  if (!expected || req.headers.origin !== expected)
    throw new HttpError(
      "Please use the admin website to make this change.",
      403,
    );
}
export async function rawBody(req, max) {
  if (Number(req.headers["content-length"]) > max)
    throw new HttpError("File or request is too large.", 413);
  if (req.body !== undefined) {
    const body = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(
          typeof req.body === "string" ? req.body : JSON.stringify(req.body),
        );
    if (body.length > max)
      throw new HttpError("File or request is too large.", 413);
    return body;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > max) throw new HttpError("File or request is too large.", 413);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
export async function readJson(req) {
  if (!req.headers["content-type"]?.startsWith("application/json"))
    throw new HttpError("JSON is required.", 415);
  const raw = await rawBody(req, 100_000);
  try {
    return JSON.parse(raw.toString());
  } catch {
    throw new HttpError("Invalid JSON.", 400);
  }
}
export function endpoint(fn) {
  return async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    try {
      await fn(req, res);
    } catch (error) {
      if (res.headersSent) {
        res.destroy();
        return;
      }
      if (!error.status) console.error("[mohor-api]", error.name);
      res
        .status(error.status || 503)
        .json({
          error: error.status
            ? error.message
            : "The service is unavailable. Please try again.",
        });
    }
  };
}
