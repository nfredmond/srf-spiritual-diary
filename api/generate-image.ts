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
  // Enable CORS
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
    const { prompt, apiKey } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ip = (req.headers['x-forwarded-for'] as string) || 'unknown';

    // Check rate limit if user doesn't provide their own API key
    if (!apiKey && !checkRateLimit(ip)) {
      return res.status(429).json({ 
        error: 'Daily limit reached (10 images per day). Please try again tomorrow.' 
      });
    }

    // Use provided API key or environment variable
    const key = apiKey || process.env.OPENAI_API_KEY;
    
    if (!key) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured. Please contact support.' 
      });
    }

    const openai = new OpenAI({
      apiKey: key,
    });

    console.log('Generating image with DALL-E 3...');

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    // Check if response data exists
    if (!response.data || !response.data[0] || !response.data[0].url) {
      throw new Error('No image URL received from OpenAI');
    }

    console.log('Image generated successfully');

    return res.status(200).json({ imageUrl: response.data[0].url });
  } catch (error: any) {
    console.error('Image generation error:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your OpenAI API key.' 
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'OpenAI rate limit exceeded. Please try again later.' 
      });
    }

    return res.status(500).json({ 
      error: error.message || 'Failed to generate image. Please try again.' 
    });
  }
}
