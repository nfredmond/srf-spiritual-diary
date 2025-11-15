import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface CalendarViewProps {
  selectedDate: Date;
  favorites: string[];
  notesCount: Record<string, boolean>;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

export function CalendarView({
  selectedDate,
  favorites,
  notesCount,
  onSelectDate,
  onClose,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelectDate(newDate);
    onClose();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const getDateKey = (day: number) => {
    const month = currentMonth.getMonth() + 1;
    return `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const isFavorite = (day: number) => favorites.includes(getDateKey(day));
  const hasNote = (day: number) => notesCount[getDateKey(day)] || false;

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-srf-white to-srf-lotus/20 rounded-2xl p-6 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-2xl text-srf-blue">{monthName}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-srf-lotus/20 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-srf-blue" />
          </button>
          <div className="flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>Favorite</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-srf-gold" />
              <span>Has Note</span>
            </div>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-srf-lotus/20 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-srf-blue" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 pb-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const today = isToday(day);
            const selected = isSelected(day);
            const favorite = isFavorite(day);
            const note = hasNote(day);

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all ${
                  selected
                    ? 'bg-gradient-to-br from-srf-blue to-srf-gold text-white shadow-lg scale-105'
                    : today
                    ? 'bg-srf-blue/20 text-srf-blue font-bold'
                    : 'hover:bg-srf-lotus/30 text-gray-700'
                }`}
              >
                <span className={`text-sm ${selected ? 'font-bold' : ''}`}>{day}</span>
                {(favorite || note) && (
                  <div className="flex gap-1 mt-1">
                    {favorite && (
                      <Heart className={`w-3 h-3 ${selected ? 'text-white' : 'text-red-500'} fill-current`} />
                    )}
                    {note && (
                      <BookOpen className={`w-3 h-3 ${selected ? 'text-white' : 'text-srf-gold'}`} />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Click any day to view that day's wisdom
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
