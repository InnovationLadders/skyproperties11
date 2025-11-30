import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import {
  FileText,
  DollarSign,
  ShieldCheck,
  Calendar,
  FileCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { NOTIFICATION_CATEGORY } from '../../utils/constants';

export function NotificationItem({ notification, onClose }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { markAsRead, deleteNotification } = useNotifications();

  const getIcon = () => {
    switch (notification.category) {
      case NOTIFICATION_CATEGORY.TICKETS:
        return FileText;
      case NOTIFICATION_CATEGORY.BILLING:
        return DollarSign;
      case NOTIFICATION_CATEGORY.PERMITS:
        return ShieldCheck;
      case NOTIFICATION_CATEGORY.BOOKINGS:
        return Calendar;
      case NOTIFICATION_CATEGORY.CONTRACTS:
        return FileCheck;
      default:
        return AlertCircle;
    }
  };

  const getColor = () => {
    if (notification.type.includes('rejected') || notification.type.includes('revoked')) {
      return 'text-red-500';
    }
    if (notification.type.includes('approved') || notification.type.includes('completed')) {
      return 'text-green-500';
    }
    if (notification.type.includes('reminder') || notification.type.includes('expiring')) {
      return 'text-yellow-500';
    }
    return 'text-blue-500';
  };

  const Icon = getIcon();

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      if (onClose) onClose();
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  const getTimeAgo = () => {
    try {
      const date = notification.createdAt?.toDate?.() || new Date(notification.createdAt);
      const locale = i18n.language === 'ar' ? ar : enUS;
      return formatDistanceToNow(date, { addSuffix: true, locale });
    } catch (error) {
      return '';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${getColor()}`}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {t(notification.title)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t(notification.message, notification.metadata)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {getTimeAgo()}
          </p>
        </div>

        <button
          onClick={handleDelete}
          className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          aria-label="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {!notification.isRead && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r" />
      )}
    </div>
  );
}
