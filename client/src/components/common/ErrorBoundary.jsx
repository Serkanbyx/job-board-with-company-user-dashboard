import { Component } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isSection = this.props.section;

      if (isSection) {
        return (
          <div
            role="alert"
            className="flex flex-col items-center justify-center rounded-lg border border-danger-100 bg-danger-50/50 px-4 py-8 text-center dark:border-danger-900/50 dark:bg-danger-950/20"
          >
            <AlertTriangle className="mb-2 h-6 w-6 text-danger-500" aria-hidden="true" />
            <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              Something went wrong in this section.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Try Again
              </button>
              <a
                href="mailto:support@jobboard.com?subject=Bug Report"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                Report Issue
              </a>
            </div>
          </div>
        );
      }

      return (
        <div
          role="alert"
          className="flex min-h-[400px] flex-col items-center justify-center px-4 py-16 text-center"
        >
          <div className="mb-4 rounded-full bg-danger-50 p-4 dark:bg-red-950/30">
            <AlertTriangle className="h-10 w-10 text-danger-500" aria-hidden="true" />
          </div>

          <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="mb-6 max-w-md text-sm text-slate-500 dark:text-slate-400">
            An unexpected error occurred. Please try again or return to the home page.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try Again
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Go Home
            </Link>
            <a
              href="mailto:support@jobboard.com?subject=Bug Report"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              Report Issue
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
