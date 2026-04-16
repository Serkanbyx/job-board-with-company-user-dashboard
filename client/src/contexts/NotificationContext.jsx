import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import * as notificationService from '../api/notificationService';

const NotificationContext = createContext(null);

const POLL_INTERVAL = 60 * 1000; // 60 seconds

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const pollRef = useRef(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count);
    } catch {
      // Silently fail — polling will retry
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getMyNotifications({
        limit: 10,
        page: 1,
      });
      setNotifications(data.notifications || data.data || []);
    } catch {
      // Silently fail
    }
  }, []);

  const markOneAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationService.markAsRead(id);
    } catch {
      refreshUnreadCount();
      refreshNotifications();
    }
  }, [refreshUnreadCount, refreshNotifications]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await notificationService.markAllAsRead();
    } catch {
      refreshUnreadCount();
      refreshNotifications();
    }
  }, [refreshUnreadCount, refreshNotifications]);

  // Start polling when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    refreshUnreadCount();

    pollRef.current = setInterval(refreshUnreadCount, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAuthenticated, refreshUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        refreshNotifications,
        refreshUnreadCount,
        markOneAsRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  return context;
};
