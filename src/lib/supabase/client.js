import { createBrowserClient } from "@supabase/ssr";

let browserClientInstance = null;

export function createClient() {
  if (browserClientInstance) return browserClientInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "Supabase URL or Key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are set."
    );
  }

  browserClientInstance = createBrowserClient(supabaseUrl || "", supabaseKey || "");
  return browserClientInstance;
}

// Convenient singleton instance for browser context
export const supabase = typeof window !== "undefined" ? createClient() : null;
