import { useRef, useState, useEffect } from 'react';
import { Download, X, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DiaryEntry } from '../../types/DiaryEntry';

interface EnhancedQuoteCardProps {
  entry: DiaryEntry;
  dateKey: string;
  onClose: () => void;
}

type Template = 'gradient' | 'lotus' | 'minimal' | 'elegant' | 'sunset';

export function EnhancedQuoteCard({ entry, dateKey, onClose }: EnhancedQuoteCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [template, setTemplate] = useState<Template>('gradient');

  const templates: Array<{ value: Template; label: string; description: string }> = [
    { value: 'gradient', label: 'Gradient', description: 'Classic blue & gold gradient' },
    { value: 'lotus', label: 'Lotus', description: 'Peaceful lotus background' },
    { value: 'minimal', label: 'Minimal', description: 'Clean white design' },
    { value: 'elegant', label: 'Elegant', description: 'Dark sophisticated' },
    { value: 'sunset', label: 'Sunset', description: 'Warm sunset colors' },
  ];

  useEffect(() => {
    generateCard();
  }, [template, entry]);

  const generateCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 1200;

    // Background based on template
    switch (template) {
      case 'gradient':
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1E4B87');
        gradient.addColorStop(0.5, '#A8C9E8');
        gradient.addColorStop(1, '#D4AF37');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        break;

      case 'lotus':
        ctx.fillStyle = '#F8F6F1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw lotus-inspired circles
        ctx.fillStyle = 'rgba(212, 175, 55, 0.1)';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(600, 600, 600 - i * 100, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'minimal':
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Simple border
        ctx.strokeStyle = '#1E4B87';
        ctx.lineWidth = 8;
        ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
        break;

      case 'elegant':
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Subtle pattern
        ctx.fillStyle = 'rgba(212, 175, 55, 0.05)';
        for (let x = 0; x < canvas.width; x += 100) {
          for (let y = 0; y < canvas.height; y += 100) {
            ctx.fillRect(x, y, 50, 50);
          }
        }
        break;

      case 'sunset':
        const sunsetGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        sunsetGrad.addColorStop(0, '#FF6B6B');
        sunsetGrad.addColorStop(0.5, '#FFD93D');
        sunsetGrad.addColorStop(1, '#FF8C42');
        ctx.fillStyle = sunsetGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        break;
    }

    // Decorative elements
    if (template !== 'minimal') {
      ctx.fillStyle = template === 'elegant' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(200, 200, 300, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(1000, 1000, 250, 0, Math.PI * 2);
      ctx.fill();
    }

    // Quote text
    const textColor = template === 'elegant' ? '#FFFFFF' : template === 'minimal' ? '#1E4B87' : '#FFFFFF';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.font = 'italic 48px Crimson Text, serif';

    const maxWidth = 1000;
    const lineHeight = 70;
    const words = entry.quote.split(' ');
    let lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine);

    const totalHeight = lines.length * lineHeight;
    let y = (canvas.height - totalHeight) / 2;

    lines.forEach(line => {
      ctx.fillText(line.trim(), canvas.width / 2, y);
      y += lineHeight;
    });

    // Topic
    ctx.font = 'bold 36px Cormorant Garamond, serif';
    ctx.fillStyle = template === 'minimal' ? '#D4AF37' : template === 'elegant' ? '#D4AF37' : '#D4AF37';
    ctx.fillText(entry.topic, canvas.width / 2, 120);

    // Attribution
    ctx.font = '32px Cormorant Garamond, serif';
    ctx.fillStyle = textColor;
    ctx.fillText('— Paramahansa Yogananda', canvas.width / 2, canvas.height - 150);

    // Date
    const [month, day] = dateKey.split('-');
    const date = new Date(2024, parseInt(month) - 1, parseInt(day));
    const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    ctx.font = '28px Inter, sans-serif';
    ctx.fillStyle = template === 'elegant' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(dateStr, canvas.width / 2, canvas.height - 100);

    // Logo/watermark
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillStyle = template === 'elegant' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('SRF Spiritual Diary', canvas.width / 2, canvas.height - 50);

    setImageUrl(canvas.toDataURL('image/png'));
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `srf-quote-${template}-${dateKey}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-2xl text-srf-blue flex items-center gap-2">
            <Palette className="w-6 h-6" />
            Create Quote Card
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Template Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Choose Template</label>
          <div className="grid grid-cols-5 gap-2">
            {templates.map(({ value, label, description }) => (
              <button
                key={value}
                onClick={() => setTemplate(value)}
                className={`p-3 rounded-lg text-center transition-all ${
                  template === value
                    ? 'bg-gradient-to-br from-srf-blue to-srf-gold text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={description}
              >
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {imageUrl && (
          <>
            <img
              src={imageUrl}
              alt="Quote card"
              className="w-full rounded-lg shadow-xl mb-4"
            />

            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-srf-blue to-srf-gold text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              <Download className="w-5 h-5" />
              Download Quote Card (1200x1200)
            </button>
          </>
        )}

        <p className="text-sm text-gray-600 text-center mt-4">
          Perfect for Instagram, Facebook, Twitter, and more!
        </p>
      </motion.div>
    </motion.div>
  );
}
