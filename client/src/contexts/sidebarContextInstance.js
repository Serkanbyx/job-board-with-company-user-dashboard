import { createContext } from 'react';

// Lives in its own module (no JSX, no components) so the file holding
// <SidebarProvider /> can stay component-only — required for Vite/React
// Fast Refresh to preserve state on edits.
export const SidebarContext = createContext(null);
