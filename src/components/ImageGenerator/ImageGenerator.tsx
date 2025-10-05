import { useState } from 'react';
import { Sparkles, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageGeneration } from '../../hooks/useImageGeneration';
import type { ImageProvider } from '../../types/ImageProvider';
import { generateImagePrompt } from '../../lib/utils/promptGenerator';
import type { DiaryEntry } from '../../types/DiaryEntry';

interface ImageGeneratorProps {
  entry: DiaryEntry;
  dateKey: string;
}

export function ImageGenerator({ entry, dateKey }: ImageGeneratorProps) {
  const [provider, setProvider] = useState<ImageProvider>('openai');
  const { image, loading, error, generateImage } = useImageGeneration(dateKey);

  const handleGenerate = () => {
    const prompt = generateImagePrompt(entry);
    generateImage(prompt, provider);
  };

  return (
    <div className="card max-w-4xl mx-auto mt-8">
      {/* Provider Selection */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setProvider('openai')}
          className={`px-4 py-2 rounded-full transition-colors ${
            provider === 'openai'
              ? 'bg-srf-blue text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          OpenAI DALL-E
        </button>
        <button
          onClick={() => setProvider('google')}
          className={`px-4 py-2 rounded-full transition-colors ${
            provider === 'google'
              ? 'bg-srf-blue text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Google Imagen
        </button>
      </div>

      {/* Generate Button */}
      {!image && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-srf-blue to-srf-gold text-white rounded-xl font-heading text-lg hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          {loading ? 'Generating Sacred Art...' : 'Generate AI Image'}
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Generated Image */}
      <AnimatePresence>
        {image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-6"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <img
                src={image.url}
                alt={`AI visualization of: ${entry.quote.substring(0, 50)}...`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = image.url;
                  link.download = `srf-${dateKey}.png`;
                  link.click();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: entry.topic,
                      text: entry.quote,
                      url: image.url,
                    });
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Generate New */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-4 py-3 bg-srf-lotus/30 text-srf-blue rounded-lg hover:bg-srf-lotus/50 transition-colors"
            >
              Generate New Image
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

