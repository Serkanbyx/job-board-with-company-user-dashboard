import { createPortal } from 'react-dom';

/**
 * Renders children into `document.body`, escaping any ancestor that creates a
 * containing block for `position: fixed` (transforms, filters, contain, etc.).
 *
 * Without a portal, a modal using `fixed inset-0` can be silently positioned
 * relative to a transformed wrapper instead of the viewport — making the panel
 * appear far below the visible area on long, scrolled pages. Wrapping every
 * modal here makes that whole class of bug impossible.
 *
 * Renders nothing (and skips touching the DOM) before the document is ready,
 * so this is safe to use in any environment.
 */
const ModalPortal = ({ children }) => {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
};

export default ModalPortal;
