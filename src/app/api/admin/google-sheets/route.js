import { ok, fail, serverError } from "@/lib/server/http";
import { getAdminSession, hasPermission } from "@/lib/server/adminAuth";
import {
  getGoogleSheetsSyncState,
  adminTriggerGoogleSheetsSync
} from "@/lib/server/adminRepo";

export async function GET(request) {
  try {
    const admin = getAdminSession(request);
    if (!admin) {
      return fail("Unauthorized access. Administrator login required.", 401);
    }

    if (!hasPermission(admin.role, "view_google_sheets")) {
      return fail("Forbidden: Insufficient permissions.", 403);
    }

    const state = getGoogleSheetsSyncState();
    return ok(state);
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

    if (!hasPermission(admin.role, "manage_google_sheets")) {
      return fail("Forbidden: Your role cannot trigger Google Sheets synchronization.", 403);
    }

    const result = adminTriggerGoogleSheetsSync(admin);
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
