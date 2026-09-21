-- Run this once for an existing contacts table.
-- Existing shared rows have no reliable creator. Replace the UUID below with
-- the user who should own those existing rows, or delete/archive them first.

alter table public.contacts
  add column if not exists owner_id uuid references auth.users(id) on delete cascade;

-- Find authenticated user IDs before continuing:
-- select id, email from auth.users order by created_at;

-- Replace YOUR_USER_UUID before running this statement.
update public.contacts
set owner_id = 'YOUR_USER_UUID'::uuid
where owner_id is null;

alter table public.contacts
  alter column owner_id set not null;

create index if not exists contacts_owner_id_idx
  on public.contacts(owner_id);

alter table public.contacts enable row level security;

drop policy if exists "Authenticated users can read contacts" on public.contacts;
drop policy if exists "Authenticated users can create contacts" on public.contacts;
drop policy if exists "Authenticated users can update contacts" on public.contacts;
drop policy if exists "Authenticated users can delete contacts" on public.contacts;
drop policy if exists "Users can read their own contacts" on public.contacts;
drop policy if exists "Users can create their own contacts" on public.contacts;
drop policy if exists "Users can update their own contacts" on public.contacts;
drop policy if exists "Users can delete their own contacts" on public.contacts;

create policy "Users can read their own contacts"
  on public.contacts for select to authenticated
  using (owner_id = auth.uid());

create policy "Users can create their own contacts"
  on public.contacts for insert to authenticated
  with check (owner_id = auth.uid());

create policy "Users can update their own contacts"
  on public.contacts for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Users can delete their own contacts"
  on public.contacts for delete to authenticated
  using (owner_id = auth.uid());

notify pgrst, 'reload schema';