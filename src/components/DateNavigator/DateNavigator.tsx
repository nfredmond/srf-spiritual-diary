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
    <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
      {/* Previous Day */}
      <button
        onClick={() => onDateChange(subDays(selectedDate, 1))}
        className="min-h-11 min-w-11 p-2.5 rounded-full bg-white border border-srf-blue/20 hover:bg-srf-lotus/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-srf-blue"
        aria-label="Previous day"
        title="Previous day"
      >
        <ChevronLeft className="w-6 h-6 text-srf-blue" />
      </button>

      {/* Current Date Display */}
      <button
        onClick={() => setShowPicker(true)}
        className="flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-srf-blue/20 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-srf-blue"
        title="Choose a date"
      >
        <Calendar className="w-5 h-5 text-srf-gold" />
        <span className="font-heading text-lg text-srf-blue">
          {format(selectedDate, 'MMMM d')}
        </span>
      </button>

      {/* Next Day */}
      <button
        onClick={() => onDateChange(addDays(selectedDate, 1))}
        className="min-h-11 min-w-11 p-2.5 rounded-full bg-white border border-srf-blue/20 hover:bg-srf-lotus/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-srf-blue"
        aria-label="Next day"
        title="Next day"
      >
        <ChevronRight className="w-6 h-6 text-srf-blue" />
      </button>

      {/* Today Button */}
      <button
        onClick={() => onDateChange(new Date())}
        className="px-5 py-2.5 text-sm font-medium bg-srf-blue text-white rounded-full hover:bg-srf-blue/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-srf-blue"
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

