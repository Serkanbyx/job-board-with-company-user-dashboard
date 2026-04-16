import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Users,
  FileText,
  CheckCircle,
  PenSquare,
  Handshake,
  ArrowRight,
  Monitor,
  DollarSign,
  HeartPulse,
  GraduationCap,
  Megaphone,
  ShoppingBag,
  Factory,
  MessagesSquare,
  Clapperboard,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import * as jobService from '../../api/jobService';
import { COMPANY_INDUSTRIES } from '../../utils/constants';
import JobCard from '../../components/common/JobCard';
import SkeletonCard from '../../components/common/SkeletonCard';

/* ────────────────────────── Industry icon mapping ────────────────────────── */
const INDUSTRY_ICONS = {
  technology: Monitor,
  finance: DollarSign,
  healthcare: HeartPulse,
  education: GraduationCap,
  marketing: Megaphone,
  retail: ShoppingBag,
  manufacturing: Factory,
  consulting: MessagesSquare,
  media: Clapperboard,
  other: MoreHorizontal,
};

/* ──────────────────────── Animated counter hook ──────────────────────── */
const useCountUp = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!target || hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;

        const start = performance.now();
        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      },
      { threshold: 0.3 },
    );

    const el = ref.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [target, duration]);

  return { count, ref };
};

/* ────────────────────────── Stat counter component ────────────────────────── */
const AnimatedStat = ({ value, label, icon: Icon }) => {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1 text-center">
      <Icon className="mb-1 h-6 w-6 text-primary-500" />
      <span className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
        {count.toLocaleString()}+
      </span>
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
};

