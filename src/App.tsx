import { useState } from 'react';
import { Flower2 } from 'lucide-react';
import { DateNavigator } from './components/DateNavigator/DateNavigator';
import { QuoteDisplay } from './components/QuoteDisplay/QuoteDisplay';
import { ImageGenerator } from './components/ImageGenerator/ImageGenerator';
import { useDiaryEntry } from './hooks/useDiaryEntry';
import { format } from 'date-fns';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { entry, loading, error } = useDiaryEntry(selectedDate);

  const dateKey = format(selectedDate, 'MM-dd');

  return (
    <div className="min-h-screen bg-gradient-to-br from-srf-white to-srf-lotus/20">
      {/* Header */}
      <header className="bg-white shadow-sm py-6">
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
        </div>
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
          <div className="card max-w-2xl mx-auto text-center text-red-600">
            {error}
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
        </div>
      </footer>
    </div>
  );
}

export default App;

