import { ok, fail, serverError, readJson, resolveUserId, isRateLimited, rateLimitedResponse } from "@/lib/server/http";
import { listChats, sendChatMessage, markChatRead, ensureChat, getSubscription } from "@/lib/server/repo";
import { sanitize } from "@/lib/server/validation";

function isPremium(userId) {
  return !!getSubscription(userId)?.isPremium;
}

export async function GET(request) {
  try {
    const userId = resolveUserId(request);
    if (!isPremium(userId)) {
      return ok({ chats: [], chatLocked: true, isPremium: false });
    }
    return ok({ chats: listChats(userId), chatLocked: false, isPremium: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request) {
  try {
    const userId = resolveUserId(request);
    if (!isPremium(userId)) {
      return fail("Halal chat is available to Premium members only. Upgrade to start chatting.", 403);
    }
    if (isRateLimited(`messages:${userId}`, { windowMs: 60_000, max: 120 })) {
      return rateLimitedResponse();
    }

    const body = await readJson(request);

    if (body.action === "markRead" && body.chatId) {
      markChatRead(userId, body.chatId);
      return ok({ chatId: body.chatId });
    }

    if (body.action === "ensure" && body.profileId) {
      const chat = ensureChat(userId, body.profileId);
      return ok({ chat });
    }

    const text = sanitize(body.text, 2000);
    if (!text) {
      return fail("Message cannot be empty.", 400);
    }

    const message = sendChatMessage(userId, body.chatId, text);
    if (!message) {
      return fail("Chat conversation not found.", 404);
    }

    return ok({ message });
  } catch (error) {
    return serverError(error);
  }
}
