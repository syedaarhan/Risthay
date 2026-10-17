import {
  ok,
  fail,
  serverError,
  readJson,
  isRateLimited,
  rateLimitedResponse,
  clientIp,
  getSessionUserId,
  resolveUserId
} from "@/lib/server/http";
import {
  createSession,
  deleteSession,
  hashPassword,
  verifyPassword,
  SESSION_COOKIE,
  sessionCookieOptions
} from "@/lib/server/auth";
import {
  getUserById,
  getUserByPhone,
  getUserByEmail,
  createUser
} from "@/lib/server/repo";
import { getDb } from "@/lib/server/db";
import { isPhone, normalizePhone, sanitize, isEmail } from "@/lib/server/validation";

const DEMO_OTP = "7860";
const otpStore = (globalThis.__risthay_otps ??= new Map());

function withSession(response, token) {
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}

function startSession(request, userId, payload) {
  const { token } = createSession(userId, {
    userAgent: request.headers.get("user-agent"),
    ip: clientIp(request)
  });

  const user = getUserById(userId);
  return withSession(ok({ ...payload, user }), token);
}

export async function GET(request) {
  try {
    const sessionUserId = getSessionUserId(request);
    const userId = sessionUserId || resolveUserId(request);
    const user = getUserById(userId);

    return ok({
      authenticated: !!user,
      session: !!sessionUserId,
      user: user || null
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request) {
  try {
    const ip = clientIp(request);
    if (isRateLimited(`auth:${ip}`, { windowMs: 60_000, max: 40 })) {
      return rateLimitedResponse();
    }

    const body = await readJson(request);
    const { action } = body;

    /* 1. DIRECT DEMO LOGIN ------------------------------------------ */
    if (action === "demo_login") {
      return startSession(request, "RS-72104", {
        message: "Demo login successful. Welcome back!"
      });
    }

    /* 2. LOGOUT ----------------------------------------------------- */
    if (action === "logout") {
      const token = request.cookies.get(SESSION_COOKIE)?.value;
      deleteSession(token);
      const response = ok({ message: "Signed out successfully." });
      response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
      return response;
    }

    /* 3. GOOGLE DIRECT SIGN IN (existing members) ------------------- */
    if (action === "google_login") {
      const existingUser = (body.email && getUserByEmail(body.email)) || getUserById("RS-72104");
      if (!existingUser) {
        return fail(
          "No Risthay account found with this Google address. Please tap 'Get Started • Create Profile' to create one.",
          404
        );
      }
      return startSession(request, existingUser.id, {
        message: `Welcome back, ${existingUser.name}!`
      });
    }

    /* 4. GOOGLE ATTACH (new member, no session yet) ----------------- */
    if (action === "google_attach") {
      return ok({
        message: "Google account attached successfully.",
        account: {
          email: body.email || "syed.rehan@example.com",
          name: sanitize(body.name, 80) || "Syed Rehan",
          avatar: body.avatar || "/images/ahmed.jpg",
          attachedAt: new Date().toISOString()
        }
      });
    }

    /* 5. REGISTRATION (phone + password) ---------------------------- */
    if (action === "register") {
      const phone = normalizePhone(body.phone);
      if (!isPhone(phone)) return fail("Please enter a valid 10-digit Indian mobile number.", 400);
      if (!body.password || String(body.password).length < 6) {
        return fail("Password must be at least 6 characters long.", 400);
      }
      if (getUserByPhone(phone)) {
        return fail("An account with this mobile number already exists. Please sign in.", 409);
      }

      const user = createUser({
        phone,
        email: isEmail(body.email) ? body.email.trim() : null,
        name: sanitize(body.name, 80) || "Risthay Member",
        gender: sanitize(body.gender, 20) || null,
        passwordHash: hashPassword(String(body.password)),
        avatar: body.avatar || null
      });

      return startSession(request, user.id, { message: "Account created successfully." });
    }

    /* 6. LOGIN (phone + password) ----------------------------------- */
    if (action === "login") {
      const phone = normalizePhone(body.phone);
      const user = getUserByPhone(phone);
      if (!user) return fail("No account found with this mobile number.", 404);

      const passwordHash = getDb()
        .prepare("SELECT password_hash FROM users WHERE id = ?")
        .get(user.id)?.password_hash;

      if (!verifyPassword(String(body.password || ""), passwordHash)) {
        return fail("Incorrect password. Please try again.", 401);
      }

      return startSession(request, user.id, { message: `Welcome back, ${user.name}!` });
    }

    /* 7. OTP FLOW --------------------------------------------------- */
    if (action === "send_otp") {
      const phone = normalizePhone(body.phone);
      if (!isPhone(phone)) {
        return fail("Please enter a valid 10-digit Indian mobile number.", 400);
      }

      const code = process.env.NODE_ENV === "production"
        ? String(Math.floor(1000 + Math.random() * 9000))
        : DEMO_OTP;

      otpStore.set(phone, { code, expiresAt: Date.now() + 5 * 60_000, attempts: 0 });

      return ok({
        message: `OTP sent successfully to +91 ${phone}`,
        demoOtp: DEMO_OTP
      });
    }

    if (action === "verify_otp") {
      const phone = normalizePhone(body.phone);
      const otp = String(body.otp || "").trim();
      const record = otpStore.get(phone);

      const recordValid = record && record.code === otp && Date.now() < record.expiresAt;
      const demoValid = process.env.NODE_ENV !== "production" && (otp === DEMO_OTP || otp === "1234");
      if (!recordValid && !demoValid) {
        return fail("Invalid OTP entered. Please enter 7860.", 400);
      }

      otpStore.delete(phone);

      let user = getUserByPhone(phone);
      if (!user) {
        user = createUser({ phone, name: sanitize(body.name, 80) || "Risthay Member", onboarded: false });
      }
      return startSession(request, user.id, { message: "Authentication successful" });
    }

    /* 8. SESSION ---------------------------------------------------- */
    if (action === "session") {
      const sessionUserId = getSessionUserId(request);
      if (!sessionUserId) return ok({ authenticated: false, user: null });
      return ok({ authenticated: true, user: getUserById(sessionUserId) });
    }

    return fail("Unsupported auth action.", 400);
  } catch (error) {
    return serverError(error);
  }
}
