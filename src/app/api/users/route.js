import { ok, fail, serverError, readJson, resolveUserId, getSessionUserId } from "@/lib/server/http";
import { getUserById, updateUser, deleteUser } from "@/lib/server/repo";
import { deleteSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/auth";

export async function GET(request) {
  try {
    const userId = resolveUserId(request);
    const user = getUserById(userId);
    return ok({ user });
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request) {
  try {
    const userId = resolveUserId(request);
    const updates = await readJson(request);
    const user = updateUser(userId, updates);
    if (!user) return fail("User not found.", 404);
    return ok({ message: "Profile updated successfully", user });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request) {
  try {
    const userId = resolveUserId(request);
    const token = getSessionUserId(request) ? request.cookies.get(SESSION_COOKIE)?.value : null;

    deleteUser(userId);
    deleteSession(token);

    const response = ok({ message: "Profile deleted successfully" });
    response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
    return response;
  } catch (error) {
    return serverError(error);
  }
}
