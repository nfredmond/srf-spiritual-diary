import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import {
  Search as SearchIcon,
  Heart,
  Timer,
  Shuffle,
  Calendar as CalendarIcon,
  CalendarDays,
  Database,
  Keyboard,
  Info,
  MoreHorizontal,
  BookImage,
} from 'lucide-react';
import { Modal } from './components/Modal/Modal';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { addDays, subDays, format } from 'date-fns';
import { DateNavigator } from './components/DateNavigator/DateNavigator';
import { QuoteDisplay } from './components/QuoteDisplay/QuoteDisplay';
import { SearchBar } from './components/SearchBar/SearchBar';
import { SearchResults } from './components/SearchResults/SearchResults';
import { ThemeSwitcher } from './components/ThemeSwitcher/ThemeSwitcher';
import { ReadingControls } from './components/ReadingControls/ReadingControls';
import { SkeletonLoader } from './components/SkeletonLoader/SkeletonLoader';
import { WeekRhythm } from './components/WeekRhythm/WeekRhythm';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';

// Modals — lazily loaded so each ships as its own chunk the first time it opens.
const FavoritesPanel = lazy(() =>
  import('./components/FavoritesPanel/FavoritesPanel').then((m) => ({ default: m.FavoritesPanel })),
);
const MeditationTimer = lazy(() =>
  import('./components/MeditationTimer/MeditationTimer').then((m) => ({
    default: m.MeditationTimer,
  })),
);
const QuoteImage = lazy(() =>
  import('./components/QuoteImage/QuoteImage').then((m) => ({
    default: m.QuoteImage,
  })),
);
const NotesPanel = lazy(() =>
  import('./components/NotesPanel/NotesPanel').then((m) => ({ default: m.NotesPanel })),
);
const CalendarView = lazy(() =>
  import('./components/CalendarView/CalendarView').then((m) => ({ default: m.CalendarView })),
);
const ExportImport = lazy(() =>
  import('./components/ExportImport/ExportImport').then((m) => ({ default: m.ExportImport })),
);
const WeeklyThemeView = lazy(() =>
  import('./components/WeeklyThemeView/WeeklyThemeView').then((m) => ({ default: m.WeeklyThemeView })),
);
const AboutModal = lazy(() =>
  import('./components/AboutModal/AboutModal').then((m) => ({ default: m.AboutModal })),
);
const OnboardingTour = lazy(() =>
  import('./components/OnboardingTour/OnboardingTour').then((m) => ({ default: m.OnboardingTour })),
);

import { UpdateNotice } from './components/UpdateNotice';
import { useDiaryEntry } from './hooks/useDiaryEntry';
import { useFavorites } from './hooks/useFavorites';
import { useNotes } from './hooks/useNotes';
import { useReadingStreak } from './hooks/useReadingStreak';
import { useTheme } from './hooks/useTheme';
import { useSwipeGesture } from './hooks/useSwipeGesture';
import { useRandomQuote } from './hooks/useRandomQuote';
import { useQuoteHistory } from './hooks/useQuoteHistory';
import { toMMDD, fromMMDD } from './lib/diaryDate';
import type { DiaryEntry } from './types/DiaryEntry';

