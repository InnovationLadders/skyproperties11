import { useTranslation } from 'react-i18next';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';

export const TimeSlotPicker = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  minTime = '00:00',
  maxTime = '23:59',
  availableSlots = [],
  label = true
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {label && (
        <div className="text-sm font-medium">
          {t('booking.selectTimeSlot')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">{t('booking.startTime')} *</Label>
          <Input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            min={minTime}
            max={maxTime}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">{t('booking.endTime')} *</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            min={startTime || minTime}
            max={maxTime}
            required
          />
        </div>
      </div>

      {availableSlots.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            {t('booking.suggestedSlots')}:
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSlots.map((slot, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  onStartTimeChange(slot.start);
                  onEndTimeChange(slot.end);
                }}
                className="px-3 py-1.5 text-sm border rounded-md hover:bg-muted transition-colors"
              >
                {slot.start} - {slot.end}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        {t('booking.availableHours')}: {minTime} - {maxTime}
      </div>
    </div>
  );
};
