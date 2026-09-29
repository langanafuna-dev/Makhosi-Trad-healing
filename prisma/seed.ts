import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

async function main() {
  const name = process.env.ADMIN_NAME || "Bongiwe Langa";
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!password || password === "change-me-before-seeding") {
    throw new Error(
      "Set ADMIN_PASSWORD in .env to a real password before seeding (see .env.example)."
    );
  }
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env before seeding."
    );
  }

  // The service role key bypasses Row Level Security and can create users
  // directly — never expose it to the browser (see .env.example).
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Re-running the seed shouldn't create a duplicate account or error out.
  const { data: existing, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) throw listError;
  let authUser = existing.users.find((u) => u.email?.toLowerCase() === email);

  if (!authUser) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // the founder's own account skips the confirmation email
      user_metadata: { name },
    });
    if (error || !data.user) throw error ?? new Error("Failed to create admin user.");
    authUser = data.user;
  }

  // supabase/sql/001_profiles.sql's trigger already inserted a CUSTOMER
  // profile for this id when the auth user was created — promote it.
  const admin = await prisma.profile.upsert({
    where: { id: authUser.id },
    update: { name, role: "ADMIN" },
    create: { id: authUser.id, name, role: "ADMIN" },
  });

  console.log(`Admin account ready: ${email} (role: ${admin.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
