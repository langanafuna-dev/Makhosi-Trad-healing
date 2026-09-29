import { prisma } from "./db";
import { createClient } from "./supabase/server";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string; // CUSTOMER | ADMIN — see prisma/schema.prisma for why this isn't a literal union
};

/** Reads the signed-in user from the Supabase session cookie (kept fresh
 * by src/middleware.ts) and joins the role from public.profiles. Returns
 * null if signed out or the session is invalid — callers should treat
 * that exactly like "not signed in", never throw. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // The profiles row is created by a trigger right after signup (see
  // supabase/sql/001_profiles.sql) — null here means that hasn't landed
  // yet, which is effectively "not signed in" for our purposes.
  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile) return null;

  return { id: user.id, name: profile.name, email: user.email ?? "", role: profile.role };
}

/** Convenience for pages/routes that only admins (the founder) may use. */
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return null;
  // Re-check against the database in case the role changed since the
  // session was last refreshed.
  const fresh = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!fresh || fresh.role !== "ADMIN") return null;
  return fresh;
}
