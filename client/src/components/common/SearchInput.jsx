import { Search, X } from 'lucide-react';
import Spinner from './Spinner';

const SearchInput = ({ value, onChange, placeholder = 'Search...', onClear, isLoading = false }) => (
  <div className="relative">
    {/* Left icon */}
    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <Search className="h-4 w-4 text-slate-400" />
      )}
    </div>

    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
    />

    {/* Clear button */}
    {value && (
      <button
        onClick={onClear || (() => onChange(''))}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
        aria-label="Clear search"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

export default SearchInput;
