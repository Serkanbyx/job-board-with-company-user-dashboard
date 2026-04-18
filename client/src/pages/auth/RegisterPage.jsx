import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  UserSearch,
  Building2,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Briefcase,
  MapPin,
  Globe,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import {
  COMPANY_INDUSTRIES,
  COMPANY_SIZES,
  EXPERIENCE_LEVELS,
} from '../../utils/constants';

const DASHBOARD_ROUTES = {
  candidate: '/candidate/dashboard',
  company: '/company/dashboard',
  admin: '/admin/dashboard',
};

/* ──────────────────────── Password strength helpers ──────────────────────── */

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 6) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-danger-500' };
  if (score <= 2) return { score, label: 'Medium', color: 'bg-warning-500' };
  return { score, label: 'Strong', color: 'bg-success-500' };
};

/* ──────────────────────────── Role cards data ────────────────────────────── */

const ROLES = [
  {
    value: 'candidate',
    title: "I'm looking for a job",
    description: 'Search and apply for job opportunities',
    Icon: UserSearch,
  },
  {
    value: 'company',
    title: "I'm hiring",
    description: 'Post jobs and find the best talent',
    Icon: Building2,
  },
];

/* ────────────────────────── Shared input component ───────────────────────── */

const FormInput = ({
  id,
  label,
  type = 'text',
  icon: Icon,
  required,
  className = '',
  ...rest
}) => (
  <div className={className}>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-danger-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}
      <input
        id={id}
        type={type}
        required={required}
        className={`w-full rounded-lg border border-slate-300 bg-white py-2.5 ${Icon ? 'pl-10' : 'pl-4'} pr-4 text-sm text-slate-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:border-primary-400`}
        {...rest}
      />
    </div>
  </div>
);

/* ────────────────────────── Shared select component ──────────────────────── */

const FormSelect = ({ id, label, options, required, className = '', ...rest }) => (
  <div className={className}>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-danger-500">*</span>}
    </label>
    <select
      id={id}
      required={required}
      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-primary-400"
      {...rest}
    >
      <option value="">Select...</option>
      {options.map((opt) =>
        typeof opt === 'string' ? (
          <option key={opt} value={opt}>{opt}</option>
        ) : (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ),
      )}
    </select>
  </div>
);

