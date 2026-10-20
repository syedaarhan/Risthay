import { ok, fail, serverError, readJson } from "@/lib/server/http";
import { getAdminSession, hasPermission } from "@/lib/server/adminAuth";
import { getDb } from "@/lib/server/db";

function nowIso() {
  return new Date().toISOString();
}

export async function GET(request) {
  try {
    const admin = getAdminSession(request);
    if (!admin) {
      return fail("Unauthorized access. Administrator login required.", 401);
    }
    if (!hasPermission(admin.role, "manage_settings")) {
      return fail("Forbidden: Insufficient permissions.", 403);
    }
    const db = getDb();
    const settings = {
      subscriptionsEnabled: true,
      chatEnabled: true
    };
    const row = db.prepare("SELECT value_json FROM system_settings WHERE key = \"feature_flags\"").get();
    if (row && row.value_json) {
      try {
        const parsed = JSON.parse(row.value_json);
        if (parsed.subscriptionsEnabled !== undefined) settings.subscriptionsEnabled = !!parsed.subscriptionsEnabled;
        if (parsed.chatEnabled !== undefined) settings.chatEnabled = !!parsed.chatEnabled;
      } catch {}
    }
    return ok({ settings });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request) {
  try {
    const admin = getAdminSession(request);
    if (!admin) {
      return fail("Unauthorized access. Administrator login required.", 401);
    }
    if (!hasPermission(admin.role, "manage_settings")) {
      return fail("Forbidden: Insufficient permissions.", 403);
    }
    const body = await readJson(request);
    const db = getDb();
    const current = { subscriptionsEnabled: true, chatEnabled: true };
    const row = db.prepare("SELECT value_json FROM system_settings WHERE key = \"feature_flags\"").get();
    if (row && row.value_json) {
      try {
        const parsed = JSON.parse(row.value_json);
        if (parsed.subscriptionsEnabled !== undefined) current.subscriptionsEnabled = !!parsed.subscriptionsEnabled;
        if (parsed.chatEnabled !== undefined) current.chatEnabled = !!parsed.chatEnabled;
      } catch {}
    }
    if (body.subscriptionsEnabled !== undefined) current.subscriptionsEnabled = !!body.subscriptionsEnabled;
    if (body.chatEnabled !== undefined) current.chatEnabled = !!body.chatEnabled;
    db.prepare("INSERT INTO system_settings (key, value_json, updated_at) VALUES (\"feature_flags\", ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at").run(JSON.stringify(current), nowIso());
    return ok({ message: "Feature flags updated", settings: current });
  } catch (error) {
    return serverError(error);
  }
}

