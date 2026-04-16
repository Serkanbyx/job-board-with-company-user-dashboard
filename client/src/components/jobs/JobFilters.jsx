import { useState } from 'react';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import TagInput from '../common/TagInput';
import {
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  EDUCATION_LEVELS,
  COMPANY_INDUSTRIES,
  POSTED_WITHIN_OPTIONS,
} from '../../utils/constants';

const FilterAccordion = ({ title, count, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-200 py-3 last:border-b-0 dark:border-slate-700">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
      >
        <span className="flex items-center gap-2">
          {title}
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-100 px-1.5 text-xs font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
};

const CheckboxGroup = ({ options, selected = [], onChange, stats = {} }) => (
  <div className="space-y-2">
    {options.map(({ value, label }) => (
      <label
        key={value}
        className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <input
          type="checkbox"
          checked={selected.includes(value)}
          onChange={() => {
            const next = selected.includes(value)
              ? selected.filter((v) => v !== value)
              : [...selected, value];
            onChange(next);
          }}
          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800"
        />
        <span className="flex-1">{label}</span>
        {stats[value] !== undefined && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            ({stats[value]})
          </span>
        )}
      </label>
    ))}
  </div>
);

const RadioGroup = ({ options, selected, onChange }) => (
  <div className="space-y-2">
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
      <input
        type="radio"
        checked={!selected}
        onChange={() => onChange('')}
        className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800"
      />
      <span>Any time</span>
    </label>
    {options.map(({ value, label }) => (
      <label
        key={value}
        className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <input
          type="radio"
          checked={selected === value}
          onChange={() => onChange(value)}
          className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800"
        />
        <span>{label}</span>
      </label>
    ))}
  </div>
);

const JobFilters = ({ filters, onFilterChange, onClearAll, stats = {}, isOpen, onClose }) => {
  const activeFilterCount = [
    filters.type?.length,
    filters.experience?.length,
    filters.education?.length,
    filters.industry?.length,
    filters.location ? 1 : 0,
    filters.salaryMin ? 1 : 0,
    filters.salaryMax ? 1 : 0,
    filters.skills?.length,
    filters.postedWithin ? 1 : 0,
  ].reduce((sum, val) => sum + (val || 0), 0);

  const filterContent = (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Job Type */}
      <FilterAccordion
        title="Job Type"
        count={filters.type?.length || 0}
        defaultOpen
      >
        <CheckboxGroup
          options={JOB_TYPES}
          selected={filters.type || []}
          onChange={(val) => onFilterChange('type', val)}
          stats={stats.types || {}}
        />
      </FilterAccordion>

      {/* Experience Level */}
      <FilterAccordion
        title="Experience Level"
        count={filters.experience?.length || 0}
        defaultOpen
      >
        <CheckboxGroup
          options={EXPERIENCE_LEVELS}
          selected={filters.experience || []}
          onChange={(val) => onFilterChange('experience', val)}
        />
      </FilterAccordion>

      {/* Location */}
      <FilterAccordion title="Location" count={filters.location ? 1 : 0}>
        <input
          type="text"
          value={filters.location || ''}
          onChange={(e) => onFilterChange('location', e.target.value)}
          placeholder="Search location..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
        />
      </FilterAccordion>

      {/* Salary Range */}
      <FilterAccordion
        title="Salary Range"
        count={(filters.salaryMin ? 1 : 0) + (filters.salaryMax ? 1 : 0)}
      >
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-400">
              $
            </span>
            <input
              type="number"
              value={filters.salaryMin || ''}
              onChange={(e) => onFilterChange('salaryMin', e.target.value)}
              placeholder="Min"
              min="0"
              className="w-full rounded-lg border border-slate-300 py-2 pl-7 pr-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <span className="text-sm text-slate-400">—</span>
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-400">
              $
            </span>
            <input
              type="number"
              value={filters.salaryMax || ''}
              onChange={(e) => onFilterChange('salaryMax', e.target.value)}
              placeholder="Max"
              min="0"
              className="w-full rounded-lg border border-slate-300 py-2 pl-7 pr-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
      </FilterAccordion>

      {/* Skills */}
      <FilterAccordion title="Skills" count={filters.skills?.length || 0}>
        <TagInput
          tags={filters.skills || []}
          onChange={(val) => onFilterChange('skills', val)}
          placeholder="Add a skill..."
          maxTags={10}
        />
        {stats.popularSkills?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {stats.popularSkills
              .filter((s) => !(filters.skills || []).includes(s))
              .slice(0, 8)
              .map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => onFilterChange('skills', [...(filters.skills || []), skill])}
                  className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-500 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-primary-700 dark:hover:bg-primary-950/30 dark:hover:text-primary-400"
                >
                  + {skill}
                </button>
              ))}
          </div>
        )}
      </FilterAccordion>

      {/* Education */}
      <FilterAccordion
        title="Education"
        count={filters.education?.length || 0}
      >
        <CheckboxGroup
          options={EDUCATION_LEVELS}
          selected={filters.education || []}
          onChange={(val) => onFilterChange('education', val)}
        />
      </FilterAccordion>

      {/* Industry */}
      <FilterAccordion
        title="Industry"
        count={filters.industry?.length || 0}
      >
        <CheckboxGroup
          options={COMPANY_INDUSTRIES}
          selected={filters.industry || []}
          onChange={(val) => onFilterChange('industry', val)}
        />
      </FilterAccordion>

      {/* Posted Within */}
      <FilterAccordion title="Posted Within" count={filters.postedWithin ? 1 : 0}>
        <RadioGroup
          options={POSTED_WITHIN_OPTIONS}
          selected={filters.postedWithin || ''}
          onChange={(val) => onFilterChange('postedWithin', val)}
        />
      </FilterAccordion>
    </div>
  );

  // Mobile: slide-in sheet overlay
  if (typeof isOpen !== 'undefined') {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}

        {/* Slide-in panel */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform overflow-y-auto bg-white p-5 shadow-2xl transition-transform duration-300 lg:hidden dark:bg-slate-800 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filters</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {filterContent}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClearAll}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Desktop: static sidebar */}
        <aside className="sticky top-24 hidden h-fit w-[280px] shrink-0 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 lg:block dark:border-slate-700 dark:bg-slate-800">
          {filterContent}
        </aside>
      </>
    );
  }

  // Default: static sidebar only
  return (
    <aside className="sticky top-24 h-fit w-[280px] shrink-0 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      {filterContent}
    </aside>
  );
};

export default JobFilters;
