import { endpoint, method, sameOrigin } from "../../lib/admin/http.js";
import { logout } from "../../lib/admin/auth.js";
export default endpoint(async (req, res) => {
  method(req, res, ["POST"]);
  sameOrigin(req);
  await logout(req, res);
  res.status(200).json({ ok: true });
});
