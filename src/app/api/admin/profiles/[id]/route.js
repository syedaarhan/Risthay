import { ok, fail, serverError } from "@/lib/server/http";
import { getAdminSession, hasPermission } from "@/lib/server/adminAuth";
import { getAdminProfileById } from "@/lib/server/adminRepo";

export async function GET(request, context) {
  try {
    const admin = getAdminSession(request);
    if (!admin) {
      return fail("Unauthorized access. Administrator login required.", 401);
    }

    if (!hasPermission(admin.role, "view_profiles")) {
      return fail("Forbidden: Your role does not have permission to view profiles.", 403);
    }

    const { id } = await context.params;
    const profile = getAdminProfileById(id);

    if (!profile) {
      return fail("Profile not found.", 404);
    }

    return ok({ profile });
  } catch (error) {
    return serverError(error);
  }
}
