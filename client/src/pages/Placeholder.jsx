import { useLocation } from 'react-router-dom';

const Placeholder = ({ title }) => {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
        {title || pathname}
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        This page will be implemented in an upcoming step.
      </p>
    </div>
  );
};

export default Placeholder;
