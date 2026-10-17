import { ok, fail, serverError } from "@/lib/server/http";
import { getUserById } from "@/lib/server/repo";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const profile = getUserById(id);

    if (!profile) {
      return fail("Profile not found", 404);
    }

    return ok({ profile });
  } catch (error) {
    return serverError(error);
  }
}
