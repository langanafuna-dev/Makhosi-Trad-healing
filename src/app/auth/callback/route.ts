import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Lands here after either: clicking the confirmation link in a signup
// email, or finishing "Continue with Google" — Supabase redirects back
// with a `code` to exchange for the session cookie (PKCE flow).
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") || "/herbal-holistic";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, req.nextUrl.origin));
  }

  return NextResponse.redirect(new URL("/login?error=auth_failed", req.nextUrl.origin));
}
