-- ADS Global Limited — initial schema
-- Every table has Row Level Security enabled. Public visitors (anon) can only
-- READ published content. Enquiries are inserted only by Server Actions using
-- the service role, after Zod validation, Turnstile and rate limiting.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('admin', 'super_admin');
create type public.category_group as enum ('consumer', 'industrial', 'automotive_transport', 'services');
create type public.enquiry_kind as enum ('rfq', 'contact', 'partner');
create type public.enquiry_status as enum ('new', 'in_progress', 'quoted', 'won', 'lost', 'closed');

-- ---------------------------------------------------------------------------
-- Profiles & role helpers
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.app_role,               -- null = signed-in user with no admin access
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on column public.profiles.role is 'Set only by a super admin (service role). null = no access.';

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role is not null
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'super_admin'
  );
$$;

revoke execute on function public.is_staff() from public;
revoke execute on function public.is_super_admin() from public;
grant execute on function public.is_staff() to anon, authenticated, service_role;
grant execute on function public.is_super_admin() to anon, authenticated, service_role;

-- New auth user → profile row (no role). Roles are granted explicitly by a super admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Shared triggers: updated_at / updated_by, audit log
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  actor_email text,
  action text not null,               -- INSERT | UPDATE | DELETE | custom (e.g. role.change, user.invite)
  table_name text not null,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_created_at_idx on public.audit_log (created_at desc);
create index audit_log_record_idx on public.audit_log (table_name, record_id);

