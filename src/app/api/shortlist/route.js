import { ok, fail, serverError, readJson, resolveUserId } from "@/lib/server/http";
import { listShortlists, addShortlist, removeShortlist } from "@/lib/server/repo";

export async function GET(request) {
  try {
    const userId = resolveUserId(request);
    return ok({ shortlistedIds: listShortlists(userId) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request) {
  try {
    const userId = resolveUserId(request);
    const { profileId, action } = await readJson(request);
    if (!profileId) return fail("profileId is required.", 400);

    const shortlistedIds = action === "remove"
      ? removeShortlist(userId, profileId)
      : addShortlist(userId, profileId);

    return ok({ shortlistedIds });
  } catch (error) {
    return serverError(error);
  }
}
