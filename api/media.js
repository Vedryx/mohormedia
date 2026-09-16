import { GridFSBucket, ObjectId } from "mongodb";
import { pipeline } from "node:stream/promises";
import { endpoint, method, HttpError } from "../lib/admin/http.js";
import { database } from "../lib/admin/db.js";
export default endpoint(async (req, res) => {
  method(req, res, ["GET", "HEAD"]);
  const id = new URL(req.url, "http://localhost").searchParams.get("id");
  if (!/^[a-f0-9]{24}$/.test(id || ""))
    throw new HttpError("Media not found.", 404);
  const db = await database(),
    file = await db
      .collection("media.files")
      .findOne({ _id: new ObjectId(id) });
  if (!file) throw new HttpError("Media not found.", 404);
  let start = 0,
    end = file.length - 1;
  const range = req.headers.range;
  if (range) {
    const match = range.match(/^bytes=(\d*)-(\d*)$/);
    if (!match || (!match[1] && !match[2]))
      throw new HttpError("Invalid range.", 416);
    if (!match[1]) start = Math.max(0, file.length - Number(match[2]));
    else {
      start = Number(match[1]);
      if (match[2]) end = Math.min(end, Number(match[2]));
    }
    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start > end ||
      start >= file.length
    ) {
      res.setHeader("Content-Range", `bytes */${file.length}`);
      throw new HttpError("Invalid range.", 416);
    }
    res.status(206);
    res.setHeader("Content-Range", `bytes ${start}-${end}/${file.length}`);
  } else res.status(200);
  res.setHeader("Content-Type", file.metadata.type);
  res.setHeader("Content-Length", end - start + 1);
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
  if (req.method === "HEAD") return res.end();
  await pipeline(
    new GridFSBucket(db, { bucketName: "media" }).openDownloadStream(file._id, {
      start,
      end: end + 1,
    }),
    res,
  );
});
