-- Row Level Security tests.
--
-- Runs inside one transaction and ROLLS BACK, so it leaves no data behind.
-- Works against local or remote Supabase (connect as the `postgres` user):
--
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql
--
-- Any failed assertion raises an exception and psql exits non-zero.

\set QUIET on
\o /dev/null
begin;

create function pg_temp.ok(cond boolean, msg text) returns void language plpgsql as $$
begin
  if cond is distinct from true then raise exception 'FAIL: %', msg; end if;
  raise notice 'ok - %', msg;
end $$;

-- Passes if executing `stmt` raises any error (permission denied, RLS violation…).
create function pg_temp.throws(stmt text, msg text) returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    raise notice 'ok - % (%)', msg, sqlerrm;
    return;
  end;
  raise exception 'FAIL: % — statement succeeded: %', msg, stmt;
end $$;

-- Rows affected by a DML statement.
create function pg_temp.affected(stmt text) returns int language plpgsql as $$
declare n int;
begin
  execute stmt;
  get diagnostics n = row_count;
  return n;
end $$;

grant execute on all functions in schema pg_temp to anon, authenticated, service_role;

-- ---------------------------------------------------------------- fixtures (as postgres)
insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000000001', 'super@test.local'),
  ('00000000-0000-4000-8000-000000000002', 'admin@test.local'),
  ('00000000-0000-4000-8000-000000000003', 'nobody@test.local');
update public.profiles set role = 'super_admin' where id = '00000000-0000-4000-8000-000000000001';
update public.profiles set role = 'admin'       where id = '00000000-0000-4000-8000-000000000002';

insert into public.categories (slug, name, category_group, published) values ('zz-hidden', 'Hidden', 'consumer', false);
insert into public.enquiries (kind, name, email, message, office_slug)
values ('contact', 'Test Buyer', 'buyer@example.com', 'Hello', 'abuja');

select pg_temp.ok(
  (select reference ~ '^ADS-[0-9]{4}-[0-9]{4}$' from public.enquiries where email = 'buyer@example.com'),
  'enquiry gets an ADS-YYYY-NNNN reference');

-- ---------------------------------------------------------------- anon
set local role anon;
set local request.jwt.claims = '{"role":"anon"}';

select pg_temp.ok((select count(*) from public.categories) > 0, 'anon reads published categories');
select pg_temp.ok((select count(*) from public.categories where slug = 'zz-hidden') = 0, 'anon cannot see unpublished category');
select pg_temp.ok((select count(*) from public.site_settings) > 0, 'anon reads site settings');
select pg_temp.ok((select count(*) from public.offices) > 0, 'anon reads offices');
select pg_temp.ok((select count(*) from (select key, value, confirmed from public.stats) s) > 0, 'anon reads public stat columns');
select pg_temp.throws('select note from public.stats', 'anon cannot read internal stat notes');
select pg_temp.throws('select note from public.claims', 'anon cannot read internal claim notes');
select pg_temp.ok((select count(*) from public.routing_rules) = 0, 'anon sees no routing rules');
select pg_temp.throws('select * from public.enquiries', 'anon cannot read enquiries');
select pg_temp.throws($q$insert into public.enquiries (kind, name, email) values ('contact', 'x', 'x@example.com')$q$, 'anon cannot insert enquiries directly');
select pg_temp.throws('select * from public.enquiry_notes', 'anon cannot read notes');
select pg_temp.throws('select * from public.audit_log', 'anon cannot read audit log');
select pg_temp.throws('select * from public.rate_limits', 'anon cannot read rate limits');
select pg_temp.throws($q$select public.check_rate_limit('x', 1, 60)$q$, 'anon cannot call check_rate_limit');
select pg_temp.throws('select public.next_enquiry_reference()', 'anon cannot mint references');
select pg_temp.ok(pg_temp.affected($q$update public.site_settings set value = '{}'::jsonb$q$) = 0, 'anon cannot update settings');
select pg_temp.ok(pg_temp.affected($q$delete from public.categories$q$) = 0, 'anon cannot delete categories');
select pg_temp.throws($q$insert into public.categories (slug, name, category_group) values ('evil', 'Evil', 'consumer')$q$, 'anon cannot insert categories');

-- ---------------------------------------------------------------- signed-in, no role
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000003","role":"authenticated"}';

