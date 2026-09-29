import { createBrowserClient } from "@supabase/ssr";

/** Supabase client for Client Components (the login form, Google button) —
 * stores the session in cookies the server client above can also read. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
