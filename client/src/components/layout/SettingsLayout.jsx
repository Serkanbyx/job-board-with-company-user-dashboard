import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { User, Shield, Bell, ChevronDown } from 'lucide-react';

const TABS = [
  { path: '/settings/profile', label: 'Profile', icon: User },
  { path: '/settings/account', label: 'Account', icon: Shield },
  { path: '/settings/notifications', label: 'Notifications', icon: Bell },
];

const tabLinkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
  }`;

const SettingsLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
        Settings
      </h1>

      {/* Desktop tabs */}
      <nav
        className="mb-8 hidden gap-1 border-b border-slate-200 pb-4 sm:flex dark:border-slate-700"
        aria-label="Settings navigation"
      >
        {TABS.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={path} className={tabLinkClass}>
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile dropdown */}
      <div className="relative mb-6 sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          <span className="flex items-center gap-2">
            {(() => {
              const active = TABS.find(({ path }) =>
                location.pathname.startsWith(path)
              );
              if (!active) return 'Settings';
              const ActiveIcon = active.icon;
              return (
                <>
                  <ActiveIcon className="h-4 w-4" />
                  {active.label}
                </>
              );
            })()}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {mobileOpen && (
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
            {TABS.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <Outlet />
    </div>
  );
};

export default SettingsLayout;
