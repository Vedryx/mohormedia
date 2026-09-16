import test from "node:test";
import assert from "node:assert/strict";
import { validateItem, videoSource, imageSource } from "../shared/content.js";
import { publicContent } from "../lib/admin/content.js";
import { detectMedia } from "../lib/admin/media.js";
const item = {
  id: "test",
  title: "A brand",
  kind: "text",
  status: "published",
};
test("supported videos normalize to trusted players", () => {
  assert.equal(
    videoSource("https://youtu.be/dQw4w9WgXcQ").url,
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  );
  assert.equal(
    videoSource("https://vimeo.com/123456/abcdef").url,
    "https://player.vimeo.com/video/123456?h=abcdef",
  );
  assert.equal(
    videoSource("https://cdn.example.com/film.mp4?signature=abc").type,
    "file",
  );
  for (const url of [
    "javascript:alert(1)",
    "https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ",
    "https://evil.com/embed/123",
    "http://cdn.example.com/video.mp4",
    "https://user:pass@example.com/movie.mp4",
  ])
    assert.equal(videoSource(url), null);
});
test("drafts allow missing media, publication requires media and accessibility", () => {
  assert.ok(
    validateItem({ ...item, kind: "image", status: "draft" }, "work").item,
  );
  assert.equal(
    validateItem({ ...item, kind: "image" }, "work").field,
    "mediaUrl",
  );
  assert.equal(
    validateItem(
      { ...item, kind: "image", mediaUrl: "https://example.com/photo.png" },
      "work",
    ).field,
    "alt",
  );
  assert.equal(validateItem(item, "stories").field, "description");
  assert.ok(
    validateItem({ ...item, description: "A wonderful studio." }, "stories")
      .item,
  );
});
test("public output excludes drafts and does not resurrect empty sections", () => {
  const result = publicContent({
    work: [{ ...item, status: "draft" }],
    stories: [],
    brands: [item],
  });
  assert.deepEqual(result.work, []);
  assert.deepEqual(result.stories, []);
  assert.equal(result.brands[0].status, undefined);
});
test("unsafe URLs and unknown fields are rejected", () => {
  for (const link of [
    "javascript:alert(1)",
    "//evil.example",
    "http://example.com",
  ])
    assert.ok(validateItem({ ...item, link }, "brands").error);
  assert.ok(validateItem({ ...item, admin: true }, "work").error);
  assert.equal(imageSource("data:image/svg+xml,<svg/>"), false);
  assert.equal(imageSource("/api/admin/content"), false);
});
test("file MIME comes from bytes, not the filename", () => {
  assert.equal(detectMedia(Buffer.from("<svg>not a photo</svg>")), null);
  assert.equal(detectMedia(Buffer.from("not an image at all")), null);
  const bytes = Buffer.alloc(20);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(bytes);
  assert.equal(detectMedia(bytes), "image/png");
});
