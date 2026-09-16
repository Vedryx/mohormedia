import { endpoint, method } from "../lib/admin/http.js";
import { getContent, publicContent } from "../lib/admin/content.js";
export default endpoint(async (req, res) => {
  method(req, res, ["GET"]);
  res.status(200).json(publicContent(await getContent()));
});
