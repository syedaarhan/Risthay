import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getUserBySupabaseId,
  getUserByEmail,
  linkSupabaseUser,
  createUser
} from "@/lib/server/repo";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/auth";
import { clientIp } from "@/lib/server/http";

function sanitizeRedirectUrl(target, fallback = "/") {
  if (!target || typeof target !== "string") return fallback;
  // Prevent open redirects: must be relative path starting with a single '/'
  if (target.startsWith("/") && !target.startsWith("//") && !target.startsWith("/\\")) {
    return target;
  }
  return fallback;
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next") || "/";
  const next = sanitizeRedirectUrl(rawNext, "/");
  const oauthError = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle OAuth provider failure or user cancellation
  if (oauthError) {
    const errorMsg = errorDescription || oauthError || "Google Sign-In was cancelled or failed.";
    const redirectUrl = new URL("/", requestUrl.origin);
    redirectUrl.searchParams.set("auth_error", errorMsg);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL("/", requestUrl.origin);
    redirectUrl.searchParams.set("auth_error", "Missing authentication code from Google.");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data?.user) {
      const redirectUrl = new URL("/", requestUrl.origin);
      redirectUrl.searchParams.set(
        "auth_error",
        error?.message || "Failed to exchange authentication code with Supabase."
      );
      return NextResponse.redirect(redirectUrl);
    }

    const supabaseUser = data.user;
    const email = supabaseUser.email ? supabaseUser.email.toLowerCase().trim() : null;
    const metadata = supabaseUser.user_metadata || {};
    const googleName = metadata.full_name || metadata.name || "Risthay Member";
    const googleAvatar = metadata.avatar_url || metadata.picture || null;

    // 1. Locate existing Risthay member profile
    let member = getUserBySupabaseId(supabaseUser.id);
    if (!member && email) {
      member = getUserByEmail(email);
      if (member) {
        linkSupabaseUser(member.id, supabaseUser.id);
      }
    }

    let isNewUser = false;

    // 2. If new user, create a draft profile (onboarded: false)
    if (!member) {
      isNewUser = true;
      member = createUser({
        email,
        name: googleName,
        avatar: googleAvatar,
        supabaseUserId: supabaseUser.id,
        onboarded: false,
        verified: false,
        role: "member"
      });
    }

    // 3. Establish Risthay application session
    const { token } = createSession(member.id, {
      userAgent: request.headers.get("user-agent"),
      ip: clientIp(request)
    });

    // 4. Determine destination:
    // Returning users with completed profiles go to dashboard.
    // New or uncompleted profiles go to onboarding with their Google details.
    let targetPath = next;
    if (isNewUser || !member.onboarded) {
      const onboardUrl = new URL("/", requestUrl.origin);
      onboardUrl.searchParams.set("onboarding", "start");
      onboardUrl.searchParams.set("provider", "google");
      if (email) onboardUrl.searchParams.set("email", email);
      if (googleName) onboardUrl.searchParams.set("name", googleName);
      targetPath = `${onboardUrl.pathname}${onboardUrl.search}`;
    } else {
      const successUrl = new URL(targetPath, requestUrl.origin);
      successUrl.searchParams.set("auth", "success");
      targetPath = `${successUrl.pathname}${successUrl.search}`;
    }

    const response = NextResponse.redirect(new URL(targetPath, requestUrl.origin));
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (err) {
    const redirectUrl = new URL("/", requestUrl.origin);
    redirectUrl.searchParams.set(
      "auth_error",
      err?.message || "An unexpected error occurred during Google Sign-In."
    );
    return NextResponse.redirect(redirectUrl);
  }
}
