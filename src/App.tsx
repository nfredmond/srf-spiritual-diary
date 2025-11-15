import { useState, useEffect } from 'react';
import { Flower2, Keyboard, Search as SearchIcon, Heart, Timer, Shuffle, Image as ImageIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { DateNavigator } from './components/DateNavigator/DateNavigator';
import { QuoteDisplay } from './components/QuoteDisplay/QuoteDisplay';
import { ImageGenerator } from './components/ImageGenerator/ImageGenerator';
import { SearchBar } from './components/SearchBar/SearchBar';
import { SearchResults } from './components/SearchResults/SearchResults';
import { ThemeSwitcher } from './components/ThemeSwitcher/ThemeSwitcher';
import { ReadingControls } from './components/ReadingControls/ReadingControls';
import { StreakBadge } from './components/StreakBadge/StreakBadge';
import { FavoritesPanel } from './components/FavoritesPanel/FavoritesPanel';
import { MeditationTimer } from './components/MeditationTimer/MeditationTimer';
import { QuoteCard } from './components/QuoteCard/QuoteCard';
import { NotesPanel } from './components/NotesPanel/NotesPanel';
import { SkeletonLoader } from './components/SkeletonLoader/SkeletonLoader';
import { useDiaryEntry } from './hooks/useDiaryEntry';
import { useFavorites } from './hooks/useFavorites';
import { useNotes } from './hooks/useNotes';
import { useReadingStreak } from './hooks/useReadingStreak';
import { useTheme } from './hooks/useTheme';
import { useSwipeGesture } from './hooks/useSwipeGesture';
import { useRandomQuote } from './hooks/useRandomQuote';
import { format, addDays, subDays } from 'date-fns';
import type { DiaryEntry } from './types/DiaryEntry';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ dateKey: string; entry: DiaryEntry }>>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showMeditationTimer, setShowMeditationTimer] = useState(false);
  const [showQuoteCard, setShowQuoteCard] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');

  const { entry, loading, error } = useDiaryEntry(selectedDate);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const dateKey = format(selectedDate, 'MM-dd');
  const { note, saveNote, hasNote } = useNotes(dateKey);
  const { currentStreak, longestStreak, totalDays, recordVisit } = useReadingStreak();
  const { theme, setTheme } = useTheme();
  const { getRandomDateKey } = useRandomQuote();

  // Record visit on mount
  useEffect(() => {
    recordVisit();
  }, [recordVisit]);

  // Swipe gestures
  useSwipeGesture({
    onSwipeLeft: () => setSelectedDate(prev => addDays(prev, 1)),
    onSwipeRight: () => setSelectedDate(prev => subDays(prev, 1)),
  });

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
        case 'r':
          e.preventDefault();
          handleRandomQuote();
          break;
        case '/':
          e.preventDefault();
          setShowSearch(!showSearch);
          break;
        case 'f':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setShowFavorites(!showFavorites);
          }
          break;
        case 'm':
          e.preventDefault();
          setShowMeditationTimer(!showMeditationTimer);
          break;
        case '?':
          e.preventDefault();
          setShowKeyboardHelp(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showSearch, showFavorites, showMeditationTimer]);

  const handleRandomQuote = () => {
    const randomKey = getRandomDateKey();
    if (randomKey) {
      const [month, day] = randomKey.split('-');
      const randomDate = new Date(2024, parseInt(month) - 1, parseInt(day));
      setSelectedDate(randomDate);
    }
  };

  const handleSearchResultSelect = (dateKey: string) => {
    const [month, day] = dateKey.split('-');
    const date = new Date(2024, parseInt(month) - 1, parseInt(day));
    setSelectedDate(date);
    setShowSearch(false);
    setSearchResults([]);
  };

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

          {/* Controls Row */}
          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
            <StreakBadge
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              totalDays={totalDays}
            />
          </div>

          {/* Top Right Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Search"
              title="Search quotes (Press /)"
            >
              <SearchIcon className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              aria-label="Favorites"
              title="View favorites (Press F)"
            >
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowMeditationTimer(!showMeditationTimer)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Meditation Timer"
              title="Meditation timer (Press M)"
            >
              <Timer className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (Press ?)"
            >
              <Keyboard className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Enhanced Keyboard help modal */}
        {showKeyboardHelp && (
          <div className="absolute top-full right-4 mt-2 bg-white rounded-lg shadow-xl p-4 z-50 w-72">
            <h3 className="font-heading text-lg mb-3 text-srf-blue">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-gray-100 rounded">← / H</kbd>
                <span>Previous day</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-gray-100 rounded">→ / L</kbd>
                <span>Next day</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-gray-100 rounded">T</kbd>
                <span>Today</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-gray-100 rounded">R</kbd>
                <span>Random quote</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-gray-100 rounded">/</kbd>
                <span>Search</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-gray-100 rounded">F</kbd>
                <span>Favorites</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-gray-100 rounded">M</kbd>
                <span>Meditation timer</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-gray-100 rounded">?</kbd>
                <span>This help</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
              Swipe left/right on mobile to navigate
            </p>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Controls Bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />
            <ReadingControls fontSize={fontSize} onFontSizeChange={setFontSize} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomQuote}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all"
              title="Random quote (Press R)"
            >
              <Shuffle className="w-4 h-4" />
              <span className="text-sm font-medium">Random</span>
            </button>

            {entry && (
              <button
                onClick={() => setShowQuoteCard(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-srf-blue to-srf-gold text-white rounded-full hover:shadow-lg transition-all"
                title="Create quote card"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Quote Card</span>
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <AnimatePresence>
          {showSearch && (
            <SearchBar
              onSearchResults={setSearchResults}
              onClose={() => {
                setShowSearch(false);
                setSearchResults([]);
              }}
            />
          )}
        </AnimatePresence>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <SearchResults
            results={searchResults}
            onSelectDate={handleSearchResultSelect}
          />
        )}

        <DateNavigator
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {loading && <SkeletonLoader />}

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
            <QuoteDisplay
              entry={entry}
              dateKey={dateKey}
              fontSize={fontSize}
              isFavorite={isFavorite(dateKey)}
              onToggleFavorite={() => toggleFavorite(dateKey)}
              hasNote={hasNote}
              onOpenNotes={() => setShowNotes(true)}
            />
            <ImageGenerator entry={entry} dateKey={dateKey} />
          </>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showFavorites && (
          <FavoritesPanel
            favorites={favorites}
            onSelectDate={handleSearchResultSelect}
            onClose={() => setShowFavorites(false)}
          />
        )}

        {showMeditationTimer && (
          <MeditationTimer onClose={() => setShowMeditationTimer(false)} />
        )}

        {showQuoteCard && entry && (
          <QuoteCard
            entry={entry}
            dateKey={dateKey}
            onClose={() => setShowQuoteCard(false)}
          />
        )}

        {showNotes && (
          <NotesPanel
            dateKey={dateKey}
            initialNote={note}
            onSave={saveNote}
            onClose={() => setShowNotes(false)}
          />
        )}
      </AnimatePresence>

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
