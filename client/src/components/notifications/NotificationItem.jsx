import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  Bell,
  MessageSquare,
  Star,
} from 'lucide-react';
import { formatRelativeDate } from '../../utils/formatDate';

const ICON_MAP = {
  application_received: { icon: FileText, className: 'text-primary-500 bg-primary-50 dark:bg-primary-950/30' },
  application_status: { icon: CheckCircle, className: 'text-success-500 bg-success-50 dark:bg-green-950/30' },
  application_rejected: { icon: XCircle, className: 'text-danger-500 bg-danger-50 dark:bg-red-950/30' },
  new_job: { icon: Briefcase, className: 'text-info-500 bg-info-50 dark:bg-cyan-950/30' },
  message: { icon: MessageSquare, className: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30' },
  review: { icon: Star, className: 'text-warning-500 bg-warning-50 dark:bg-yellow-950/30' },
};

const DEFAULT_ICON = { icon: Bell, className: 'text-slate-500 bg-slate-100 dark:bg-slate-700' };

const NotificationItem = ({ notification, onRead }) => {
  const navigate = useNavigate();
  const { icon: Icon, className: iconClassName } = ICON_MAP[notification.type] || DEFAULT_ICON;

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
        !notification.isRead ? 'bg-primary-50/50 dark:bg-primary-950/10' : ''
      }`}
    >
      <div className={`mt-0.5 shrink-0 rounded-full p-2 ${iconClassName}`}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {formatRelativeDate(notification.createdAt)}
        </p>
      </div>

      {!notification.isRead && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
      )}
    </button>
  );
};

export default NotificationItem;
