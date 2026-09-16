export function videoSource(value) {
  if (/^\/api\/media\?id=[a-f0-9]{24}$/.test(value))
    return { type: "file", url: value };
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password) return null;
    const host = u.hostname.replace(/^www\./, "");
    let id;
    if (host === "youtu.be") id = u.pathname.slice(1);
    if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host))
      id =
        u.searchParams.get("v") ||
        u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)\/?$/)?.[1];
    if (id && /^[\w-]{11}$/.test(id))
      return {
        type: "embed",
        url: `https://www.youtube-nocookie.com/embed/${id}`,
      };
    if (["vimeo.com", "player.vimeo.com"].includes(host)) {
      id = u.pathname.match(/^\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?\/?$/);
      if (id) {
        const hash = id[2] || u.searchParams.get("h");
        return {
          type: "embed",
          url: `https://player.vimeo.com/video/${id[1]}${hash ? `?h=${encodeURIComponent(hash)}` : ""}`,
        };
      }
    }
    if (/\.(mp4|webm)$/i.test(u.pathname)) return { type: "file", url: value };
  } catch {
    /* not a supported URL */
  }
  return null;
}
export function imageSource(value) {
  if (
    /^\/api\/media\?id=[a-f0-9]{24}$/.test(value) ||
    /^\/clients\/[\w.-]+\.(png|jpe?g|webp)$/i.test(value)
  )
    return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}
