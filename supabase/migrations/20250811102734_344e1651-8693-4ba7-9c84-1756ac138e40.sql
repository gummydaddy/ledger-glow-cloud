-- Create receipts storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

-- Conditionally create policies for the receipts bucket
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public can view receipts'
  ) then
    create policy "Public can view receipts"
      on storage.objects for select
      using (bucket_id = 'receipts');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can upload their receipts'
  ) then
    create policy "Users can upload their receipts"
      on storage.objects for insert
      with check (
        bucket_id = 'receipts'
        and auth.role() = 'authenticated'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can update their receipts'
  ) then
    create policy "Users can update their receipts"
      on storage.objects for update
      using (
        bucket_id = 'receipts'
        and auth.role() = 'authenticated'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can delete their receipts'
  ) then
    create policy "Users can delete their receipts"
      on storage.objects for delete
      using (
        bucket_id = 'receipts'
        and auth.role() = 'authenticated'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end $$;