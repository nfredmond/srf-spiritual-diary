create extension if not exists pgcrypto;

create table if not exists public.diary_entries (
  date_key text primary key,
  month integer not null,
  day integer not null,
  weekly_theme text,
  topic text not null,
  quote text not null,
  source text not null,
  book text,
  special_day text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_renders (
  id uuid primary key default gen_random_uuid(),
  run_date date not null unique,
  date_key text,
  quote text,
  prompt text,
  image_url text,
  image_path text,
  provider text,
  status text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.delivery_logs (
  id uuid primary key default gen_random_uuid(),
  run_date date not null,
  channel text not null,
  target text,
  status text not null,
  message_id text,
  error text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_diary_entries_month_day on public.diary_entries (month, day);
create index if not exists idx_daily_renders_run_date on public.daily_renders (run_date);
create index if not exists idx_daily_renders_date_key on public.daily_renders (date_key);
create index if not exists idx_delivery_logs_run_date on public.delivery_logs (run_date);
create index if not exists idx_delivery_logs_channel on public.delivery_logs (channel);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_diary_entries_updated_at on public.diary_entries;
create trigger trg_diary_entries_updated_at
before update on public.diary_entries
for each row execute function public.set_updated_at();
