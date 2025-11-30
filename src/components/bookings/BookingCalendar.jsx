import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const BookingCalendar = ({ selectedDate, onDateSelect, bookedDates = [], minDate = new Date() }) => {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthNames = [
    t('common.january') || 'January',
    t('common.february') || 'February',
    t('common.march') || 'March',
    t('common.april') || 'April',
    t('common.may') || 'May',
    t('common.june') || 'June',
    t('common.july') || 'July',
    t('common.august') || 'August',
    t('common.september') || 'September',
    t('common.october') || 'October',
    t('common.november') || 'November',
    t('common.december') || 'December'
  ];

  const dayNames = [
    t('common.sun') || 'Sun',
    t('common.mon') || 'Mon',
    t('common.tue') || 'Tue',
    t('common.wed') || 'Wed',
    t('common.thu') || 'Thu',
    t('common.fri') || 'Fri',
    t('common.sat') || 'Sat'
  ];

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateBooked = (date) => {
    return bookedDates.some(bookedDate => {
      const booked = bookedDate.toDate ? bookedDate.toDate() : new Date(bookedDate);
      return (
        booked.getDate() === date.getDate() &&
        booked.getMonth() === date.getMonth() &&
        booked.getFullYear() === date.getFullYear()
      );
    });
  };

  const isDateDisabled = (date) => {
    return date < minDate;
  };

  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    const selected = selectedDate.toDate ? selectedDate.toDate() : new Date(selectedDate);
    return (
      selected.getDate() === date.getDate() &&
      selected.getMonth() === date.getMonth() &&
      selected.getFullYear() === date.getFullYear()
    );
  };

  const handleDateClick = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDateDisabled(date)) {
      onDateSelect(date);
    }
  };

  const renderDays = () => {
    const days = [];
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const day = i - firstDayOfMonth + 1;

      if (i < firstDayOfMonth || day > daysInMonth) {
        days.push(
          <div key={i} className="aspect-square" />
        );
      } else {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const isBooked = isDateBooked(date);
        const isDisabled = isDateDisabled(date);
        const isSelected = isDateSelected(date);

        days.push(
          <button
            key={i}
            type="button"
            onClick={() => handleDateClick(day)}
            disabled={isDisabled}
            className={`
              aspect-square rounded-lg text-sm font-medium transition-all
              ${isSelected ? 'bg-primary text-primary-foreground' : ''}
              ${isBooked && !isSelected ? 'bg-red-100 text-red-700 cursor-not-allowed' : ''}
              ${!isSelected && !isBooked && !isDisabled ? 'hover:bg-muted' : ''}
              ${isDisabled ? 'text-muted-foreground cursor-not-allowed opacity-40' : ''}
              ${!isDisabled && !isBooked && !isSelected ? 'hover:border hover:border-primary' : ''}
            `}
          >
            {day}
          </button>
        );
      }
    }

    return days;
  };

  return (
    <div className="w-full bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={previousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h3 className="font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="aspect-square flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {renderDays()}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span>{t('booking.selected')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100" />
          <span>{t('booking.booked')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted" />
          <span>{t('booking.available')}</span>
        </div>
      </div>
    </div>
  );
};
