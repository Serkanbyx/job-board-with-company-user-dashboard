import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import {
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  EDUCATION_LEVELS,
  SALARY_CURRENCIES,
  SALARY_PERIODS,
} from '../../utils/constants';
import TagInput from '../common/TagInput';
import CharacterCounter from '../common/CharacterCounter';
import Spinner from '../common/Spinner';

const DESCRIPTION_MAX = 5000;
const TEXTAREA_MAX = 3000;
const DRAFT_KEY = 'jb_job_draft';
const AUTO_SAVE_INTERVAL = 30_000;

const POPULAR_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
  'Java', 'SQL', 'AWS', 'Docker', 'Git',
  'CSS', 'HTML', 'MongoDB', 'PostgreSQL', 'GraphQL',
];

const INITIAL_STATE = {
  title: '',
  description: '',
  requirements: '',
  responsibilities: '',
  benefits: '',
  type: '',
  location: '',
  experienceLevel: '',
  educationLevel: '',
  department: '',
  positions: 1,
  salary: { min: '', max: '', currency: 'USD', period: 'monthly' },
  skills: [],
  deadline: '',
};

const buildInitialState = (data) => {
  if (!data) return { ...INITIAL_STATE };
  return {
    title: data.title || '',
    description: data.description || '',
    requirements: data.requirements || '',
    responsibilities: data.responsibilities || '',
    benefits: data.benefits || '',
    type: data.type || '',
    location: data.location || '',
    experienceLevel: data.experienceLevel || '',
    educationLevel: data.educationLevel || '',
    department: data.department || '',
    positions: data.positions || 1,
    salary: {
      min: data.salary?.min || '',
      max: data.salary?.max || '',
      currency: data.salary?.currency || 'USD',
      period: data.salary?.period || 'monthly',
    },
    skills: data.skills || [],
    deadline: data.deadline ? data.deadline.slice(0, 10) : '',
  };
};

/* ─────────────────── Validation ─────────────────── */

const validate = (form) => {
  const errors = {};

  if (!form.title.trim()) errors.title = 'Title is required';
  if (!form.description.trim()) errors.description = 'Description is required';
  else if (form.description.trim().length < 50) errors.description = 'Description must be at least 50 characters';

  if (!form.type) errors.type = 'Job type is required';
  if (!form.location.trim()) errors.location = 'Location is required';

  if (form.skills.length < 1) errors.skills = 'At least 1 skill is required';

  if (form.deadline) {
    const deadlineDate = new Date(form.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate < today) errors.deadline = 'Deadline must be a future date';
  }

  if (form.salary.min && form.salary.max) {
    if (Number(form.salary.min) > Number(form.salary.max)) {
      errors.salaryMin = 'Min salary cannot exceed max salary';
    }
  }

  return errors;
};

/* ─────────────────── Component ─────────────────── */

