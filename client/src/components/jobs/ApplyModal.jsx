import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as uploadService from '../../api/uploadService';
import * as applicationService from '../../api/applicationService';
import CharacterCounter from '../common/CharacterCounter';

const STEPS = [
  { id: 1, label: 'CV Upload' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Review' },
];

const COVER_LETTER_MAX = 5000;

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center justify-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-700">
    {STEPS.map((step, idx) => (
      <div key={step.id} className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              currentStep > step.id
                ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                : currentStep === step.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
            }`}
          >
            {currentStep > step.id ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              step.id
            )}
          </span>
          <span
            className={`hidden text-xs font-medium sm:block ${
              currentStep >= step.id
                ? 'text-slate-700 dark:text-slate-200'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {step.label}
          </span>
        </div>
        {idx < STEPS.length - 1 && (
          <div
            className={`h-px w-8 transition-colors ${
              currentStep > step.id
                ? 'bg-success-400 dark:bg-success-600'
                : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

const ApplyModal = ({ isOpen, onClose, job, userCvUrl, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cvSource, setCvSource] = useState(userCvUrl ? 'profile' : 'upload');
  const [uploadedCv, setUploadedCv] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | uploaded | error
  const [uploadError, setUploadError] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState({ min: '', max: '', currency: 'USD' });
  const [availableFrom, setAvailableFrom] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const modalRef = useRef(null);
  const firstFocusRef = useRef(null);
  const fileInputRef = useRef(null);

  const resetState = useCallback(() => {
    setCurrentStep(1);
    setCvSource(userCvUrl ? 'profile' : 'upload');
    setUploadedCv(null);
    setUploadStatus('idle');
    setUploadError('');
    setCoverLetter('');
    setExpectedSalary({ min: '', max: '', currency: 'USD' });
    setAvailableFrom('');
    setSubmitting(false);
    setHasUnsavedChanges(false);
  }, [userCvUrl]);

  const handleClose = useCallback(() => {
    if (submitting) return;
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) return;
    }
    resetState();
    onClose();
  }, [submitting, hasUnsavedChanges, resetState, onClose]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') handleClose();

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [handleClose]
  );

  useEffect(() => {
    if (isOpen) {
      resetState();
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => firstFocusRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown, resetState]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are accepted.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB.');
      return;
    }

    setUploadStatus('uploading');
    setUploadError('');
    setHasUnsavedChanges(true);

    try {
      const data = await uploadService.uploadCV(file);
      setUploadedCv({ url: data.url, filename: file.name });
      setUploadStatus('uploaded');
      setCvSource('upload');
    } catch (err) {
      setUploadStatus('error');
      setUploadError(err.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const getCvUrl = () => {
    if (cvSource === 'profile' && userCvUrl) return userCvUrl;
    if (cvSource === 'upload' && uploadedCv) return uploadedCv.url;
    return null;
  };

  const canProceedStep1 = () => {
    if (cvSource === 'profile' && userCvUrl) return true;
    if (cvSource === 'upload' && uploadStatus === 'uploaded') return true;
    return false;
  };

  const handleSubmit = async () => {
    const cvUrl = getCvUrl();
    if (!cvUrl) {
      toast.error('Please provide a CV.');
      return;
    }

    setSubmitting(true);

    try {
      const applicationData = { cvUrl };

      if (coverLetter.trim()) applicationData.coverLetter = coverLetter.trim();

      if (expectedSalary.min || expectedSalary.max) {
        applicationData.expectedSalary = {
          ...(expectedSalary.min && { min: Number(expectedSalary.min) }),
          ...(expectedSalary.max && { max: Number(expectedSalary.max) }),
          currency: expectedSalary.currency,
        };
      }

      if (availableFrom) applicationData.availableFrom = availableFrom;

      await applicationService.applyToJob(job._id, applicationData);

      toast.success('Application submitted successfully! Good luck!');
      resetState();
      onClose();
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
    >
      {/* Backdrop */}
      <div
        className="animate-backdrop-in absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="animate-modal-in relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl dark:bg-slate-800"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div className="min-w-0 pr-8">
            <h2
              id="apply-modal-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              Apply to {job.title}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              at {job.company?.companyName || 'Company'}
            </p>
          </div>
          <button
            ref={firstFocusRef}
            onClick={handleClose}
            disabled={submitting}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 dark:hover:bg-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-5 pt-4">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Step 1: CV Upload */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Upload your CV
              </h3>

              {/* Profile CV option */}
              {userCvUrl && (
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3.5 transition-colors ${
                    cvSource === 'profile'
                      ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-950/30'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="cvSource"
                    value="profile"
                    checked={cvSource === 'profile'}
                    onChange={() => setCvSource('profile')}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      cvSource === 'profile'
                        ? 'border-primary-500 dark:border-primary-400'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {cvSource === 'profile' && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary-500 dark:bg-primary-400" />
                    )}
                  </div>
                  <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Use your profile CV
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Already uploaded to your profile
                    </p>
                  </div>
                </label>
              )}

              {/* Upload new CV */}
              <div>
                {userCvUrl && (
                  <label
                    className={`mb-3 flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3.5 transition-colors ${
                      cvSource === 'upload'
                        ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-950/30'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cvSource"
                      value="upload"
                      checked={cvSource === 'upload'}
                      onChange={() => setCvSource('upload')}
                      className="sr-only"
                    />
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        cvSource === 'upload'
                          ? 'border-primary-500 dark:border-primary-400'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {cvSource === 'upload' && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary-500 dark:bg-primary-400" />
                      )}
                    </div>
                    <Upload className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Upload a new CV
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        PDF format, max 5MB
                      </p>
                    </div>
                  </label>
                )}

                {/* File input area */}
                {(cvSource === 'upload' || !userCvUrl) && (
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {uploadStatus === 'idle' && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-6 text-slate-500 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-primary-500"
                      >
                        <Upload className="h-8 w-8" />
                        <span className="text-sm font-medium">
                          Click to upload your CV
                        </span>
                        <span className="text-xs">PDF only, up to 5MB</span>
                      </button>
                    )}

                    {uploadStatus === 'uploading' && (
                      <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                        <Loader2 className="h-5 w-5 animate-spin text-primary-600 dark:text-primary-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          Uploading...
                        </span>
                      </div>
                    )}

                    {uploadStatus === 'uploaded' && uploadedCv && (
                      <div className="flex items-center gap-3 rounded-lg border border-success-200 bg-success-50 p-4 dark:border-success-800 dark:bg-success-950/30">
                        <CheckCircle2 className="h-5 w-5 text-success-600 dark:text-success-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-success-700 dark:text-success-300">
                            {uploadedCv.filename}
                          </p>
                          <p className="text-xs text-success-600 dark:text-success-400">
                            Uploaded successfully
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedCv(null);
                            setUploadStatus('idle');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        >
                          Change
                        </button>
                      </div>
                    )}

                    {uploadStatus === 'error' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 rounded-lg border border-danger-200 bg-danger-50 p-4 dark:border-danger-800 dark:bg-danger-950/30">
                          <AlertCircle className="h-5 w-5 shrink-0 text-danger-600 dark:text-danger-400" />
                          <p className="text-sm text-danger-700 dark:text-danger-300">
                            {uploadError}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadStatus('idle');
                            setUploadError('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        >
                          Try again
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Cover Letter & Details */}
          {currentStep === 2 && (
            <div className="space-y-5">
              {/* Cover Letter */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="coverLetter"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Cover Letter
                    <span className="ml-1 font-normal text-slate-400">(optional)</span>
                  </label>
                  <CharacterCounter current={coverLetter.length} max={COVER_LETTER_MAX} />
                </div>
                <textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => {
                    if (e.target.value.length <= COVER_LETTER_MAX) {
                      setCoverLetter(e.target.value);
                      setHasUnsavedChanges(true);
                    }
                  }}
                  rows={6}
                  placeholder="Tell the employer why you're a great fit for this role..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              {/* Expected Salary */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Expected Salary
                  <span className="ml-1 font-normal text-slate-400">(optional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      value={expectedSalary.min}
                      onChange={(e) => {
                        setExpectedSalary((prev) => ({ ...prev, min: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Min"
                      className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <span className="text-sm text-slate-400">—</span>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      value={expectedSalary.max}
                      onChange={(e) => {
                        setExpectedSalary((prev) => ({ ...prev, max: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Max"
                      className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <select
                    value={expectedSalary.currency}
                    onChange={(e) => {
                      setExpectedSalary((prev) => ({ ...prev, currency: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    className="rounded-lg border border-slate-300 px-2 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="TRY">TRY</option>
                  </select>
                </div>
              </div>

              {/* Available From */}
              <div>
                <label
                  htmlFor="availableFrom"
                  className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Available From
                  <span className="ml-1 font-normal text-slate-400">(optional)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="availableFrom"
                    type="date"
                    value={availableFrom}
                    onChange={(e) => {
                      setAvailableFrom(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Review your application
              </h3>

              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
                {/* CV */}
                <div className="flex items-center gap-3 p-3.5">
                  <FileText className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">CV</p>
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {cvSource === 'profile'
                        ? 'Profile CV'
                        : uploadedCv?.filename || 'Not selected'}
                    </p>
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="p-3.5">
                  <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Cover Letter
                  </p>
                  {coverLetter.trim() ? (
                    <p className="line-clamp-3 text-sm text-slate-700 dark:text-slate-200">
                      {coverLetter}
                    </p>
                  ) : (
                    <p className="text-sm italic text-slate-400 dark:text-slate-500">
                      Not provided
                    </p>
                  )}
                </div>

                {/* Expected Salary */}
                {(expectedSalary.min || expectedSalary.max) && (
                  <div className="flex items-center gap-3 p-3.5">
                    <DollarSign className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Expected Salary
                      </p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {expectedSalary.min && expectedSalary.max
                          ? `${expectedSalary.currency} ${Number(expectedSalary.min).toLocaleString()} - ${Number(expectedSalary.max).toLocaleString()}`
                          : expectedSalary.min
                            ? `From ${expectedSalary.currency} ${Number(expectedSalary.min).toLocaleString()}`
                            : `Up to ${expectedSalary.currency} ${Number(expectedSalary.max).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Available From */}
                {availableFrom && (
                  <div className="flex items-center gap-3 p-3.5">
                    <Calendar className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Available From
                      </p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {new Date(availableFrom).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 p-5 dark:border-slate-700">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={currentStep === 1 && !canProceedStep1()}
              className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
