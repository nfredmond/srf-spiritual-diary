import { useState, useEffect } from 'react';
import { Flower2, Keyboard } from 'lucide-react';
import { DateNavigator } from './components/DateNavigator/DateNavigator';
import { QuoteDisplay } from './components/QuoteDisplay/QuoteDisplay';
import { ImageGenerator } from './components/ImageGenerator/ImageGenerator';
import { useDiaryEntry } from './hooks/useDiaryEntry';
import { format, addDays, subDays } from 'date-fns';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const { entry, loading, error } = useDiaryEntry(selectedDate);

  const dateKey = format(selectedDate, 'MM-dd');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch(e.key) {
        case 'ArrowLeft':
        case 'h':
          e.preventDefault();
          setSelectedDate(prev => subDays(prev, 1));
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          setSelectedDate(prev => addDays(prev, 1));
          break;
        case 't':
          e.preventDefault();
          setSelectedDate(new Date());
          break;
        case '?':
          e.preventDefault();
          setShowKeyboardHelp(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-srf-white to-srf-lotus/20">
      {/* Header */}
      <header className="bg-white shadow-sm py-6 relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <Flower2 className="w-8 h-8 text-srf-gold" />
            <h1 className="font-heading text-3xl md:text-4xl text-srf-blue">
              SRF Spiritual Diary
            </h1>
          </div>
          <p className="text-center text-gray-600 mt-2">
            Daily Wisdom from Paramahansa Yogananda
          </p>

          {/* Keyboard shortcuts button */}
          <button
            onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Keyboard help modal */}
        {showKeyboardHelp && (
          <div className="absolute top-full right-4 mt-2 bg-white rounded-lg shadow-xl p-4 z-50 w-64">
            <h3 className="font-heading text-lg mb-3 text-srf-blue">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-gray-100 rounded">←</kbd>
                <span>Previous day</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-gray-100 rounded">→</kbd>
                <span>Next day</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-gray-100 rounded">T</kbd>
                <span>Today</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-gray-100 rounded">?</kbd>
                <span>This help</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <DateNavigator 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
        />

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-srf-blue border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading wisdom...</p>
          </div>
        )}

        {error && (
          <div className="card max-w-2xl mx-auto text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-600 text-sm">
              Try selecting a different date or return to today.
            </p>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="mt-4 px-6 py-2 bg-srf-blue text-white rounded-full hover:bg-srf-blue/90 transition-colors"
            >
              Go to Today
            </button>
          </div>
        )}

        {entry && (
          <>
            <QuoteDisplay entry={entry} />
            <ImageGenerator entry={entry} dateKey={dateKey} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-srf-blue text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2025 Self-Realization Fellowship. All rights reserved.
          </p>
          <p className="text-sm mt-2 text-srf-sky">
            Made with devotion to share the teachings of Paramahansa Yogananda
          </p>
          <p className="text-xs mt-3 text-srf-sky/70">
            Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">?</kbd> for keyboard shortcuts
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
