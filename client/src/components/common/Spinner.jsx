const SIZE_MAP = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

const Spinner = ({ size = 'md', fullPage = false, text = '' }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3" aria-live="polite">
      <div
        role="status"
        aria-label="Loading"
        className={`${SIZE_MAP[size]} animate-spin rounded-full border-primary-200 border-t-primary-600 dark:border-slate-600 dark:border-t-primary-400`}
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Spinner;
