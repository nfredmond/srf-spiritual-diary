import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPacificDateParts, loadDiaryEntry } from './_lib/common.js';
import { getSupabaseAnonClient } from './_lib/supabase.js';

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

    const { entry } = await loadDiaryEntry(supabase, { dateKey, month, day });

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
