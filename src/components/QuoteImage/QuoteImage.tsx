import { useRef, useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import type { DiaryEntry } from '../../types/DiaryEntry';
import { Modal } from '../Modal/Modal';

interface QuoteImageProps {
  entry: DiaryEntry;
  dateKey: string;
  onClose: () => void;
}

type Template = 'paper' | 'night';

const THEMES: Record<
  Template,
  { label: string; bg: string; ink: string; sub: string; gold: string }
> = {
  paper: { label: 'Warm paper', bg: '#F1E9D9', ink: '#052956', sub: '#5b626b', gold: '#8A6A12' },
  night: { label: 'Deep night', bg: '#052956', ink: '#F3EFE6', sub: '#B9C7DA', gold: '#DCBD23' },
};

export function QuoteImage({ entry, dateKey, onClose }: QuoteImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [template, setTemplate] = useState<Template>('paper');

  useEffect(() => {
    let cancelled = false;
    const draw = async () => {
      // Ensure the serif fonts are available before painting to canvas.
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          /* ignore */
        }
      }
      if (cancelled) return;
      renderCard();
    };
    draw();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, entry]);

  const renderCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1200;
    const H = 1200;
    canvas.width = W;
    canvas.height = H;
    const t = THEMES[template];

    // Background
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, W, H);

    // Quiet inner frame
    ctx.strokeStyle = t.gold;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, W - 120, H - 120);
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';

    // Topic (small caps feel via letter spacing where supported)
    ctx.fillStyle = t.gold;
    ctx.font = '600 34px "Cormorant Garamond", Georgia, serif';
    ctx.letterSpacing = '6px';
    ctx.fillText(entry.topic.toUpperCase(), W / 2, 200);
    ctx.letterSpacing = '0px';

    // Gold hairline under topic
    ctx.strokeStyle = t.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 60, 240);
    ctx.lineTo(W / 2 + 60, 240);
    ctx.stroke();

    // Quote (wrapped)
    ctx.fillStyle = t.ink;
    ctx.font = 'italic 46px "Crimson Text", Georgia, serif';
    const maxWidth = 900;
    const lineHeight = 66;
    const words = `“${entry.quote}”`.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxWidth && line !== '') {
        lines.push(line.trim());
        line = word + ' ';
      } else {
        line = test;
      }
    }
    lines.push(line.trim());

    const blockHeight = lines.length * lineHeight;
    let y = H / 2 - blockHeight / 2 + 20;
    for (const l of lines) {
      ctx.fillText(l, W / 2, y);
      y += lineHeight;
    }

    // Gold hairline above attribution
    ctx.strokeStyle = t.gold;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 60, H - 320);
    ctx.lineTo(W / 2 + 60, H - 320);
    ctx.stroke();

    // Attribution — the entry's TRUE source (never assumed)
    ctx.fillStyle = t.ink;
    ctx.font = '34px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(`— ${entry.source}`, W / 2, H - 260);

    if (entry.book) {
      ctx.fillStyle = t.sub;
      ctx.font = '26px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(entry.book, W / 2, H - 220);
    }

    // Date
    const [month, day] = dateKey.split('-').map(Number);
    const dateStr = new Date(2024, month - 1, day).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
    ctx.fillStyle = t.sub;
    ctx.font = '24px "Inter", sans-serif';
    ctx.fillText(dateStr, W / 2, H - 150);

    // Quiet wordmark
    ctx.fillStyle = t.gold;
    ctx.font = '22px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('The Spiritual Diary', W / 2, H - 110);

    setImageUrl(canvas.toDataURL('image/png'));
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `spiritual-diary-${dateKey}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      onClose={onClose}
      ariaLabel="Save this reading as an image"
      panelClassName="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl bg-white p-6 shadow-2xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-heading text-2xl text-srf-blue">Save this reading</h3>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-srf-blue/70 transition-colors hover:bg-srf-lotus/50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-5 flex gap-2" role="group" aria-label="Choose a style">
        {(Object.keys(THEMES) as Template[]).map((value) => (
          <button
            key={value}
            onClick={() => setTemplate(value)}
            aria-pressed={template === value}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              template === value
                ? 'bg-srf-blue text-white'
                : 'border border-srf-blue/15 bg-white text-srf-blue hover:bg-srf-lotus/40'
            }`}
          >
            {THEMES[value].label}
          </button>
        ))}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {imageUrl && (
        <>
          <img src={imageUrl} alt="A preview of this reading rendered as an image" className="mb-5 w-full rounded-xl shadow-lg" />
          <button
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-srf-blue px-6 py-3.5 font-medium text-white transition-colors hover:bg-srf-blue-700"
          >
            <Download className="h-5 w-5" />
            Download image
          </button>
        </>
      )}

      <p className="text-muted mt-4 text-center text-sm">A quiet image to keep, print, or share.</p>
    </Modal>
  );
}
