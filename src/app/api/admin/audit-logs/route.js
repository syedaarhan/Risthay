import { ok, fail, serverError } from "@/lib/server/http";
import { getAdminSession, hasPermission } from "@/lib/server/adminAuth";
import { getAuditLogsList } from "@/lib/server/adminRepo";

export async function GET(request) {
  try {
    const admin = getAdminSession(request);
    if (!admin) {
      return fail("Unauthorized access. Administrator login required.", 401);
    }

    if (!hasPermission(admin.role, "view_audit_logs")) {
      return fail("Forbidden: Insufficient permissions to view audit logs.", 403);
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "";
    const targetType = searchParams.get("targetType") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const logs = getAuditLogsList({ action, targetType, limit });
    return ok({ logs });
  } catch (error) {
    return serverError(error);
  }
}
