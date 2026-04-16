import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Download,
  ExternalLink,
  Star,
  MapPin,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Linkedin,
  Github,
  Globe,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as applicationService from '../../api/applicationService';
import { APPLICATION_STATUSES, STATUS_TRANSITIONS } from '../../utils/constants';
import { getInitials } from '../../utils/helpers';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import StatusBadge from '../common/StatusBadge';
import CharacterCounter from '../common/CharacterCounter';
import StatusTimeline from './StatusTimeline';

const MAX_NOTES_LENGTH = 2000;

const ApplicationDetailModal = ({ isOpen, onClose, application, onStatusUpdate }) => {
  const [status, setStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [internalNotes, setInternalNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    if (application) {
      setRating(application.rating || 0);
      setInternalNotes(application.internalNotes || '');
      setStatus('');
      setStatusNote('');
      setShowStatusForm(false);
    }
  }, [application]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !application) return null;

  const candidate = application.candidate || {};
  const fullName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim();
  const allowedTransitions = STATUS_TRANSITIONS[application.status] || [];

  const handleStatusUpdate = async () => {
    if (!status) return;
    setIsUpdatingStatus(true);
    try {
      const res = await applicationService.updateApplicationStatus(application._id, {
        status,
        statusNote: statusNote || undefined,
      });
      toast.success(`Status updated to ${status}`);
      onStatusUpdate?.(res.application || { ...application, status });
      setShowStatusForm(false);
      setStatus('');
      setStatusNote('');
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await applicationService.updateInternalNotes(application._id, {
        internalNotes,
        rating: rating || undefined,
      });
      toast.success('Notes saved');
    } catch (error) {
      toast.error(error.message || 'Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Application Details"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={modalRef}
        className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white shadow-2xl animate-in slide-in-from-right duration-300 dark:bg-slate-800"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Application Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 p-6">
          {/* 1. Candidate Info */}
          <section>
            <div className="flex items-start gap-4">
              {candidate.avatar ? (
                <img
                  src={candidate.avatar}
                  alt={fullName}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  {getInitials(candidate.firstName, candidate.lastName)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {fullName || 'Unknown Candidate'}
                </h3>
                {candidate.title && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {candidate.title}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                  {candidate.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {candidate.location}
                    </span>
                  )}
                  {candidate.email && (
                    <a
                      href={`mailto:${candidate.email}`}
                      className="inline-flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <Mail className="h-3.5 w-3.5" /> {candidate.email}
                    </a>
                  )}
                  {candidate.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> {candidate.phone}
                    </span>
                  )}
                </div>

                {/* Social links */}
                <div className="mt-2 flex gap-2">
                  {candidate.linkedinUrl && (
                    <a
                      href={candidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {candidate.githubUrl && (
                    <a
                      href={candidate.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white"
                      aria-label="GitHub"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {candidate.portfolioUrl && (
                    <a
                      href={candidate.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
                      aria-label="Portfolio"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* 2. Application Details */}
          <section>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Application Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-700/40">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Applied</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatDate(application.createdAt)}
                  </p>
                </div>
              </div>
              {application.expectedSalary && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-700/40">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Expected Salary</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {application.expectedSalary}
                    </p>
                  </div>
                </div>
              )}
              {application.availableFrom && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-700/40">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Available From</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatDate(application.availableFrom)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 3. Cover Letter */}
          {application.coverLetter && (
            <section>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cover Letter
              </h4>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:border-slate-700 dark:bg-slate-700/40 dark:text-slate-300">
                {application.coverLetter}
              </div>
            </section>
          )}

          {/* 4. CV */}
          {application.cvUrl && (
            <section>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                CV / Resume
              </h4>
              <div className="flex gap-3">
                <a
                  href={application.cvUrl}
                  download
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Download className="h-4 w-4" /> Download CV
                </a>
                <a
                  href={application.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <ExternalLink className="h-4 w-4" /> View CV
                </a>
              </div>
            </section>
          )}

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* 5. Status Section */}
          <section>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status
            </h4>
            <div className="flex items-center gap-3">
              <StatusBadge status={application.status} size="md" />
              {allowedTransitions.length > 0 && !showStatusForm && (
                <button
                  onClick={() => setShowStatusForm(true)}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Change Status
                </button>
              )}
            </div>

            {showStatusForm && (
              <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-700/40">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    New Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">Select status...</option>
                    {allowedTransitions.map((s) => {
                      const label =
                        APPLICATION_STATUSES.find((st) => st.value === s)?.label || s;
                      return (
                        <option key={s} value={s}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Note (optional)
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    rows={2}
                    maxLength={1000}
                    placeholder="Add a note about this status change..."
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={!status || isUpdatingStatus}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isUpdatingStatus ? 'Updating...' : 'Update Status'}
                  </button>
                  <button
                    onClick={() => {
                      setShowStatusForm(false);
                      setStatus('');
                      setStatusNote('');
                    }}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 6. Status Timeline */}
          {application.statusHistory?.length > 0 && (
            <section>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Status History
              </h4>
              <StatusTimeline statusHistory={application.statusHistory} />
            </section>
          )}

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* 7. Internal Section */}
          <section>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Internal Notes (Company Only)
            </h4>

            {/* Star Rating */}
            <div className="mb-4">
              <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                Rating
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star === rating ? 0 : star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Notes
                </label>
                <CharacterCounter
                  current={internalNotes.length}
                  max={MAX_NOTES_LENGTH}
                />
              </div>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={4}
                maxLength={MAX_NOTES_LENGTH}
                placeholder="Add internal notes about this candidate..."
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSavingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;
