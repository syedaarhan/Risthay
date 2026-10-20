import { ok, serverError } from "@/lib/server/http";
import { getDb } from "@/lib/server/db";

export async function GET() {
  try {
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

