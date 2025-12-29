import { useTranslation } from 'react-i18next';
import { CONTACT_REQUEST_STATUS } from '../../utils/constants';

export const ContactRequestStatusBadge = ({ status }) => {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (status) {
      case CONTACT_REQUEST_STATUS.NEW:
        return {
          label: t('contactRequest.statusNew'),
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case CONTACT_REQUEST_STATUS.READ:
        return {
          label: t('contactRequest.statusRead'),
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case CONTACT_REQUEST_STATUS.RESPONDED:
        return {
          label: t('contactRequest.statusResponded'),
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case CONTACT_REQUEST_STATUS.CLOSED:
        return {
          label: t('contactRequest.statusClosed'),
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};
