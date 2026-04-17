import { useState } from 'react';
import { Mail, MapPin, MessageSquare, Send, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@jobboard.dev',
    href: 'mailto:support@jobboard.dev',
  },
  {
    icon: MessageSquare,
    label: 'Response time',
    value: 'Within 1–2 business days',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Remote · Worldwide',
  },
];

const initialState = { name: '', email: '', subject: '', message: '' };

const ContactPage = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Enter a valid email address';
    if (!form.message.trim()) next.message = 'Please write a short message';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    // Backend endpoint pending — simulate submission
    await new Promise((r) => setTimeout(r, 700));
    setIsLoading(false);
    setSubmitted(true);
    setForm(initialState);
    toast.success('Message sent — we\'ll get back to you soon!');
  };

  return (
    <div className="bg-white px-4 py-12 dark:bg-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Contact us
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-600 dark:text-slate-300">
            Have a question, partnership idea, or feedback? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_2fr]">
          {/* Info card */}
          <aside className="space-y-4">
            {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="rounded-lg bg-primary-50 p-2 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {label}
                  </p>
                  {href ? (
                    <a
                      href={href}
                      className="mt-0.5 block truncate text-sm font-medium text-slate-900 hover:text-primary-600 dark:text-white dark:hover:text-primary-300"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-white">
                      {value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </aside>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            {submitted && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-success-200 bg-success-50 p-3 text-sm text-success-700 dark:border-success-700/50 dark:bg-success-900/20 dark:text-success-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                Thanks! Your message has been received.
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Your name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                {errors.name && <p className="mt-1 text-xs text-danger-500">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                {errors.email && <p className="mt-1 text-xs text-danger-500">{errors.email}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Subject <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              {errors.message && <p className="mt-1 text-xs text-danger-500">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isLoading ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
