-- v4: merge useful ideas from archived srf-diary-agentic
-- - extend diary_entries with provenance-aware columns (nullable, PK untouched)
-- - enable row-level security; public read on diary_entries, writes via service role only
-- - extend daily_renders with image-QA + run classification columns
-- - introduce dispatch_logs (multi-channel delivery audit; supersedes the
--   v3 delivery_logs table without dropping it — keep v3 rows until Phase E)

alter table public.diary_entries
  add column if not exists source_book text,
  add column if not exists source_year integer,
  add column if not exists jurisdiction text,
  add column if not exists confidence_score numeric,
  add column if not exists provenance jsonb;

alter table public.daily_renders
  add column if not exists prompt_hash text,
  add column if not exists image_qa_pass boolean,
  add column if not exists image_qa_notes text,
  add column if not exists run_kind text;

create table if not exists public.dispatch_logs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid,
  channel text not null,
  target text,
  status text not null,
  external_message_id text,
  error_text text,
  payload jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_dispatch_logs_run_id on public.dispatch_logs (run_id);
create index if not exists idx_dispatch_logs_channel on public.dispatch_logs (channel);
create index if not exists idx_dispatch_logs_created_at on public.dispatch_logs (created_at desc);

-- RLS: anon can read diary_entries; everything else requires service role.
alter table public.diary_entries enable row level security;
alter table public.daily_renders enable row level security;
alter table public.delivery_logs enable row level security;
alter table public.dispatch_logs enable row level security;

drop policy if exists diary_entries_public_read on public.diary_entries;
create policy diary_entries_public_read
  on public.diary_entries
  for select
  to anon, authenticated
  using (true);

-- daily_renders: anon may read so the SPA can show today's image without a service key.
drop policy if exists daily_renders_public_read on public.daily_renders;
create policy daily_renders_public_read
  on public.daily_renders
  for select
  to anon, authenticated
  using (true);

-- delivery_logs + dispatch_logs: no anon policy = service role only (bypasses RLS).
