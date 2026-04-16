const WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6', 'w-1/3'];

const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="animate-pulse overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
    {/* Header row */}
    <div className="grid bg-slate-100 px-4 py-3 dark:bg-slate-800" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }, (_, i) => (
        <div key={i} className="px-2">
          <div className="h-3 w-2/3 rounded bg-slate-300 dark:bg-slate-600" />
        </div>
      ))}
    </div>

    {/* Body rows */}
    {Array.from({ length: rows }, (_, rowIdx) => (
      <div
        key={rowIdx}
        className="grid border-t border-slate-100 px-4 py-3 dark:border-slate-700"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }, (_, colIdx) => (
          <div key={colIdx} className="px-2">
            <div className={`h-3 rounded bg-slate-200 dark:bg-slate-700 ${WIDTHS[(rowIdx + colIdx) % WIDTHS.length]}`} />
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default SkeletonTable;
