import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  BarChart3,
  Shield,
  Menu,
  X,
  Home,
  Search,
  ExternalLink,
} from 'lucide-react';

export const ADMIN_NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/admin/applications', label: 'Applications', icon: FileText },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

// Quick-links to public site sections so admins can jump out of the
// admin shell without hunting through the navbar dropdown.
const PUBLIC_SITE_LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/jobs', label: 'Find Jobs', icon: Search },
];

const AdminSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-700 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
          <Shield className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Admin Panel</p>
          <p className="text-xs text-slate-400">System Management</p>
        </div>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-3 py-4">
        {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin/dashboard'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Public site quick-links */}
      <div className="border-t border-slate-700 px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Public Site
        </p>
        {PUBLIC_SITE_LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{label}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </NavLink>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed top-16 left-0 hidden h-[calc(100vh-4rem)] w-70 overflow-y-auto border-r border-slate-700 bg-slate-900 lg:block">
        {sidebarContent}
      </aside>

      <button
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
        className="fixed top-20 left-4 z-30 rounded-lg border border-slate-600 bg-slate-800 p-2 shadow-sm lg:hidden"
      >
        <Menu className="h-5 w-5 text-slate-300" />
      </button>

      {sidebarOpen && (
        <>
          <div
            className="animate-backdrop-in fixed inset-0 top-16 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="animate-slide-in-left fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-70 overflow-y-auto border-r border-slate-700 bg-slate-900 shadow-lg lg:hidden">
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              className="absolute top-4 right-4"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
};

export default AdminSidebar;
