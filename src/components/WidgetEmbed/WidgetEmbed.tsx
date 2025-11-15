import { motion } from 'framer-motion';
import { X, Code, Copy, Check, Eye } from 'lucide-react';
import { useState } from 'react';

interface WidgetEmbedProps {
  onClose: () => void;
}

export function WidgetEmbed({ onClose }: WidgetEmbedProps) {
  const [copied, setCopied] = useState(false);
  const [widgetType, setWidgetType] = useState<'minimal' | 'card' | 'full'>('card');
  const [showPreview, setShowPreview] = useState(true);

  const baseUrl = window.location.origin;

  const getEmbedCode = () => {
    const height = widgetType === 'minimal' ? '120' : widgetType === 'card' ? '300' : '500';
    const width = widgetType === 'minimal' ? '100%' : widgetType === 'card' ? '400' : '100%';

    return `<!-- SRF Spiritual Diary Widget -->
<iframe
  src="${baseUrl}/widget?type=${widgetType}"
  width="${width}"
  height="${height}"
  frameborder="0"
  scrolling="no"
  style="border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
  title="SRF Daily Wisdom">
</iframe>`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getEmbedCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getWidgetPreview = () => {
    switch (widgetType) {
      case 'minimal':
        return (
          <div className="p-4 bg-white rounded-lg border-2 border-srf-blue/20 text-center">
            <p className="text-sm italic text-gray-700">
              "Calmness is the ideal state in which we should receive all life's experiences."
            </p>
            <p className="text-xs text-gray-500 mt-2">— Paramahansa Yogananda</p>
          </div>
        );

      case 'card':
        return (
          <div className="p-6 bg-gradient-to-br from-srf-blue/10 to-srf-gold/10 rounded-xl border-2 border-srf-blue/20">
            <div className="text-center mb-4">
              <h4 className="font-heading text-lg text-srf-blue">Daily Wisdom</h4>
              <p className="text-xs text-gray-600">Self-Realization Fellowship</p>
            </div>
            <blockquote className="text-sm italic text-gray-700 mb-3 text-center">
              "Calmness is the ideal state in which we should receive all life's experiences."
            </blockquote>
            <p className="text-xs text-gray-500 text-center">— Paramahansa Yogananda</p>
            <div className="mt-4 text-center">
              <a href="#" className="text-xs text-srf-blue hover:underline">
                View Full Diary →
              </a>
            </div>
          </div>
        );

      case 'full':
        return (
          <div className="p-8 bg-gradient-to-br from-srf-white to-srf-lotus/20 rounded-xl">
            <div className="text-center mb-6">
              <h3 className="font-heading text-2xl text-srf-blue mb-2">Daily Wisdom</h3>
              <p className="text-sm text-gray-600">Self-Realization Fellowship Spiritual Diary</p>
            </div>
            <div className="bg-white rounded-lg p-6 mb-4">
              <h4 className="font-heading text-lg text-srf-blue mb-3">Seeking Divine Wisdom</h4>
              <blockquote className="text-sm italic text-gray-700 mb-4">
                "Calmness is the ideal state in which we should receive all life's experiences. By practicing calmness, we can keep our minds always in a state of poise and equilibrium."
              </blockquote>
              <p className="text-xs text-gray-500 mb-2">— Paramahansa Yogananda</p>
              <p className="text-xs text-gray-400">Autobiography of a Yogi</p>
            </div>
            <div className="text-center">
              <a href="#" className="inline-block px-6 py-2 bg-gradient-to-r from-srf-blue to-srf-gold text-white rounded-lg hover:shadow-lg transition-shadow text-sm">
                Read More Daily Wisdom
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-srf-white to-srf-lotus/20 rounded-2xl p-6 max-w-4xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-2xl text-srf-blue flex items-center gap-2">
            <Code className="w-6 h-6" />
            Widget & Embed
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Embed the SRF Spiritual Diary on your website or blog to share daily wisdom with your visitors.
        </p>

        {/* Widget Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Widget Style
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { type: 'minimal' as const, name: 'Minimal', desc: 'Simple quote only' },
              { type: 'card' as const, name: 'Card', desc: 'Styled card view' },
              { type: 'full' as const, name: 'Full', desc: 'Complete widget' },
            ].map(({ type, name, desc }) => (
              <button
                key={type}
                onClick={() => setWidgetType(type)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  widgetType === type
                    ? 'border-srf-blue bg-srf-blue/5'
                    : 'border-gray-200 hover:border-srf-blue/50'
                }`}
              >
                <div className="font-medium text-gray-900">{name}</div>
                <div className="text-xs text-gray-500 mt-1">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm text-srf-blue hover:underline"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
            <div className="bg-white p-4 rounded-lg">
              {getWidgetPreview()}
            </div>
          </div>
        )}

        {/* Embed Code */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Embed Code
            </label>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1 text-sm text-srf-blue hover:bg-srf-blue/10 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Code
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
              {getEmbedCode()}
            </pre>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 text-sm">How to Use:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Choose your preferred widget style above</li>
            <li>Copy the embed code</li>
            <li>Paste it into your website's HTML where you want the widget to appear</li>
            <li>The widget will automatically display the current day's quote</li>
          </ol>
          <p className="text-xs text-blue-700 mt-3">
            <strong>Note:</strong> The widget requires JavaScript to be enabled and will link back to this diary for the full experience.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
