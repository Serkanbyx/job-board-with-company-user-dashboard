import { Shield } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Information we collect',
    body: `We collect information you provide directly — your name, email, role, and any
profile data (CV, skills, location). When you apply to a job we share your application
with the company that posted it. Technical data such as device type and IP address may
be logged for security and analytics purposes.`,
  },
  {
    title: '2. How we use your data',
    body: `Your data is used to operate the platform: showing relevant jobs, processing
applications, sending transactional emails, preventing fraud, and improving the
product. We never sell personal data to third parties.`,
  },
  {
    title: '3. Sharing with employers',
    body: `When you apply to a job, the company you apply to receives the data you
explicitly include in your application — typically your name, email, profile snapshot
and CV. Companies are contractually required to handle this data responsibly.`,
  },
  {
    title: '4. Cookies & tracking',
    body: `We use a small number of essential cookies to keep you signed in and remember
preferences such as theme. We do not use cross-site advertising trackers.`,
  },
  {
    title: '5. Your rights',
    body: `You can update or delete your data at any time from Settings → Account.
Deletion removes your profile and applications irreversibly. For any privacy request
that you cannot complete in-app, contact support@jobboard.dev.`,
  },
  {
    title: '6. Data retention',
    body: `We retain your data while your account is active. After deletion, backups
may persist for up to 30 days before being permanently purged.`,
  },
  {
    title: '7. Updates to this policy',
    body: `We may update this policy as the product evolves. Material changes will be
announced via in-app notification. Your continued use of the platform after an update
constitutes acceptance of the revised terms.`,
  },
];

const PrivacyPolicyPage = () => (
  <div className="bg-white px-4 py-12 dark:bg-slate-900 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-3xl">
      <div className="mb-10 flex items-start gap-3">
        <div className="rounded-lg bg-primary-50 p-2.5 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <p className="text-base text-slate-700 dark:text-slate-300">
        This Privacy Policy explains how JobBoard collects, uses, and protects your
        personal information. We aim to be transparent and to give you control over
        your data.
      </p>

      <div className="mt-8 space-y-8">
        {SECTIONS.map(({ title, body }) => (
          <section key={title}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        Have a question about your data? Reach out at{' '}
        <a
          href="mailto:support@jobboard.dev"
          className="font-medium text-primary-600 hover:underline dark:text-primary-300"
        >
          support@jobboard.dev
        </a>
        .
      </div>
    </div>
  </div>
);

export default PrivacyPolicyPage;
