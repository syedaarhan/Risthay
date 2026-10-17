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

export function createSession(userId, { userAgent = null, ip = null } = {}) {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  db.prepare(`
    INSERT INTO sessions (token, user_id, created_at, expires_at, user_agent, ip)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(token, userId, createdAt, expiresAt, userAgent, ip);

  return { token, expiresAt };
}

export function getSessionUser(token) {
  if (!token) return null;
  const db = getDb();
  const row = db.prepare(`
    SELECT s.user_id AS userId, s.expires_at AS expiresAt
    FROM sessions s
    WHERE s.token = ?
  `).get(token);

  if (!row) return null;
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    deleteSession(token);
    return null;
  }
  return row.userId;
}

export function deleteSession(token) {
  if (!token) return;
  getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
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
