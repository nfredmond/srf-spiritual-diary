import { useState, useEffect, useMemo } from 'react';
import { Keyboard, Search as SearchIcon, Heart, Timer, Shuffle, Image as ImageIcon, TrendingUp, Calendar as CalendarIcon, Database, Info } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { DateNavigator } from './components/DateNavigator/DateNavigator';
import { QuoteDisplay } from './components/QuoteDisplay/QuoteDisplay';
import { ImageGenerator } from './components/ImageGenerator/ImageGenerator';
import { SearchBar } from './components/SearchBar/SearchBar';
import { SearchResults } from './components/SearchResults/SearchResults';
import { ThemeSwitcher } from './components/ThemeSwitcher/ThemeSwitcher';
import { ReadingControls } from './components/ReadingControls/ReadingControls';
import { FavoritesPanel } from './components/FavoritesPanel/FavoritesPanel';
import { EnhancedMeditationTimer } from './components/EnhancedMeditationTimer/EnhancedMeditationTimer';
import { EnhancedQuoteCard } from './components/EnhancedQuoteCard/EnhancedQuoteCard';
import { NotesPanel } from './components/NotesPanel/NotesPanel';
import { SkeletonLoader } from './components/SkeletonLoader/SkeletonLoader';
import { StatsDashboard } from './components/StatsDashboard/StatsDashboard';
import { CalendarView } from './components/CalendarView/CalendarView';
import { ExportImport } from './components/ExportImport/ExportImport';
import { WeeklyThemeView } from './components/WeeklyThemeView/WeeklyThemeView';
import { AboutModal } from './components/AboutModal/AboutModal';
import { OnboardingTour } from './components/OnboardingTour/OnboardingTour';
import { WeekRhythm } from './components/WeekRhythm/WeekRhythm';
import { useDiaryEntry } from './hooks/useDiaryEntry';
import { useFavorites } from './hooks/useFavorites';
import { useNotes } from './hooks/useNotes';
import { useReadingStreak } from './hooks/useReadingStreak';
import { useTheme } from './hooks/useTheme';
import { useSwipeGesture } from './hooks/useSwipeGesture';
import { useRandomQuote } from './hooks/useRandomQuote';
import { useQuoteHistory } from './hooks/useQuoteHistory';
import { addDays, subDays } from 'date-fns';
import { toMMDD, fromMMDD } from './lib/diaryDate';
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
  const [showStats, setShowStats] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [showWeeklyThemes, setShowWeeklyThemes] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');

  const { entry, loading, error } = useDiaryEntry(selectedDate);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const dateKey = toMMDD(selectedDate);
  const { note, saveNote, hasNote } = useNotes(dateKey);
  const { totalDays, recordVisit } = useReadingStreak();
  const { theme, setTheme } = useTheme();
  const { getRandomDateKey } = useRandomQuote();
  const { history, addToHistory } = useQuoteHistory();
  const visitedKeys = useMemo(() => history.map((h) => h.dateKey), [history]);

  // Get notes count map for calendar
  const getNotesMap = () => {
    const stored = localStorage.getItem('srf-notes');
    if (!stored) return {};
    try {
      const notes = JSON.parse(stored);
      const map: Record<string, boolean> = {};
      Object.keys(notes).forEach(key => {
        map[key] = true;
      });
      return map;
    } catch {
      return {};
    }
  };

  // Record visit on mount and track quote history
  useEffect(() => {
    recordVisit();
    addToHistory(dateKey);
  }, [recordVisit, addToHistory, dateKey]);

  // First-visit onboarding tour
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.localStorage.getItem('srf-onboarding-completed')) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('srf-onboarding-completed', 'true');
    }
    setShowOnboarding(false);
  };

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
        case 'w':
          e.preventDefault();
          setShowWeeklyThemes(prev => !prev);
          break;
        case '?':
          e.preventDefault();
          setShowKeyboardHelp(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showSearch, showFavorites, showMeditationTimer, showWeeklyThemes]);

  const handleRandomQuote = () => {
    const randomKey = getRandomDateKey();
    if (randomKey) {
      setSelectedDate(fromMMDD(randomKey));
    }
  };

  const handleSearchResultSelect = (dateKey: string) => {
    setSelectedDate(fromMMDD(dateKey));
    setShowSearch(false);
    setSearchResults([]);
  };

  return (
    <div className="app-shell min-h-screen bg-gradient-to-br from-srf-white to-srf-lotus/20">
      {/* Header */}
      <header className="app-header bg-white shadow-sm py-6 relative">
        <div className="container mx-auto px-4">
          <div className="relative z-10 flex items-center justify-center gap-3 md:gap-4">
            <img
              src="/branding/logo-transparent.png"
              alt=""
              aria-hidden="true"
              className="brand-logo h-14 w-14 md:h-16 md:w-16 object-contain"
            />
            <h1 className="font-heading text-3xl md:text-4xl text-srf-blue">
              SRF Spiritual Diary
            </h1>
          </div>
          <p className="text-center text-gray-700 mt-2">
            Daily guidance inspired by the teachings of Paramahansa Yogananda
          </p>

          <p className="text-center text-sm text-gray-700 mt-4 max-w-2xl mx-auto leading-relaxed">
            A calm place for daily reading, reflection, personal notes, and meditation.
          </p>

          {/* Top Right Controls */}
          <div className="utility-toolbar absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-srf-blue/10 bg-white/90 px-2 py-1 shadow-sm backdrop-blur-sm">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-full hover:bg-srf-lotus/30 transition-colors"
              aria-label="Search readings"
              title="Search readings (Press /)"
            >
              <SearchIcon className="utility-toolbar-icon w-5 h-5 text-srf-blue/80" />
            </button>

            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className="p-2 rounded-full hover:bg-srf-lotus/30 transition-colors relative"
              aria-label="Saved readings"
              title="View saved readings (Press F)"
            >
              <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'text-red-500 fill-red-500' : 'utility-toolbar-icon text-srf-blue/80'}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 rounded-full hover:bg-srf-lotus/30 transition-colors"
              aria-label="Reflection overview"
              title="View your reflection overview"
            >
              <TrendingUp className="utility-toolbar-icon w-5 h-5 text-srf-blue/80" />
            </button>

            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="p-2 rounded-full hover:bg-srf-lotus/30 transition-colors"
              aria-label="Reading calendar"
              title="Reading calendar"
            >
              <CalendarIcon className="utility-toolbar-icon w-5 h-5 text-srf-blue/80" />
            </button>

            <button
              onClick={() => setShowMeditationTimer(!showMeditationTimer)}
              className="p-2 rounded-full hover:bg-srf-lotus/30 transition-colors"
              aria-label="Meditation timer"
              title="Meditation timer (Press M)"
            >
              <Timer className="utility-toolbar-icon w-5 h-5 text-srf-blue/80" />
            </button>

            <button
              onClick={() => setShowExportImport(!showExportImport)}
              className="p-2 rounded-full hover:bg-srf-lotus/30 transition-colors"
              aria-label="Preserve your journal"
              title="Preserve your journal"
            >
              <Database className="utility-toolbar-icon w-5 h-5 text-srf-blue/80" />
            </button>

            <button
              onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
              className="p-2 rounded-full hover:bg-srf-lotus/30 transition-colors"
              aria-label="Reading shortcuts"
              title="Reading shortcuts (Press ?)"
            >
              <Keyboard className="utility-toolbar-icon w-5 h-5 text-srf-blue/80" />
            </button>

            <button
              onClick={() => setShowAbout(true)}
              className="p-2 rounded-full hover:bg-srf-lotus/30 transition-colors"
              aria-label="About this reader"
              title="About this reader"
            >
              <Info className="utility-toolbar-icon w-5 h-5 text-srf-blue/80" />
            </button>
          </div>
        </div>

        {/* Enhanced Keyboard help modal */}
        {showKeyboardHelp && (
          <div className="utility-popover absolute top-full right-4 mt-2 bg-white rounded-lg shadow-xl p-4 z-50 w-72">
            <h3 className="font-heading text-lg mb-3 text-srf-blue">Reading Shortcuts</h3>
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
                <span>Random reading</span>
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
                <kbd className="px-2 py-1 bg-gray-100 rounded">W</kbd>
                <span>Weekly themes</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-1 bg-gray-100 rounded">?</kbd>
                <span>This help</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3 pt-3 border-t">
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
              className="secondary-action-btn flex items-center gap-2 px-4 py-2 bg-white/90 text-srf-blue border border-srf-gold/30 rounded-full hover:bg-srf-lotus/30 transition-all shadow-sm"
              title="Random reading (Press R)"
            >
              <Shuffle className="w-4 h-4" />
              <span className="text-sm font-medium">Random Reading</span>
            </button>

            {entry && (
              <button
                onClick={() => setShowQuoteCard(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-srf-blue to-srf-gold text-white rounded-full hover:shadow-lg transition-all"
                title="Create quote image"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Quote Image</span>
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

        <WeekRhythm
          selectedDate={selectedDate}
          visitedKeys={visitedKeys}
          onSelectDate={setSelectedDate}
        />

        {loading && <SkeletonLoader />}

        {error && (
          <div className="card max-w-2xl mx-auto text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-700 text-sm">
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

        {showStats && (
          <StatsDashboard
            favorites={favorites}
            totalDays={totalDays}
            onClose={() => setShowStats(false)}
          />
        )}

        {showCalendar && (
          <CalendarView
            selectedDate={selectedDate}
            favorites={favorites}
            notesCount={getNotesMap()}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setShowCalendar(false);
            }}
            onClose={() => setShowCalendar(false)}
          />
        )}

        {showMeditationTimer && (
          <EnhancedMeditationTimer onClose={() => setShowMeditationTimer(false)} />
        )}

        {showQuoteCard && entry && (
          <EnhancedQuoteCard
            entry={entry}
            dateKey={dateKey}
            onClose={() => setShowQuoteCard(false)}
          />
        )}

        {showExportImport && (
          <ExportImport onClose={() => setShowExportImport(false)} />
        )}

        {showNotes && (
          <NotesPanel
            dateKey={dateKey}
            initialNote={note}
            onSave={saveNote}
            onClose={() => setShowNotes(false)}
            prompt={entry ? { quote: entry.quote, topic: entry.topic, weeklyTheme: entry.weeklyTheme ?? null } : undefined}
          />
        )}

        {showWeeklyThemes && (
          <WeeklyThemeView
            currentDateKey={dateKey}
            onSelectDate={setSelectedDate}
            onClose={() => setShowWeeklyThemes(false)}
          />
        )}
      </AnimatePresence>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}

      {/* Footer */}
      <footer className="app-footer bg-srf-blue text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm text-srf-sky">
            A personal reading companion for <em>The Spiritual Diary</em> by Paramahansa Yogananda.
          </p>
          <p className="text-xs text-srf-sky/80 max-w-2xl mx-auto">
            Quotes are sourced from <em>The Spiritual Diary</em>, published by Self-Realization Fellowship (Los Angeles, CA). Yogananda&apos;s writings are © Self-Realization Fellowship. This site is an unofficial personal devotional reader; it is not affiliated with, endorsed by, or sponsored by Self-Realization Fellowship.
          </p>
          <p className="text-xs text-srf-sky/70 pt-2">
            Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">?</kbd> for keyboard shortcuts
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
