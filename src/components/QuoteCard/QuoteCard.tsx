import { useRef, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DiaryEntry } from '../../types/DiaryEntry';

interface QuoteCardProps {
  entry: DiaryEntry;
  dateKey: string;
  onClose: () => void;
}

export function QuoteCard({ entry, dateKey, onClose }: QuoteCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  const generateCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 1200;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1E4B87'); // SRF Blue
    gradient.addColorStop(0.5, '#A8C9E8'); // Sky Blue
    gradient.addColorStop(1, '#D4AF37'); // Gold

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(200, 200, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(1000, 1000, 250, 0, Math.PI * 2);
    ctx.fill();

    // Add quote text
    ctx.fillStyle = '#FFFFFF';
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

    // Center the text vertically
    const totalHeight = lines.length * lineHeight;
    let y = (canvas.height - totalHeight) / 2;

    lines.forEach(line => {
      ctx.fillText(line.trim(), canvas.width / 2, y);
      y += lineHeight;
    });

    // Add attribution
    ctx.font = '32px Cormorant Garamond, serif';
    ctx.fillText('— Paramahansa Yogananda', canvas.width / 2, canvas.height - 150);

    // Add topic
    ctx.font = 'bold 36px Cormorant Garamond, serif';
    ctx.fillStyle = '#D4AF37';
    ctx.fillText(entry.topic, canvas.width / 2, 100);

    // Add date
    const [month, day] = dateKey.split('-');
    const date = new Date(2024, parseInt(month) - 1, parseInt(day));
    const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    ctx.font = '28px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(dateStr, canvas.width / 2, canvas.height - 100);

    // Convert to image
    const url = canvas.toDataURL('image/png');
    setImageUrl(url);
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `srf-quote-card-${dateKey}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate on mount
  useState(() => {
    setTimeout(generateCard, 100);
  });

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
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-2xl text-srf-blue">Quote Card</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
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
              Download Quote Card
            </button>
          </>
        )}

        <p className="text-sm text-gray-600 text-center mt-4">
          Perfect for sharing on social media or saving for inspiration
        </p>
      </motion.div>
    </motion.div>
  );
}
