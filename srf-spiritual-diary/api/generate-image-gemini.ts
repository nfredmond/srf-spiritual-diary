import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

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
    const { prompt, apiKey, aspectRatio = '1:1' } = req.body;
    
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
    const key = apiKey || process.env.GOOGLE_GENAI_API_KEY;
    
    if (!key) {
      return res.status(500).json({ 
        error: 'Google GenAI API key not configured. Please contact support.' 
      });
    }

    const ai = new GoogleGenAI({
      apiKey: key,
    });

    console.log('Generating image with Gemini 2.5 Flash Image (Nano Banana)...');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        responseModalities: ['Image'],
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    // Extract the image from the response
    let imageBase64 = null;
    
    if (response.candidates && response.candidates[0]) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!imageBase64) {
      throw new Error('No image data received from Google Gemini');
    }

    console.log('Image generated successfully with Gemini');

    // Return base64 data URL for display
    const imageDataUrl = `data:image/png;base64,${imageBase64}`;

    return res.status(200).json({ imageUrl: imageDataUrl });
  } catch (error: any) {
    console.error('Gemini image generation error:', error);
    
    // Handle specific errors
    if (error.message?.includes('API key')) {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your Google GenAI API key.' 
      });
    }
    
    if (error.status === 429 || error.message?.includes('quota')) {
      return res.status(429).json({ 
        error: 'Google API rate limit exceeded. Please try again later.' 
      });
    }

    return res.status(500).json({ 
      error: error.message || 'Failed to generate image with Gemini. Please try again.' 
    });
  }
}