-- Logs every change made by a signed-in user (i.e. an admin via the admin UI).
-- Seeds and service-role writes from public forms are not logged here; admin
-- actions that must use the service role (user invites, role changes) write
-- their own audit rows.
create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  rec jsonb;
begin
  if uid is null then
    return coalesce(new, old);
  end if;

  rec := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;

  insert into public.audit_log (actor_id, actor_email, action, table_name, record_id, old_data, new_data)
  values (
    uid,
    (select email from public.profiles where id = uid),
    tg_op,
    tg_table_name,
    coalesce(rec ->> 'id', rec ->> 'key', rec ->> 'slug', rec ->> 'country_code'),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;

-- ---------------------------------------------------------------------------
-- Content tables
-- ---------------------------------------------------------------------------
create table public.site_settings (
  key text primary key check (key in ('company', 'about', 'contact', 'socials', 'hero')),
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.offices (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  country text not null,
  country_code char(2) not null,
  city text not null,
  address text not null default '',
  address_confirmed boolean not null default false,
  phone text not null,
  whatsapp text,
  email text not null,
  timezone text not null,              -- IANA, e.g. Africa/Lagos
  tz_label text not null,              -- e.g. WAT
  utc_offset_label text not null,      -- e.g. UTC+1
  is_hq boolean not null default false,
  map_url text,
  hours jsonb not null default '[]'::jsonb,
  hours_confirmed boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  hs_label text not null default '',
  category_group public.category_group not null,
  summary text not null default '',
  description text not null default '',
  example_products text[] not null default '{}',
  example_products_confirmed boolean not null default false,
  sourcing_regions text[] not null default '{}',
  sourcing_regions_confirmed boolean not null default false,
  incoterms text[] not null default '{}',
  image_url text,
  image_alt text not null default '',
  image_is_stock boolean not null default true,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_image_alt_required check (image_url is null or length(trim(image_alt)) > 0)
);
create index categories_sort_idx on public.categories (sort_order);

create table public.stats (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  value numeric not null,
  prefix text not null default '',
  suffix text not null default '',
  confirmed boolean not null default false,
  note text not null default '',       -- internal; hidden from anon via column grants
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  text text not null,
  source text not null default '',     -- internal
  confirmed boolean not null default false,
  note text not null default '',       -- internal
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.strengths (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  icon text not null default 'Check',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.process_steps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  details text[] not null default '{}',
  image_url text,
  image_alt text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leaders (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text not null default '',
  bio text not null default '',
  photo_url text,
  confirmed boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  issuer text not null default '',
  reference text not null default '',
  valid_until date,
  document_url text,
  confirmed boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  client text not null default '',
  location text not null default '',
  category_slugs text[] not null default '{}',
  summary text not null default '',
  body text not null default '',
  cover_url text,
  cover_alt text not null default '',
  published boolean not null default false,
  published_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_cover_alt_required check (cover_url is null or length(trim(cover_alt)) > 0)
);

create table public.routing_rules (
  country_code char(2) primary key,
  office_slug text not null references public.offices (slug) on update cascade on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Enquiries (RFQ, contact, partner applications)
-- ---------------------------------------------------------------------------
create table public.reference_counters (
  year int primary key,
  last_value int not null default 0
);

-- ADS-2026-0001, numbered per calendar year in Africa/Lagos time.
create or replace function public.next_enquiry_reference()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  y int := extract(year from (now() at time zone 'Africa/Lagos'))::int;
  n int;
begin
  insert into public.reference_counters as rc (year, last_value)
  values (y, 1)
  on conflict (year) do update set last_value = rc.last_value + 1
  returning last_value into n;
  return format('ADS-%s-%s', y, lpad(n::text, 4, '0'));
end;
$$;
revoke execute on function public.next_enquiry_reference() from public, anon, authenticated;
grant execute on function public.next_enquiry_reference() to service_role;

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default public.next_enquiry_reference(),
  kind public.enquiry_kind not null,
  status public.enquiry_status not null default 'new',
  office_slug text references public.offices (slug) on update cascade on delete set null,
  assignee_id uuid references public.profiles (id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  company text,
  country_code char(2),
  subject text,
  message text,
  details jsonb not null default '{}'::jsonb,   -- RFQ / partner-specific fields
  source_path text,
  ip_hash text,
  user_agent text,
  status_changed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index enquiries_inbox_idx on public.enquiries (kind, status, created_at desc);
create index enquiries_assignee_idx on public.enquiries (assignee_id);
create index enquiries_office_idx on public.enquiries (office_slug);

create or replace function public.enquiry_status_changed()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;
  return new;
end;
$$;

create table public.enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null default auth.uid(),
  body text not null check (length(trim(body)) > 0),
  created_at timestamptz not null default now()
);
create index enquiry_notes_enquiry_idx on public.enquiry_notes (enquiry_id, created_at);

create table public.enquiry_attachments (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries (id) on delete cascade,
  provider text not null default 'cloudinary',
  public_id text not null,             -- private ("authenticated") asset; served via signed URLs only
  resource_type text not null default 'image',
  filename text not null,
  mime_type text not null,
  bytes int not null check (bytes > 0),
  created_at timestamptz not null default now()
);
create index enquiry_attachments_enquiry_idx on public.enquiry_attachments (enquiry_id);

-- ---------------------------------------------------------------------------
-- Rate limiting (fixed window, Postgres-backed). Service role only.
-- ---------------------------------------------------------------------------
create table public.rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  hits int not null default 0,
  primary key (bucket, window_start)
);
create index rate_limits_window_idx on public.rate_limits (window_start);

-- Returns true if the request is allowed.
create or replace function public.check_rate_limit(p_bucket text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  h int;
begin
  insert into public.rate_limits as r (bucket, window_start, hits)
  values (p_bucket, w, 1)
  on conflict (bucket, window_start) do update set hits = r.hits + 1
  returning hits into h;

  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '2 days';
  end if;

  return h <= p_limit;
end;
$$;
revoke execute on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, int, int) to service_role;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'offices', 'categories', 'stats', 'claims', 'strengths', 'process_steps',
    'leaders', 'certifications', 'projects', 'routing_rules', 'enquiries', 'site_settings'
  ] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;

  foreach t in array array[
    'profiles', 'offices', 'categories', 'stats', 'claims', 'strengths', 'process_steps',
    'leaders', 'certifications', 'projects', 'routing_rules', 'site_settings',
    'enquiries', 'enquiry_notes', 'enquiry_attachments'
  ] loop
    execute format('create trigger audit_changes after insert or update or delete on public.%I for each row execute function public.audit_row_change()', t);
  end loop;
end;
$$;

create trigger enquiry_status_changed before update on public.enquiries
  for each row execute function public.enquiry_status_changed();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.audit_log enable row level security;
alter table public.site_settings enable row level security;
alter table public.offices enable row level security;
alter table public.categories enable row level security;
alter table public.stats enable row level security;
alter table public.claims enable row level security;
alter table public.strengths enable row level security;
alter table public.process_steps enable row level security;
alter table public.leaders enable row level security;
alter table public.certifications enable row level security;
alter table public.projects enable row level security;
alter table public.routing_rules enable row level security;
alter table public.reference_counters enable row level security;
alter table public.enquiries enable row level security;
alter table public.enquiry_notes enable row level security;
alter table public.enquiry_attachments enable row level security;
alter table public.rate_limits enable row level security;
-- reference_counters and rate_limits intentionally have NO policies: service role only.

-- Profiles: read own row (staff read all). Users may edit only their own name;
-- role changes go through a super-admin Server Action using the service role.
create policy "profiles: read own or staff" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_staff()));
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

-- Audit log: staff can read; nobody writes directly (triggers are security definer).
create policy "audit_log: staff read" on public.audit_log
  for select to authenticated using ((select public.is_staff()));
revoke insert, update, delete on public.audit_log from anon, authenticated;

-- Public content: anyone can read; staff can write.
do $$
declare t text;
begin
  foreach t in array array['site_settings', 'offices', 'stats', 'claims', 'strengths', 'process_steps', 'leaders', 'certifications'] loop
    execute format('create policy "%s: public read" on public.%I for select to anon, authenticated using (true)', t, t);
    execute format('create policy "%s: staff insert" on public.%I for insert to authenticated with check ((select public.is_staff()))', t, t);
    execute format('create policy "%s: staff update" on public.%I for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()))', t, t);
    execute format('create policy "%s: staff delete" on public.%I for delete to authenticated using ((select public.is_staff()))', t, t);
  end loop;

  foreach t in array array['categories', 'projects'] loop
    execute format('create policy "%s: read published or staff" on public.%I for select to anon, authenticated using (published or (select public.is_staff()))', t, t);
    execute format('create policy "%s: staff insert" on public.%I for insert to authenticated with check ((select public.is_staff()))', t, t);
    execute format('create policy "%s: staff update" on public.%I for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()))', t, t);
    execute format('create policy "%s: staff delete" on public.%I for delete to authenticated using ((select public.is_staff()))', t, t);
  end loop;
end;
$$;

-- Internal notes on stats/claims are hidden from anonymous visitors (column privileges).
revoke select on public.stats from anon;
grant select (id, key, label, value, prefix, suffix, confirmed, sort_order) on public.stats to anon;
revoke select on public.claims from anon;
grant select (id, key, label, text, confirmed) on public.claims to anon;

-- Routing rules: staff only.
create policy "routing_rules: staff all" on public.routing_rules
  for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));

