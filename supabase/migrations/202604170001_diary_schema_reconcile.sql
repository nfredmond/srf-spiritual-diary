-- Reconcile remote diary_entries to match the app's expected shape.
-- The remote db had been bootstrapped by an earlier unversioned schema
-- with column names (`entry_key`) and types (`source_year text`) that
-- no longer match client code or the seed script. The table is empty at
-- the time of this migration, so column renames and type changes are
-- safe. Guarded with IF checks so this migration is idempotent.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='diary_entries' and column_name='entry_key'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='diary_entries' and column_name='date_key'
  ) then
    alter table public.diary_entries rename column entry_key to date_key;
  end if;
end $$;

alter table public.diary_entries
  add column if not exists date_key text,
  add column if not exists book text;

-- Fix source_year type if it was created as text.
do $$
declare
  col_type text;
begin
  select data_type into col_type
  from information_schema.columns
  where table_schema='public' and table_name='diary_entries' and column_name='source_year';

  if col_type = 'text' then
    alter table public.diary_entries
      alter column source_year type integer
      using nullif(source_year, '')::integer;
  end if;
end $$;

-- Ensure date_key is unique so seed/upsert on conflict (date_key) works.
create unique index if not exists diary_entries_date_key_idx
  on public.diary_entries (date_key);
