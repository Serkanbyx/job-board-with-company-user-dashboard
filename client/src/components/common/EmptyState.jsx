import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title, description, actionLabel, actionHref, onAction }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
      <Icon className="h-10 w-10 text-slate-400 dark:text-slate-500" />
    </div>

    <h3 className="mb-1 text-lg font-semibold text-slate-700 dark:text-slate-200">{title}</h3>

    {description && (
      <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
    )}

    {actionLabel && (actionHref || onAction) && (
      actionHref ? (
        <Link
          to={actionHref}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          onClick={onAction}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          {actionLabel}
        </button>
      )
    )}
  </div>
);

export default EmptyState;
