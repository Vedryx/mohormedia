import { z } from "zod";
import {
  endpoint,
  method,
  sameOrigin,
  readJson,
  HttpError,
} from "../../lib/admin/http.js";
import { requireAdmin } from "../../lib/admin/auth.js";
import { getContent, saveContent } from "../../lib/admin/content.js";
import { validateItem } from "../../shared/content.js";
import { verifyMedia } from "../../lib/admin/media.js";
export default endpoint(async (req, res) => {
  method(req, res, ["GET", "PUT", "DELETE", "PATCH"]);
  await requireAdmin(req);
  if (req.method === "GET") return res.status(200).json(await getContent());
  sameOrigin(req);
  const body = await readJson(req);
  const parsed = z
    .object({
      section: z.enum(["work", "stories", "brands"]),
      revision: z.number().int().min(0),
    })
    .safeParse(body);
  if (!parsed.success) throw new HttpError("Invalid section or revision.", 400);
  const { section, revision } = parsed.data,
    current = await getContent();
  if (revision !== current.revision)
    throw new HttpError(
      "Content changed in another tab. Reload the latest content before saving.",
      409,
    );
  let items = [...current[section]];
  if (req.method === "PUT") {
    const checked = validateItem(body.item, section);
    if (checked.error) throw new HttpError(checked.error, 400);
    await verifyMedia(checked.item);
    const index = items.findIndex((i) => i.id === checked.item.id);
    if (index < 0) {
      if (items.length >= 200)
        throw new HttpError("This section supports up to 200 items.", 400);
      items.push(checked.item);
    } else items[index] = checked.item;
  } else if (req.method === "DELETE") {
    if (typeof body.id !== "string" || !items.some((i) => i.id === body.id))
      throw new HttpError("Item not found.", 404);
    items = items.filter((i) => i.id !== body.id);
  } else {
    if (
      !Array.isArray(body.ids) ||
      body.ids.length !== items.length ||
      new Set(body.ids).size !== items.length ||
      !body.ids.every((id) => items.some((i) => i.id === id))
    )
      throw new HttpError("Invalid item order.", 400);
    items = body.ids.map((id) => items.find((i) => i.id === id));
  }
  res.status(200).json(await saveContent(current, section, items));
});
