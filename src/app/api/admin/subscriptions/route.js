import { ok, fail, serverError, readJson } from "@/lib/server/http";
import { getAdminSession, hasPermission } from "@/lib/server/adminAuth";
import {
  getAdminSubscriptionsList,
  adminGrantSubscription,
  adminExtendSubscription,
  adminRenewSubscription,
  adminRevokeSubscription
} from "@/lib/server/adminRepo";

export async function GET(request) {
  try {
    const admin = getAdminSession(request);
    if (!admin) {
      return fail("Unauthorized access. Administrator login required.", 401);
    }

    if (!hasPermission(admin.role, "view_subscriptions")) {
      return fail("Forbidden: Insufficient permissions to view subscriptions.", 403);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const planId = searchParams.get("planId") || "";
    const method = searchParams.get("method") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = getAdminSubscriptionsList({ search, status, planId, method, page, limit });
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

    if (!hasPermission(admin.role, "manage_subscriptions")) {
      return fail("Forbidden: Your role does not have permission to modify subscriptions.", 403);
    }

    const body = await readJson(request);
    const { action } = body;

    if (!action) {
      return fail("Action required ('grant', 'extend', 'renew', 'revoke').", 400);
    }

    if (action === "grant") {
      const {
        profileId,
        planId,
        startDate,
        customEndDate,
        assignmentMethod,
        paymentMethod,
        paymentStatus,
        paymentReference,
        notes
      } = body;

      if (!profileId || !planId) {
        return fail("Profile ID and Plan selection are required.", 400);
      }

      const result = adminGrantSubscription({
        profileId,
        planId,
        startDate,
        customEndDate,
        assignmentMethod,
        paymentMethod,
        paymentStatus,
        paymentReference,
        notes,
        adminUser: admin
      });

      return ok({
        message: "Subscription successfully granted to member! 👑",
        ...result
      });
    }

    if (action === "extend") {
      const { subscriptionId, monthsToAdd, notes } = body;
      if (!subscriptionId || !monthsToAdd) {
        return fail("Subscription ID and months to add are required.", 400);
      }

      const result = adminExtendSubscription({
        subscriptionId,
        monthsToAdd: parseInt(monthsToAdd, 10),
        notes: notes || "",
        adminUser: admin
      });

      return ok({
        message: `Subscription successfully extended by ${monthsToAdd} month(s).`,
        ...result
      });
    }

    if (action === "renew") {
      const { subscriptionId, planId, startOption, notes } = body;
      if (!subscriptionId || !planId) {
        return fail("Subscription ID and renewal plan are required.", 400);
      }

      // Read subscription and grant renewal
      const db = (await import("@/lib/server/db")).getDb();
      const sub = db.prepare("SELECT * FROM subscriptions WHERE id = ?").get(subscriptionId);
      if (!sub) return fail("Subscription record not found.", 404);

      const startDate = startOption === "after_current" && new Date(sub.end_date).getTime() > Date.now()
        ? sub.end_date
        : new Date().toISOString();

      const result = adminGrantSubscription({
        profileId: sub.profile_id,
        planId,
        startDate,
        assignmentMethod: "manual",
        paymentMethod: "upi",
        paymentStatus: "paid",
        notes: `Renewal: ${notes || ""}`,
        adminUser: admin
      });

      return ok({
        message: "Membership successfully renewed! 🎉",
        ...result
      });
    }

    if (action === "revoke") {
      const { subscriptionId, reason } = body;
      if (!subscriptionId || !reason || !reason.trim()) {
        return fail("Subscription ID and a mandatory revocation reason are required.", 400);
      }

      const result = adminRevokeSubscription({
        subscriptionId,
        reason,
        adminUser: admin
      });

      return ok({
        message: "Subscription revoked. Premium entitlements removed from member.",
        ...result
      });
    }

    return fail("Unsupported subscription action.", 400);
  } catch (error) {
    return serverError(error);
  }
}
