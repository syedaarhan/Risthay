import { ok, serverError, resolveUserId } from "@/lib/server/http";
import { listNotifications } from "@/lib/server/repo";

export async function GET(request) {
  try {
    const userId = resolveUserId(request);
    return ok({ notifications: listNotifications(userId) });
  } catch (error) {
    return serverError(error);
  }
}
