import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

/* Layouts */
import MainLayout from './components/layout/MainLayout';
import CompanyLayout from './components/layout/CompanyLayout';
import CandidateLayout from './components/layout/CandidateLayout';
import AdminLayout from './components/layout/AdminLayout';

/* Route Guards */
import ProtectedRoute from './components/guards/ProtectedRoute';
import GuestOnlyRoute from './components/guards/GuestOnlyRoute';
import CompanyRoute from './components/guards/CompanyRoute';
import CandidateRoute from './components/guards/CandidateRoute';
import AdminRoute from './components/guards/AdminRoute';

/* Common */
import ScrollToTop from './components/common/ScrollToTop';

/* Auth Pages */
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

/* Public Pages */
import HomePage from './pages/public/HomePage';
import JobListPage from './pages/public/JobListPage';
import JobDetailPage from './pages/public/JobDetailPage';
import CompanyProfilePage from './pages/public/CompanyProfilePage';

/* Company Pages */
import CompanyDashboard from './pages/company/CompanyDashboard';
import MyJobsPage from './pages/company/MyJobsPage';
import CreateJobPage from './pages/company/CreateJobPage';
import EditJobPage from './pages/company/EditJobPage';
import JobApplicationsPage from './pages/company/JobApplicationsPage';
import CompanyAnalyticsPage from './pages/company/CompanyAnalyticsPage';

/* Candidate Pages */
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import MyApplicationsPage from './pages/candidate/MyApplicationsPage';
import SavedJobsPage from './pages/candidate/SavedJobsPage';

/* Settings Pages */
import SettingsLayout from './components/layout/SettingsLayout';
import ProfileSettingsPage from './pages/settings/ProfileSettingsPage';
import AccountSettingsPage from './pages/settings/AccountSettingsPage';
import NotificationSettingsPage from './pages/settings/NotificationSettingsPage';

/* Admin Pages */
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageJobsPage from './pages/admin/ManageJobsPage';
import ManageApplicationsPage from './pages/admin/ManageApplicationsPage';

/* Public Pages — 404 */
import NotFoundPage from './pages/public/NotFoundPage';

/* Placeholder — will be replaced with real page components */
import Placeholder from './pages/Placeholder';
const CandidateProfilePage = () => <Placeholder title="Candidate Profile" />;

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className:
            '!rounded-xl !shadow-lg !border !border-slate-200 !text-sm dark:!bg-slate-800 dark:!text-white dark:!border-slate-700',
          success: {
            duration: 3000,
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
          },
          error: {
            duration: 5000,
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
        containerStyle={{ top: 16, right: 16 }}
        gutter={8}
      />

      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/jobs/:slug" element={<JobDetailPage />} />
          <Route path="/company/:id" element={<CompanyProfilePage />} />
        </Route>

        {/* Guest only routes */}
        <Route element={<GuestOnlyRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* Candidate routes */}
        <Route element={<CandidateRoute />}>
          <Route element={<MainLayout />}>
            <Route element={<CandidateLayout />}>
              <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
              <Route path="/candidate/applications" element={<MyApplicationsPage />} />
              <Route path="/candidate/saved-jobs" element={<SavedJobsPage />} />
              <Route path="/candidate/profile" element={<CandidateProfilePage />} />
            </Route>
          </Route>
        </Route>

        {/* Company routes */}
        <Route element={<CompanyRoute />}>
          <Route element={<MainLayout />}>
            <Route element={<CompanyLayout />}>
              <Route path="/company/dashboard" element={<CompanyDashboard />} />
              <Route path="/company/jobs" element={<MyJobsPage />} />
              <Route path="/company/jobs/create" element={<CreateJobPage />} />
              <Route path="/company/jobs/:id/edit" element={<EditJobPage />} />
              <Route path="/company/jobs/:id/applications" element={<JobApplicationsPage />} />
              <Route path="/company/analytics" element={<CompanyAnalyticsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route element={<MainLayout />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsersPage />} />
              <Route path="/admin/jobs" element={<ManageJobsPage />} />
              <Route path="/admin/applications" element={<ManageApplicationsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Settings (any authenticated user) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route element={<SettingsLayout />}>
              <Route path="/settings/profile" element={<ProfileSettingsPage />} />
              <Route path="/settings/account" element={<AccountSettingsPage />} />
              <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
            </Route>
          </Route>
        </Route>

        {/* 404 */}
        <Route element={<MainLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
