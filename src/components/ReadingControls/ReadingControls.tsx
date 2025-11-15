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
    <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full p-1 shadow-sm">
      <Type className="w-4 h-4 text-gray-600 ml-2" />
      {sizes.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onFontSizeChange(value)}
          className={`relative px-3 py-1.5 rounded-full transition-all text-sm font-medium ${
            fontSize === value
              ? 'text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          aria-label={`${label} font size`}
        >
          {fontSize === value && (
            <motion.div
              layoutId="font-size-indicator"
              className="absolute inset-0 bg-gradient-to-r from-srf-blue to-srf-gold rounded-full"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{label}</span>
        </button>
      ))}
    </div>
  );
}
