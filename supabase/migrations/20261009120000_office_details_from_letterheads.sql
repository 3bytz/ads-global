-- Office details from the company letterheads (October 2026).
--   China:   Shenyang Sadiq International Trade Co., Ltd. — Shenyang head office + Shandong (Liangshan) branch
--   Nigeria: Abubakar Dahiru Sadiq Global Ltd., RC 8079004 — Abuja and Kano offices
-- Safe on a fresh database (updates touch no rows; the seed then inserts everything)
-- and on an already-seeded one (rows are updated in place; FKs cascade the slug rename).

alter table public.offices add column if not exists legal_entity text;
alter table public.offices add column if not exists registration text;

-- Shenyang head office
update public.offices set
  name = 'Shenyang head office',
  legal_entity = 'Shenyang Sadiq International Trade Co., Ltd.',
  address = 'Room 3, No. 703, West Five District, 888 Puhe Avenue, Shenbei New District, Shenyang, Liaoning Province, China',
  address_confirmed = true,
  phone = '+8618012824844',
  whatsapp = '+8613591479952',
  email = 'globalltdads@gmail.com',
  map_url = 'https://www.google.com/maps/search/?api=1&query=888%20Puhe%20Avenue%2C%20Shenbei%20New%20District%2C%20Shenyang%2C%20Liaoning%2C%20China',
  sort_order = 1
where slug = 'shenyang';

-- The old single "Nigeria" office becomes the Abuja office. Renaming the slug cascades to
-- routing_rules and enquiries (ON UPDATE CASCADE).
update public.offices set
  slug = 'abuja',
  name = 'Abuja office',
  legal_entity = 'Abubakar Dahiru Sadiq Global Ltd.',
  registration = 'RC 8079004',
  city = 'Abuja',
  address = 'Plot 458 Ahmadu Bello Way, opposite Access Bank, Garki II, Abuja, Nigeria',
  address_confirmed = true,
  phone = '+2347031129111',
  whatsapp = '+8613591479952',
  email = 'globalltdads@gmail.com',
  map_url = 'https://www.google.com/maps/search/?api=1&query=Plot%20458%20Ahmadu%20Bello%20Way%2C%20Garki%20II%2C%20Abuja%2C%20Nigeria',
  sort_order = 3
where slug = 'nigeria';

-- New offices (only if the offices table was already seeded; on a fresh DB the seed adds them).
insert into public.offices
  (slug, name, legal_entity, registration, country, country_code, city, address, address_confirmed, phone, whatsapp, email,
   timezone, tz_label, utc_offset_label, is_hq, map_url, hours, hours_confirmed, sort_order)
select v.* from (values
  ('liangshan', 'Shandong branch', 'Shenyang Sadiq International Trade Co., Ltd.', null::text, 'China', 'CN', 'Liangshan, Shandong',
   '500 metres east of Quanpuwaking Village, Quanpu Town, Liangshan County, Shandong Province, China', true,
   '+8618012824844', '+8613591479952', 'globalltdads@gmail.com', 'Asia/Shanghai', 'CST', 'UTC+8', false,
   'https://www.google.com/maps/search/?api=1&query=Quanpu%20Town%2C%20Liangshan%20County%2C%20Shandong%2C%20China',
   '[{"days":"Mon–Fri","opens":"09:00","closes":"18:00"},{"days":"Saturday","opens":"10:00","closes":"16:00","note":"[CONFIRM: which time zone]"},{"days":"Sunday","opens":null,"closes":null}]'::jsonb,
   false, 2),
  ('kano', 'Kano office', 'Abubakar Dahiru Sadiq Global Ltd.', 'RC 8079004', 'Nigeria', 'NG', 'Kano',
   'No. 86 U/Badawa, A.A. Rano Street, Hotoro NNPC Depot, Maiduguri Road, Kano, Nigeria', true,
   '+2347031129111', '+8613591479952', 'globalltdads@gmail.com', 'Africa/Lagos', 'WAT', 'UTC+1', false,
   'https://www.google.com/maps/search/?api=1&query=Hotoro%20NNPC%20Depot%2C%20Maiduguri%20Road%2C%20Kano%2C%20Nigeria',
   '[{"days":"Mon–Fri","opens":"09:00","closes":"18:00"},{"days":"Saturday","opens":"10:00","closes":"16:00","note":"[CONFIRM: which time zone]"},{"days":"Sunday","opens":null,"closes":null}]'::jsonb,
   false, 4)
) as v
where exists (select 1 from public.offices)
on conflict (slug) do nothing;

-- Office count stat and the CAC registration.
update public.stats set value = 4, label = 'Offices in China and Nigeria', confirmed = true,
  note = 'Shenyang, Shandong (Liangshan), Abuja, Kano — per company letterheads.'
where key = 'offices' and value = 2;

update public.certifications set
  name = 'CAC registration — Abubakar Dahiru Sadiq Global Ltd.',
  issuer = 'Corporate Affairs Commission, Nigeria',
  reference = 'RC 8079004',
  confirmed = true
where slug = 'cac' and reference like '[CONFIRM%';

-- Public emails: the letterhead address replaces the unverified @adsglobaltd.com ones
-- (only where they're still the old defaults, so admin edits are kept).
update public.site_settings
set value = value
  || case when value ->> 'generalEmail' = 'info@adsglobaltd.com' then '{"generalEmail":"globalltdads@gmail.com"}'::jsonb else '{}'::jsonb end
  || case when value ->> 'partnersEmail' = 'partners@adsglobaltd.com' then '{"partnersEmail":"globalltdads@gmail.com"}'::jsonb else '{}'::jsonb end
where key = 'contact';
