const CharacterCounter = ({ current, max, threshold = 0.8 }) => {
  const ratio = current / max;

  const color =
    current >= max
      ? 'text-danger-600 dark:text-red-400'
      : ratio >= threshold
        ? 'text-warning-600 dark:text-amber-400'
        : 'text-slate-400 dark:text-slate-500';

  return (
    <span className={`text-xs font-medium ${color}`}>
      {current} / {max}
    </span>
  );
};

export default CharacterCounter;
