import { ok, fail, serverError, readJson, resolveUserId } from "@/lib/server/http";
import { getSubscription, activateSubscription } from "@/lib/server/repo";
import { SUBSCRIPTION_PLANS, PREMIUM_BENEFITS, getPlanById } from "@/lib/plans";

export async function GET(request) {
  try {
    const userId = resolveUserId(request);
    const subscription = getSubscription(userId);
    return ok({ subscription, plans: SUBSCRIPTION_PLANS, benefits: PREMIUM_BENEFITS });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request) {
  try {
    const userId = resolveUserId(request);
    const { planId } = await readJson(request);

    if (!planId) return fail("planId is required.", 400);
    if (!getPlanById(planId)) return fail("Unknown subscription plan.", 400);

    const result = activateSubscription(userId, planId);
    if (!result) return fail("Unable to activate this plan.", 400);

    return ok({
      success: true,
      ...result,
      plans: SUBSCRIPTION_PLANS,
      benefits: PREMIUM_BENEFITS
    });
  } catch (error) {
    return serverError(error);
  }
}
