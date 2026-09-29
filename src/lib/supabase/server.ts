import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/** Supabase client for Server Components, Route Handlers and Server
 * Actions — reads the session from cookies (kept fresh by middleware.ts)
 * and writes cookies back when the session refreshes. */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component, which can't set cookies —
            // middleware.ts refreshes the session on the next request
            // instead, so this is safe to ignore.
          }
        },
      },
    }
  );
}
