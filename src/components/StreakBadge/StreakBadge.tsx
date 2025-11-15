import { Flame, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface StreakBadgeProps {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
}

export function StreakBadge({ currentStreak, longestStreak, totalDays }: StreakBadgeProps) {
  if (currentStreak === 0 && totalDays === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3"
    >
      <div className="flex items-center gap-1.5">
        <Flame className="w-4 h-4" />
        <span className="font-bold">{currentStreak}</span>
        <span className="text-sm opacity-90">day streak</span>
      </div>

      {longestStreak > currentStreak && (
        <>
          <div className="w-px h-4 bg-white/30"></div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 opacity-75" />
            <span className="text-sm opacity-90">Best: {longestStreak}</span>
          </div>
        </>
      )}

      <div className="w-px h-4 bg-white/30"></div>
      <div className="flex items-center gap-1.5">
        <TrendingUp className="w-4 h-4 opacity-75" />
        <span className="text-sm opacity-90">{totalDays} total</span>
      </div>
    </motion.div>
  );
}
