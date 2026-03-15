import { motion } from 'framer-motion';
import { Type } from 'lucide-react';

interface ReadingControlsProps {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  onFontSizeChange: (size: 'small' | 'medium' | 'large' | 'xlarge') => void;
}

export function ReadingControls({ fontSize, onFontSizeChange }: ReadingControlsProps) {
  const sizes = [
    { value: 'small' as const, label: 'S' },
    { value: 'medium' as const, label: 'M' },
    { value: 'large' as const, label: 'L' },
    { value: 'xlarge' as const, label: 'XL' },
  ];

  return (
    <div className="theme-pill-group flex items-center gap-2 rounded-full p-1 shadow-sm backdrop-blur-sm">
      <Type className="theme-pill-icon w-4 h-4 ml-2" />
      {sizes.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onFontSizeChange(value)}
          className={`theme-pill-button relative px-3 py-1.5 rounded-full transition-all text-sm font-medium ${
            fontSize === value ? 'text-white' : ''
          }`}
          aria-label={`${label} font size`}
        >
          {fontSize === value && (
            <motion.div
              layoutId="font-size-indicator"
              className="theme-pill-indicator absolute inset-0 rounded-full"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{label}</span>
        </button>
      ))}
    </div>
  );
}
