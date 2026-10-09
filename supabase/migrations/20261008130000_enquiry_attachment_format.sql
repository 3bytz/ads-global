-- Phase 3: keep the Cloudinary format so staff downloads can request the original file type.
alter table public.enquiry_attachments add column if not exists format text;

-- Inbox search (reference, name, email, company) without a full-text index: trigram is
-- overkill at this volume, a btree on lower(email) speeds the common lookup.
create index if not exists enquiries_email_idx on public.enquiries (lower(email));