/* ─────────────────────────── How-it-works data ─────────────────────────── */
const HOW_IT_WORKS = {
  candidates: [
    { icon: Search, title: 'Browse Jobs', description: 'Search through hundreds of opportunities that match your skills and interests.' },
    { icon: FileText, title: 'Apply with CV', description: 'Submit your application with your resume in just a few clicks.' },
    { icon: CheckCircle, title: 'Get Hired', description: 'Connect with top employers and land your dream job.' },
  ],
  companies: [
    { icon: PenSquare, title: 'Post a Job', description: 'Create detailed job listings to attract the best talent.' },
    { icon: Users, title: 'Review Applicants', description: 'Browse applications and shortlist candidates that fit your needs.' },
    { icon: Handshake, title: 'Hire Talent', description: 'Interview, offer, and onboard the perfect team members.' },
  ],
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*                              HOME PAGE                                   */
/* ══════════════════════════════════════════════════════════════════════════ */
const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isCompany, isCandidate } = useAuth();

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('candidates');

  /* ─── Data fetching ─── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, jobsRes] = await Promise.all([
          jobService.getJobStats().catch(() => null),
          jobService.getAllJobs({ featured: true, limit: 6 }).catch(() => null),
        ]);

        if (statsRes?.data) setStats(statsRes.data);

        const jobs = jobsRes?.data || [];
        if (jobs.length > 0) {
          setFeaturedJobs(jobs);
        } else {
          const latestRes = await jobService.getAllJobs({ limit: 6 }).catch(() => null);
          setFeaturedJobs(latestRes?.data || []);
        }
      } catch {
        /* Fallback: empty state */
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ─── Quick search handler ─── */
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (keyword.trim()) params.set('search', keyword.trim());
      if (location.trim()) params.set('location', location.trim());
      navigate(`/jobs?${params.toString()}`);
    },
    [keyword, location, navigate],
  );

  /* ─── Dashboard redirect helper ─── */
  const getDashboardPath = () => {
    if (isCompany) return '/company/dashboard';
    if (isCandidate) return '/candidate/dashboard';
    return '/admin/dashboard';
  };

  /* ─── Fallback stat values ─── */
  const totalJobs = stats?.totalJobs || 150;
  const totalCompanies = stats?.topLocations?.length ? stats.topLocations.length * 12 : 50;
  const totalCandidates = totalJobs * 8;

  return (
    <div className="min-h-screen">
      {/* ═══════ 1. HERO SECTION ═══════ */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary-50 via-white to-primary-100/40 dark:from-slate-900 dark:via-slate-900 dark:to-primary-950/30">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary-200/30 blur-3xl dark:bg-primary-800/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-primary-300/20 blur-3xl dark:bg-primary-900/10" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 py-20 lg:flex-row lg:py-28">
          {/* Left — text */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl font-bold leading-tight text-slate-900 dark:text-white md:text-5xl">
              Find Your Perfect{' '}
              <span className="bg-linear-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Career Match
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-400 lg:mx-0 mx-auto">
              Connect with top companies and discover opportunities that match your skills and ambitions.
            </p>

            {/* Quick search bar */}
            <form
              onSubmit={handleSearch}
              className="mt-8 flex flex-col gap-3 rounded-xl bg-white p-3 shadow-lg dark:bg-slate-800 sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Job title or keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-primary-900"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-primary-900"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 active:bg-primary-800"
              >
                <Search className="h-4 w-4" />
                Search Jobs
              </button>
            </form>

            {/* Animated stats */}
            <div className="mt-10 flex justify-center gap-10 lg:justify-start">
              <AnimatedStat value={totalJobs} label="Active Jobs" icon={Briefcase} />
              <AnimatedStat value={totalCompanies} label="Companies" icon={Building2} />
              <AnimatedStat value={totalCandidates} label="Candidates" icon={Users} />
            </div>
          </div>

          {/* Right — decorative illustration */}
          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="relative h-[380px] w-[380px]">
              <div className="absolute inset-0 animate-pulse rounded-full bg-linear-to-tr from-primary-400/20 to-primary-600/20 blur-2xl" />
              <div className="absolute left-6 top-6 h-44 w-44 rounded-2xl bg-linear-to-br from-primary-500 to-primary-700 opacity-90 shadow-2xl" />
              <div className="absolute bottom-10 right-4 h-36 w-52 rounded-2xl bg-linear-to-br from-primary-300 to-primary-500 opacity-80 shadow-xl" />
              <div className="absolute right-12 top-16 h-28 w-28 rounded-xl bg-linear-to-br from-primary-200 to-primary-400 opacity-70 shadow-lg" />
              <div className="absolute bottom-28 left-16 h-20 w-20 rounded-lg bg-linear-to-br from-primary-600 to-primary-800 opacity-60 shadow-md" />

              {/* Floating cards */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 rounded-lg border border-white/20 bg-white/90 px-4 py-3 shadow-lg backdrop-blur dark:bg-slate-800/90">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100 text-success-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Application Sent</p>
                    <p className="text-[10px] text-slate-400">Just now</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-0 rounded-lg border border-white/20 bg-white/90 px-4 py-3 shadow-lg backdrop-blur dark:bg-slate-800/90">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">New Job Posted</p>
                    <p className="text-[10px] text-slate-400">5 min ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 2. FEATURED JOBS SECTION ═══════ */}
      <section className="bg-white py-16 dark:bg-slate-900 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
              Featured Opportunities
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Explore hand-picked positions from top companies
            </p>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <SkeletonCard count={6} />
            </div>
          ) : featuredJobs.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 dark:text-slate-500">
              No jobs available at the moment. Check back soon!
            </p>
          )}

          <div className="mt-10 text-center">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-6 py-2.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:border-primary-800 dark:text-primary-400 dark:hover:bg-primary-950/40"
            >
              View All Jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ 3. HOW IT WORKS SECTION ═══════ */}
      <section className="bg-slate-50 py-16 dark:bg-slate-800/50 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
              How It Works
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Getting started is easy — whether you're hiring or looking for work
            </p>
          </div>

          {/* Tab toggle */}
          <div className="mb-10 flex justify-center">
            <div className="inline-flex rounded-lg bg-white p-1 shadow-sm dark:bg-slate-800">
              {['candidates', 'companies'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400'
                  }`}
                >
                  For {tab === 'candidates' ? 'Candidates' : 'Companies'}
                </button>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS[activeTab].map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-xl bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md dark:bg-slate-800"
              >
                <div className="absolute -top-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                  {index + 1}
                </div>
                <div className="mx-auto mb-4 mt-2 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/40">
                  <step.icon className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 4. BROWSE BY CATEGORY / INDUSTRY ═══════ */}
      <section className="bg-white py-16 dark:bg-slate-900 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
              Explore by Industry
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Find jobs in the industry that fits your expertise
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {COMPANY_INDUSTRIES.map(({ value, label }) => {
              const Icon = INDUSTRY_ICONS[value] || MoreHorizontal;
              const jobCount = stats?.byType
                ? Object.values(stats.byType).reduce((s, v) => s + v, 0)
                : null;

              return (
                <Link
                  key={value}
                  to={`/jobs?industry=${value}`}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-primary-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-600"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 transition-colors group-hover:bg-primary-100 dark:bg-primary-950/40 dark:group-hover:bg-primary-950/60">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                  </span>
                  {jobCount && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {jobCount}+ jobs
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ 5. TOP COMPANIES SECTION ═══════ */}
      <section className="bg-slate-50 py-16 dark:bg-slate-800/50 lg:py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
              Trusted by Leading Companies
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Top employers actively hiring on our platform
            </p>
          </div>

          {/* Company logos from featured jobs */}
          {featuredJobs.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[...new Map(featuredJobs.map((j) => [j.company?._id, j.company])).values()]
                .filter(Boolean)
                .slice(0, 8)
                .map((company) => (
                  <Link
                    key={company._id}
                    to={`/company/${company._id}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 transition-all hover:border-primary-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-600"
                  >
                    {company.companyLogo ? (
                      <img
                        src={company.companyLogo}
                        alt={company.companyName}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400">
                        <Building2 className="h-5 w-5" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {company.companyName || `${company.firstName} ${company.lastName}`}
                    </span>
                  </Link>
                ))}
            </div>
          ) : (
            !loading && (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500">
                Company highlights coming soon.
              </p>
            )
          )}
        </div>
      </section>

      {/* ═══════ 6. CTA SECTION ═══════ */}
      <section className="relative overflow-hidden bg-linear-to-r from-primary-600 to-primary-800 py-16 lg:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
            Ready to Take the Next Step?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Whether you're looking for your dream job or the perfect candidate — we've got you covered.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isAuthenticated ? (
              <Link
                to={getDashboardPath()}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-semibold text-primary-700 shadow-lg transition-colors hover:bg-primary-50"
              >
                Go to Dashboard
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register?role=candidate"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-semibold text-primary-700 shadow-lg transition-colors hover:bg-primary-50"
                >
                  Find a Job
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/register?role=company"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-8 py-3 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Post a Job
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
