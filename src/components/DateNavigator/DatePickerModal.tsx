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
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="font-heading text-2xl text-srf-blue">
              Select a Date
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Month Selector */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {months.map((month, index) => (
              <button
                key={month}
                onClick={() => setCurrentMonth(index)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  currentMonth === index
                    ? 'bg-srf-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {month.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-gray-500 py-2">
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
                  className={`
                    py-2 rounded-lg text-sm font-medium transition-colors
                    ${isSelected ? 'bg-srf-blue text-white' : ''}
                    ${!isSelected && isToday ? 'bg-srf-gold/20 text-srf-blue' : ''}
                    ${!isSelected && !isToday ? 'hover:bg-gray-100' : ''}
                  `}
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

