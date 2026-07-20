import { motion } from 'framer-motion';
import { Share2, Copy, Check, Heart, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import type { DiaryEntry } from '../../types/DiaryEntry';
import { useSpeech } from '../../hooks/useSpeech';

interface QuoteDisplayProps {
  entry: DiaryEntry;
  dateKey: string;
  fontSize?: 'small' | 'medium' | 'large' | 'xlarge';
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  hasNote?: boolean;
  onOpenNotes?: () => void;
}

const actionBtn =
  'p-2.5 rounded-full text-muted transition-colors hover:bg-srf-lotus/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-srf-blue';

export function QuoteDisplay({
  entry,
  fontSize = 'medium',
  isFavorite = false,
  onToggleFavorite,
  hasNote = false,
  onOpenNotes,
}: QuoteDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { supported: speechSupported, speaking, toggle } = useSpeech();

  // The quote is the hero — generous, unhurried sizes.
  const fontSizeClasses = {
    small: 'text-xl md:text-2xl',
    medium: 'text-2xl md:text-3xl',
    large: 'text-3xl md:text-4xl',
    xlarge: 'text-4xl md:text-5xl',
  };

  const handleShare = async () => {
    const text = `"${entry.quote}"\n\n— ${entry.source}\n\nThe Spiritual Diary`;
    if (navigator.share) {
      try {
        await navigator.share({ title: entry.topic, text, url: window.location.href });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`"${entry.quote}"\n\n— ${entry.source}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleListen = () => {
    toggle(`${entry.topic}. ${entry.quote}. ${entry.source}.`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="card mx-auto max-w-3xl text-center"
      aria-label={`Reading for ${entry.topic}`}
    >
      {/* One quiet meta line for the weekly theme */}
      {entry.weeklyTheme && (
        <p className="mb-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span className="text-muted font-body text-[0.7rem] uppercase tracking-[0.22em]">
            Weekly Theme
          </span>
          <span aria-hidden="true" className="text-gold-accent">·</span>
          <span className="text-accent font-heading text-base font-semibold tracking-wide">
            {entry.weeklyTheme}
          </span>
        </p>
      )}

      {/* Special observance — subtle and dignified, no decorative stars */}
      {entry.specialDay && (
        <p className="quote-special-pill-text text-gold-accent mb-5 font-heading text-lg">
          {entry.specialDay.trim()}
        </p>
      )}

      {/* The day's topic */}
      <h2 className="quote-topic-pill-text text-accent font-heading text-sm font-semibold uppercase tracking-[0.2em]">
        {entry.topic}
      </h2>

      <hr className="gold-rule my-7" />

      {/* The reading — the focal point of the page */}
      <blockquote
        className={`quote-text mx-auto max-w-2xl transition-all ${fontSizeClasses[fontSize]}`}
      >
        {'“'}
        {entry.quote}
        {'”'}
      </blockquote>

      <hr className="gold-rule my-7" />

      {/* Attribution — faithful to the entry's true source */}
      <footer>
        <p className="text-muted font-body italic">— {entry.source}</p>
        {entry.book && <p className="text-muted mt-1 font-body text-sm not-italic opacity-80">{entry.book}</p>}
      </footer>

      {/* Understated, always-available actions */}
      <div className="mt-7 flex items-center justify-center gap-1">
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className={actionBtn}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
            title={isFavorite ? 'Saved' : 'Save this reading'}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current text-gold-accent' : ''}`} />
          </button>
        )}

        {onOpenNotes && (
          <button
            onClick={onOpenNotes}
            className={actionBtn}
            aria-label="Personal notes"
            title={hasNote ? 'Edit your reflection' : 'Add a reflection'}
          >
            <BookOpen className={`h-5 w-5 ${hasNote ? 'text-gold-accent' : ''}`} />
          </button>
        )}

        {speechSupported && (
          <button
            onClick={handleListen}
            className={actionBtn}
            aria-label={speaking ? 'Stop reading aloud' : 'Listen to this reading'}
            aria-pressed={speaking}
            title={speaking ? 'Stop' : 'Listen'}
          >
            {speaking ? <VolumeX className="h-5 w-5 text-gold-accent" /> : <Volume2 className="h-5 w-5" />}
          </button>
        )}

        <button onClick={handleCopy} className={actionBtn} aria-label="Copy this reading" title="Copy">
          {copied ? <Check className="h-5 w-5 text-accent" /> : <Copy className="h-5 w-5" />}
        </button>

        <button onClick={handleShare} className={actionBtn} aria-label="Share this reading" title="Share">
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </motion.article>
  );
}
