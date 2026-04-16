import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ErrorBoundary from '../common/ErrorBoundary';

const MainLayout = () => {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="grow pt-16">
        <ErrorBoundary>
          <div key={pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
