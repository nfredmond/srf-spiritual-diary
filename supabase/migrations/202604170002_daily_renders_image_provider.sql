-- Phase 2: track which image provider produced each daily render
-- (gemini | comfyui | <custom>). Used by the daily pipeline and any
-- UI that wants to label provider attribution. Additive + idempotent.

alter table public.daily_renders
  add column if not exists image_provider text;

create index if not exists idx_daily_renders_image_provider
  on public.daily_renders (image_provider);
