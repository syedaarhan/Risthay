import crypto from "node:crypto";
import { getDb } from "./db.js";

function clientIp(request) {
  const forwarded = request?.headers?.get?.("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request?.headers?.get?.("x-real-ip") || "unknown";
}

export const ADMIN_SESSION_COOKIE = "risthay_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export const ADMIN_PERMISSIONS = {
  super_admin: [
    "view_dashboard",
    "view_profiles",
    "review_profiles",
    "view_verifications",
    "review_verifications",
    "view_subscriptions",
    "manage_subscriptions",
    "view_payments",
    "manage_payments",
    "view_google_sheets",
    "manage_google_sheets",
    "view_notifications",
    "manage_admin_users",
    "view_audit_logs",
    "manage_settings"
  ],
  profile_reviewer: [
    "view_dashboard",
    "view_profiles",
    "review_profiles",
    "view_verifications",
    "review_verifications",
    "view_notifications",
    "view_audit_logs"
  ],
  membership_manager: [
    "view_dashboard",
    "view_profiles",
    "view_subscriptions",
    "manage_subscriptions",
    "view_payments",
    "manage_payments",
    "view_notifications",
    "view_audit_logs"
  ],
  read_only_admin: [
    "view_dashboard",
    "view_profiles",
    "view_verifications",
    "view_subscriptions",
    "view_payments",
    "view_google_sheets",
    "view_notifications",
    "view_audit_logs"
  ]
};

export function hasPermission(role, permission) {
  if (!role) return false;
  if (role === "super_admin") return true;
  const list = ADMIN_PERMISSIONS[role] || [];
  return list.includes(permission);
}

export function hashAdminPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyAdminPassword(password, stored) {
  if (!stored || typeof stored !== "string") return false;
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return crypto.timingSafeEqual(expected, derived);
}

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET || "risthay-admin-secure-key-2026-bismillah";

function signAdminToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", ADMIN_JWT_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  try {
    const expectedSig = crypto.createHmac("sha256", ADMIN_JWT_SECRET).update(data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createAdminSession(adminUser, { userAgent = null, ip = null } = {}) {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    role: adminUser.role,
    exp,
    iat: Date.now()
  };
  const token = signAdminToken(payload);
  const createdAtIso = new Date().toISOString();
  const expiresAtIso = new Date(exp).toISOString();

  // Best effort write to local database
  try {
    const db = getDb();
    db.prepare(`
      INSERT OR REPLACE INTO admin_sessions (token, admin_id, email, role, created_at, expires_at, user_agent, ip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(token, adminUser.id, adminUser.email, adminUser.role, createdAtIso, expiresAtIso, userAgent, ip);
    db.prepare("UPDATE admin_users SET last_login_at = ? WHERE id = ?").run(createdAtIso, adminUser.id);
  } catch {
    // Stateless token is verified without DB
  }

  return { token, expiresAt: expiresAtIso };
}

export function getAdminSession(request) {
  const token = request?.cookies?.get?.(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  // 1. Verify stateless cryptographic token (works 100% across all serverless containers)
  const payload = verifyAdminToken(token);
  if (payload) {
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      permissions: ADMIN_PERMISSIONS[payload.role] || []
    };
  }

  // 2. Fallback to database lookup for legacy tokens
  try {
    const db = getDb();
    const row = db.prepare(`
      SELECT s.token, s.admin_id, s.email, s.role, s.expires_at,
             u.name, u.active
      FROM admin_sessions s
      JOIN admin_users u ON s.admin_id = u.id
      WHERE s.token = ?
    `).get(token);

    if (row && row.active && new Date(row.expires_at).getTime() > Date.now()) {
      return {
        id: row.admin_id,
        email: row.email,
        name: row.name,
        role: row.role,
        permissions: ADMIN_PERMISSIONS[row.role] || []
      };
    }
  } catch {
    // Ignore DB errors
  }

  return null;
}

export function deleteAdminSession(token) {
  if (!token) return;
  try {
    getDb().prepare("DELETE FROM admin_sessions WHERE token = ?").run(token);
  } catch {}
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000)
  };
}

/**
 * Audit log recording helper.
 */
export function recordAuditLog({
  adminId = "system",
  adminEmail = "system@risthay.com",
  adminName = "System",
  action,
  targetType,
  targetId,
  details = {},
  request = null
}) {
  try {
    const db = getDb();
    const id = crypto.randomUUID();
    const ip = request ? clientIp(request) : "127.0.0.1";
    const userAgent = request?.headers?.get?.("user-agent") || "system";
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO audit_logs (id, admin_id, admin_email, admin_name, action, target_type, target_id, details_json, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      adminId,
      adminEmail,
      adminName,
      action,
      targetType,
      targetId,
      typeof details === "string" ? details : JSON.stringify(details),
      ip,
      userAgent,
      now
    );
  } catch (err) {
    console.error("Failed to record audit log:", err);
  }
}
