import { useTranslation } from 'react-i18next';
import { COMPLAINT_STATUS } from '../../utils/constants';

export const ComplaintStatusBadge = ({ status }) => {
  const { t } = useTranslation();

  const statusConfig = {
    [COMPLAINT_STATUS.NEW]: {
      label: t('complaint.status.new'),
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    [COMPLAINT_STATUS.IN_PROGRESS]: {
      label: t('complaint.status.inProgress'),
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    },
    [COMPLAINT_STATUS.RESOLVED]: {
      label: t('complaint.status.resolved'),
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    [COMPLAINT_STATUS.CLOSED]: {
      label: t('complaint.status.closed'),
      className: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    },
  };

  const config = statusConfig[status] || statusConfig[COMPLAINT_STATUS.NEW];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};
