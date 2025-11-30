import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { NotificationItem } from './NotificationItem';
import { Button } from '../ui/Button';

export function NotificationsDropdown({ onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, markAllAsRead, loading } = useNotifications();

  const recentNotifications = notifications.slice(0, 10);

  const handleViewAll = () => {
    navigate('/notifications');
    if (onClose) onClose();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('notifications.notifications')}
        </h3>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <CheckCheck className="h-4 w-4" />
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('common.loading')}
            </p>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {t('notifications.noNotifications')}
            </p>
          </div>
        ) : (
          <div>
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {notifications.length > 10 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleViewAll}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {t('notifications.viewAll')}
          </Button>
        </div>
      )}
    </div>
  );
}
