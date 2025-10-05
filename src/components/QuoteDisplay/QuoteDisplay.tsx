import { motion } from 'framer-motion';
import { Star, Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { DiaryEntry } from '../../types/DiaryEntry';

interface QuoteDisplayProps {
  entry: DiaryEntry;
}

export function QuoteDisplay({ entry }: QuoteDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `"${entry.quote}"\n\n— ${entry.source}\n\nSRF Spiritual Diary`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: entry.topic,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopy = async () => {
    const text = `"${entry.quote}"\n\n— ${entry.source}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="card max-w-4xl mx-auto relative"
    >
      {/* Share Button */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={handleCopy}
          className="p-2 rounded-full hover:bg-srf-lotus/30 transition-colors group relative"
          aria-label="Copy quote"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <Copy className="w-5 h-5 text-srf-blue" />
          )}
          <span className="absolute top-full right-0 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {copied ? 'Copied!' : 'Copy quote'}
          </span>
        </button>
        
        <button
          onClick={handleShare}
          className="p-2 rounded-full hover:bg-srf-lotus/30 transition-colors group relative"
          aria-label="Share quote"
        >
          <Share2 className="w-5 h-5 text-srf-blue" />
          <span className="absolute top-full right-0 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Share quote
          </span>
        </button>
      </div>

      {/* Weekly Theme (if present) */}
      {entry.weeklyTheme && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-srf-blue/10 to-srf-gold/10 rounded-full border border-srf-gold/30">
            <span className="font-heading text-xs uppercase tracking-[0.15em] text-srf-blue/70">
              Weekly Theme
            </span>
            <span className="font-heading text-sm font-semibold text-srf-blue">
              {entry.weeklyTheme}
            </span>
          </div>
        </div>
      )}

      {/* Special Day (if present) */}
      {entry.specialDay && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-srf-gold/20 to-srf-gold/10 rounded-lg border-2 border-srf-gold/50">
            <Star className="w-5 h-5 text-srf-gold fill-srf-gold" />
            <span className="font-heading text-base font-semibold text-srf-blue">
              {entry.specialDay}
            </span>
            <Star className="w-5 h-5 text-srf-gold fill-srf-gold" />
          </div>
        </div>
      )}

      {/* Daily Topic */}
      <div className="text-center mb-6">
        <span className="inline-block px-4 py-2 bg-srf-lotus/30 rounded-full">
          <span className="font-heading text-sm uppercase tracking-[0.2em] text-srf-blue">
            {entry.topic}
          </span>
        </span>
      </div>

      {/* Quote */}
      <blockquote className="quote-text text-center mb-8 px-4">
        "{entry.quote}"
      </blockquote>

      {/* Attribution */}
      <div className="text-center">
        <p className="text-gray-600 italic">
          — {entry.source}
        </p>
        {entry.book && (
          <p className="text-sm text-gray-500 mt-2">
            {entry.book}
          </p>
        )}
      </div>
    </motion.div>
  );
}