/* ══════════════════════════ MAIN COMPONENT ══════════════════════════════════ */

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    role: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyIndustry: '',
    companySize: '',
    companyWebsite: '',
    companyLocation: '',
    companyAbout: '',
    location: '',
    title: '',
    experienceLevel: '',
  });

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['candidate', 'company'].includes(roleParam) && !formData.role) {
      setFormData((prev) => ({ ...prev, role: roleParam }));
      setStep(2);
    }
  }, [searchParams]);

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password],
  );

  /* ─── Handlers ─── */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /* ─── Validation ─── */

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.role) newErrors.role = 'Please select a role';
    }

    if (currentStep === 2) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = 'Enter a valid email';

      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6)
        newErrors.password = 'At least 6 characters';
      else if (!/[A-Z]/.test(formData.password))
        newErrors.password = 'Include at least 1 uppercase letter';
      else if (!/[0-9]/.test(formData.password))
        newErrors.password = 'Include at least 1 number';

      if (!formData.confirmPassword)
        newErrors.confirmPassword = 'Please confirm your password';
      else if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match';
    }

    if (currentStep === 3 && formData.role === 'company') {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  /* ─── Submit ─── */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === 'company') {
        payload.companyName = formData.companyName;
        if (formData.companyIndustry) payload.companyIndustry = formData.companyIndustry;
        if (formData.companySize) payload.companySize = formData.companySize;
        if (formData.companyWebsite) payload.companyWebsite = formData.companyWebsite;
        if (formData.companyLocation) payload.companyLocation = formData.companyLocation;
        if (formData.companyAbout) payload.companyAbout = formData.companyAbout;
      } else {
        if (formData.title) payload.title = formData.title;
        if (formData.location) payload.location = formData.location;
        if (formData.experienceLevel) payload.experience = formData.experienceLevel;
      }

      const data = await register(payload);
      const role = data?.user?.role;
      navigate(DASHBOARD_ROUTES[role] || '/', { replace: true });
      toast.success('Welcome to JobBoard!');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Error message component ─── */

  const FieldError = ({ field }) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-danger-500">{errors[field]}</p>
    ) : null;

  /* ═══════════════════════════ STEP RENDERERS ═══════════════════════════════ */

  const renderStepOne = () => (
    <div className="step-content">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Join JobBoard</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Choose how you want to use JobBoard
        </p>
      </div>

      <div className="space-y-4">
        {ROLES.map(({ value, title, description, Icon }) => {
          const isSelected = formData.role === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, role: value }));
                if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
              }}
              className={`group flex w-full items-center gap-4 rounded-xl border-2 p-5 text-left transition-all ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 shadow-sm dark:border-primary-400 dark:bg-primary-900/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:hover:border-slate-500'
              }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-800 dark:text-primary-300'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 dark:bg-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
              </div>
              {isSelected && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <FieldError field="role" />

      <button
        type="button"
        onClick={handleNext}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
      >
        Continue <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );

  const renderStepTwo = () => (
    <div className="step-content">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Your Account</h1>
      </div>

      {/* Progress bar */}
      <div className="mb-8 flex gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-primary-500" />
        <div className="h-1.5 flex-1 rounded-full bg-primary-500" />
        <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-600" />
      </div>

      <div className="space-y-4">
        {/* First Name + Last Name */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FormInput
              id="firstName"
              name="firstName"
              label="First Name"
              icon={User}
              required
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
            />
            <FieldError field="firstName" />
          </div>
          <div>
            <FormInput
              id="lastName"
              name="lastName"
              label="Last Name"
              icon={User}
              required
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
            />
            <FieldError field="lastName" />
          </div>
        </div>

        {/* Email */}
        <div>
          <FormInput
            id="email"
            name="email"
            label="Email"
            type="email"
            icon={Mail}
            required
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />
          <FieldError field="email" />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Password <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:border-primary-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Password strength meter */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      level <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
              <p className={`mt-1 text-xs ${
                passwordStrength.score <= 1
                  ? 'text-danger-500'
                  : passwordStrength.score <= 2
                    ? 'text-warning-500'
                    : 'text-success-500'
              }`}>
                {passwordStrength.label}
              </p>
            </div>
          )}
          <FieldError field="password" />
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirm Password <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              required
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:border-primary-400"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError field="confirmPassword" />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="ml-auto flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderStepThreeCompany = () => (
    <div className="space-y-4">
      <div>
        <FormInput
          id="companyName"
          name="companyName"
          label="Company Name"
          icon={Building2}
          required
          placeholder="Acme Inc."
          value={formData.companyName}
          onChange={handleChange}
        />
        <FieldError field="companyName" />
      </div>

      <FormSelect
        id="companyIndustry"
        name="companyIndustry"
        label="Industry"
        options={COMPANY_INDUSTRIES}
        value={formData.companyIndustry}
        onChange={handleChange}
      />

      <FormSelect
        id="companySize"
        name="companySize"
        label="Company Size"
        options={COMPANY_SIZES}
        value={formData.companySize}
        onChange={handleChange}
      />

      <FormInput
        id="companyWebsite"
        name="companyWebsite"
        label="Company Website"
        icon={Globe}
        placeholder="https://example.com"
        value={formData.companyWebsite}
        onChange={handleChange}
      />

      <FormInput
        id="companyLocation"
        name="companyLocation"
        label="Location"
        icon={MapPin}
        placeholder="San Francisco, CA"
        value={formData.companyLocation}
        onChange={handleChange}
      />

      <div>
        <label htmlFor="companyAbout" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          About Company
        </label>
        <div className="relative">
          <textarea
            id="companyAbout"
            name="companyAbout"
            rows={3}
            maxLength={500}
            placeholder="Tell us about your company..."
            value={formData.companyAbout}
            onChange={handleChange}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:border-primary-400"
          />
        </div>
        <p className="mt-1 text-right text-xs text-slate-400">
          {formData.companyAbout.length}/500
        </p>
      </div>
    </div>
  );

  const renderStepThreeCandidate = () => (
    <div className="space-y-4">
      <FormInput
        id="title"
        name="title"
        label="Professional Title"
        icon={Briefcase}
        placeholder="e.g., Frontend Developer"
        value={formData.title}
        onChange={handleChange}
      />

      <FormInput
        id="location"
        name="location"
        label="Location"
        icon={MapPin}
        placeholder="San Francisco, CA"
        value={formData.location}
        onChange={handleChange}
      />

      <FormSelect
        id="experienceLevel"
        name="experienceLevel"
        label="Experience Level"
        options={EXPERIENCE_LEVELS}
        value={formData.experienceLevel}
        onChange={handleChange}
      />
    </div>
  );

  const renderStepThree = () => (
    <div className="step-content">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {formData.role === 'company' ? 'Company Details' : 'Your Profile'}
        </h1>
        <p className="mt-1 flex items-center justify-center gap-1 text-sm text-slate-500 dark:text-slate-400">
          <Info className="h-3.5 w-3.5" />
          {formData.role === 'company'
            ? 'Tell us about your company'
            : 'A few more details to get started'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 flex gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-primary-500" />
        <div className="h-1.5 flex-1 rounded-full bg-primary-500" />
        <div className="h-1.5 flex-1 rounded-full bg-primary-500" />
      </div>

      {formData.role === 'company' ? renderStepThreeCompany() : renderStepThreeCandidate()}

      {/* Buttons */}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="ml-auto flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </div>
  );

  /* ════════════════════════════════ RENDER ════════════════════════════════════ */

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-linear-to-br from-primary-50 to-slate-100 px-4 py-10 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-[480px] rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
        <form onSubmit={handleSubmit}>
          {step === 1 && renderStepOne()}
          {step === 2 && renderStepTwo()}
          {step === 3 && renderStepThree()}
        </form>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
