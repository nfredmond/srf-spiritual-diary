#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function main() {
  const supabase = createClient(
    requiredEnv('SUPABASE_URL'),
    requiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false } },
  );

  const jsonPath = path.resolve(__dirname, '../public/data/diary-entries.json');
  const raw = await fs.readFile(jsonPath, 'utf8');
  const parsed = JSON.parse(raw);
  const entries = parsed.entries || {};

  const rows = Object.entries(entries).map(([dateKey, entry]) => ({
    date_key: dateKey,
    month: entry.month,
    day: entry.day,
    weekly_theme: entry.weeklyTheme || null,
    topic: entry.topic,
    quote: entry.quote,
    source: entry.source || 'Paramahansa Yogananda',
    book: entry.book || null,
    special_day: entry.specialDay || null,
  }));

  if (rows.length === 0) {
    throw new Error('No entries found in public/data/diary-entries.json');
  }

  const { error } = await supabase.from('diary_entries').upsert(rows, { onConflict: 'date_key' });
  if (error) {
    throw error;
  }

  console.log(`Seed complete: upserted ${rows.length} diary entries`);
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
