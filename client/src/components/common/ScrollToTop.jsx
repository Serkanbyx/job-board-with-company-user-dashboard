import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

const SCROLL_THRESHOLD = 600;

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // If the URL has a hash, scroll to that element after the route mounts
    if (hash) {
      const id = hash.replace('#', '');
      // Defer to next tick so target element is rendered
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (typeof el.focus === 'function') el.focus({ preventScroll: true });
          return;
        }
        window.scrollTo(0, 0);
      }, 50);
      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

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
