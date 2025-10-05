import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Rate limiting (simple in-memory - use Redis for production)
const rateLimits = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = 10; // 10 generations per day
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours

  const timestamps = rateLimits.get(ip) || [];
  const recentTimestamps = timestamps.filter(t => now - t < windowMs);

  if (recentTimestamps.length >= limit) {
    return false;
  }

  recentTimestamps.push(now);
  rateLimits.set(ip, recentTimestamps);
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, provider, apiKey } = req.body;
  const ip = req.headers['x-forwarded-for'] as string || 'unknown';

  // Check rate limit if user doesn't provide their own API key
  if (!apiKey && !checkRateLimit(ip)) {
    return res.status(429).json({ 
      error: 'Daily limit reached. Please add your own API key in settings or try again tomorrow.' 
    });
  }

  try {
    if (provider === 'openai') {
      const openai = new OpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY,
      });

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        // Note: The prompt already includes strong instructions to avoid text
        // DALL-E 3 tends to add text unless explicitly told not to
      });

      return res.status(200).json({ imageUrl: response.data[0].url });
    } 
    else if (provider === 'google') {
      // Google Imagen implementation
      // Note: This requires Google Cloud setup
      return res.status(501).json({ 
        error: 'Google Imagen coming soon. Please use OpenAI for now.' 
      });
    }

    return res.status(400).json({ error: 'Invalid provider' });
  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate image. Please try again.' 
    });
  }
}

