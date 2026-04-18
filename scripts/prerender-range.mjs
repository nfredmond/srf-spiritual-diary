#!/usr/bin/env node
// Pre-render a date range of diary images on the host and push them to
// Supabase Storage + `daily_renders`. Lets a ComfyUI user populate, e.g.,
// the next 7 days in one go without needing ComfyUI reachable from the
// Vercel cron. Usage:
//
//   node scripts/prerender-range.mjs [--start YYYY-MM-DD] [--days N] [--force]
//
// Defaults: start = today in America/Los_Angeles, days = 7, force = false.
// --force overwrites existing successful renders for a date.
//
// Honors SRF_IMAGE_PROVIDER (gemini|comfyui) and all SRF_COMFY_* env vars
// the provider layer already reads. Does NOT do Drive upload, channel
// delivery, or email — those belong to the daily-pipeline for "today".

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { buildSpiritualImagePrompt } from './lib/prompt-engine.mjs';
import { getImageProvider } from './lib/imageProviders.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function boolEnv(name, defaultValue) {
  const value = process.env[name];
  if (value == null || value === '') return defaultValue;
  return value === 'true';
}

function parseArgs(argv) {
  const args = { start: null, days: 7, force: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--start') args.start = argv[++i];
    else if (a === '--days') args.days = Number(argv[++i]);
    else if (a === '--force') args.force = true;
    else if (a === '--help' || a === '-h') {
      console.log('Usage: node scripts/prerender-range.mjs [--start YYYY-MM-DD] [--days N] [--force]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  if (!Number.isFinite(args.days) || args.days < 1 || args.days > 60) {
    throw new Error('--days must be between 1 and 60');
  }
  return args;
}

function getPacificDateString() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(new Date());
  const y = parts.find((p) => p.type === 'year').value;
  const m = parts.find((p) => p.type === 'month').value;
  const d = parts.find((p) => p.type === 'day').value;
  return `${y}-${m}-${d}`;
}

function addDays(runDate, n) {
  const [y, m, d] = runDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + n);
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function dateKeyFromRunDate(runDate) {
  const [, m, d] = runDate.split('-');
  return `${m}-${d}`;
}

async function loadFallbackEntry(dateKey) {
  const jsonPath = path.resolve(__dirname, '../public/data/diary-entries.json');
  const raw = await fs.readFile(jsonPath, 'utf8');
  const parsed = JSON.parse(raw);
  const entry = parsed.entries?.[dateKey];
  if (!entry) throw new Error(`No fallback entry for ${dateKey} in diary-entries.json`);
  return {
    date_key: dateKey,
    month: entry.month,
    day: entry.day,
    weekly_theme: entry.weeklyTheme || null,
    topic: entry.topic,
    quote: entry.quote,
    source: entry.source || 'Paramahansa Yogananda',
    book: entry.book || null,
    special_day: entry.specialDay || null,
  };
}

async function loadEntry(supabase, runDate) {
  const dateKey = dateKeyFromRunDate(runDate);
  const [, month, day] = runDate.split('-').map(Number);
  const { data } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('month', month)
    .eq('day', day)
    .maybeSingle();
  if (data) return data;
  const fallback = await loadFallbackEntry(dateKey);
  await supabase.from('diary_entries').upsert(fallback, { onConflict: 'date_key' });
  return fallback;
}

async function renderOne({ supabase, runDate, force, allowOmSymbol, provider }) {
  const dateKey = dateKeyFromRunDate(runDate);
  const { data: existing } = await supabase
    .from('daily_renders')
    .select('id, status, image_url')
    .eq('run_date', runDate)
    .maybeSingle();

  if (!force && existing?.status === 'success' && existing.image_url) {
    return { runDate, status: 'skipped_existing_success' };
  }

  const entry = await loadEntry(supabase, runDate);
  const promptResult = buildSpiritualImagePrompt(entry, { dateKey, allowOmSymbol });
  const generation = await provider.generate({
    prompt: promptResult.prompt,
    negativePrompt: promptResult.negativePrompt,
    runDate,
  });

  const { error: upsertError } = await supabase.from('daily_renders').upsert(
    {
      run_date: runDate,
      date_key: dateKey,
      quote: entry.quote,
      prompt: `${promptResult.prompt}\n\nNegative prompt: ${promptResult.negativePrompt}`,
      image_url: generation.imageUrl,
      image_path: generation.imagePath,
      provider: generation.model,
      image_provider: generation.provider,
      status: 'success',
    },
    { onConflict: 'run_date' },
  );
  if (upsertError) throw upsertError;

  return {
    runDate,
    status: 'generated',
    provider: generation.provider,
    imageUrl: generation.imageUrl,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const start = args.start || getPacificDateString();
  const dates = [];
  for (let i = 0; i < args.days; i++) dates.push(addDays(start, i));

  const supabase = createClient(
    requiredEnv('SUPABASE_URL'),
    requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false } },
  );
  const allowOmSymbol = boolEnv('SRF_ALLOW_OM_SYMBOL', true);
  const artifactRoot = path.resolve(__dirname, '../artifacts');
  const provider = getImageProvider({ artifactRoot });

  const results = [];
  for (const runDate of dates) {
    try {
      console.log(`[prerender] ${runDate} ...`);
      const r = await renderOne({ supabase, runDate, force: args.force, allowOmSymbol, provider });
      console.log(`[prerender] ${runDate} → ${r.status}`);
      results.push(r);
    } catch (err) {
      console.error(`[prerender] ${runDate} failed:`, err.message);
      results.push({ runDate, status: 'error', error: err.message });
    }
  }

  const summary = {
    start,
    days: args.days,
    force: args.force,
    generated: results.filter((r) => r.status === 'generated').length,
    skipped: results.filter((r) => r.status === 'skipped_existing_success').length,
    errors: results.filter((r) => r.status === 'error').length,
    results,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (summary.errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error('[prerender-range] fatal:', err.message);
  process.exit(1);
});
