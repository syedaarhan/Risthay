// Shared HTTP helpers for route handlers: JSON envelopes, rate limiting,
// and current-user resolution.

import { NextResponse } from "next/server";
import { DEMO_USER_ID } from "./db";
import { readToken, getSessionUser } from "./auth";
import { getUserById } from "./repo";

export function ok(data = {}, init) {
  return NextResponse.json({ success: true, ...data }, init);
}

export function fail(error, status = 400, extra = {}) {
  return NextResponse.json({ success: false, error, ...extra }, { status });
}

export function serverError(error) {
  const message = error?.message || "Unexpected server error";
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

export function clientIp(request) {
  const forwarded = request?.headers?.get?.("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request?.headers?.get?.("x-real-ip") || "unknown";
}

/**
 * The authenticated user, or `null` when there is no valid session.
 */
export function getSessionUserId(request) {
  const token = readToken(request);
  if (!token) return null;
  return getSessionUser(token);
}

/**
 * The effective user for demo-friendly endpoints: falls back to the seeded
 * demo account when no session is present, so the client keeps working before
 * it has adopted session cookies.
 */
export function resolveUserId(request) {
  const sessionUser = getSessionUserId(request);
  if (sessionUser && getUserById(sessionUser)) return sessionUser;
  return DEMO_USER_ID;
}

const buckets = (globalThis.__risthay_rate_buckets ??= new Map());

/**
 * Fixed-window in-memory rate limiter. Returns true when the request should be
 * rejected. Suitable for auth/OTP endpoints on a single-process deployment.
 */
export function isRateLimited(key, { windowMs = 60_000, max = 30 } = {}) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > max;
}

export function rateLimitedResponse() {
  return fail("Too many requests. Please slow down and try again shortly.", 429);
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
