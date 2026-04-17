import { useEffect } from 'react';

/**
 * Locks page scroll while `isLocked` is truthy.
 *
 * Sets overflow:hidden on both <html> and <body> so the lock is reliable
 * across browsers where the scroll container may be the documentElement
 * (Chrome, Edge) or the body (older configurations). Scroll position is
 * preserved with `position: fixed` + top offset and restored on unlock,
 * which prevents the page from jumping back to the top when a modal closes.
 */
const useLockBodyScroll = (isLocked) => {
  useEffect(() => {
    if (!isLocked) return undefined;

    const { documentElement: html, body } = document;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
    };

    const scrollbarWidth = window.innerWidth - html.clientWidth;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.width = previous.bodyWidth;
      body.style.paddingRight = '';
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
};

export default useLockBodyScroll;
