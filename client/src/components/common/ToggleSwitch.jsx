const ToggleSwitch = ({ checked, onChange, disabled = false, label, description }) => {
  const handleKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <label className={`flex items-start gap-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <div
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:ring-2 focus:ring-primary-500/40 focus:outline-none ${
          checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </div>

      {(label || description) && (
        <div>
          {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>}
          {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
      )}
    </label>
  );
};

export default ToggleSwitch;
