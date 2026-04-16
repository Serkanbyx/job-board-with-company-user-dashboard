import {
  Clock,
  Eye,
  Star,
  Users,
  Gift,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  reviewed: {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'text-sky-700 dark:text-sky-400',
    dot: 'bg-sky-500',
    icon: Eye,
  },
  shortlisted: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
    icon: Star,
  },
  interviewed: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-700 dark:text-indigo-400',
    dot: 'bg-indigo-500',
    icon: Users,
  },
  offered: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    icon: Gift,
  },
  hired: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
    icon: CheckCircle2,
  },
  rejected: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    icon: XCircle,
  },
  withdrawn: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-400',
    icon: MinusCircle,
  },
};

const SIZE_MAP = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.text} ${SIZE_MAP[size]}`}>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
