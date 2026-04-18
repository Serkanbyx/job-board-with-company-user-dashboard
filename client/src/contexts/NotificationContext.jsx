import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as notificationService from '../api/notificationService';

const NotificationContext = createContext(null);

const POLL_INTERVAL = 60 * 1000; // 60 seconds

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [prevIsAuthenticated, setPrevIsAuthenticated] = useState(isAuthenticated);
  const pollRef = useRef(null);

  // Reset notification state on auth transition (e.g. logout). Done during
  // render via the previous-value pattern so we avoid the cascading re-render
  // that would happen if we called setState inside an effect.
  if (isAuthenticated !== prevIsAuthenticated) {
    setPrevIsAuthenticated(isAuthenticated);
    if (!isAuthenticated) {
      setUnreadCount(0);
      setNotifications([]);
    }
  }

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.count);
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

  // Start polling when authenticated. The initial fetch is scheduled via
  // setTimeout(..., 0) so the resulting setState happens inside a callback
  // rather than synchronously within the effect body (avoids cascading renders).
  useEffect(() => {
    if (!isAuthenticated) return;

    const initialFetchId = setTimeout(refreshUnreadCount, 0);
    pollRef.current = setInterval(refreshUnreadCount, POLL_INTERVAL);

    return () => {
      clearTimeout(initialFetchId);
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
