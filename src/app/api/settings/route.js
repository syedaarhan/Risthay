import { ok, serverError, readJson, resolveUserId } from "@/lib/server/http";
import { getSettings, updateSettings } from "@/lib/server/repo";

export async function GET(request) {
  try {
    const userId = resolveUserId(request);
    return ok({ settings: getSettings(userId) });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request) {
  try {
    const userId = resolveUserId(request);
    const body = await readJson(request);
    const settings = updateSettings(userId, body);
    return ok({ message: "Settings updated successfully", settings });
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request) {
  return POST(request);
}
