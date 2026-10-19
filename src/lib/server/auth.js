// Session + credential handling. Uses only Node built-ins (crypto/scrypt).

import crypto from "node:crypto";
import { getDb } from "./db";

export const SESSION_COOKIE = "risthay_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password, stored) {
  if (!stored || typeof stored !== "string") return false;
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return crypto.timingSafeEqual(expected, derived);
}

const USER_AUTH_SECRET = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || "risthay-user-secure-key-2026-bismillah";

function signUserToken(userId, exp) {
  const payload = { uid: userId, exp, iat: Date.now() };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", USER_AUTH_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyUserToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  try {
    const expectedSig = crypto.createHmac("sha256", USER_AUTH_SECRET).update(data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload.uid;
  } catch {
    return null;
  }
}

export function createSession(userId, { userAgent = null, ip = null } = {}) {
  const expiresAtMs = Date.now() + SESSION_TTL_MS;
  const token = signUserToken(userId, expiresAtMs);
  const createdAtIso = new Date().toISOString();
  const expiresAtIso = new Date(expiresAtMs).toISOString();

  try {
    const db = getDb();
    db.prepare(`
      INSERT OR REPLACE INTO sessions (token, user_id, created_at, expires_at, user_agent, ip)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(token, userId, createdAtIso, expiresAtIso, userAgent, ip);
  } catch {
    // Stateless token will verify without DB
  }

  return { token, expiresAt: expiresAtIso };
}

export function getSessionUser(token) {
  if (!token) return null;

  // 1. Verify stateless cryptographic token (works across all serverless containers)
  const userId = verifyUserToken(token);
  if (userId) return userId;

  // 2. Fallback to DB lookup for legacy tokens
  try {
    const db = getDb();
    const row = db.prepare(`
      SELECT s.user_id AS userId, s.expires_at AS expiresAt
      FROM sessions s
      WHERE s.token = ?
    `).get(token);

    if (row && new Date(row.expiresAt).getTime() > Date.now()) {
      return row.userId;
    }
  } catch {}

  return null;
}

export function deleteSession(token) {
  if (!token) return;
  try {
    getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
  } catch {}
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000)
  };
}

/** Read the session token from the incoming request (cookie or bearer header). */
export function readToken(request) {
  const cookieToken = request?.cookies?.get?.(SESSION_COOKIE)?.value;
  if (cookieToken) return cookieToken;

  const authHeader = request?.headers?.get?.("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return null;
}