const toolbarBtn =
  'p-2.5 rounded-full text-srf-blue/80 transition-colors hover:bg-srf-lotus/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-srf-blue';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ dateKey: string; entry: DiaryEntry }>>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showMeditationTimer, setShowMeditationTimer] = useState(false);
  const [showQuoteCard, setShowQuoteCard] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [showWeeklyThemes, setShowWeeklyThemes] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');

  const { entry, loading, error, missing, nearest, retry } = useDiaryEntry(selectedDate);
  const { favorites, toggleFavorite, isFavorite, error: favoriteError } = useFavorites();
  const dateKey = toMMDD(selectedDate);
  const { note, saveNote, hasNote } = useNotes(dateKey);
  const { recordVisit } = useReadingStreak();
  const { theme, setTheme } = useTheme();
  const { getRandomDateKey } = useRandomQuote();
  const { history, addToHistory } = useQuoteHistory();
  const visitedKeys = useMemo(() => history.map((h) => h.dateKey), [history]);

  // Any full-screen overlay is open — used to suppress global shortcuts.
  const isOverlayOpen =
    showKeyboardHelp ||
    showFavorites ||
    showMeditationTimer ||
    showQuoteCard ||
    showNotes ||
    showCalendar ||
    showExportImport ||
    showWeeklyThemes ||
    showAbout ||
    showOnboarding;

  const getNotesMap = (): Record<string, boolean> => {
    try {
      const stored = localStorage.getItem('srf-notes');
      if (!stored) return {};
      const notes = JSON.parse(stored);
      const map: Record<string, boolean> = {};
      Object.keys(notes).forEach((key) => {
        map[key] = true;
      });
      return map;
    } catch {
      return {};
    }
  };

  const lastToday = useRef(new Date().toDateString());
  useEffect(() => {
    const check = () => {
      const today = new Date();
      if (today.toDateString() !== lastToday.current && !isOverlayOpen && !document.querySelector('[role="dialog"]')) {
        const previous = lastToday.current;
        lastToday.current = today.toDateString();
        setSelectedDate(selected => selected.toDateString() === previous ? today : selected);
      }
    };
    window.addEventListener('focus',check); document.addEventListener('visibilitychange',check);
    const timer=window.setInterval(check,30000);
    return () => { clearInterval(timer); window.removeEventListener('focus',check); document.removeEventListener('visibilitychange',check); };
  },[isOverlayOpen]);

  // Record the visit and remember the viewed reading.
  useEffect(() => {
    if (entry) { recordVisit(); addToHistory(dateKey); }
  }, [recordVisit, addToHistory, dateKey, entry]);

  // First-visit onboarding.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { if (!window.localStorage.getItem('srf-onboarding-completed')) setShowOnboarding(true); } catch { /* Reader remains usable without storage. */ }
  }, []);

  const handleOnboardingComplete = () => {
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem('srf-onboarding-completed', 'true'); } catch { /* Tour may return next time. */ }
    }
    setShowOnboarding(false);
  };

  useSwipeGesture({
    onSwipeLeft: () => !isOverlayOpen && setSelectedDate((prev) => addDays(prev, 1)),
    onSwipeRight: () => !isOverlayOpen && setSelectedDate((prev) => subDays(prev, 1)),
  });

  const handleRandomQuote = useCallback(() => {
    const randomKey = getRandomDateKey();
    if (randomKey) setSelectedDate(fromMMDD(randomKey));
  }, [getRandomDateKey]);

  // Global keyboard shortcuts — quiet while any overlay or text field is active.
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }
      if (isOverlayOpen || document.querySelector('[role="dialog"]') || e.ctrlKey || e.metaKey || e.altKey || target instanceof HTMLSelectElement || target instanceof HTMLButtonElement) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'h':
          e.preventDefault();
          setSelectedDate((prev) => subDays(prev, 1));
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          setSelectedDate((prev) => addDays(prev, 1));
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
          setShowSearch((v) => !v);
          break;
        case 'f':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setShowFavorites((v) => !v);
          }
          break;
        case 'm':
          e.preventDefault();
          setShowMeditationTimer((v) => !v);
          break;
        case 'w':
          e.preventDefault();
          setShowWeeklyThemes((v) => !v);
          break;
        case '?':
          e.preventDefault();
          setShowKeyboardHelp((v) => !v);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOverlayOpen, handleRandomQuote]);

  const handleSearchResultSelect = (key: string) => {
    setSelectedDate(fromMMDD(key));
    setShowSearch(false);
    setSearchResults([]);
  };

  const moreMenu = [
    { label: 'Weekly themes', icon: CalendarDays, onClick: () => setShowWeeklyThemes(true) },
    { label: 'Reading calendar', icon: CalendarIcon, onClick: () => setShowCalendar(true) },
    { label: 'Preserve your journal', icon: Database, onClick: () => setShowExportImport(true) },
    { label: 'Reading shortcuts', icon: Keyboard, onClick: () => setShowKeyboardHelp((v) => !v) },
    { label: 'About this reader', icon: Info, onClick: () => setShowAbout(true) },
  ];

  return (
    <div className="app-shell min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-md focus:bg-srf-blue focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Screen-reader announcement of the current reading */}
      <p role="status" aria-live="polite" className="sr-only">
        {loading ? 'Loading reading…' : entry ? `${format(selectedDate, 'MMMM d')}. ${entry.topic}.` : missing ? `${format(selectedDate, 'MMMM d')}. Reading unavailable.` : error ?? ''}
      </p>

      {/* Header */}
      <header className="app-header relative pb-8 pt-4">
        <div className="container mx-auto px-4">
          {/* Slim utility bar (in normal flow — never overlaps the title) */}
          <div className="flex items-center justify-end">
            <div className="utility-toolbar flex items-center gap-0.5 rounded-full border border-srf-blue/10 bg-white/85 px-1.5 py-1 shadow-sm backdrop-blur-sm">
              <button
                onClick={() => setShowSearch((v) => !v)}
                className={toolbarBtn}
                aria-label="Search readings"
                title="Search readings (/)"
              >
                <SearchIcon className="utility-toolbar-icon h-5 w-5" />
              </button>

              <button
                onClick={() => setShowFavorites((v) => !v)}
                className={`${toolbarBtn} relative`}
                aria-label="Saved readings"
                title="Saved readings (F)"
              >
                <Heart
                  className={`h-5 w-5 ${favorites.length > 0 ? 'fill-current text-gold-accent' : 'utility-toolbar-icon'}`}
                />
                {favorites.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-srf-gold" aria-hidden="true" />
                )}
              </button>

              <button
                onClick={() => setShowMeditationTimer((v) => !v)}
                className={toolbarBtn}
                aria-label="Meditation timer"
                title="Meditation timer (M)"
              >
                <Timer className="utility-toolbar-icon h-5 w-5" />
              </button>

              <Menu as="div" className="relative">
                <MenuButton className={toolbarBtn} aria-label="More">
                  <MoreHorizontal className="utility-toolbar-icon h-5 w-5" />
                </MenuButton>
                <MenuItems
                  className="utility-popover absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border p-1 shadow-xl focus:outline-none"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {moreMenu.map(({ label, icon: Icon, onClick }) => (
                    <MenuItem key={label}>
                      <button
                        onClick={onClick}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors data-[focus]:bg-srf-lotus/60"
                      >
                        <Icon className="h-4 w-4 text-gold-accent" />
                        {label}
                      </button>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
            </div>
          </div>

          {/* Brand block */}
          <div className="mt-2 flex flex-col items-center text-center">
            <img
              src="/lotus-icon.svg"
              alt=""
              aria-hidden="true"
              className="brand-logo h-12 w-12 md:h-14 md:w-14"
            />
            <h1 className="mt-3 font-heading text-3xl text-srf-blue md:text-4xl">The Spiritual Diary</h1>
            <p className="text-muted mt-1 font-body text-sm">
              Daily readings from the teachings of Paramahansa Yogananda
            </p>
            <p className="text-muted mt-3 max-w-md text-xs opacity-80">
              An independent, unofficial devotional reader — not affiliated with or endorsed by
              Self-Realization Fellowship.
            </p>
          </div>
        </div>

        {/* Keyboard help dialog */}
        {showKeyboardHelp && (
          <Modal onClose={() => setShowKeyboardHelp(false)} ariaLabel="Reading shortcuts" panelClassName="w-full max-w-sm rounded-xl border bg-white p-5 shadow-xl">
            <button className="float-right rounded px-2 py-1 text-sm" onClick={() => setShowKeyboardHelp(false)}>Close shortcuts</button>
            <h3 className="mb-3 font-heading text-lg text-srf-blue">Reading Shortcuts</h3>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {[
                ['← / H', 'Previous day'],
                ['→ / L', 'Next day'],
                ['T', 'Today'],
                ['R', 'A reading finds you'],
                ['/', 'Search'],
                ['F', 'Saved readings'],
                ['M', 'Meditation timer'],
                ['W', 'Weekly themes'],
                ['?', 'This help'],
              ].map(([k, label]) => (
                <div key={k} className="flex justify-between">
                  <kbd className="rounded bg-black/5 px-2 py-0.5">{k}</kbd>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 border-t border-black/5 pt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Swipe left or right on a touch screen to move through the days.
            </p>
          </Modal>
        )}
      </header>

      {/* Main content */}
      <main id="main-content" tabIndex={-1} aria-busy={loading} className="container mx-auto px-4 py-10">
        {/* Reading-comfort controls + gentle secondary actions */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />
            <ReadingControls fontSize={fontSize} onFontSizeChange={setFontSize} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRandomQuote}
              className="secondary-action-btn flex items-center gap-2 rounded-full border border-srf-gold/40 bg-white/85 px-4 py-2 text-sm text-srf-blue shadow-sm transition-colors hover:bg-srf-lotus/40"
              title="A reading finds you (R)"
            >
              <Shuffle className="h-4 w-4" />
              <span className="font-medium">A reading finds you</span>
            </button>

            {entry && (
              <button
                onClick={() => setShowQuoteCard(true)}
                className="secondary-action-btn flex items-center gap-2 rounded-full border border-srf-gold/40 bg-white/85 px-4 py-2 text-sm text-srf-blue shadow-sm transition-colors hover:bg-srf-lotus/40"
                title="Save this reading as an image"
              >
                <BookImage className="h-4 w-4" />
                <span className="font-medium">Save this reading</span>
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        {showSearch && (
          <SearchBar
            onSearchResults={setSearchResults}
            onClose={() => {
              setShowSearch(false);
              setSearchResults([]);
            }}
          />
        )}

        {searchResults.length > 0 && (
          <SearchResults results={searchResults} onSelectDate={handleSearchResultSelect} />
        )}

        <nav aria-label="Daily practice" className="mb-5 flex flex-wrap justify-center gap-3">
          <button className="secondary-action-btn rounded-full border px-4 py-2" onClick={()=>setSelectedDate(new Date())}>Today</button>
          <button className="secondary-action-btn rounded-full border px-4 py-2" onClick={()=>setShowCalendar(true)}>Reading calendar</button>
          <button className="secondary-action-btn rounded-full border px-4 py-2" onClick={()=>setShowNotes(true)}>Reflect</button>
          <button className="secondary-action-btn rounded-full border px-4 py-2" onClick={()=>setShowMeditationTimer(true)}>Meditate</button>
        </nav>
        <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

        <WeekRhythm selectedDate={selectedDate} visitedKeys={visitedKeys} onSelectDate={setSelectedDate} />

        {favoriteError && <p role="alert">{favoriteError}</p>}
        {loading && <SkeletonLoader />}

        {error && !loading && <div className="card mx-auto max-w-2xl text-center" role="alert"><h2>Readings could not be loaded</h2><p>{error}</p><button className="mt-4 rounded-full border px-5 py-2" onClick={retry}>Retry loading</button></div>}
        {missing && !loading && <div className="card mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-xl text-srf-blue">Reading unavailable for {format(selectedDate,'MMMM d')}</h2>
          <p className="text-muted mt-3">{dateKey === '02-29' ? 'The printed treatment of February 29 has not been verified.' : 'This passage has not been transcribed from a verified source.'}</p>
          {nearest && <button className="mt-5 rounded-full bg-srf-blue px-6 py-2 text-white" onClick={()=>setSelectedDate(nearest)}>Read {format(nearest,'MMMM d')} instead</button>}
        </div>}

        {entry && !loading && (
          <QuoteDisplay
            entry={entry}
            dateKey={dateKey}
            fontSize={fontSize}
            isFavorite={isFavorite(dateKey)}
            onToggleFavorite={() => toggleFavorite(dateKey)}
            hasNote={hasNote}
            onOpenNotes={() => setShowNotes(true)}
          />
        )}
      </main>

      <UpdateNotice paused={isOverlayOpen} />
      {/* Modals — lazy-loaded; the boundary catches chunk-load failures. */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          {showFavorites && (
              <FavoritesPanel
                favorites={favorites}
                onSelectDate={handleSearchResultSelect}
                onClose={() => setShowFavorites(false)}
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
              <MeditationTimer onClose={() => setShowMeditationTimer(false)} />
            )}

            {showQuoteCard && entry && (
              <QuoteImage entry={entry} dateKey={dateKey} onClose={() => setShowQuoteCard(false)} />
            )}

            {showExportImport && <ExportImport onClose={() => setShowExportImport(false)} />}

            {showNotes && (
              <NotesPanel
                dateKey={dateKey}
                initialNote={note}
                onSave={saveNote}
                onClose={() => setShowNotes(false)}
                prompt={
                  entry
                    ? { quote: entry.quote, topic: entry.topic, weeklyTheme: entry.weeklyTheme ?? null }
                    : undefined
                }
              />
            )}

            {showWeeklyThemes && (
              <WeeklyThemeView
                currentDateKey={dateKey}
                onSelectDate={setSelectedDate}
                onClose={() => setShowWeeklyThemes(false)}
              />
            )}

          {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
          {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}
        </Suspense>
      </ErrorBoundary>

      {/* Footer */}
      <footer className="app-footer mt-16 py-10 text-white">
        <div className="container mx-auto space-y-3 px-4 text-center">
          <p className="font-heading text-lg text-srf-sky">
            Offered in loving devotion to Guruji and the SRF family.
          </p>
          <p className="text-sm text-srf-sky/90">
            A personal reading companion for <em>The Spiritual Diary</em> by Paramahansa Yogananda.
          </p>
          <p className="mx-auto max-w-2xl text-xs text-srf-sky/70">
            The writings of Paramahansa Yogananda are &copy; Self-Realization Fellowship (Los Angeles,
            CA). This is an independent, unofficial devotional reader; it is not affiliated with,
            endorsed by, or sponsored by Self-Realization Fellowship. For official publications, please
            visit yogananda.org.
          </p>
          <p className="pt-1 text-xs text-srf-sky/60">
            Press <kbd className="rounded bg-white/10 px-1 py-0.5">?</kbd> for keyboard shortcuts
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
