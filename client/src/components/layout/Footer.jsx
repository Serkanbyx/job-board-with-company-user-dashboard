import { Link, useLocation } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Footer = () => {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();

  // Offset the footer when the fixed admin sidebar is visible so its content
  // is not hidden underneath it on admin and admin-viewed settings pages.
  const sidebarVisible =
    pathname.startsWith('/admin') ||
    (isAdmin && pathname.startsWith('/settings'));
  const wrapperPadding = sidebarVisible ? 'lg:pl-70' : '';

  return (
    <footer
      className={`border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${wrapperPadding}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Briefcase className="h-4 w-4" />
          <span>&copy; {new Date().getFullYear()} JobBoard. All rights reserved.</span>
        </div>

        <nav aria-label="Footer navigation" className="flex items-center gap-6">
          <Link
            to="/about"
            className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Contact
          </Link>
          <Link
            to="/privacy"
            className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Privacy Policy
          </Link>
        </nav>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700">
        <p className="py-3 text-center text-xs text-slate-500 dark:text-slate-500">
          Created by{' '}
          <a
            href="https://serkanbayraktar.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary-500 transition-colors hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Serkanby
          </a>
          {' | '}
          <a
            href="https://github.com/Serkanbyx"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary-500 transition-colors hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Github
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
