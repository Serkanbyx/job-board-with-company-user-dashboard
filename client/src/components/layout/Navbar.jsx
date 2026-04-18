import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { getInitials } from '../../utils/helpers';
import RoleBadge from '../common/RoleBadge';
import NotificationDropdown from '../notifications/NotificationDropdown';

const DASHBOARD_ROUTES = {
  candidate: '/candidate/dashboard',
  company: '/company/dashboard',
  admin: '/admin/dashboard',
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = usePreferences();
  const { unreadCount } = useNotifications();
  const { pathname } = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close mobile menu and dropdowns when the route changes. Tracking the
  // previous pathname during render avoids the cascading re-render caused
  // by calling setState inside an effect.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotificationOpen(false);
  }

  const userDropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const closeAllDropdowns = useCallback(() => {
    setUserDropdownOpen(false);
    setNotificationOpen(false);
  }, []);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeAllDropdowns();
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeAllDropdowns]);

  const handleLogout = async () => {
    closeAllDropdowns();
    setMobileMenuOpen(false);
    await logout();
  };

  const dashboardLink = user ? DASHBOARD_ROUTES[user.role] || '/' : '/';

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80">
        <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left — Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary-600" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            JobBoard
          </span>
        </Link>

        {/* Center — Desktop nav */}
        <div className="hidden md:flex md:items-center md:gap-6">
          <Link
            to="/jobs"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
          >
            Find Jobs
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Notification bell */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setNotificationOpen((prev) => !prev);
                    setUserDropdownOpen(false);
                  }}
                  aria-label="Notifications"
                  aria-expanded={notificationOpen}
                  aria-haspopup="true"
                  className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span
                      key={unreadCount}
                      className="animate-badge-bounce absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown
                  isOpen={notificationOpen}
                  onClose={() => setNotificationOpen(false)}
                />
              </div>

              {/* User avatar dropdown */}
              <div className="relative hidden md:block" ref={userDropdownRef}>
                <button
                  onClick={() => {
                    setUserDropdownOpen((prev) => !prev);
                    setNotificationOpen(false);
                  }}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  aria-label="User menu"
                  className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                      {getInitials(user?.firstName, user?.lastName)}
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="animate-dropdown-in absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <div className="mt-1">
                        <RoleBadge role={user?.role} />
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to={dashboardLink}
                        onClick={closeAllDropdowns}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        to="/settings/profile"
                        onClick={closeAllDropdowns}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </div>

                    <div className="border-t border-slate-200 py-1 dark:border-slate-700">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger-600 transition-colors hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-950/30"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        </nav>
      </header>

      {/* Mobile drawer (rendered outside <header> so it's not trapped in the
          stacking context created by the header's backdrop-blur filter) */}
      {mobileMenuOpen && (
        <>
          <div
            className="animate-backdrop-in fixed inset-0 top-16 z-50 bg-black/30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div id="mobile-menu" className="animate-slide-in-right fixed top-16 right-0 bottom-0 z-50 w-72 overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-lg md:hidden dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-1">
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Find Jobs
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="my-2 border-t border-slate-200 dark:border-slate-700" />

                  <div className="mb-2 flex items-center gap-3 px-3">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                        {getInitials(user?.firstName, user?.lastName)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <RoleBadge role={user?.role} />
                    </div>
                  </div>

                  <Link
                    to={dashboardLink}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/settings/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>

                  <div className="my-2 border-t border-slate-200 dark:border-slate-700" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger-600 transition-colors hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-950/30"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="my-2 border-t border-slate-200 dark:border-slate-700" />
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg bg-primary-600 px-3 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-primary-700"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
