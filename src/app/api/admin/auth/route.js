import { ok, fail, serverError, readJson, clientIp } from "@/lib/server/http";
import {
  getAdminSession,
  createAdminSession,
  deleteAdminSession,
  verifyAdminPassword,
  ADMIN_SESSION_COOKIE,
  adminCookieOptions,
  recordAuditLog
} from "@/lib/server/adminAuth";
import { getDb } from "@/lib/server/db";

export async function GET(request) {
  try {
    const admin = getAdminSession(request);
    if (!admin) {
      return ok({ authenticated: false, admin: null });
    }
    return ok({ authenticated: true, admin });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request) {
  try {
    const body = await readJson(request);
    const { email, password } = body;

    if (!email || !password) {
      return fail("Email and password are required.", 400);
    }

    const db = getDb();
    const adminRow = db.prepare(`
      SELECT * FROM admin_users
      WHERE lower(email) = lower(?) AND active = 1
    `).get(email.trim());

    if (!adminRow || !verifyAdminPassword(password, adminRow.password_hash)) {
      return fail("Invalid administrator email or password.", 401);
    }

    const { token } = createAdminSession(adminRow, {
      userAgent: request.headers.get("user-agent"),
      ip: clientIp(request)
    });

    recordAuditLog({
      adminId: adminRow.id,
      adminEmail: adminRow.email,
      adminName: adminRow.name,
      action: "admin_login",
      targetType: "admin_session",
      targetId: token,
      request
    });

    const admin = {
      id: adminRow.id,
      email: adminRow.email,
      name: adminRow.name,
      role: adminRow.role
    };

    const response = ok({
      message: `Assalamu Alaikum, ${adminRow.name}! Welcome to the Risthay Admin Console.`,
      admin
    });

    response.cookies.set(ADMIN_SESSION_COOKIE, token, adminCookieOptions());
    return response;
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request) {
  try {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    deleteAdminSession(token);

    const response = ok({ message: "Administrator signed out successfully." });
    response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...adminCookieOptions(), maxAge: 0 });
    return response;
  } catch (error) {
    return serverError(error);
  }
}
