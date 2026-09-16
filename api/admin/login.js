import { z } from "zod";
import {
  endpoint,
  method,
  sameOrigin,
  readJson,
  HttpError,
} from "../../lib/admin/http.js";
import {
  allowLogin,
  credentialsMatch,
  createSession,
} from "../../lib/admin/auth.js";
export default endpoint(async (req, res) => {
  method(req, res, ["POST"]);
  sameOrigin(req);
  const parsed = z
    .object({
      email: z.string().email().max(200),
      password: z.string().min(1).max(256),
    })
    .safeParse(await readJson(req));
  if (!parsed.success)
    throw new HttpError("Enter your email and password.", 400);
  if (!(await allowLogin())) {
    res.setHeader("Retry-After", "900");
    throw new HttpError(
      "Too many sign-in attempts. Try again in 15 minutes.",
      429,
    );
  }
  if (!credentialsMatch(parsed.data.email, parsed.data.password))
    throw new HttpError("Email or password is incorrect.", 401);
  await createSession(res);
  res.status(200).json({ ok: true });
});
