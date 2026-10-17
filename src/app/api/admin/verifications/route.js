import { ok, fail, serverError, readJson } from "@/lib/server/http";
import { getAdminSession, hasPermission } from "@/lib/server/adminAuth";
import {
  getAdminVerificationsList,
  adminReviewVerification
} from "@/lib/server/adminRepo";

export async function GET(request) {
  try {
    const admin = getAdminSession(request);
    if (!admin) {
      return fail("Unauthorized access. Administrator login required.", 401);
    }

    if (!hasPermission(admin.role, "view_verifications")) {
      return fail("Forbidden: Insufficient permissions to view verification queue.", 403);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = getAdminVerificationsList({ status, page, limit });
    return ok(result);
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

    if (!hasPermission(admin.role, "review_verifications")) {
      return fail("Forbidden: Your role cannot make verification decisions.", 403);
    }

    const body = await readJson(request);
    const { profileId, docDecision, selfieDecision, notes } = body;

    if (!profileId) {
      return fail("Profile ID is required.", 400);
    }

    const result = adminReviewVerification({
      profileId,
      docDecision,
      selfieDecision,
      notes: notes || "",
      adminUser: admin
    });

    return ok({ message: "Verification status updated successfully.", ...result });
  } catch (error) {
    return serverError(error);
  }
}
