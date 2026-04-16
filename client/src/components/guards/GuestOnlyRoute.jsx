import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../common/Spinner';

const DASHBOARD_ROUTES = {
  candidate: '/candidate/dashboard',
  company: '/company/dashboard',
  admin: '/admin/dashboard',
};

const GuestOnlyRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <Spinner fullPage text="Loading..." />;

  if (isAuthenticated) {
    const redirectTo = DASHBOARD_ROUTES[user?.role] || '/';
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};

export default GuestOnlyRoute;
