import {
  createHmac,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { database } from "./db.js";
import { HttpError } from "./http.js";
const COOKIE = "mohor_admin";
const TTL = 8 * 60 * 60;
const issuer = "mohor-admin";
function config() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase(),
    password = process.env.ADMIN_PASSWORD,
    secret = process.env.ADMIN_JWT_SECRET;
  if (
    !email ||
    !password ||
    password.length < 12 ||
    !secret ||
    secret.length < 32
  )
    throw new Error("Admin credentials are not configured securely");
  return { email, password, key: new TextEncoder().encode(secret) };
}
function version() {
  const c = config();
  return createHmac("sha256", c.key)
    .update(`${c.email}\0${c.password}`)
    .digest("hex");
}
export function credentialsMatch(email, password) {
  const c = config();
  return (
    timingSafeEqual(
      scryptSync(password, "mohor-admin", 64),
      scryptSync(c.password, "mohor-admin", 64),
    ) && email.trim().toLowerCase() === c.email
  );
}
export async function allowLogin() {
  const col = (await database()).collection("admin_login_limits");
  await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  const bucket = Math.floor(Date.now() / 900000);
  const row = await col.findOneAndUpdate(
    { _id: `login:${bucket}` },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date((bucket + 2) * 900000) },
    },
    { upsert: true, returnDocument: "after" },
  );
  return row.count <= 10;
}
function cookie(res, token, age) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
}
export async function createSession(res) {
  const c = config(),
    id = randomUUID();
  const col = (await database()).collection("admin_sessions");
  await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await col.insertOne({
    tokenId: id,
    expiresAt: new Date(Date.now() + TTL * 1000),
  });
  const token = await new SignJWT({ version: version(), role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(c.email)
    .setIssuer(issuer)
    .setAudience(issuer)
    .setJti(id)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(c.key);
  cookie(res, token, TTL);
}
export async function session(req) {
  const token = req.headers.cookie
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!token) return null;
  let payload;
  try {
    const c = config();
    ({ payload } = await jwtVerify(token, c.key, {
      algorithms: ["HS256"],
      issuer,
      audience: issuer,
    }));
    if (
      payload.sub !== c.email ||
      payload.role !== "admin" ||
      payload.version !== version() ||
      !payload.jti
    )
      return null;
  } catch {
    return null;
  }
  return await (
    await database()
  )
    .collection("admin_sessions")
    .findOne({ tokenId: payload.jti, expiresAt: { $gt: new Date() } });
}
export async function requireAdmin(req) {
  const s = await session(req);
  if (!s) throw new HttpError("Please sign in again.", 401);
  return s;
}
export async function logout(req, res) {
  const s = await session(req);
  if (s)
    await (
      await database()
    )
      .collection("admin_sessions")
      .deleteOne({ _id: s._id });
  cookie(res, "", 0);
}
