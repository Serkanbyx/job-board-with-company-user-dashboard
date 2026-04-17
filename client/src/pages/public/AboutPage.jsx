import { Link } from 'react-router-dom';
import { Briefcase, Users, Target, Heart, ArrowRight } from 'lucide-react';

const VALUES = [
  {
    icon: Target,
    title: 'Built for impact',
    description:
      'We connect talented people with opportunities that matter — fewer dead-ends, more career-defining moves.',
  },
  {
    icon: Users,
    title: 'Open to everyone',
    description:
      'Whether you are a fresh graduate or a seasoned engineer, our tools are designed to fit your stage.',
  },
  {
    icon: Heart,
    title: 'Human-first hiring',
    description:
      'Recruiting should feel personal — not transactional. We build features that respect both candidates and employers.',
  },
];

const AboutPage = () => (
  <div className="bg-white dark:bg-slate-900">
    {/* Hero */}
    <section className="border-b border-slate-200 bg-linear-to-br from-primary-50 to-white px-4 py-16 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
          <Briefcase className="h-3.5 w-3.5" />
          About JobBoard
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Helping talent find work that matters.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300">
          JobBoard is a modern recruiting platform that gives candidates a clean
          way to discover roles and gives companies a focused space to publish jobs
          and manage applications.
        </p>
      </div>
    </section>

    {/* Mission */}
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our mission</h2>
        <p className="mt-3 max-w-3xl text-base text-slate-600 dark:text-slate-300">
          Job hunting and hiring should feel less like paperwork and more like
          progress. We focus on a fast, accessible product where every action —
          searching, applying, posting — takes the smallest number of clicks possible.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary-50 p-2.5 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="border-t border-slate-200 px-4 py-12 dark:border-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-primary-600 to-primary-700 p-8 text-white sm:flex-row">
        <div>
          <h3 className="text-lg font-semibold">Ready to get started?</h3>
          <p className="mt-1 text-sm text-primary-100">
            Browse open roles or post your first job in minutes.
          </p>
        </div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
        >
          Browse jobs
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  </div>
);

export default AboutPage;
