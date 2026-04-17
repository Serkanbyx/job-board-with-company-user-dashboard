import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../api/authService';
import ToggleSwitch from '../../components/common/ToggleSwitch';

const NOTIFICATION_SETTINGS = [
  {
    key: 'emailOnApplication',
    label: 'New Applications',
    description: 'Receive email when someone applies to your job',
    roles: ['company'],
  },
  {
    key: 'emailOnStatusChange',
    label: 'Status Updates',
    description: 'Receive email when your application status changes',
    roles: ['candidate'],
  },
  {
    key: 'emailOnNewJob',
    label: 'Job Alerts',
    description: 'Receive email about new jobs matching your skills',
    roles: ['candidate'],
  },
  {
    key: 'inAppNotifications',
    label: 'In-App Notifications',
    description: 'Show notification bell and dropdown in the navbar',
    roles: ['company', 'candidate', 'admin'],
  },
];

const DEFAULT_PREFS = {
  emailOnApplication: true,
  emailOnStatusChange: true,
  emailOnNewJob: false,
  inAppNotifications: true,
};

const NotificationSettingsPage = () => {
  const { user, updateUser } = useAuth();

  const [prefs, setPrefs] = useState(() => ({
    ...DEFAULT_PREFS,
    ...(user?.notificationPrefs || {}),
  }));
  const [savingKey, setSavingKey] = useState(null);

  const visibleSettings = NOTIFICATION_SETTINGS.filter(
    (s) => s.roles.includes(user?.role)
  );

  const handleToggle = useCallback(
    async (key, newValue) => {
      const prevPrefs = { ...prefs };
      const updatedPrefs = { ...prefs, [key]: newValue };

      setPrefs(updatedPrefs);
      setSavingKey(key);

      try {
        const res = await authService.updateProfile({
          notificationPrefs: updatedPrefs,
        });
        const updatedUser = res?.data?.user || res?.user;
        if (updatedUser) updateUser(updatedUser);
        toast.success('Preferences saved');
      } catch (err) {
        setPrefs(prevPrefs);
        toast.error(err?.response?.data?.message || 'Failed to update preferences.');
      } finally {
        setSavingKey(null);
      }
    },
    [prefs, updateUser]
  );

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Email Notifications
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Changes are saved automatically
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {visibleSettings.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <ToggleSwitch
                checked={!!prefs[key]}
                onChange={(val) => handleToggle(key, val)}
                disabled={savingKey === key}
                label={label}
                description={description}
              />
            </div>
          ))}
        </div>

        {visibleSettings.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No notification settings available for your role.
          </p>
        )}
      </section>
    </div>
  );
};

export default NotificationSettingsPage;
