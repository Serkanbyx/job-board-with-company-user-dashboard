import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';

/**
 * Portal-based actions menu (kebab "..." dropdown).
 *
 * - Renders the menu OUTSIDE the row/table via React portal so it never gets
 *   clipped by `overflow-hidden` containers and never visually hides row content.
 * - Auto-closes on outside click, Escape, scroll, or window resize.
 * - Positions itself relative to the trigger button (top-right anchored).
 *
 * children: receives `{ close }` so each item can close the menu after action.
 */
const ActionsMenu = ({ children, label = 'Actions', menuWidth = 192 }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const computePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const margin = 8; // px from viewport edge
    const top = rect.bottom + 4;
    let left = rect.right - menuWidth;
    if (left < margin) left = margin;
    if (left + menuWidth > window.innerWidth - margin) {
      left = window.innerWidth - menuWidth - margin;
    }
    setPosition({ top, left });
  }, [menuWidth]);

  useEffect(() => {
    if (!open) return undefined;

    computePosition();

    const handleOutsideClick = (e) => {
      if (
        menuRef.current?.contains(e.target) ||
        buttonRef.current?.contains(e.target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    const handleReposition = () => setOpen(false);

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [open, computePosition]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: 'fixed',
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${menuWidth}px`,
              zIndex: 1000,
            }}
            className="rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            {typeof children === 'function' ? children({ close }) : children}
          </div>,
          document.body,
        )}
    </>
  );
};

export default ActionsMenu;
