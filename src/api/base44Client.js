/// <reference types="vite/client" />
import { createClient } from '@base44/sdk';

// Shared Base44 SDK client. `base44 dev` and `base44 build` inject
// VITE_BASE44_APP_ID (and optionally VITE_BASE44_BACKEND_URL). Without a
// configured backend the app runs frontend-only and SDK calls fail softly.
// Keep `import.meta.env.X` accesses as direct chains: Vite replaces them
// statically at build time (wrapping `import.meta` defeats that).
const appId = import.meta.env.VITE_BASE44_APP_ID;

export const db = createClient({
  appId,
  serverUrl: import.meta.env.VITE_BASE44_BACKEND_URL,
  // Don't start analytics sessions when no backend is configured.
  ...(appId ? {} : { analytics: { enabled: false } }),
});

export const base44 = db;
export default db;
