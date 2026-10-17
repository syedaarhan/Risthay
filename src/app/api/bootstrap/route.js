import { ok, serverError, resolveUserId } from "@/lib/server/http";
import { getBootstrapData } from "@/lib/server/repo";

export async function GET(request) {
  try {
    const userId = resolveUserId(request);
    return ok(getBootstrapData(userId));
  } catch (error) {
    return serverError(error);
  }
}
