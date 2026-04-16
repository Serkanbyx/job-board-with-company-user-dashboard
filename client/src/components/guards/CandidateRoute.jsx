import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../common/Spinner';

const CandidateRoute = () => {
  const { isAuthenticated, isCandidate, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner fullPage text="Verifying session..." />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isCandidate) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default CandidateRoute;
