import { ok, fail, serverError, readJson } from "@/lib/server/http";
import { getAdminSession, hasPermission } from "@/lib/server/adminAuth";
import {
  adminApproveProfile,
  adminRejectProfile,
  adminRequestCorrection
} from "@/lib/server/adminRepo";

export async function POST(request, context) {
  try {
    const admin = getAdminSession(request);
    if (!admin) {
      return fail("Unauthorized access. Administrator login required.", 401);
    }

    if (!hasPermission(admin.role, "review_profiles")) {
      return fail("Forbidden: Your role does not have permission to review or change profile decisions.", 403);
    }

    const { id } = await context.params;
    const body = await readJson(request);
    const { action, notes, reason, userMessage, correctionNotes, checklist } = body;

    if (!action) {
      return fail("Review decision action is required ('approve', 'reject', 'request_correction').", 400);
    }

    if (action === "approve") {
      const updated = adminApproveProfile({
        profileId: id,
        adminUser: admin,
        notes: notes || "",
        checklist: checklist || {}
      });
      return ok({
        message: `Profile ${id} successfully approved and published! 🎉`,
        profile: updated
      });
    }

    if (action === "reject") {
      if (!reason || !reason.trim()) {
        return fail("A rejection reason is mandatory when rejecting a profile.", 400);
      }
      const updated = adminRejectProfile({
        profileId: id,
        adminUser: admin,
        reason,
        userMessage: userMessage || "",
        internalNotes: notes || ""
      });
      return ok({
        message: `Profile ${id} rejected. Decision recorded in review ledger.`,
        profile: updated
      });
    }

    if (action === "request_correction") {
      if (!correctionNotes || !correctionNotes.trim()) {
        return fail("Please provide specific correction instructions for the member.", 400);
      }
      const updated = adminRequestCorrection({
        profileId: id,
        adminUser: admin,
        correctionNotes,
        internalNotes: notes || ""
      });
      return ok({
        message: `Corrections requested for profile ${id}. Notification sent to member.`,
        profile: updated
      });
    }

    return fail("Unsupported review action.", 400);
  } catch (error) {
    return serverError(error);
  }
}
