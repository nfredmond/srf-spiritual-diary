import { Sparkles, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useImageGeneration } from '../../hooks/useImageGeneration';
import { generateImagePrompt } from '../../lib/utils/promptGenerator';
import type { DiaryEntry } from '../../types/DiaryEntry';
import type { ImageProvider } from '../../types/ImageProvider';

interface ImageGeneratorProps {
  entry: DiaryEntry;
  dateKey: string;
}

export function ImageGenerator({ entry, dateKey }: ImageGeneratorProps) {
  const { image, loading, error, generateImage } = useImageGeneration(dateKey);
  const [selectedProvider, setSelectedProvider] = useState<ImageProvider>('openai');

  const handleGenerate = () => {
    const prompt = generateImagePrompt(entry);
    generateImage(prompt, selectedProvider);
  };

  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `srf-spiritual-diary-${dateKey}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!image) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: entry.topic,
          text: `${entry.quote.substring(0, 100)}...`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <div className="card max-w-4xl mx-auto mt-8">
      {/* Provider Selection */}
      {!image && !loading && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose AI Image Generator:
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedProvider('openai')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                selectedProvider === 'openai'
                  ? 'bg-gradient-to-r from-srf-blue to-srf-gold text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-lg">OpenAI DALL-E 3</div>
              <div className="text-xs opacity-80 mt-1">HD Quality, Classic</div>
            </button>
            <button
              onClick={() => setSelectedProvider('gemini')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                selectedProvider === 'gemini'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-lg">Google Gemini 🍌</div>
              <div className="text-xs opacity-80 mt-1">Nano Banana, Conversational</div>
            </button>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {!image && !loading && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full py-4 text-white rounded-xl font-heading text-lg hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2 ${
            selectedProvider === 'gemini'
              ? 'bg-gradient-to-r from-purple-600 to-blue-500'
              : 'bg-gradient-to-r from-srf-blue to-srf-gold'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          Generate Imagery with {selectedProvider === 'gemini' ? 'Gemini (Nano Banana)' : 'DALL-E 3'}
        </button>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-srf-blue border-t-transparent mb-4"></div>
          <p className="text-srf-blue font-heading text-lg">Creating sacred imagery...</p>
          <p className="text-gray-600 text-sm mt-2">This may take 10-15 seconds</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold mb-2">Unable to generate image</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={handleGenerate}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Try Again
          </button>
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
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl">
              <img
                src={image.url}
                alt={`Sacred imagery inspired by: ${entry.quote.substring(0, 50)}...`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-srf-blue text-white rounded-full hover:bg-srf-blue/90 transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
              
              {typeof navigator.share !== 'undefined' && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3 bg-srf-gold text-white rounded-full hover:bg-srf-gold/90 transition-colors font-medium"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              )}
            </div>

            {/* Provider Badge */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Generated with {image.provider === 'gemini' ? 'Google Gemini 🍌' : 'OpenAI DALL-E 3'}
            </div>

            {/* Provider Selection for Regeneration */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Generate Another with:
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedProvider('openai')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    selectedProvider === 'openai'
                      ? 'bg-gradient-to-r from-srf-blue to-srf-gold text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  DALL-E 3
                </button>
                <button
                  onClick={() => setSelectedProvider('gemini')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    selectedProvider === 'gemini'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Gemini 🍌
                </button>
              </div>
            </div>

            {/* Generate New */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full mt-3 py-3 rounded-lg hover:opacity-90 transition-all font-medium ${
                selectedProvider === 'gemini'
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  : 'bg-srf-lotus/30 text-srf-blue hover:bg-srf-lotus/50'
              }`}
            >
              Generate New with {selectedProvider === 'gemini' ? 'Gemini' : 'DALL-E 3'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
