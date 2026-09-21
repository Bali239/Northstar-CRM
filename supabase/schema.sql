create extension if not exists "pgcrypto";

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  company text not null,
  status text not null default 'lead' check (status in ('lead', 'active', 'inactive')),
  source text not null default 'Inbound' check (source in ('Referral', 'Inbound', 'Partner', 'Event')),
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contacts_status_idx on public.contacts(status);
create index if not exists contacts_source_idx on public.contacts(source);
create index if not exists contacts_owner_id_idx on public.contacts(owner_id);
create index if not exists contacts_created_at_idx on public.contacts(created_at desc);
alter table public.contacts enable row level security;
drop policy if exists "Authenticated users can read contacts" on public.contacts;
drop policy if exists "Authenticated users can create contacts" on public.contacts;
drop policy if exists "Authenticated users can update contacts" on public.contacts;
drop policy if exists "Authenticated users can delete contacts" on public.contacts;
create policy "Users can read their own contacts" on public.contacts for select to authenticated using (owner_id = auth.uid());
create policy "Users can create their own contacts" on public.contacts for insert to authenticated with check (owner_id = auth.uid());
create policy "Users can update their own contacts" on public.contacts for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Users can delete their own contacts" on public.contacts for delete to authenticated using (owner_id = auth.uid());
insert into public.contacts (owner_id, full_name, email, company, status, source, phone, notes)
select owners.id, seed.*
from (select id from auth.users order by created_at limit 1) as owners
cross join (select * from (values
  ('Maya Chen', 'maya@northstar.studio', 'Northstar Studio', 'active', 'Referral', '+1 415 555 0182', 'Expanding into the west coast market.'),
  ('Jon Bell', 'jon@fieldnote.co', 'Fieldnote', 'lead', 'Event', '+1 212 555 0134', 'Met at Product Assembly.'),
  ('Amina Okafor', 'amina@commonthread.org', 'Common Thread', 'active', 'Partner', '+44 20 7946 0958', 'Quarterly partnership review due.'),
  ('Leo Martins', 'leo@aperture.io', 'Aperture', 'inactive', 'Inbound', null, 'Revisit in Q4.')
) as seed(full_name, email, company, status, source, phone, notes)) as seed
where not exists (select 1 from public.contacts);