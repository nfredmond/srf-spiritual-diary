import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildSpiritualImagePrompt } from './_lib/promptEngine.js';
import { interpretQuoteVisually } from './_lib/quoteInterpreter.js';

const rateLimits = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = 10;
  const windowMs = 24 * 60 * 60 * 1000;

  const timestamps = rateLimits.get(ip) || [];
  const recentTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (recentTimestamps.length >= limit) {
    return false;
  }

  recentTimestamps.push(now);
  rateLimits.set(ip, recentTimestamps);
  return true;
}

function getGeminiKey(override?: string) {
  return override || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || null;
}

async function generateGeminiImage(prompt: string, apiKey: string) {
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
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || 'Google Gemini image generation failed';
    const err = new Error(message) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  const parts = payload?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part: any) => part?.inlineData?.data);
  const mimeType = imagePart?.inlineData?.mimeType || 'image/png';
  const data = imagePart?.inlineData?.data;

  if (!data) {
    throw new Error('No image data received from Google Gemini');
  }

  return `data:${mimeType};base64,${data}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, apiKey, entry, dateKey } = req.body;

    // New path: entry data provided → do LLM interpretation + prompt building server-side
    // Legacy path: raw prompt string → use directly (backward compat)
    let finalPrompt: string;

    if (entry && dateKey) {
      console.log('Building quote-aware prompt via LLM interpretation...');

      const interpretedVisual = await interpretQuoteVisually(
        entry.quote,
        entry.topic,
        entry.weeklyTheme || entry.weekly_theme,
        entry.specialDay || entry.special_day,
      );
      console.log('Visual interpretation:', interpretedVisual);

      const allowOmSymbol = process.env.SRF_ALLOW_OM_SYMBOL !== 'false';
      const result = buildSpiritualImagePrompt(
        {
          month: entry.month,
          day: entry.day,
          topic: entry.topic,
          weekly_theme: entry.weeklyTheme || entry.weekly_theme || null,
          quote: entry.quote,
          special_day: entry.specialDay || entry.special_day || null,
        },
        { dateKey, allowOmSymbol, interpretedVisual },
      );

      finalPrompt = `${result.prompt}\n\nNegative prompt: ${result.negativePrompt}`;
    } else if (prompt) {
      finalPrompt = prompt;
    } else {
      return res.status(400).json({ error: 'Either entry+dateKey or prompt is required' });
    }

    const ip = (req.headers['x-forwarded-for'] as string) || 'unknown';

    if (!apiKey && !checkRateLimit(ip)) {
      return res.status(429).json({
        error: 'Daily limit reached (10 images per day). Please try again tomorrow.',
      });
    }

    const key = getGeminiKey(apiKey);

    if (!key) {
      return res.status(500).json({
        error: 'Google Gemini API key not configured. Please contact support.',
      });
    }

    console.log('Generating image with Google Gemini...');
    const imageUrl = await generateGeminiImage(finalPrompt, key);
    console.log('Image generated successfully with Google Gemini');

    return res.status(200).json({ imageUrl, provider: 'gemini' });
  } catch (error: any) {
    console.error('Gemini image generation error:', error);

    if (error?.status === 401 || /api key/i.test(error?.message || '')) {
      return res.status(401).json({
        error: 'Invalid Google Gemini API key. Please check your Gemini API key.',
      });
    }

    if (error?.status === 429 || /quota|rate limit/i.test(error?.message || '')) {
      return res.status(429).json({
        error: 'Google Gemini rate limit exceeded. Please try again later.',
      });
    }

    return res.status(500).json({
      error: error?.message || 'Failed to generate image with Google Gemini. Please try again.',
    });
  }
}
