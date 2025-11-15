import { useState, useEffect } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'favorites' | 'notes' | 'days' | 'special';
  unlocked: boolean;
  unlockedAt?: number;
}

const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Streak Achievements
  { id: 'streak_3', title: 'First Steps', description: 'Maintain a 3-day reading streak', icon: '🌱', requirement: 3, type: 'streak' },
  { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day reading streak', icon: '⭐', requirement: 7, type: 'streak' },
  { id: 'streak_30', title: 'Monthly Master', description: 'Maintain a 30-day reading streak', icon: '🏆', requirement: 30, type: 'streak' },
  { id: 'streak_100', title: 'Century Scholar', description: 'Maintain a 100-day reading streak', icon: '💎', requirement: 100, type: 'streak' },
  { id: 'streak_365', title: 'Yearly Yogi', description: 'Maintain a 365-day reading streak', icon: '👑', requirement: 365, type: 'streak' },

  // Favorites Achievements
  { id: 'fav_10', title: 'Collector', description: 'Save 10 favorite quotes', icon: '❤️', requirement: 10, type: 'favorites' },
  { id: 'fav_50', title: 'Curator', description: 'Save 50 favorite quotes', icon: '💖', requirement: 50, type: 'favorites' },
  { id: 'fav_100', title: 'Wisdom Keeper', description: 'Save 100 favorite quotes', icon: '💝', requirement: 100, type: 'favorites' },

  // Notes Achievements
  { id: 'notes_5', title: 'Reflective Soul', description: 'Write 5 personal notes', icon: '📝', requirement: 5, type: 'notes' },
  { id: 'notes_25', title: 'Thoughtful Seeker', description: 'Write 25 personal notes', icon: '📖', requirement: 25, type: 'notes' },
  { id: 'notes_100', title: 'Master Chronicler', description: 'Write 100 personal notes', icon: '📚', requirement: 100, type: 'notes' },

  // Days Achievements
  { id: 'days_30', title: 'Explorer', description: 'Visit 30 different days', icon: '🗓️', requirement: 30, type: 'days' },
  { id: 'days_100', title: 'Wanderer', description: 'Visit 100 different days', icon: '🌍', requirement: 100, type: 'days' },
  { id: 'days_365', title: 'Complete Journey', description: 'Visit all 365 days', icon: '🌟', requirement: 365, type: 'days' },

  // Special Achievements
  { id: 'first_visit', title: 'Welcome!', description: 'Start your spiritual journey', icon: '🪷', requirement: 1, type: 'special' },
  { id: 'first_favorite', title: 'First Love', description: 'Save your first favorite quote', icon: '💫', requirement: 1, type: 'special' },
  { id: 'first_note', title: 'First Reflection', description: 'Write your first note', icon: '✍️', requirement: 1, type: 'special' },
  { id: 'meditation_master', title: 'Meditation Master', description: 'Complete 10 meditation sessions', icon: '🧘', requirement: 10, type: 'special' },
];

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('srf-achievements');
    if (stored) {
      try {
        setAchievements(JSON.parse(stored));
      } catch (e) {
        initializeAchievements();
      }
    } else {
      initializeAchievements();
    }
  }, []);

  const initializeAchievements = () => {
    const initial = ACHIEVEMENTS.map(ach => ({
      ...ach,
      unlocked: false,
    }));
    setAchievements(initial);
    localStorage.setItem('srf-achievements', JSON.stringify(initial));
  };

  const checkAchievements = (stats: {
    currentStreak: number;
    favoritesCount: number;
    notesCount: number;
    totalDays: number;
    meditationCount?: number;
  }) => {
    const updated = achievements.map(ach => {
      if (ach.unlocked) return ach;

      let shouldUnlock = false;

      switch (ach.type) {
        case 'streak':
          shouldUnlock = stats.currentStreak >= ach.requirement;
          break;
        case 'favorites':
          shouldUnlock = stats.favoritesCount >= ach.requirement;
          break;
        case 'notes':
          shouldUnlock = stats.notesCount >= ach.requirement;
          break;
        case 'days':
          shouldUnlock = stats.totalDays >= ach.requirement;
          break;
        case 'special':
          if (ach.id === 'first_visit') shouldUnlock = stats.totalDays >= 1;
          if (ach.id === 'first_favorite') shouldUnlock = stats.favoritesCount >= 1;
          if (ach.id === 'first_note') shouldUnlock = stats.notesCount >= 1;
          if (ach.id === 'meditation_master') shouldUnlock = (stats.meditationCount || 0) >= 10;
          break;
      }

      if (shouldUnlock) {
        return { ...ach, unlocked: true, unlockedAt: Date.now() };
      }

      return ach;
    });

    setAchievements(updated);
    localStorage.setItem('srf-achievements', JSON.stringify(updated));

    // Return newly unlocked achievements
    return updated.filter((ach, i) => ach.unlocked && !achievements[i].unlocked);
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return {
    achievements,
    checkAchievements,
    unlockedCount,
    totalCount,
    progress,
  };
}
