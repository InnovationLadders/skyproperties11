import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { REPORT_PERIODS } from '../../utils/constants';

export function DateRangePicker({ onRangeChange, selectedPeriod, onPeriodChange }) {
  const { t } = useTranslation();
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handlePeriodClick = (period) => {
    onPeriodChange(period);
    if (period !== REPORT_PERIODS.CUSTOM && onRangeChange) {
      onRangeChange(period);
    }
  };

  const handleCustomApply = () => {
    if (customStart && customEnd && onRangeChange) {
      onRangeChange(REPORT_PERIODS.CUSTOM, new Date(customStart), new Date(customEnd));
    }
  };

  const periods = [
    { value: REPORT_PERIODS.MONTHLY, label: t('reports.monthly') },
    { value: REPORT_PERIODS.QUARTERLY, label: t('reports.quarterly') },
    { value: REPORT_PERIODS.YEARLY, label: t('reports.yearly') },
    { value: REPORT_PERIODS.CUSTOM, label: t('reports.custom') },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {periods.map((period) => (
          <Button
            key={period.value}
            variant={selectedPeriod === period.value ? 'default' : 'outline'}
            onClick={() => handlePeriodClick(period.value)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {selectedPeriod === REPORT_PERIODS.CUSTOM && (
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="start-date">{t('reports.startDate')}</Label>
            <Input
              id="start-date"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="end-date">{t('reports.endDate')}</Label>
            <Input
              id="end-date"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
            />
          </div>
          <Button onClick={handleCustomApply}>
            <Calendar className="h-4 w-4 mr-2" />
            {t('reports.apply')}
          </Button>
        </div>
      )}
    </div>
  );
}
