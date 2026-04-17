import { useEffect } from 'react';

/**
 * Locks the page body scroll while `isLocked` is truthy.
 * Restores the previous overflow value on unlock or unmount.
 */
const useLockBodyScroll = (isLocked) => {
  useEffect(() => {
    if (!isLocked) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLocked]);
};

export default useLockBodyScroll;
