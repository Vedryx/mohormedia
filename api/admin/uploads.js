import { GridFSBucket } from "mongodb";
import { randomUUID } from "node:crypto";
import { finished } from "node:stream/promises";
import {
  endpoint,
  method,
  sameOrigin,
  rawBody,
  HttpError,
} from "../../lib/admin/http.js";
import { requireAdmin } from "../../lib/admin/auth.js";
import { database } from "../../lib/admin/db.js";
import { detectMedia } from "../../lib/admin/media.js";
import { MAX_UPLOAD } from "../../shared/content.js";
export default endpoint(async (req, res) => {
  method(req, res, ["POST"]);
  sameOrigin(req);
  await requireAdmin(req);
  const bytes = await rawBody(req, MAX_UPLOAD),
    type = detectMedia(bytes);
  if (!type || type !== req.headers["content-type"]?.split(";")[0])
    throw new HttpError(
      "Choose a valid JPG, PNG, WebP, MP4 or WebM file.",
      415,
    );
  const stream = new GridFSBucket(await database(), {
    bucketName: "media",
  }).openUploadStream(randomUUID(), { metadata: { type } });
  const done = finished(stream);
  stream.end(bytes);
  await done;
  res.status(201).json({ url: `/api/media?id=${stream.id}`, type });
});
