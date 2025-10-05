import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useState } from 'react';
import { DatePickerModal } from './DatePickerModal';

interface DateNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateNavigator({ selectedDate, onDateChange }: DateNavigatorProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {/* Previous Day */}
      <button
        onClick={() => onDateChange(subDays(selectedDate, 1))}
        className="p-2 rounded-full hover:bg-srf-lotus/30 transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft className="w-6 h-6 text-srf-blue" />
      </button>

      {/* Current Date Display */}
      <button
        onClick={() => setShowPicker(true)}
        className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
      >
        <Calendar className="w-5 h-5 text-srf-gold" />
        <span className="font-heading text-lg text-srf-blue">
          {format(selectedDate, 'MMMM d')}
        </span>
      </button>

      {/* Next Day */}
      <button
        onClick={() => onDateChange(addDays(selectedDate, 1))}
        className="p-2 rounded-full hover:bg-srf-lotus/30 transition-colors"
        aria-label="Next day"
      >
        <ChevronRight className="w-6 h-6 text-srf-blue" />
      </button>

      {/* Today Button */}
      <button
        onClick={() => onDateChange(new Date())}
        className="px-4 py-2 text-sm bg-srf-blue text-white rounded-full hover:bg-srf-blue/90 transition-colors"
      >
        Today
      </button>

      {/* Date Picker Modal */}
      {showPicker && (
        <DatePickerModal
          selectedDate={selectedDate}
          onSelect={(date) => {
            onDateChange(date);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

