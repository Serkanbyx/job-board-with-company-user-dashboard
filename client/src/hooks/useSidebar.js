import { useContext, useEffect } from 'react';
import { SidebarContext } from '../contexts/sidebarContextInstance';

/**
 * Returns the sidebar context. Useful for the Navbar (consumer side) to read
 * the registered `openSidebar` callback.
 */
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error('useSidebar must be used within a SidebarProvider');
  return context;
};

/**
 * Convenience hook for layouts: registers an `open` callback on mount and
 * automatically clears it on unmount. The Navbar will render a mobile sidebar
 * trigger only while a callback is registered.
 */
export const useRegisterSidebar = (openFn) => {
  const { registerSidebar, unregisterSidebar } = useSidebar();

  useEffect(() => {
    registerSidebar(openFn);
    return () => unregisterSidebar();
  }, [openFn, registerSidebar, unregisterSidebar]);
};
