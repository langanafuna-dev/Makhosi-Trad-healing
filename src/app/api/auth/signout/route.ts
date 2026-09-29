import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  await supabase.auth.signOut();
  // Plain redirect keeps the <form action="/api/auth/signout" method="post">
  // in Navbar.tsx working without any client-side JavaScript.
  return NextResponse.redirect(new URL("/", req.url));
}
