import { createClient } from "./client";

/**
 * Initiates Google OAuth using Supabase Auth.
 * Redirects the user to Google for authentication and returns via PKCE to /auth/callback.
 *
 * @param {Object} options
 * @param {string} [options.next] - Path to redirect to upon successful sign in (default: '/')
 * @param {string} [options.intent] - 'login' | 'register' | 'attach'
 * @returns {Promise<{data: any, error: any}>}
 */
export async function signInWithGoogle({ next = "/", intent = "login" } = {}) {
  try {
    const supabase = createClient();
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "";

    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}&intent=${encodeURIComponent(intent)}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "select_account"
        }
      }
    });

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Signs out from both Supabase Auth and the local Risthay session.
 */
export async function signOutUser() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Supabase signOut notice:", err?.message);
  }

  try {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" })
    });
  } catch (err) {
    console.warn("Local logout notice:", err?.message);
  }
}
