import { APPLICATION_STATUSES } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatDate';

const STATUS_DOT_COLORS = {
  pending: 'bg-amber-500',
  reviewed: 'bg-sky-500',
  shortlisted: 'bg-blue-500',
  interviewed: 'bg-indigo-500',
  offered: 'bg-emerald-500',
  hired: 'bg-green-500',
  rejected: 'bg-red-500',
  withdrawn: 'bg-slate-400',
};

const StatusTimeline = ({ statusHistory = [] }) => {
  const sorted = [...statusHistory].sort(
    (a, b) => new Date(b.changedAt) - new Date(a.changedAt),
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No status history available.
      </p>
    );
  }

  return (
    <div className="relative">
      {sorted.map((entry, idx) => {
        const statusLabel =
          APPLICATION_STATUSES.find((s) => s.value === entry.status)?.label ||
          entry.status;
        const dotColor = STATUS_DOT_COLORS[entry.status] || 'bg-slate-400';
        const isLast = idx === sorted.length - 1;

        return (
          <div
            key={entry._id || idx}
            className="relative flex gap-4 pb-6 last:pb-0"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`z-10 h-3 w-3 shrink-0 rounded-full ring-4 ring-white dark:ring-slate-800 ${dotColor}`}
              />
              {!isLast && (
                <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" />
              )}
            </div>

            {/* Content */}
            <div className="-mt-0.5 min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {statusLabel}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {formatDateTime(entry.changedAt)}
              </p>
              {entry.note && (
                <p className="mt-1.5 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
                  {entry.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
