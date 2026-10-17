import { ok, serverError, resolveUserId } from "@/lib/server/http";
import { listProfiles } from "@/lib/server/repo";

export async function GET(request) {
  try {
    const userId = resolveUserId(request);
    const { searchParams } = new URL(request.url);

    const result = listProfiles({
      excludeId: userId,
      state: searchParams.get("state"),
      search: searchParams.get("search"),
      gender: searchParams.get("gender"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit")
    });

    return ok({
      total: result.total,
      page: result.page,
      limit: result.limit,
      profiles: result.profiles
    });
  } catch (error) {
    return serverError(error);
  }
}
