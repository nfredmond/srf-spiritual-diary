import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateLimitMap = new Map<string, RateLimitEntry>();

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const promptCache = new Map<string, { prompt: string; expiresAt: number }>();

function getClientKey(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = forwardedStr?.split(',')[0]?.trim() || req.headers['x-real-ip'] || 'unknown';
  return String(ip);
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

function quoteHash(quote: string, topic: string): string {
  return crypto.createHash('sha256').update(`${topic}::${quote}`).digest('hex').slice(0, 24);
}

function getGeminiKey(): string | null {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || null;
}

const SYSTEM_PROMPT = `You help readers of Paramahansa Yogananda's spiritual diary deepen their contemplation.

Given a quote, topic, and optional weekly theme, produce ONE short contemplative question (15-25 words) that:
- invites honest self-reflection rather than abstract theorizing
- points inward to the reader's own life, choices, and awareness
- avoids prescriptive instruction, moralizing, or yes/no framing
- stays reverent and open-hearted

Return ONLY the question text. No preamble, no quotes, no attribution.`;

async function generatePrompt(params: {
  quote: string;
  topic: string;
  weeklyTheme?: string | null;
}): Promise<string | null> {
  const apiKey = getGeminiKey();
  if (!apiKey) return null;

  const model = process.env.SRF_TEXT_MODEL || 'gemini-2.5-flash';
  const userPrompt = [
    `Topic: ${params.topic}`,
    params.weeklyTheme ? `Weekly theme: ${params.weeklyTheme}` : '',
    `Quote: "${params.quote}"`,
    '',
    'Write the single reflection question now.',
  ]
    .filter(Boolean)
    .join('\n');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
        generationConfig: { maxOutputTokens: 120, temperature: 0.8 },
      }),
    },
  );

  if (!response.ok) return null;
  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== 'string') return null;

  return text.trim().replace(/^["'\s]+|["'\s]+$/g, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientKey = getClientKey(req);
  if (!checkRateLimit(clientKey)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) ?? {};
  const quote = typeof body.quote === 'string' ? body.quote.trim() : '';
  const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
  const weeklyTheme = typeof body.weeklyTheme === 'string' ? body.weeklyTheme.trim() : null;

  if (!quote || !topic) {
    return res.status(400).json({ error: 'quote and topic are required' });
  }

  const cacheKey = quoteHash(quote, topic);
  const cached = promptCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return res.status(200).json({ ok: true, prompt: cached.prompt, cached: true });
  }

  try {
    const prompt = await generatePrompt({ quote, topic, weeklyTheme });
    if (!prompt) {
      return res.status(503).json({ error: 'Prompt generation unavailable' });
    }

    promptCache.set(cacheKey, { prompt, expiresAt: Date.now() + CACHE_TTL_MS });
    return res.status(200).json({ ok: true, prompt, cached: false });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Prompt generation failed',
    });
  }
}

function safeParse(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
