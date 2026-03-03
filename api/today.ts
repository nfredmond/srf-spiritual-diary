import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPacificDateParts, loadFallbackEntry } from './_lib/common';
import { getSupabaseAnonClient } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-cron-secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { month, day, runDate, dateKey } = getPacificDateParts();
    const supabase = getSupabaseAnonClient();

    let { data: entry } = await supabase
      .from('diary_entries')
      .select('date_key, month, day, weekly_theme, topic, quote, source, book, special_day')
      .eq('month', month)
      .eq('day', day)
      .maybeSingle();

    if (!entry) {
      entry = await loadFallbackEntry(dateKey);
    }

    const { data: todayRender } = await supabase
      .from('daily_renders')
      .select('id, run_date, date_key, image_url, image_path, provider, status, created_at')
      .eq('run_date', runDate)
      .maybeSingle();

    const { data: latestRender } = todayRender
      ? { data: todayRender }
      : await supabase
          .from('daily_renders')
          .select('id, run_date, date_key, image_url, image_path, provider, status, created_at')
          .order('run_date', { ascending: false })
          .limit(1)
          .maybeSingle();

    return res.status(200).json({
      ok: true,
      runDate,
      entry,
      image: latestRender || null,
      imageExists: Boolean(latestRender?.image_url || latestRender?.image_path),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
