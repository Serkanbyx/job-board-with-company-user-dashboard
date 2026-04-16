import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

const SCROLL_THRESHOLD = 600;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return showButton ? (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="animate-slide-up fixed right-6 bottom-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-colors hover:bg-primary-700 focus:ring-2 focus:ring-primary-500/40 focus:outline-none dark:bg-primary-500 dark:hover:bg-primary-600"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  ) : null;
};

export default ScrollToTop;
