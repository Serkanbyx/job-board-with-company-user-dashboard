import { useCallback, useState } from 'react';
import { SidebarContext } from './sidebarContextInstance';

/**
 * Holds an `openSidebar` callback that dashboard layouts (Admin/Company/
 * Candidate) register on mount. The Navbar consumes this to render a single,
 * consistently-placed mobile trigger inside the header — instead of every
 * layout floating its own button over the page content.
 *
 * The function-in-state pattern (`useState(() => null)` + `useCallback`) lets
 * us store a callable directly without React calling it as an updater.
 */
export const SidebarProvider = ({ children }) => {
  const [openSidebar, setOpenSidebarState] = useState(null);

  const registerSidebar = useCallback((openFn) => {
    setOpenSidebarState(() => openFn);
  }, []);

  const unregisterSidebar = useCallback(() => {
    setOpenSidebarState(null);
  }, []);

  return (
    <SidebarContext.Provider value={{ openSidebar, registerSidebar, unregisterSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
