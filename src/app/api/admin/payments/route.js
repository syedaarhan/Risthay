import { ok, fail, serverError } from "@/lib/server/http";
import { getAdminSession, hasPermission } from "@/lib/server/adminAuth";
import { getAdminPaymentsList } from "@/lib/server/adminRepo";

export async function GET(request) {
  try {
    const admin = getAdminSession(request);
    if (!admin) {
      return fail("Unauthorized access. Administrator login required.", 401);
    }

    if (!hasPermission(admin.role, "view_payments")) {
      return fail("Forbidden: Insufficient permissions to view payments.", 403);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const method = searchParams.get("method") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = getAdminPaymentsList({ search, status, method, page, limit });
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
