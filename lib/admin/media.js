import { ObjectId } from "mongodb";
import { database } from "./db.js";
import { HttpError } from "./http.js";
export function detectMedia(bytes) {
  if (bytes.length < 12) return null;
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return "image/jpeg";
  if (
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "image/png";
  if (
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  )
    return "image/webp";
  if (
    bytes.toString("ascii", 4, 8) === "ftyp" &&
    /^(isom|iso[2-9]|mp4[12]|avc1|M4V )$/.test(bytes.toString("ascii", 8, 12))
  )
    return "video/mp4";
  if (
    bytes.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163])) &&
    bytes.subarray(0, 256).includes(Buffer.from("webm"))
  )
    return "video/webm";
  return null;
}
export async function verifyMedia(item) {
  for (const [url, kind] of [
    [item.kind === "text" ? "" : item.mediaUrl, item.kind],
    [item.posterUrl, "image"],
  ]) {
    const id = url.match(/^\/api\/media\?id=([a-f0-9]{24})$/)?.[1];
    if (!id) continue;
    const file = await (
      await database()
    )
      .collection("media.files")
      .findOne({ _id: new ObjectId(id) });
    if (!file || !file.metadata?.type?.startsWith(`${kind}/`))
      throw new HttpError(
        "The uploaded file is missing or does not match the selected media type.",
        400,
      );
  }
}
