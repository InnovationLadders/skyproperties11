import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, XCircle, Ban, Check } from 'lucide-react';
import { BOOKING_STATUS } from '../../utils/constants';

export const BookingStatusBadge = ({ status }) => {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (status) {
      case BOOKING_STATUS.PENDING:
        return {
          label: t('booking.pending'),
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
        };
      case BOOKING_STATUS.APPROVED:
        return {
          label: t('booking.approved'),
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-300'
        };
      case BOOKING_STATUS.REJECTED:
        return {
          label: t('booking.rejected'),
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-300'
        };
      case BOOKING_STATUS.CANCELLED:
        return {
          label: t('booking.cancelled'),
          icon: Ban,
          className: 'bg-gray-100 text-gray-800 border-gray-300'
        };
      case BOOKING_STATUS.COMPLETED:
        return {
          label: t('booking.completed'),
          icon: Check,
          className: 'bg-blue-100 text-blue-800 border-blue-300'
        };
      default:
        return {
          label: status,
          icon: Clock,
          className: 'bg-gray-100 text-gray-800 border-gray-300'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
};
