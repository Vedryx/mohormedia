import { imageSource, videoSource } from "./media.js";
export { imageSource, videoSource } from "./media.js";
import { z } from "zod";
export const sections = {
  work: "Featured work",
  stories: "Client stories",
  brands: "Brands we’ve helped bloom",
};
export const categories = [
  "Branding & Identity",
  "Digital Marketing",
  "Social Media",
  "Performance Ads",
  "Content & Films",
  "Web & SEO",
  "Other",
];
export const MAX_UPLOAD = 4 * 1024 * 1024;
const short = z.string().trim().max(180);
export const itemSchema = z
  .object({
    id: z.string().regex(/^[\w-]{1,80}$/),
    title: short.min(1, "Add a title or brand name."),
    subtitle: short.default(""),
    description: z.string().trim().max(2500).default(""),
    category: z.enum(categories).default("Other"),
    result: short.default(""),
    kind: z.enum(["text", "image", "video"]),
    mediaUrl: z.string().trim().max(2000).default(""),
    posterUrl: z.string().trim().max(2000).default(""),
    alt: short.default(""),
    link: z.string().trim().max(2000).default(""),
    status: z.enum(["draft", "published"]),
  })
  .strict()
  .superRefine((item, ctx) => {
    const issue = (path, message) =>
      ctx.addIssue({ code: "custom", path: [path], message });
    if (item.link) {
      try {
        const u = new URL(item.link);
        if (u.protocol !== "https:" || u.username || u.password) throw 0;
      } catch {
        issue("link", "Use a full HTTPS website link.");
      }
    }
    if (item.posterUrl && !imageSource(item.posterUrl))
      issue("posterUrl", "Use an uploaded image or an HTTPS image URL.");
    if (item.mediaUrl && item.kind === "image" && !imageSource(item.mediaUrl))
      issue("mediaUrl", "Use an uploaded image or an HTTPS image URL.");
    if (item.mediaUrl && item.kind === "video" && !videoSource(item.mediaUrl))
      issue(
        "mediaUrl",
        "Use YouTube, Vimeo, an HTTPS .mp4/.webm link, or an uploaded video.",
      );
    if (item.status === "published" && item.kind !== "text" && !item.mediaUrl)
      issue("mediaUrl", "Add media before publishing, or save a draft.");
    if (item.status === "published" && item.kind === "image" && !item.alt)
      issue("alt", "Describe the image for accessibility.");
  });
export function validateItem(value, section) {
  const result = itemSchema.safeParse(value);
  if (!result.success)
    return {
      error: result.error.issues[0].message,
      field: result.error.issues[0].path[0],
    };
  if (
    result.data.status === "published" &&
    section === "stories" &&
    !result.data.description
  )
    return {
      error: "Add the client’s quote before publishing.",
      field: "description",
    };
  return { item: result.data };
}
export function blankItem() {
  return {
    id: crypto.randomUUID(),
    title: "",
    subtitle: "",
    description: "",
    category: "Other",
    result: "",
    kind: "text",
    mediaUrl: "",
    posterUrl: "",
    alt: "",
    link: "",
    status: "draft",
  };
}
