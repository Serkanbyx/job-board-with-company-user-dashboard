import { Outlet } from 'react-router-dom';
import ErrorBoundary from '../common/ErrorBoundary';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div>
      <AdminSidebar />

      {/* Use padding-left (box-sizing: border-box) so the wrapper never
          exceeds the viewport when the fixed sidebar is rendered. */}
      <div className="lg:pl-70">
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
