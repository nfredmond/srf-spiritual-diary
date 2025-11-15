import { motion } from 'framer-motion';
import { X, Award, Lock, Calendar as CalendarIcon } from 'lucide-react';
import type { Achievement } from '../../hooks/useAchievements';

interface AchievementsPanelProps {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  progress: number;
  onClose: () => void;
}

export function AchievementsPanel({
  achievements,
  unlockedCount,
  totalCount,
  progress,
  onClose,
}: AchievementsPanelProps) {
  const categories = {
    streak: achievements.filter(a => a.type === 'streak'),
    favorites: achievements.filter(a => a.type === 'favorites'),
    notes: achievements.filter(a => a.type === 'notes'),
    days: achievements.filter(a => a.type === 'days'),
    special: achievements.filter(a => a.type === 'special'),
  };

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
            <Award className="w-6 h-6 text-srf-gold" />
            Achievements
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-srf-blue">
              {unlockedCount} / {totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-srf-blue to-srf-gold h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {progress.toFixed(1)}% Complete
          </p>
        </div>

        {/* Achievement Categories */}
        <div className="space-y-6">
          {Object.entries(categories).map(([category, items]) => (
            <div key={category} className="bg-white rounded-xl p-4 shadow-sm">
              <h4 className="font-heading text-lg text-srf-blue mb-3 capitalize">
                {category === 'days' ? 'Exploration' : category}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      achievement.unlocked
                        ? 'border-srf-gold bg-gradient-to-br from-srf-gold/10 to-srf-gold/5'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-gray-900">
                            {achievement.title}
                          </h5>
                          {!achievement.unlocked && (
                            <Lock className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {achievement.description}
                        </p>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <div className="flex items-center gap-1 text-xs text-srf-gold">
                            <CalendarIcon className="w-3 h-3" />
                            <span>
                              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Motivational Message */}
        <div className="mt-6 p-4 bg-gradient-to-r from-srf-blue/10 to-srf-gold/10 rounded-lg border border-srf-gold/30">
          <p className="text-center text-sm text-gray-700 italic">
            "The season of failure is the best time for sowing the seeds of success."
            <br />
            <span className="text-xs text-gray-600 mt-1 block">— Paramahansa Yogananda</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
