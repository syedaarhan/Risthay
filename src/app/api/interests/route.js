import { ok, fail, serverError, readJson, resolveUserId, isRateLimited, rateLimitedResponse } from "@/lib/server/http";
import {
  listInterests,
  sendInterest,
  acceptInterest,
  declineInterest,
  undoDecline,
  addReport,
  addBlock
} from "@/lib/server/repo";

export async function GET(request) {
  try {
    const userId = resolveUserId(request);
    const { received, sent, declined } = listInterests(userId);
    return ok({ received, sent, declined });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request) {
  try {
    const userId = resolveUserId(request);
    if (isRateLimited(`interests:${userId}`, { windowMs: 60_000, max: 60 })) {
      return rateLimitedResponse();
    }

    const body = await readJson(request);
    const { action } = body;

    if (action === "send") {
      const { profile, note } = body;
      if (!profile || !profile.id) return fail("A target profile is required.", 400);
      if (profile.id === userId) return fail("You cannot send an interest to yourself.", 400);

      const item = sendInterest(userId, profile, note);
      if (!item) return fail("Unable to send interest to this profile.", 400);
      return ok({ item });
    }

    if (action === "accept") {
      const { requestId } = body;
      if (!requestId) return fail("requestId is required.", 400);

      const acceptedItem = acceptInterest(userId, requestId);
      if (!acceptedItem) return fail("Interest request not found.", 404);
      return ok({ acceptedItem });
    }

    if (action === "decline") {
      const { requestId, reason, shouldBlock } = body;
      if (!requestId) return fail("requestId is required.", 400);

      const declinedItem = declineInterest(userId, requestId, reason, shouldBlock);
      if (!declinedItem) return fail("Interest request not found.", 404);

      if (shouldBlock && declinedItem.from_id) {
        addReport(userId, declinedItem.from_id, "Declined interest", reason || "Blocked while declining interest");
      }

      return ok({ declinedItem });
    }

    if (action === "undo") {
      const { requestId } = body;
      if (!requestId) return fail("requestId is required.", 400);

      const restoredItem = undoDecline(userId, requestId);
      if (!restoredItem) return fail("Declined interest not found.", 404);
      return ok({ restoredItem });
    }

    if (action === "block") {
      const { profileId } = body;
      if (!profileId) return fail("profileId is required.", 400);
      addBlock(userId, profileId);
      return ok({ blockedId: profileId });
    }

    return fail("Invalid action.", 400);
  } catch (error) {
    return serverError(error);
  }
}