-- Enquiries: staff read/update; only super admins delete; NO insert policy
-- (public forms insert through the service role after Turnstile + rate limit).
create policy "enquiries: staff read" on public.enquiries
  for select to authenticated using ((select public.is_staff()));
create policy "enquiries: staff update" on public.enquiries
  for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "enquiries: super admin delete" on public.enquiries
  for delete to authenticated using ((select public.is_super_admin()));
revoke insert on public.enquiries from anon, authenticated;
revoke all on public.enquiries from anon;

create policy "enquiry_notes: staff read" on public.enquiry_notes
  for select to authenticated using ((select public.is_staff()));
create policy "enquiry_notes: staff write own" on public.enquiry_notes
  for insert to authenticated with check ((select public.is_staff()) and author_id = (select auth.uid()));
create policy "enquiry_notes: author delete" on public.enquiry_notes
  for delete to authenticated using ((select public.is_staff()) and author_id = (select auth.uid()));
revoke all on public.enquiry_notes from anon;

create policy "enquiry_attachments: staff read" on public.enquiry_attachments
  for select to authenticated using ((select public.is_staff()));
revoke all on public.enquiry_attachments from anon;
revoke insert, update, delete on public.enquiry_attachments from authenticated;

revoke all on public.rate_limits from anon, authenticated;
revoke all on public.reference_counters from anon, authenticated;
revoke all on public.audit_log from anon;
