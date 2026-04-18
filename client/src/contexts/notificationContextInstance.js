import { createContext } from 'react';

// Lives in its own (non-JSX, non-component) module so that the file
// holding <NotificationProvider /> can stay component-only — required for
// Vite/React Fast Refresh to preserve state on edits.
export const NotificationContext = createContext(null);
