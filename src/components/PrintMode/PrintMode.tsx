import { motion } from 'framer-motion';
import { X, Printer, Calendar, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { DiaryEntry } from '../../types/DiaryEntry';

interface PrintModeProps {
  currentDate: Date;
  onClose: () => void;
}

export function PrintMode({ currentDate, onClose }: PrintModeProps) {
  const [printType, setPrintType] = useState<'single' | 'week' | 'month'>('single');
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({});

  useEffect(() => {
    fetch('/data/diary-entries.json')
      .then(res => res.json())
      .then(data => setEntries(data.entries || data));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const getDateRange = () => {
    const dates: Date[] = [];

    if (printType === 'single') {
      dates.push(currentDate);
    } else if (printType === 'week') {
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - date.getDay() + i);
        dates.push(date);
      }
    } else {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        dates.push(new Date(year, month, i));
      }
    }

    return dates;
  };

  const formatDateKey = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}-${day}`;
  };

  const dates = getDateRange();

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
        className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto print:max-w-full print:max-h-none print:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 print:hidden">
          <h3 className="font-heading text-2xl text-srf-blue flex items-center gap-2">
            <Printer className="w-6 h-6" />
            Print Mode
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Print Type Selector */}
        <div className="mb-6 print:hidden">
          <label className="block text-sm font-medium text-gray-700 mb-2">Print Layout</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setPrintType('single')}
              className={`p-4 rounded-lg border-2 transition-all ${
                printType === 'single'
                  ? 'border-srf-blue bg-srf-blue/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className="w-6 h-6 mx-auto mb-2 text-srf-blue" />
              <div className="text-sm font-medium">Single Day</div>
            </button>

            <button
              onClick={() => setPrintType('week')}
              className={`p-4 rounded-lg border-2 transition-all ${
                printType === 'week'
                  ? 'border-srf-blue bg-srf-blue/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-6 h-6 mx-auto mb-2 text-srf-blue" />
              <div className="text-sm font-medium">Week</div>
            </button>

            <button
              onClick={() => setPrintType('month')}
              className={`p-4 rounded-lg border-2 transition-all ${
                printType === 'month'
                  ? 'border-srf-blue bg-srf-blue/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-6 h-6 mx-auto mb-2 text-srf-blue" />
              <div className="text-sm font-medium">Month</div>
            </button>
          </div>
        </div>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="w-full mb-6 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-srf-blue to-srf-gold text-white rounded-xl font-medium hover:shadow-lg transition-shadow print:hidden"
        >
          <Printer className="w-5 h-5" />
          Print {printType === 'single' ? 'Day' : printType === 'week' ? 'Week' : 'Month'}
        </button>

        {/* Print Content */}
        <div className="print:p-8">
          {/* Header */}
          <div className="text-center mb-8 print:mb-12">
            <h1 className="font-heading text-3xl text-srf-blue mb-2">
              SRF Spiritual Diary
            </h1>
            <p className="text-gray-600">
              {printType === 'single'
                ? currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : printType === 'week'
                ? `Week of ${dates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
                : currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
              }
            </p>
          </div>

          {/* Entries */}
          <div className="space-y-8 print:space-y-12">
            {dates.map((date) => {
              const dateKey = formatDateKey(date);
              const entry = entries[dateKey];
              if (!entry) return null;

              return (
                <div key={dateKey} className="border-b border-gray-200 pb-8 print:pb-12 print:break-inside-avoid">
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">
                      {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <h3 className="font-heading text-xl text-srf-blue">{entry.topic}</h3>
                    {entry.weeklyTheme && (
                      <div className="text-sm text-srf-gold mt-1">
                        Weekly Theme: {entry.weeklyTheme}
                      </div>
                    )}
                  </div>

                  <blockquote className="text-lg leading-relaxed mb-4 italic text-gray-800">
                    "{entry.quote}"
                  </blockquote>

                  <div className="text-sm text-gray-600">
                    <p>— {entry.source}</p>
                    {entry.book && <p className="mt-1">{entry.book}</p>}
                  </div>

                  {/* Space for personal notes */}
                  <div className="mt-6 print:mt-8 border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500 mb-2">Personal Notes:</p>
                    <div className="h-20 border border-gray-200 rounded-lg"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-xs text-gray-500 print:fixed print:bottom-8 print:left-0 print:right-0">
            <p>© {new Date().getFullYear()} Self-Realization Fellowship. All rights reserved.</p>
            <p className="mt-1">Made with devotion to share the teachings of Paramahansa Yogananda</p>
          </div>
        </div>
      </motion.div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            margin: 1in;
            size: letter;
          }
        }
      `}</style>
    </motion.div>
  );
}
