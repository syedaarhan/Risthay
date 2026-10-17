import { ok, fail, serverError } from "@/lib/server/http";
import { getAdminSession, hasPermission } from "@/lib/server/adminAuth";
import { getAdminProfiles } from "@/lib/server/adminRepo";

export async function GET(request) {
  try {
    const admin = getAdminSession(request);
    if (!admin) {
      return fail("Unauthorized access. Administrator login required.", 401);
    }

    if (!hasPermission(admin.role, "view_profiles")) {
      return fail("Forbidden: Your role does not have permission to view profiles.", 403);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const identityStatus = searchParams.get("identityStatus") || "";
    const selfieStatus = searchParams.get("selfieStatus") || "";
    const isPremium = searchParams.get("isPremium");
    const plan = searchParams.get("plan") || "";
    const gender = searchParams.get("gender") || "";
    const state = searchParams.get("state") || "";
    const city = searchParams.get("city") || "";
    const relationship = searchParams.get("relationship") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = getAdminProfiles({
      search,
      status,
      identityStatus,
      selfieStatus,
      isPremium,
      plan,
      gender,
      state,
      city,
      relationship,
      page,
      limit
    });

    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
