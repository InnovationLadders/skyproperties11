import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, Filter } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { NotificationItem } from '../../components/notifications/NotificationItem';
import { useNotifications } from '../../contexts/NotificationsContext';
import { NOTIFICATION_CATEGORY } from '../../utils/constants';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { notifications, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'read' && !notification.isRead) return false;
    if (categoryFilter !== 'all' && notification.category !== categoryFilter) return false;
    return true;
  });

  const tabs = [
    { value: 'all', label: t('notifications.all') },
    { value: 'unread', label: t('notifications.unread') },
    { value: 'read', label: t('notifications.read') },
  ];

  const categories = [
    { value: 'all', label: t('notifications.allCategories') },
    { value: NOTIFICATION_CATEGORY.TICKETS, label: t('notifications.category.tickets') },
    { value: NOTIFICATION_CATEGORY.BILLING, label: t('notifications.category.billing') },
    { value: NOTIFICATION_CATEGORY.PERMITS, label: t('notifications.category.permits') },
    { value: NOTIFICATION_CATEGORY.BOOKINGS, label: t('notifications.category.bookings') },
    { value: NOTIFICATION_CATEGORY.CONTRACTS, label: t('notifications.category.contracts') },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Bell className="h-8 w-8" />
              {t('notifications.notifications')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('notifications.manageNotifications')}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="h-4 w-4 mr-2" />
              {t('notifications.markAllRead')}
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filter === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
                {tab.value === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                {t('common.loading')}
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('notifications.noNotifications')}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'unread'
                  ? t('notifications.allCaughtUp')
                  : t('notifications.noNotificationsDesc')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </Card>

        {filteredNotifications.length > 0 && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {t('notifications.showing', {
              count: filteredNotifications.length,
              total: notifications.length,
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
