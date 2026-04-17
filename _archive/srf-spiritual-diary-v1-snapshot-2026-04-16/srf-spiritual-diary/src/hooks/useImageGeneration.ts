import { useState, useEffect } from 'react';
import type { ImageProvider, GeneratedImage } from '../types/ImageProvider';
import { cacheImage, getCachedImage } from './useImageCache';

export function useImageGeneration(dateKey: string) {
  const [image, setImage] = useState<GeneratedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached image when dateKey changes
  useEffect(() => {
    let isMounted = true;

    const loadCachedImage = async () => {
      try {
        const cached = await getCachedImage(dateKey);
        if (isMounted) {
          setImage(cached);
          setError(null);
        }
      } catch (err) {
        console.error('Error loading cached image:', err);
      }
    };

    loadCachedImage();

    return () => {
      isMounted = false;
    };
  }, [dateKey]);

  const generateImage = async (prompt: string, provider: ImageProvider, apiKey?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first (in case it was just generated)
      const cached = await getCachedImage(dateKey);
      if (cached) {
        setImage(cached);
        setLoading(false);
        return;
      }

      // Determine which API endpoint to use based on provider
      const apiEndpoint = provider === 'gemini' 
        ? '/api/generate-image-gemini' 
        : '/api/generate-image';

      // Call serverless function
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, provider, apiKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const { imageUrl } = await response.json();

      const generatedImage: GeneratedImage = {
        url: imageUrl,
        provider,
        timestamp: Date.now(),
        dateKey,
      };

      // Cache it
      await cacheImage(generatedImage);
      setImage(generatedImage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { image, loading, error, generateImage };
}
