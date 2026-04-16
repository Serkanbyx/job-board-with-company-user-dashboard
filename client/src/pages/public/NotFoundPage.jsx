import { Link } from 'react-router-dom';
import { Home, Briefcase } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <main
      className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden px-4"
      role="main"
      aria-labelledby="not-found-heading"
    >
      {/* Animated floating shapes */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="animate-float-slow absolute left-[10%] top-[15%] h-20 w-20 rounded-full bg-primary-200/30 blur-sm dark:bg-primary-800/20" />
        <div className="animate-float-medium absolute right-[15%] top-[20%] h-14 w-14 rounded-xl bg-info-500/20 blur-sm dark:bg-info-500/10" />
        <div className="animate-float-fast absolute bottom-[20%] left-[20%] h-16 w-16 rounded-lg bg-primary-300/25 blur-sm dark:bg-primary-700/15" />
        <div className="animate-float-medium absolute bottom-[25%] right-[10%] h-24 w-24 rounded-full bg-info-500/15 blur-sm dark:bg-info-500/10" />
        <div className="animate-float-slow absolute left-[45%] top-[10%] h-10 w-10 rounded-full bg-primary-400/20 blur-sm dark:bg-primary-600/15" />
        <div className="animate-float-fast absolute right-[30%] bottom-[15%] h-12 w-12 rounded-xl bg-primary-200/30 blur-sm dark:bg-primary-800/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-lg text-center">
        <p className="bg-linear-to-r from-primary-600 to-info-500 bg-clip-text text-[8rem] font-extrabold leading-none text-transparent sm:text-[10rem]">
          404
        </p>

        <h1
          id="not-found-heading"
          className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white"
        >
          Page Not Found
        </h1>

        <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-900"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900"
          >
            <Briefcase className="h-4 w-4" />
            Browse Jobs
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
