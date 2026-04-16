import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import ErrorBoundary from '../common/ErrorBoundary';
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/helpers';

const NAV_ITEMS = [
  { to: '/company/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/company/jobs', label: 'My Jobs', icon: Briefcase },
  { to: '/company/jobs/create', label: 'Post a Job', icon: PlusCircle },
  { to: '/company/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings/profile', label: 'Settings', icon: Settings },
];

const CompanyLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Company identity */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 dark:border-slate-700">
        {user?.company?.logo ? (
          <img
            src={user.company.logo}
            alt={user.company.name}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
            {getInitials(user?.company?.name || user?.firstName, user?.lastName)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {user?.company?.name || `${user?.firstName} ${user?.lastName}`}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Company</p>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Company navigation" className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/company/dashboard'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex">
      {/* Desktop sidebar */}
      <aside className="fixed top-16 left-0 hidden h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-slate-200 bg-white lg:block dark:border-slate-700 dark:bg-slate-900">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
        className="fixed top-20 left-4 z-30 rounded-lg border border-slate-200 bg-white p-2 shadow-sm lg:hidden dark:border-slate-700 dark:bg-slate-800"
      >
        <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="animate-backdrop-in fixed inset-0 top-16 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="animate-slide-in-left fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-slate-200 bg-white shadow-lg lg:hidden dark:border-slate-700 dark:bg-slate-900">
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              className="absolute top-4 right-4"
            >
              <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Content area */}
      <div className="w-full lg:ml-64">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default CompanyLayout;
