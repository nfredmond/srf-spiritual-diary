import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPacificDateParts, loadDiaryEntry } from './_lib/common.js';
import { buildSpiritualImagePrompt } from './_lib/promptEngine.js';
import { interpretQuoteVisually } from './_lib/quoteInterpreter.js';
import { getSupabaseServiceClient } from './_lib/supabase.js';

function isAuthorized(req: VercelRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.SRF_RUN_DAILY_TOKEN;
  if (!secret) return false;

  const authHeader = req.headers.authorization;
  const cronHeader = req.headers['x-cron-secret'];

  if (authHeader === `Bearer ${secret}`) return true;
  if (cronHeader === secret) return true;
  return false;
}

function boolEnv(name: string, defaultValue: boolean) {
  const value = process.env[name];
  if (value == null || value === '') return defaultValue;
  return value === 'true';
}

function getGeminiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || null;
}

async function uploadRenderToStorage(bytes: Buffer, runDate: string): Promise<string> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for Storage upload');
  }
  const bucket = process.env.SRF_IMAGE_BUCKET || 'daily-renders';
  const objectPath = `${runDate}.png`;
  const res = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      'Content-Type': 'image/png',
      'x-upsert': 'true',
      'Cache-Control': '3600',
    },
    body: bytes,
  });
  if (!res.ok) {
    throw new Error(`Supabase Storage upload failed: ${res.status} ${await res.text()}`);
  }
  return `${url}/storage/v1/object/public/${bucket}/${objectPath}`;
}

async function generateImageWithGemini(prompt: string, negativePrompt: string, runDate: string) {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY or GOOGLE_GENAI_API_KEY is required for generation');
  }

  const model = process.env.SRF_GENERATION_MODEL || process.env.SRF_GOOGLE_IMAGE_MODEL || 'gemini-2.5-flash-image';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${prompt}\n\nNegative prompt: ${negativePrompt}` }] }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    },
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Google Gemini image generation failed');
  }

  const parts = payload?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part: any) => part?.inlineData?.data);
  const mimeType = imagePart?.inlineData?.mimeType || 'image/png';
  const imageData = imagePart?.inlineData?.data;

  if (!imageData) {
    throw new Error('No image data returned from Google Gemini');
  }

  const bytes = Buffer.from(imageData, 'base64');
  let imageUrl: string;
  try {
    imageUrl = await uploadRenderToStorage(bytes, runDate);
  } catch (err) {
    console.warn('[run-daily] Storage upload failed, falling back to data URL:', err instanceof Error ? err.message : err);
    imageUrl = `data:${mimeType};base64,${imageData}`;
  }

  return {
    provider: model,
    imageUrl,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-cron-secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const serverlessWarnings: string[] = [];
  if (process.env.SRF_DRIVE_ROOT_FOLDER_ID) {
    serverlessWarnings.push('Drive archival skipped in serverless route: run host pipeline script for gog upload.');
  }
  if (process.env.SRF_TELEGRAM_TARGET || process.env.SRF_SLACK_TARGET || process.env.SRF_DISCORD_TARGET) {
    serverlessWarnings.push('OpenClaw delivery skipped in serverless route: run host pipeline script for channel delivery.');
  }
  if (process.env.SRF_EMAIL_TO) {
    serverlessWarnings.push('Gmail send skipped in serverless route: run host pipeline script for gog gmail send.');
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { runDate, dateKey, month, day } = getPacificDateParts();
    const force = req.query.force === 'true' || req.body?.force === true;

    const { data: existingRender } = await supabase
      .from('daily_renders')
      .select('id, status, image_url, provider, created_at')
      .eq('run_date', runDate)
      .maybeSingle();

    if (!force && existingRender?.status === 'success' && existingRender.image_url) {
      return res.status(200).json({
        ok: true,
        runDate,
        status: 'skipped_existing_success',
        render: existingRender,
        warnings: serverlessWarnings,
      });
    }

    const { entry, fromFallback } = await loadDiaryEntry(supabase, { dateKey, month, day });
    if (fromFallback) {
      await supabase.from('diary_entries').upsert(entry, { onConflict: 'date_key' });
    }

    const allowOmSymbol = boolEnv('SRF_ALLOW_OM_SYMBOL', true);

    // LLM pass: interpret the quote into a bespoke visual scene description
    console.log('Interpreting quote visually with Gemini text model...');
    const interpretedVisual = await interpretQuoteVisually(
      entry.quote,
      entry.topic,
      entry.weekly_theme,
      entry.special_day,
    );
    console.log('Visual interpretation:', interpretedVisual);

    const promptResult = buildSpiritualImagePrompt(entry, { dateKey, allowOmSymbol, interpretedVisual });
    const generated = await generateImageWithGemini(promptResult.prompt, promptResult.negativePrompt, runDate);

    const { data: render, error: upsertError } = await supabase
      .from('daily_renders')
      .upsert(
        {
          run_date: runDate,
          date_key: dateKey,
          quote: entry.quote,
          prompt: `${promptResult.prompt}\n\nNegative prompt: ${promptResult.negativePrompt}`,
          image_url: generated.imageUrl,
          image_path: null,
          provider: generated.provider,
          status: 'success',
        },
        { onConflict: 'run_date' },
      )
      .select('*')
      .single();

    if (upsertError) {
      throw upsertError;
    }

    return res.status(200).json({
      ok: true,
      runDate,
      status: 'generated',
      render,
      warnings: serverlessWarnings,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      warnings: serverlessWarnings,
    });
  }
}
