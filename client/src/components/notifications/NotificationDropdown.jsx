import { useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';

// Note: outside-click and Escape handling is owned by the parent (Navbar),
// whose ref wraps both the trigger button and this dropdown. Adding another
// outside-click handler here would close the panel on mousedown and let the
// trigger's click handler reopen it immediately (toggle gets out of sync).
const NotificationDropdown = ({ isOpen }) => {
  const { notifications, unreadCount, refreshNotifications, markOneAsRead, markAllRead } =
    useNotifications();

  useEffect(() => {
    if (isOpen) {
      refreshNotifications();
    }
  }, [isOpen, refreshNotifications]);

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="animate-dropdown-in absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg sm:w-96 dark:border-slate-700 dark:bg-slate-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Notifications
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onRead={markOneAsRead}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <Bell className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No notifications yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
