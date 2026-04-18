import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../common/Spinner';

const CompanyRoute = () => {
  const { isAuthenticated, isCompany, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner fullPage text="Verifying session..." />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isCompany) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default CompanyRoute;
