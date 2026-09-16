import { database } from "./db.js";
import { seed } from "./seed.js";
import { HttpError } from "./http.js";
export async function getContent() {
  const col = (await database()).collection("site_content");
  await col.updateOne(
    { _id: "main" },
    { $setOnInsert: seed },
    { upsert: true },
  );
  const { _id, ...content } = await col.findOne({ _id: "main" });
  return content;
}
export async function saveContent(current, section, items) {
  const result = await (
    await database()
  )
    .collection("site_content")
    .updateOne(
      { _id: "main", revision: current.revision },
      { $set: { [section]: items }, $inc: { revision: 1 } },
    );
  if (!result.matchedCount)
    throw new HttpError(
      "Content changed in another tab. Reload the latest content before saving.",
      409,
    );
  return { ...current, [section]: items, revision: current.revision + 1 };
}
export function publicContent(content) {
  return Object.fromEntries(
    ["work", "stories", "brands"].map((section) => [
      section,
      content[section]
        .filter((i) => i.status === "published")
        .map(({ status, ...item }) => item),
    ]),
  );
}
