import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { getDaysInMonth } from 'date-fns';

interface DatePickerModalProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

export function DatePickerModal({ selectedDate, onSelect, onClose }: DatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const currentYear = new Date().getFullYear();
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onSelect(newDate);
  };

  const daysInMonth = getDaysInMonth(new Date(currentYear, currentMonth));
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className="rounded-2xl shadow-2xl p-6 max-w-md w-full border"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex justify-between items-center mb-5">
            <Dialog.Title
              className="font-heading text-2xl"
              style={{ color: 'var(--text-primary)' }}
            >
              Select a Date
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full transition-colors hover:bg-srf-lotus/30"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Month Selector */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {months.map((month, index) => (
              <button
                key={month}
                onClick={() => setCurrentMonth(index)}
                style={
                  currentMonth === index
                    ? undefined
                    : { color: 'var(--text-primary)', borderColor: 'var(--border-color)' }
                }
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  currentMonth === index
                    ? 'bg-srf-blue text-white'
                    : 'border hover:bg-srf-lotus/30'
                }`}
              >
                {month.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div
                key={i}
                className="text-center text-xs font-semibold py-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDate.getMonth() === currentMonth && selectedDate.getDate() === day;
              const isToday = new Date().getMonth() === currentMonth && new Date().getDate() === day;

              return (
                <button
                  key={day}
                  onClick={() => handleDateSelect(day)}
                  style={isSelected ? undefined : { color: 'var(--text-primary)' }}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-srf-blue text-white'
                      : isToday
                      ? 'bg-srf-gold/10 border border-srf-gold/60 hover:bg-srf-gold/20'
                      : 'hover:bg-srf-lotus/30'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

