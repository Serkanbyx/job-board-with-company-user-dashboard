import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun, Moon, Monitor, Check, AlertTriangle, Eye, EyeOff, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { usePreferences } from '../../hooks/usePreferences';
import * as authService from '../../api/authService';
import ConfirmModal from '../../components/common/ConfirmModal';

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500';

const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';

const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-danger-500' };
  if (score === 2) return { level: 2, label: 'Fair', color: 'bg-warning-500' };
  if (score === 3) return { level: 3, label: 'Good', color: 'bg-info-500' };
  return { level: 4, label: 'Strong', color: 'bg-success-500' };
};

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const AccountSettingsPage = () => {
  const { user, isCompany, isCandidate, logout, updateUser } = useAuth();
  const { theme, setTheme } = usePreferences();
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [jobCount, setJobCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { user: me, activeJobCount, applicationCount: appCount } =
          await authService.getMe();
        if (isCompany) setJobCount(activeJobCount || 0);
        if (isCandidate) setApplicationCount(appCount || 0);
        updateUser(me);
      } catch {
        // Non-critical
      }
    };
    fetchCounts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const strength = getPasswordStrength(passwords.newPassword);

  const passwordErrors = [];
  if (passwords.newPassword && passwords.currentPassword && passwords.newPassword === passwords.currentPassword) {
    passwordErrors.push('New password must be different from current password.');
  }
  if (passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword) {
    passwordErrors.push('Passwords do not match.');
  }
  if (passwords.newPassword && strength.level < 2) {
    passwordErrors.push('Password is too weak.');
  }

  const isPasswordFormValid =
    passwords.currentPassword &&
    passwords.newPassword &&
    passwords.confirmPassword &&
    passwords.newPassword !== passwords.currentPassword &&
    passwords.newPassword === passwords.confirmPassword &&
    strength.level >= 2;

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!isPasswordFormValid) return;

    setChangingPassword(true);
    try {
      const { accessToken, refreshToken } = await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      localStorage.setItem('jb_access_token', accessToken);
      localStorage.setItem('jb_refresh_token', refreshToken);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (password) => {
    setDeleting(true);
    try {
      await authService.deleteAccount({ password });
      setDeleteModalOpen(false);
      await logout();
      navigate('/');
      toast.success('Account deleted.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const renderPasswordInput = (field, id, label, placeholder) => (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className="relative">
        <input
          id={id}
          type={showPasswords[field] ? 'text' : 'password'}
          value={passwords[id] || ''}
          onChange={(e) => setPasswords((prev) => ({ ...prev, [id]: e.target.value }))}
          className={`${inputClass} pr-10`}
          placeholder={placeholder}
          autoComplete={id === 'currentPassword' ? 'current-password' : 'new-password'}
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          tabIndex={-1}
        >
          {showPasswords[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Email Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Email
        </h2>
        <div>
          <label className={labelClass}>Current Email</label>
          <input
            type="email"
            value={user?.email || ''}
            readOnly
            className={`${inputClass} cursor-not-allowed bg-slate-50 dark:bg-slate-700/50`}
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Contact support to change your email.
          </p>
        </div>
      </section>

      {/* Change Password Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
          Change Password
        </h2>

        <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
          {renderPasswordInput('current', 'currentPassword', 'Current Password', 'Enter current password')}

          <div>
            {renderPasswordInput('new', 'newPassword', 'New Password', 'Enter new password')}

            {/* Strength indicator */}
            {passwords.newPassword && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i <= strength.level ? strength.color : 'bg-slate-200 dark:bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <p className={`mt-1 text-xs font-medium ${
                  strength.level <= 1
                    ? 'text-danger-600 dark:text-red-400'
                    : strength.level === 2
                      ? 'text-warning-600 dark:text-amber-400'
                      : strength.level === 3
                        ? 'text-info-600 dark:text-blue-400'
                        : 'text-success-600 dark:text-green-400'
                }`}>
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {renderPasswordInput('confirm', 'confirmPassword', 'Confirm New Password', 'Confirm new password')}

          {/* Validation errors */}
          {passwordErrors.length > 0 && (
            <ul className="space-y-1">
              {passwordErrors.map((err) => (
                <li key={err} className="text-xs text-danger-600 dark:text-red-400">
                  {err}
                </li>
              ))}
            </ul>
          )}

          <button
            type="submit"
            disabled={!isPasswordFormValid || changingPassword}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:ring-2 focus:ring-primary-500/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {changingPassword ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Changing...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </section>

      {/* Theme Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Theme
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const isActive = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 transition-all ${
                  isActive
                    ? 'border-primary-500 bg-primary-50 shadow-sm dark:border-primary-400 dark:bg-primary-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500'
                }`}
              >
                {isActive && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 dark:bg-primary-500">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <Icon
                  className={`h-6 w-6 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-xl border-2 border-danger-200 bg-white p-6 shadow-sm dark:border-danger-900 dark:bg-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-danger-600 dark:text-red-400" />
          <h2 className="text-lg font-semibold text-danger-700 dark:text-red-400">
            Delete Account
          </h2>
        </div>

        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Once deleted, your account and all associated data cannot be recovered.
        </p>

        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          This will permanently delete:{' '}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            your profile
            {isCompany && <>, {jobCount} job listing{jobCount !== 1 ? 's' : ''}, and all associated applications</>}
            {isCandidate && <>, {applicationCount} application{applicationCount !== 1 ? 's' : ''}, and all saved jobs</>}
          </span>
          .
        </p>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="rounded-lg bg-danger-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-danger-700 focus:ring-2 focus:ring-danger-500/40 focus:outline-none"
        >
          Delete My Account
        </button>
      </section>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account Permanently"
        message="Type your password to confirm. This action is irreversible."
        confirmText="Delete Permanently"
        variant="danger"
        requirePassword
        isLoading={deleting}
      />
    </div>
  );
};

export default AccountSettingsPage;