select pg_temp.ok((select count(*) from public.enquiries) = 0, 'non-staff user sees no enquiries');
select pg_temp.ok(pg_temp.affected($q$update public.categories set name = 'x'$q$) = 0, 'non-staff user cannot edit categories');
select pg_temp.ok((select count(*) from public.profiles) = 1, 'non-staff user sees only own profile');
select pg_temp.throws($q$update public.profiles set role = 'super_admin' where id = '00000000-0000-4000-8000-000000000003'$q$, 'user cannot grant themselves a role');
select pg_temp.ok(pg_temp.affected($q$update public.profiles set full_name = 'Me' where id = '00000000-0000-4000-8000-000000000003'$q$) = 1, 'user can edit own name');
select pg_temp.ok((select count(*) from public.audit_log) = 0, 'non-staff user cannot read audit log');

-- ---------------------------------------------------------------- admin
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}';

select pg_temp.ok((select count(*) from public.enquiries) >= 1, 'admin reads enquiries');
select pg_temp.ok((select count(*) from public.categories where slug = 'zz-hidden') = 1, 'admin sees unpublished categories');
select pg_temp.ok((select count(*) from public.routing_rules) > 0, 'admin reads routing rules');
select pg_temp.ok(pg_temp.affected($q$update public.enquiries set status = 'in_progress' where email = 'buyer@example.com'$q$) = 1, 'admin updates enquiry status');
select pg_temp.ok((select status_changed_at is not null from public.enquiries where email = 'buyer@example.com'), 'status change is timestamped');
select pg_temp.ok(pg_temp.affected($q$update public.categories set summary = summary || '' where slug = 'zz-hidden'$q$) = 1, 'admin edits a category');
select pg_temp.ok(
  (select count(*) from public.audit_log where table_name = 'categories' and actor_id = '00000000-0000-4000-8000-000000000002' and action = 'UPDATE') = 1,
  'category edit is written to the audit log with the actor');
select pg_temp.ok(
  (select actor_email from public.audit_log where table_name = 'enquiries' order by id desc limit 1) = 'admin@test.local',
  'enquiry status change is audited');
select pg_temp.ok(
  pg_temp.affected($q$insert into public.enquiry_notes (enquiry_id, body) select id, 'Called the buyer' from public.enquiries where email = 'buyer@example.com'$q$) = 1,
  'admin adds an internal note (author defaults to self)');
select pg_temp.throws(
  $q$insert into public.enquiry_notes (enquiry_id, body, author_id) select id, 'spoof', '00000000-0000-4000-8000-000000000001' from public.enquiries limit 1$q$,
  'admin cannot write a note as someone else');
select pg_temp.throws($q$insert into public.enquiries (kind, name, email) values ('contact', 'x', 'x@example.com')$q$, 'admin cannot insert enquiries directly');
select pg_temp.ok(pg_temp.affected($q$delete from public.enquiries where email = 'buyer@example.com'$q$) = 0, 'plain admin cannot delete enquiries');
select pg_temp.throws($q$update public.profiles set role = 'super_admin' where id = '00000000-0000-4000-8000-000000000002'$q$, 'admin cannot promote themselves');
select pg_temp.throws($q$insert into public.audit_log (action, table_name) values ('FAKE', 'x')$q$, 'admin cannot forge audit entries');
select pg_temp.throws($q$delete from public.audit_log$q$, 'admin cannot delete audit entries');
select pg_temp.throws($q$select public.check_rate_limit('x', 1, 60)$q$, 'admin cannot call check_rate_limit');

-- ---------------------------------------------------------------- super admin
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}';

select pg_temp.ok(pg_temp.affected($q$delete from public.enquiries where email = 'buyer@example.com'$q$) = 1, 'super admin deletes an enquiry');

-- ---------------------------------------------------------------- service role
reset role;
set local role service_role;
set local request.jwt.claims = '{"role":"service_role"}';

select pg_temp.ok(public.check_rate_limit('test:rls', 2, 3600), 'rate limit: 1st request allowed');
select pg_temp.ok(public.check_rate_limit('test:rls', 2, 3600), 'rate limit: 2nd request allowed');
select pg_temp.ok(not public.check_rate_limit('test:rls', 2, 3600), 'rate limit: 3rd request blocked');
select pg_temp.ok(public.next_enquiry_reference() ~ '^ADS-[0-9]{4}-[0-9]{4}$', 'service role mints references');
select pg_temp.ok(
  pg_temp.affected($q$insert into public.enquiries (kind, name, email) values ('rfq', 'Svc', 'svc@example.com')$q$) = 1,
  'service role inserts enquiries');

reset role;
rollback;
\o
\echo 'All RLS tests passed.'
