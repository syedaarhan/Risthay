import { ok, fail, serverError } from "@/lib/server/http";
import { getAdminSession, hasPermission } from "@/lib/server/adminAuth";
import { getAdminNotificationsList } from "@/lib/server/adminRepo";

export async function GET(request) {
  try {
    const admin = getAdminSession(request);
    if (!admin) {
      return fail("Unauthorized access. Administrator login required.", 401);
    }

    if (!hasPermission(admin.role, "view_notifications")) {
      return fail("Forbidden: Insufficient permissions.", 403);
    }

    const notifications = getAdminNotificationsList({ limit: 40 });
    return ok({ notifications });
  } catch (error) {
    return serverError(error);
  }
}
