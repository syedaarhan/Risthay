import { ok, fail, serverError } from "@/lib/server/http";
import { getAdminSession, hasPermission } from "@/lib/server/adminAuth";
import { getAdminDashboardStats } from "@/lib/server/adminRepo";

export async function GET(request) {
  try {
    const admin = getAdminSession(request);
    if (!admin) {
      return fail("Unauthorized access. Administrator login required.", 401);
    }

    if (!hasPermission(admin.role, "view_dashboard")) {
      return fail("Forbidden: Your role does not have permission to view dashboard analytics.", 403);
    }

    const stats = getAdminDashboardStats();
    return ok({ stats, admin });
  } catch (error) {
    return serverError(error);
  }
}
