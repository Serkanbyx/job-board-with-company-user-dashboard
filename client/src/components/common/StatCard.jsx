import { TrendingUp, TrendingDown } from 'lucide-react';

const COLOR_MAP = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-950/30',
    icon: 'text-primary-600 dark:text-primary-400',
    border: 'border-l-primary-500',
  },
  success: {
    bg: 'bg-success-50 dark:bg-green-950/30',
    icon: 'text-success-600 dark:text-green-400',
    border: 'border-l-success-500',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-amber-950/30',
    icon: 'text-warning-600 dark:text-amber-400',
    border: 'border-l-warning-500',
  },
  danger: {
    bg: 'bg-danger-50 dark:bg-red-950/30',
    icon: 'text-danger-600 dark:text-red-400',
    border: 'border-l-danger-500',
  },
  info: {
    bg: 'bg-info-50 dark:bg-cyan-950/30',
    icon: 'text-info-600 dark:text-cyan-400',
    border: 'border-l-info-500',
  },
};

const StatCard = ({ title, value, icon: Icon, color = 'primary', trend, subtitle }) => {
  const colors = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <div className={`rounded-xl border border-l-4 ${colors.border} border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>

          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-success-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger-600 dark:text-red-400" />
              )}
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-success-600 dark:text-green-400' : 'text-danger-600 dark:text-red-400'}`}>
                {trend.value}%
              </span>
            </div>
          )}

          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div className={`rounded-lg p-2.5 ${colors.bg}`}>
            <Icon className={`h-5 w-5 ${colors.icon}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
