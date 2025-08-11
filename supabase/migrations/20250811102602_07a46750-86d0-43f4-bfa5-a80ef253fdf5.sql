-- Create receipts storage bucket and policies
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

-- Allow public read access to receipts
create policy if not exists "Public can view receipts"
  on storage.objects for select
  using (bucket_id = 'receipts');

-- Allow authenticated users to upload to their own folder
create policy if not exists "Users can upload their receipts"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to update their own receipts
create policy if not exists "Users can update their receipts"
  on storage.objects for update
  using (
    bucket_id = 'receipts'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to delete their own receipts
create policy if not exists "Users can delete their receipts"
  on storage.objects for delete
  using (
    bucket_id = 'receipts'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );