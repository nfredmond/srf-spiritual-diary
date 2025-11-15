import { motion } from 'framer-motion';
import { X, TrendingUp, Heart, BookOpen, Calendar, Award, Star, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DiaryEntry } from '../../types/DiaryEntry';

interface StatsDashboardProps {
  favorites: string[];
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  onClose: () => void;
}

interface ThemeStats {
  theme: string;
  count: number;
}

export function StatsDashboard({
  favorites,
  currentStreak,
  longestStreak,
  totalDays,
  onClose,
}: StatsDashboardProps) {
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({});
  const [topThemes, setTopThemes] = useState<ThemeStats[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  useEffect(() => {
    // Load diary entries
    fetch('/data/diary-entries.json')
      .then(res => res.json())
      .then(data => setEntries(data.entries || data));

    // Load notes count
    const stored = localStorage.getItem('srf-notes');
    if (stored) {
      try {
        const notes = JSON.parse(stored);
        setTotalNotes(Object.keys(notes).length);
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    }

    // Load recent activity
    const history = localStorage.getItem('srf-reading-history');
    if (history) {
      try {
        const data = JSON.parse(history);
        setRecentActivity(data.dates?.slice(-7) || []);
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (favorites.length === 0 || Object.keys(entries).length === 0) return;

    // Analyze favorite themes
    const themeCounts: Record<string, number> = {};
    favorites.forEach(dateKey => {
      const entry = entries[dateKey];
      if (entry?.weeklyTheme) {
        themeCounts[entry.weeklyTheme] = (themeCounts[entry.weeklyTheme] || 0) + 1;
      }
    });

    const sorted = Object.entries(themeCounts)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTopThemes(sorted);
  }, [favorites, entries]);

  const averagePerWeek = totalDays > 0 ? (totalDays / 4).toFixed(1) : '0';
  const favoritePercentage = favorites.length > 0
    ? ((favorites.length / 346) * 100).toFixed(1)
    : '0';

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
        className="bg-gradient-to-br from-srf-white to-srf-lotus/20 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-2xl text-srf-blue flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Your Spiritual Journey
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Days */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">Total Days</span>
            </div>
            <p className="text-3xl font-bold text-srf-blue">{totalDays}</p>
            <p className="text-xs text-gray-500 mt-1">{averagePerWeek}/week avg</p>
          </div>

          {/* Current Streak */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-600">Current Streak</span>
            </div>
            <p className="text-3xl font-bold text-orange-500">{currentStreak}</p>
            <p className="text-xs text-gray-500 mt-1">
              {currentStreak === longestStreak ? 'Personal best! 🎉' : `Best: ${longestStreak}`}
            </p>
          </div>

          {/* Favorites */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600">Favorites</span>
            </div>
            <p className="text-3xl font-bold text-red-500">{favorites.length}</p>
            <p className="text-xs text-gray-500 mt-1">{favoritePercentage}% of all quotes</p>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-srf-gold" />
              <span className="text-sm text-gray-600">Notes Written</span>
            </div>
            <p className="text-3xl font-bold text-srf-gold">{totalNotes}</p>
            <p className="text-xs text-gray-500 mt-1">Personal reflections</p>
          </div>
        </div>

        {/* Top Themes */}
        {topThemes.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h4 className="font-heading text-lg text-srf-blue mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-srf-gold" />
              Your Favorite Themes
            </h4>
            <div className="space-y-3">
              {topThemes.map(({ theme, count }, index) => {
                const percentage = (count / favorites.length) * 100;
                return (
                  <div key={theme}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {index + 1}. {theme}
                      </span>
                      <span className="text-sm text-gray-500">
                        {count} {count === 1 ? 'quote' : 'quotes'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-srf-blue to-srf-gold h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h4 className="font-heading text-lg text-srf-blue mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Recent Activity (Last 7 Days)
            </h4>
            <div className="flex gap-2">
              {recentActivity.map((date, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-br from-green-400 to-green-500 rounded-lg p-3 text-center"
                >
                  <div className="text-white text-xs mb-1">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-white text-xl">✓</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivational Message */}
        <div className="mt-6 p-4 bg-gradient-to-r from-srf-blue/10 to-srf-gold/10 rounded-lg border border-srf-gold/30">
          <p className="text-center text-sm text-gray-700 italic">
            {currentStreak >= 7
              ? '"Sainthood is not attained in a day. Spiritual truths come only through patient, persistent practice." — Paramahansa Yogananda'
              : '"Little by little, through patience and repeated effort, the mind will become stilled in the Self." — Paramahansa Yogananda'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
