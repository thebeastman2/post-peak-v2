import React, { createContext, useState, useContext, useEffect } from 'react';

import { db } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    setAuthError(null);
    try {
      // Resolve the app's access policy first so a gated app never renders an
      // empty shell. A 403 carries the reason in extra_data.reason:
      // "auth_required" (visitor must sign in) or "user_not_registered"
      // (signed in but not granted access).
      setIsLoadingPublicSettings(true);
      try {
        const settings = await db.app.getPublicSettings();
        setAppPublicSettings({ id: settings.id, public_settings: settings.public_settings });
      } catch (err) {
        const reason = err?.data?.extra_data?.reason;
        if (err?.status === 403 && (reason === 'auth_required' || reason === 'user_not_registered')) {
          setAuthError({ type: reason });
          return;
        }
        // Backend unreachable (e.g. frontend-only build): run as a public app.
      }

      setIsLoadingAuth(true);
      try {
        const authed = await db.auth.isAuthenticated();
        setIsAuthenticated(authed);
        if (authed) {
          setUser(await db.auth.me());
        }
      } catch (err) {
        setIsAuthenticated(false);
        setUser(null);
      }
      setAuthChecked(true);
    } finally {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const navigateToLogin = () => {
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        setAuthError,
        authChecked,
        appPublicSettings,
        checkAppState,
        navigateToLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
