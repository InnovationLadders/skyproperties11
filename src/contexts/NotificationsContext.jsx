import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getUserNotifications,
  getUnreadCount,
  subscribeToNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../utils/internalNotificationsService';

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      console.log('[NotificationsContext] No current user, clearing notifications');
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      setError(null);
      return;
    }

    console.log('[NotificationsContext] Setting up notifications for user:', currentUser.uid);
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToNotifications(
      currentUser.uid,
      (newNotifications) => {
        console.log('[NotificationsContext] Received notifications:', newNotifications.length);
        setNotifications(newNotifications);
        const unread = newNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('[NotificationsContext] Subscription error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) {
        console.log('[NotificationsContext] Unsubscribing from notifications');
        unsubscribe();
      }
    };
  }, [currentUser]);

  const refreshNotifications = async () => {
    if (!currentUser) return;

    try {
      console.log('[NotificationsContext] Refreshing notifications');
      const { notifications: newNotifications } = await getUserNotifications(currentUser.uid);
      setNotifications(newNotifications);

      const { count } = await getUnreadCount(currentUser.uid);
      setUnreadCount(count);
      setError(null);
    } catch (error) {
      console.error('[NotificationsContext] Error refreshing notifications:', error);
      setError(error.message);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;

    try {
      console.log('[NotificationsContext] Marking all as read');
      await markAllAsRead(currentUser.uid);
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('[NotificationsContext] Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
