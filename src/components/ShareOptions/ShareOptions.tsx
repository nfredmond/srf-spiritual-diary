import { motion } from 'framer-motion';
import { X, Twitter, Facebook, MessageCircle, Mail, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';
import type { DiaryEntry } from '../../types/DiaryEntry';

interface ShareOptionsProps {
  entry: DiaryEntry;
  dateKey: string;
  onClose: () => void;
}

export function ShareOptions({ entry, dateKey, onClose }: ShareOptionsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `"${entry.quote}"\n\n— ${entry.source}\n\nSRF Spiritual Diary`;
  const shareUrl = `${window.location.origin}?date=${dateKey}`;

  const handleTwitter = () => {
    const text = `"${entry.quote.substring(0, 200)}${entry.quote.length > 200 ? '...' : ''}"\n\n— Paramahansa Yogananda`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    const subject = `Daily Wisdom: ${entry.topic}`;
    const body = `${shareText}\n\nView more at: ${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareOptions = [
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'from-blue-400 to-blue-600', onClick: handleTwitter },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-800', onClick: handleFacebook },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'from-green-400 to-green-600', onClick: handleWhatsApp },
    { id: 'email', name: 'Email', icon: Mail, color: 'from-gray-500 to-gray-700', onClick: handleEmail },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-srf-white to-srf-lotus/20 rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-2xl text-srf-blue">Share This Wisdom</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {shareOptions.map(({ id, name, icon: Icon, color, onClick }) => (
            <button
              key={id}
              onClick={onClick}
              className={`flex flex-col items-center gap-2 p-4 bg-gradient-to-br ${color} text-white rounded-xl hover:shadow-lg transition-all`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{name}</span>
            </button>
          ))}
        </div>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white border-2 border-srf-blue/20 rounded-xl hover:border-srf-blue transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-600">Link Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-5 h-5 text-srf-blue" />
              <span className="font-medium text-srf-blue">Copy Link</span>
            </>
          )}
        </button>

        {/* Quote Preview */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700 italic mb-2">"{entry.quote.substring(0, 100)}..."</p>
          <p className="text-xs text-gray-500">— {entry.source}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
