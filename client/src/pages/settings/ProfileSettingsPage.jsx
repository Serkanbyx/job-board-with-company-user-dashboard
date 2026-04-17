import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Upload, FileText, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../api/authService';
import * as uploadService from '../../api/uploadService';
import TagInput from '../../components/common/TagInput';
import CharacterCounter from '../../components/common/CharacterCounter';
import {
  EXPERIENCE_LEVELS,
  COMPANY_SIZES,
  COMPANY_INDUSTRIES,
  SALARY_CURRENCIES,
} from '../../utils/constants';

const BIO_MAX = 2000;
const ABOUT_MAX = 3000;

const POPULAR_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
  'Java', 'SQL', 'AWS', 'Docker', 'Git',
  'CSS', 'HTML', 'MongoDB', 'PostgreSQL', 'GraphQL',
];

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500';

const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';

const URL_FIELDS = {
  portfolioUrl: 'Portfolio URL',
  linkedinUrl: 'LinkedIn URL',
  githubUrl: 'GitHub URL',
  companyWebsite: 'Company Website',
  socialLinkedin: 'LinkedIn',
  socialTwitter: 'Twitter',
  socialFacebook: 'Facebook',
};

const isValidHttpUrl = (value) => {
  if (!value) return true; // empty is allowed (fields are optional)
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const ProfileSettingsPage = () => {
  const { user, isCandidate, isCompany, updateUser } = useAuth();
  const [formData, setFormData] = useState({});
  const [initialData, setInitialData] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const avatarInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const buildFormData = useCallback(
    (u) => ({
      firstName: u?.firstName || '',
      lastName: u?.lastName || '',
      phone: u?.phone || '',
      location: u?.location || '',
      avatar: u?.avatar || '',
      // Candidate
      title: u?.title || '',
      bio: u?.bio || '',
      skills: u?.skills || [],
      experience: u?.experience || '',
      cvUrl: u?.cvUrl || '',
      portfolioUrl: u?.portfolioUrl || '',
      linkedinUrl: u?.linkedinUrl || '',
      githubUrl: u?.githubUrl || '',
      desiredSalaryMin: u?.desiredSalary?.min || '',
      desiredSalaryMax: u?.desiredSalary?.max || '',
      desiredSalaryCurrency: u?.desiredSalary?.currency || 'USD',
      // Company
      companyName: u?.companyName || '',
      companyLogo: u?.companyLogo || '',
      companyIndustry: u?.companyIndustry || '',
      companySize: u?.companySize || '',
      companyWebsite: u?.companyWebsite || '',
      companyLocation: u?.companyLocation || '',
      companyFounded: u?.companyFounded || '',
      companyAbout: u?.companyAbout || '',
      socialLinkedin: u?.companySocials?.linkedin || '',
      socialTwitter: u?.companySocials?.twitter || '',
      socialFacebook: u?.companySocials?.facebook || '',
    }),
    []
  );

  useEffect(() => {
    if (user) {
      const data = buildFormData(user);
      setFormData(data);
      setInitialData(data);
    }
  }, [user, buildFormData]);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const next = {};

    for (const field of Object.keys(URL_FIELDS)) {
      if (!isValidHttpUrl(formData[field])) {
        next[field] = `Enter a valid URL starting with http:// or https://`;
      }
    }

    const min = formData.desiredSalaryMin;
    const max = formData.desiredSalaryMax;
    if (min !== '' && Number(min) < 0) next.desiredSalaryMin = 'Salary cannot be negative';
    if (max !== '' && Number(max) < 0) next.desiredSalaryMax = 'Salary cannot be negative';
    if (min !== '' && max !== '' && Number(min) > Number(max)) {
      next.desiredSalaryMax = 'Maximum must be greater than minimum';
    }

    if (formData.companyFounded) {
      const year = Number(formData.companyFounded);
      const currentYear = new Date().getFullYear();
      if (year < 1800 || year > currentYear) {
        next.companyFounded = `Year must be between 1800 and ${currentYear}`;
      }
    }

    return next;
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      const url = res?.data?.url || res?.url;
      setFormData((prev) => ({ ...prev, avatar: url }));
      toast.success('Photo uploaded!');
    } catch {
      toast.error('Failed to upload photo.');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      const url = res?.data?.url || res?.url;
      setFormData((prev) => ({ ...prev, companyLogo: url }));
      toast.success('Logo uploaded!');
    } catch {
      toast.error('Failed to upload logo.');
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleCvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvUploading(true);
    try {
      const res = await uploadService.uploadCV(file);
      const url = res?.data?.url || res?.url;
      setFormData((prev) => ({ ...prev, cvUrl: url }));
      toast.success('CV uploaded!');
    } catch {
      toast.error('Failed to upload CV.');
    } finally {
      setCvUploading(false);
      if (cvInputRef.current) cvInputRef.current.value = '';
    }
  };

  const handleRemoveCv = () => {
    setFormData((prev) => ({ ...prev, cvUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstField = Object.keys(validationErrors)[0];
      const el = document.getElementById(firstField) || document.querySelector(`[name="${firstField}"]`);
      if (el) setTimeout(() => el.focus(), 50);
      toast.error('Please fix the highlighted errors.');
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        location: formData.location,
        avatar: formData.avatar,
      };

      if (isCandidate) {
        Object.assign(payload, {
          title: formData.title,
          bio: formData.bio,
          skills: formData.skills,
          experience: formData.experience || undefined,
          cvUrl: formData.cvUrl,
          portfolioUrl: formData.portfolioUrl,
          linkedinUrl: formData.linkedinUrl,
          githubUrl: formData.githubUrl,
          desiredSalary: {
            min: Number(formData.desiredSalaryMin) || undefined,
            max: Number(formData.desiredSalaryMax) || undefined,
            currency: formData.desiredSalaryCurrency,
          },
        });
      }

      if (isCompany) {
        Object.assign(payload, {
          companyName: formData.companyName,
          companyLogo: formData.companyLogo,
          companyIndustry: formData.companyIndustry || undefined,
          companySize: formData.companySize || undefined,
          companyWebsite: formData.companyWebsite,
          companyLocation: formData.companyLocation,
          companyFounded: Number(formData.companyFounded) || undefined,
          companyAbout: formData.companyAbout,
          companySocials: {
            linkedin: formData.socialLinkedin,
            twitter: formData.socialTwitter,
            facebook: formData.socialFacebook,
          },
        });
      }

      const res = await authService.updateProfile(payload);
      // API envelope: { success, message, data: { user } }
      const updatedUser = res?.data?.user || res?.user;
      if (updatedUser) {
        updateUser(updatedUser);
        setInitialData(buildFormData(updatedUser));
      }
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const FieldError = ({ name }) =>
    errors[name] ? (
      <p className="mt-1 text-xs text-danger-500" role="alert">
        {errors[name]}
      </p>
    ) : null;

  const errorBorder = (name) =>
    errors[name]
      ? 'border-danger-400 focus:border-danger-500 focus:ring-danger-500/20 dark:border-danger-500'
      : '';

  const getCvFilename = (url) => {
    if (!url) return null;
    try {
      return decodeURIComponent(url.split('/').pop().split('?')[0]);
    } catch {
      return 'CV Document';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Unsaved changes bar */}
      {hasChanges && (
        <div className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
            You have unsaved changes
          </p>
          <button
            type="button"
            onClick={() => setFormData(initialData)}
            className="text-sm font-medium text-amber-700 underline hover:text-amber-800 dark:text-amber-300"
          >
            Discard
          </button>
        </div>
      )}

      {/* Personal Information */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
          Personal Information
        </h2>

        {/* Avatar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Avatar"
                className="h-24 w-24 rounded-full border-2 border-slate-200 object-cover dark:border-slate-600"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-600 dark:bg-primary-950/40 dark:text-primary-400">
                {(formData.firstName?.[0] || '') + (formData.lastName?.[0] || '')}
              </div>
            )}
            {avatarUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Camera className="h-4 w-4" />
              Change Photo
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              JPG, PNG or WebP. Max 2MB.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className={labelClass}>First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName || ''}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName || ''}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={handleChange}
              className={inputClass}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div>
            <label htmlFor="location" className={labelClass}>Location</label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location || ''}
              onChange={handleChange}
              className={inputClass}
              placeholder="City, Country"
            />
          </div>
        </div>
      </section>

      {/* Candidate — Professional Profile */}
      {isCandidate && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
            Professional Profile
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className={labelClass}>Professional Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title || ''}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Senior Frontend Developer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="bio" className={labelClass}>Bio</label>
                <CharacterCounter current={(formData.bio || '').length} max={BIO_MAX} />
              </div>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio || ''}
                onChange={handleChange}
                maxLength={BIO_MAX}
                className={`${inputClass} resize-none`}
                placeholder="Tell employers about yourself..."
              />
            </div>

            <div>
              <label className={labelClass}>Skills</label>
              <TagInput
                tags={formData.skills || []}
                onChange={(skills) => setFormData((prev) => ({ ...prev, skills }))}
                placeholder="Add a skill..."
                maxTags={15}
                suggestions={POPULAR_SKILLS}
              />
            </div>

            <div>
              <label htmlFor="experience" className={labelClass}>Experience Level</label>
              <select
                id="experience"
                name="experience"
                value={formData.experience || ''}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select level</option>
                {EXPERIENCE_LEVELS.filter((l) => l.value !== 'any').map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* CV Upload */}
            <div>
              <label className={labelClass}>Default CV</label>
              {formData.cvUrl ? (
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-700/50">
                  <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <a
                    href={formData.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 truncate text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    {getCvFilename(formData.cvUrl)}
                  </a>
                  <button
                    type="button"
                    onClick={() => cvInputRef.current?.click()}
                    disabled={cvUploading}
                    className="text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {cvUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Replace'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveCv}
                    className="text-sm font-medium text-danger-600 hover:text-danger-700 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={cvUploading}
                  className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:border-primary-400 hover:text-primary-600 disabled:opacity-50 dark:border-slate-600 dark:text-slate-400 dark:hover:border-primary-500 dark:hover:text-primary-400"
                >
                  {cvUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload CV (PDF)
                </button>
              )}
              <input
                ref={cvInputRef}
                type="file"
                accept=".pdf"
                onChange={handleCvUpload}
                className="hidden"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="portfolioUrl" className={labelClass}>Portfolio URL</label>
                <input
                  id="portfolioUrl"
                  name="portfolioUrl"
                  type="url"
                  value={formData.portfolioUrl || ''}
                  onChange={handleChange}
                  className={`${inputClass} ${errorBorder('portfolioUrl')}`}
                  placeholder="https://portfolio.com"
                />
                <FieldError name="portfolioUrl" />
              </div>
              <div>
                <label htmlFor="linkedinUrl" className={labelClass}>LinkedIn URL</label>
                <input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl || ''}
                  onChange={handleChange}
                  className={`${inputClass} ${errorBorder('linkedinUrl')}`}
                  placeholder="https://linkedin.com/in/..."
                />
                <FieldError name="linkedinUrl" />
              </div>
              <div>
                <label htmlFor="githubUrl" className={labelClass}>GitHub URL</label>
                <input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  value={formData.githubUrl || ''}
                  onChange={handleChange}
                  className={`${inputClass} ${errorBorder('githubUrl')}`}
                  placeholder="https://github.com/..."
                />
                <FieldError name="githubUrl" />
              </div>
            </div>

            {/* Desired Salary */}
            <div>
              <label className={labelClass}>Desired Salary</label>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <input
                    name="desiredSalaryMin"
                    type="number"
                    min="0"
                    value={formData.desiredSalaryMin || ''}
                    onChange={handleChange}
                    className={`${inputClass} ${errorBorder('desiredSalaryMin')}`}
                    placeholder="Min"
                  />
                  <FieldError name="desiredSalaryMin" />
                </div>
                <div>
                  <input
                    name="desiredSalaryMax"
                    type="number"
                    min="0"
                    value={formData.desiredSalaryMax || ''}
                    onChange={handleChange}
                    className={`${inputClass} ${errorBorder('desiredSalaryMax')}`}
                    placeholder="Max"
                  />
                  <FieldError name="desiredSalaryMax" />
                </div>
                <select
                  name="desiredSalaryCurrency"
                  value={formData.desiredSalaryCurrency || 'USD'}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {SALARY_CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Company — Company Information */}
      {isCompany && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
            Company Information
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className={labelClass}>Company Name</label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName || ''}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Company Logo */}
            <div>
              <label className={labelClass}>Company Logo</label>
              <div className="flex items-center gap-4">
                {formData.companyLogo ? (
                  <img
                    src={formData.companyLogo}
                    alt="Company logo"
                    className="h-16 w-16 rounded-lg border border-slate-200 object-contain dark:border-slate-600"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-700">
                    <Camera className="h-6 w-6" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {logoUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {formData.companyLogo ? 'Change Logo' : 'Upload Logo'}
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="companyIndustry" className={labelClass}>Industry</label>
                <select
                  id="companyIndustry"
                  name="companyIndustry"
                  value={formData.companyIndustry || ''}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select industry</option>
                  {COMPANY_INDUSTRIES.map((i) => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="companySize" className={labelClass}>Company Size</label>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize || ''}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select size</option>
                  {COMPANY_SIZES.map((s) => (
                    <option key={s} value={s}>{s} employees</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="companyWebsite" className={labelClass}>Company Website</label>
                <input
                  id="companyWebsite"
                  name="companyWebsite"
                  type="url"
                  value={formData.companyWebsite || ''}
                  onChange={handleChange}
                  className={`${inputClass} ${errorBorder('companyWebsite')}`}
                  placeholder="https://yourcompany.com"
                />
                <FieldError name="companyWebsite" />
              </div>
              <div>
                <label htmlFor="companyLocation" className={labelClass}>Company Location</label>
                <input
                  id="companyLocation"
                  name="companyLocation"
                  type="text"
                  value={formData.companyLocation || ''}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div>
              <label htmlFor="companyFounded" className={labelClass}>Year Founded</label>
              <input
                id="companyFounded"
                name="companyFounded"
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={formData.companyFounded || ''}
                onChange={handleChange}
                className={`${inputClass} max-w-[180px] ${errorBorder('companyFounded')}`}
                placeholder="e.g. 2015"
              />
              <FieldError name="companyFounded" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="companyAbout" className={labelClass}>About Company</label>
                <CharacterCounter current={(formData.companyAbout || '').length} max={ABOUT_MAX} />
              </div>
              <textarea
                id="companyAbout"
                name="companyAbout"
                rows={5}
                value={formData.companyAbout || ''}
                onChange={handleChange}
                maxLength={ABOUT_MAX}
                className={`${inputClass} resize-none`}
                placeholder="Tell candidates about your company..."
              />
            </div>

            {/* Social links */}
            <div>
              <p className={`${labelClass} mb-3`}>Social Links</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="socialLinkedin" className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                    LinkedIn
                  </label>
                  <input
                    id="socialLinkedin"
                    name="socialLinkedin"
                    type="url"
                    value={formData.socialLinkedin || ''}
                    onChange={handleChange}
                    className={`${inputClass} ${errorBorder('socialLinkedin')}`}
                    placeholder="https://linkedin.com/company/..."
                  />
                  <FieldError name="socialLinkedin" />
                </div>
                <div>
                  <label htmlFor="socialTwitter" className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                    Twitter
                  </label>
                  <input
                    id="socialTwitter"
                    name="socialTwitter"
                    type="url"
                    value={formData.socialTwitter || ''}
                    onChange={handleChange}
                    className={`${inputClass} ${errorBorder('socialTwitter')}`}
                    placeholder="https://twitter.com/..."
                  />
                  <FieldError name="socialTwitter" />
                </div>
                <div>
                  <label htmlFor="socialFacebook" className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                    Facebook
                  </label>
                  <input
                    id="socialFacebook"
                    name="socialFacebook"
                    type="url"
                    value={formData.socialFacebook || ''}
                    onChange={handleChange}
                    className={`${inputClass} ${errorBorder('socialFacebook')}`}
                    placeholder="https://facebook.com/..."
                  />
                  <FieldError name="socialFacebook" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!hasChanges || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:ring-2 focus:ring-primary-500/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileSettingsPage;
