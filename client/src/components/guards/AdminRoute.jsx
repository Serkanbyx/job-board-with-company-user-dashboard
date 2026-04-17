import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../common/Spinner';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Toast feedback only on unauthorized non-admin access attempts
  useEffect(() => {
    if (!loading && isAuthenticated && !isAdmin) {
      toast.error('Admin access required.');
    }
  }, [loading, isAuthenticated, isAdmin]);

  if (loading) return <Spinner fullPage text="Verifying session..." />;

  if (!isAuthenticated) {
    // Send the original admin URL through state so they land back here after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