const JobForm = ({ mode = 'create', initialData, onSubmit, isLoading = false }) => {
  const [form, setForm] = useState(() => buildInitialState(initialData));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const autoSaveRef = useRef(null);

  /* ── Draft restoration (only in create mode) ── */
  useEffect(() => {
    if (mode !== 'create') return;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setShowDraftPrompt(true);
    } catch { /* noop */ }
  }, [mode]);

  const restoreDraft = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
      if (saved) setForm(saved);
    } catch { /* noop */ }
    setShowDraftPrompt(false);
  };

  const dismissDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setShowDraftPrompt(false);
  };

  /* ── Auto-save draft (create mode only) ── */
  useEffect(() => {
    if (mode !== 'create') return;

    autoSaveRef.current = setInterval(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      } catch { /* noop */ }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(autoSaveRef.current);
  }, [form, mode]);

  /* ── Populate from initialData when editing ── */
  useEffect(() => {
    if (initialData) setForm(buildInitialState(initialData));
  }, [initialData]);

  /* ── Field handlers ── */
  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSalaryChange = useCallback((field, value) => {
    setForm((prev) => ({
      ...prev,
      salary: { ...prev.salary, [field]: value },
    }));
  }, []);

  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  /* ── Real-time validation ── */
  useEffect(() => {
    const newErrors = validate(form);
    setErrors(newErrors);
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  /* ── Submit ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      title: true, description: true, type: true,
      location: true, skills: true, deadline: true,
    });

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      const el = document.getElementById(firstErrorField);
      if (el) setTimeout(() => el.focus(), 50);
      return;
    }

    const payload = {
      ...form,
      salary: {
        ...form.salary,
        min: form.salary.min ? Number(form.salary.min) : undefined,
        max: form.salary.max ? Number(form.salary.max) : undefined,
      },
      positions: Number(form.positions) || 1,
    };

    if (mode === 'create') localStorage.removeItem(DRAFT_KEY);

    onSubmit(payload);
  };

  const fieldError = (field) =>
    touched[field] && errors[field] ? (
      <p id={`${field}-error`} role="alert" className="mt-1 text-xs text-danger-600 dark:text-red-400">{errors[field]}</p>
    ) : null;

  const ariaProps = (field, required = false) => ({
    ...(required && { 'aria-required': true }),
    ...(touched[field] && errors[field] && {
      'aria-invalid': true,
      'aria-describedby': `${field}-error`,
    }),
  });

  /* ─── Input base classes ─── */
  const inputBase =
    'w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:outline-none dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500';
  const inputNormal =
    'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20 dark:border-slate-600';
  const inputError =
    'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20 dark:border-red-500';

  const getInputClass = (field) =>
    `${inputBase} ${touched[field] && errors[field] ? inputError : inputNormal}`;

  return (
    <>
      {/* Draft prompt */}
      {showDraftPrompt && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-800 dark:bg-primary-950/30">
          <p className="text-sm text-primary-700 dark:text-primary-300">
            You have a saved draft. Would you like to resume?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
            >
              Resume Draft
            </button>
            <button
              type="button"
              onClick={dismissDraft}
              className="rounded-md border border-primary-300 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100 dark:border-primary-700 dark:text-primary-300"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* ── Left Column — Basic Information ── */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">
                Basic Information
              </h2>

              {/* Title */}
              <div className="mb-4">
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Job Title <span className="text-danger-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  onBlur={() => handleBlur('title')}
                  placeholder="e.g. Senior Frontend Developer"
                  className={getInputClass('title')}
                  {...ariaProps('title', true)}
                />
                {fieldError('title')}
              </div>

              {/* Description */}
              <div className="mb-4">
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description <span className="text-danger-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={6}
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                  placeholder="Describe the role, expectations and company culture..."
                  className={`resize-y ${getInputClass('description')}`}
                  maxLength={DESCRIPTION_MAX}
                  {...ariaProps('description', true)}
                />
                <div className="mt-1 flex items-center justify-between">
                  {fieldError('description') || <span />}
                  <CharacterCounter current={form.description.length} max={DESCRIPTION_MAX} />
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-4">
                <label htmlFor="requirements" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Requirements
                </label>
                <textarea
                  id="requirements"
                  rows={4}
                  value={form.requirements}
                  onChange={(e) => handleChange('requirements', e.target.value)}
                  placeholder="List the required qualifications..."
                  className={`resize-y ${inputBase} ${inputNormal}`}
                  maxLength={TEXTAREA_MAX}
                />
                <div className="mt-1 flex justify-end">
                  <CharacterCounter current={form.requirements.length} max={TEXTAREA_MAX} />
                </div>
              </div>

              {/* Responsibilities */}
              <div className="mb-4">
                <label htmlFor="responsibilities" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Responsibilities
                </label>
                <textarea
                  id="responsibilities"
                  rows={4}
                  value={form.responsibilities}
                  onChange={(e) => handleChange('responsibilities', e.target.value)}
                  placeholder="Outline the key responsibilities..."
                  className={`resize-y ${inputBase} ${inputNormal}`}
                  maxLength={TEXTAREA_MAX}
                />
                <div className="mt-1 flex justify-end">
                  <CharacterCounter current={form.responsibilities.length} max={TEXTAREA_MAX} />
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label htmlFor="benefits" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Benefits
                </label>
                <textarea
                  id="benefits"
                  rows={4}
                  value={form.benefits}
                  onChange={(e) => handleChange('benefits', e.target.value)}
                  placeholder="Describe the perks and benefits..."
                  className={`resize-y ${inputBase} ${inputNormal}`}
                  maxLength={TEXTAREA_MAX}
                />
                <div className="mt-1 flex justify-end">
                  <CharacterCounter current={form.benefits.length} max={TEXTAREA_MAX} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column — Job Details ── */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <h2 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">
                Job Details
              </h2>

              {/* Type */}
              <div className="mb-4">
                <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Job Type <span className="text-danger-500">*</span>
                </label>
                <select
                  id="type"
                  value={form.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  onBlur={() => handleBlur('type')}
                  className={getInputClass('type')}
                  {...ariaProps('type', true)}
                >
                  <option value="">Select type</option>
                  {JOB_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {fieldError('type')}
              </div>

              {/* Location */}
              <div className="mb-4">
                <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Location <span className="text-danger-500">*</span>
                </label>
                <input
                  id="location"
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  onBlur={() => handleBlur('location')}
                  placeholder="e.g. Istanbul, Turkey"
                  className={getInputClass('location')}
                  {...ariaProps('location', true)}
                />
                {fieldError('location')}
              </div>

              {/* Experience Level */}
              <div className="mb-4">
                <label htmlFor="experienceLevel" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Experience Level
                </label>
                <select
                  id="experienceLevel"
                  value={form.experienceLevel}
                  onChange={(e) => handleChange('experienceLevel', e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                >
                  <option value="">Select level</option>
                  {EXPERIENCE_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>

              {/* Education Level */}
              <div className="mb-4">
                <label htmlFor="educationLevel" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Education Level
                </label>
                <select
                  id="educationLevel"
                  value={form.educationLevel}
                  onChange={(e) => handleChange('educationLevel', e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                >
                  <option value="">Select level</option>
                  {EDUCATION_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="mb-4">
                <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Department
                </label>
                <input
                  id="department"
                  type="text"
                  value={form.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="e.g. Engineering"
                  className={`${inputBase} ${inputNormal}`}
                />
              </div>

              {/* Positions */}
              <div className="mb-4">
                <label htmlFor="positions" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Number of Positions
                </label>
                <input
                  id="positions"
                  type="number"
                  min={1}
                  value={form.positions}
                  onChange={(e) => handleChange('positions', e.target.value)}
                  className={`${inputBase} ${inputNormal}`}
                />
              </div>

              {/* Salary */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Salary Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      min={0}
                      value={form.salary.min}
                      onChange={(e) => handleSalaryChange('min', e.target.value)}
                      placeholder="Min"
                      className={`${inputBase} ${touched.salaryMin && errors.salaryMin ? inputError : inputNormal}`}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min={0}
                      value={form.salary.max}
                      onChange={(e) => handleSalaryChange('max', e.target.value)}
                      placeholder="Max"
                      className={`${inputBase} ${inputNormal}`}
                    />
                  </div>
                </div>
                {touched.salaryMin && errors.salaryMin && (
                  <p className="mt-1 text-xs text-danger-600 dark:text-red-400">{errors.salaryMin}</p>
                )}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <select
                    value={form.salary.currency}
                    onChange={(e) => handleSalaryChange('currency', e.target.value)}
                    className={`${inputBase} ${inputNormal}`}
                  >
                    {SALARY_CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <select
                    value={form.salary.period}
                    onChange={(e) => handleSalaryChange('period', e.target.value)}
                    className={`${inputBase} ${inputNormal}`}
                  >
                    {SALARY_PERIODS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Required Skills <span className="text-danger-500">*</span>
                </label>
                <TagInput
                  tags={form.skills}
                  onChange={(skills) => {
                    handleChange('skills', skills);
                  }}
                  placeholder="Type a skill and press Enter..."
                  maxTags={15}
                  suggestions={POPULAR_SKILLS}
                />
                {fieldError('skills')}
              </div>

              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Application Deadline
                </label>
                <input
                  id="deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => handleChange('deadline', e.target.value)}
                  onBlur={() => handleBlur('deadline')}
                  min={new Date().toISOString().slice(0, 10)}
                  className={getInputClass('deadline')}
                />
                {fieldError('deadline')}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Actions ── */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
          <Link
            to="/company/jobs"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                {mode === 'create' ? 'Posting...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === 'create' ? 'Post Job' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default JobForm;
