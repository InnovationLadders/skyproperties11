import { useTranslation } from 'react-i18next';
import { COMPLAINT_PRIORITY } from '../../utils/constants';
import { AlertCircle } from 'lucide-react';

export const ComplaintPriorityBadge = ({ priority }) => {
  const { t } = useTranslation();

  const priorityConfig = {
    [COMPLAINT_PRIORITY.NORMAL]: {
      label: t('complaint.priority.normal'),
      className: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    },
    [COMPLAINT_PRIORITY.MEDIUM]: {
      label: t('complaint.priority.medium'),
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    },
    [COMPLAINT_PRIORITY.HIGH]: {
      label: t('complaint.priority.high'),
      className: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
    },
    [COMPLAINT_PRIORITY.URGENT]: {
      label: t('complaint.priority.urgent'),
      className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
    },
  };

  const config = priorityConfig[priority] || priorityConfig[COMPLAINT_PRIORITY.NORMAL];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      <AlertCircle className="h-3 w-3" />
      {config.label}
    </span>
  );
};
