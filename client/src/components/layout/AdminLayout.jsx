import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../common/ErrorBoundary';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="flex">
      <AdminSidebar />

      <div className="w-full lg:ml-70">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
