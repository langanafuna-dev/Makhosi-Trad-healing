-- Run this once in the Supabase SQL editor (Dashboard > SQL Editor),
-- AFTER `npm run db:push` has created the `profiles` table from
-- prisma/schema.prisma. Prisma doesn't know about Supabase's `auth` schema,
-- so the pieces that touch it (the foreign key, and the trigger that
-- creates a profile row on signup) live here instead of in the schema.

-- Every profile row is the app-side half of a Supabase Auth user — tie
-- its lifecycle to that user so deleting the auth user cleans up here too.
alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

alter table public.profiles enable row level security;

-- The app's own server code (src/lib/supabase/server.ts) reads/writes
-- profiles with the anon key under the signed-in user's session, so RLS
-- needs to let someone see and update their own row. Admin-only reads
-- (the practitioner dashboard, prisma/seed.ts) go through
-- SUPABASE_SERVICE_ROLE_KEY instead, which bypasses RLS entirely.
create policy "Profiles are viewable by the owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by the owner"
  on public.profiles for update
  using (auth.uid() = id);

-- One account, both branches, however they sign in (password or Google):
-- this fires right after Supabase Auth creates the auth.users row, so a
-- matching profiles row (role defaults to CUSTOMER) always exists before
-- the app's first request needs it.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'CUSTOMER',
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
