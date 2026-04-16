const SkeletonCardItem = () => (
  <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
    {/* Header bar */}
    <div className="mb-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>

    {/* Text lines */}
    <div className="mb-4 space-y-2">
      <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
    </div>

    {/* Tags area */}
    <div className="mb-4 flex gap-2">
      <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="h-6 w-14 rounded-full bg-slate-200 dark:bg-slate-700" />
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700">
      <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>
  </div>
);

const SkeletonCard = ({ count = 1 }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <SkeletonCardItem key={i} />
    ))}
  </>
);

export default SkeletonCard;
