import { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import useLockBodyScroll from '../../hooks/useLockBodyScroll';

const VARIANT_STYLES = {
  danger: 'bg-danger-600 hover:bg-danger-700 focus:ring-danger-500',
  primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
  warning: 'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500',
};

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  requireInput,
  requirePassword,
}) => {
  const [inputValue, setInputValue] = useState('');
  const modalRef = useRef(null);
  const firstFocusRef = useRef(null);

  const isConfirmDisabled =
    isLoading ||
    (requireInput && inputValue !== requireInput) ||
    (requirePassword && !inputValue);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && !isLoading) onClose();

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, input, [tabindex]:not([tabindex="-1"])'
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
    [isLoading, onClose]
  );

  useLockBodyScroll(isOpen);

  useEffect(() => {
    let focusTimer;

    if (isOpen) {
      setInputValue('');
      document.addEventListener('keydown', handleKeyDown);
      focusTimer = setTimeout(() => firstFocusRef.current?.focus(), 50);
    }

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Backdrop */}
      <div
        className="animate-backdrop-in absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal card */}
      <div
        ref={modalRef}
        className="animate-modal-in relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800"
      >
        {/* Close button */}
        <button
          ref={firstFocusRef}
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 dark:hover:bg-slate-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 id="confirm-modal-title" className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>

        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">{message}</p>

        {/* Optional confirmation input */}
        {requireInput && (
          <div className="mb-4">
            <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">
              Type <span className="font-mono font-semibold text-danger-600 dark:text-danger-500">{requireInput}</span> to confirm:
            </p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              autoComplete="off"
            />
          </div>
        )}

        {requirePassword && (
          <div className="mb-4">
            <label className="mb-2 block text-sm text-slate-600 dark:text-slate-300">
              Enter your password to confirm:
            </label>
            <input
              type="password"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              autoComplete="current-password"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {cancelText}
          </button>
          <button
            onClick={() => onConfirm(requirePassword ? inputValue : undefined)}
            disabled={isConfirmDisabled}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 disabled:opacity-40 ${VARIANT_STYLES[variant]}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
