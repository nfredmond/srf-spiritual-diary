import { useEffect, useState } from 'react';
import type { GeneratedImage, ImageProvider } from '../types/ImageProvider';
import type { DiaryEntry } from '../types/DiaryEntry';
import { cacheImage, getCachedImage } from './useImageCache';

const DEFAULT_PROVIDER: ImageProvider = 'gemini';

export function useImageGeneration(dateKey: string, preferredProvider: ImageProvider = DEFAULT_PROVIDER) {
  const [image, setImage] = useState<GeneratedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCachedImage = async () => {
      try {
        const cached = await getCachedImage(dateKey);
        if (!isMounted) return;

        if (cached && cached.provider === preferredProvider) {
          setImage(cached);
        } else {
          setImage(null);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading cached image:', err);
      }
    };

    loadCachedImage();

    return () => {
      isMounted = false;
    };
  }, [dateKey, preferredProvider]);

  const generateImage = async (
    entry: DiaryEntry,
    provider: ImageProvider = preferredProvider,
    _options?: { force?: boolean },
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Always hit the API when the user explicitly requests generation.
      // Cached images are loaded on page init via the effect above.
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry, dateKey }),
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

      // Update the UI immediately; cache persistence is best-effort.
      setImage(generatedImage);
      cacheImage(generatedImage).catch((cacheErr) => {
        console.error('Error caching generated image:', cacheErr);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { image, loading, error, generateImage, preferredProvider };
}
