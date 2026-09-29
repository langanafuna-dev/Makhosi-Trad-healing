-- Run this once in the Supabase SQL editor, same as 001_profiles.sql.
-- Creates the public bucket product photos upload to (ProductManager.tsx
-- uploads directly from the browser using the signed-in admin's session —
-- these policies are what let that succeed for an admin and fail for
-- everyone else, without routing the file through our own server).

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

create policy "Admins can replace product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );

create policy "Admins can delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );
