import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as authService from '../api/authService';

const AuthContext = createContext(null);

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes
const THROTTLE_DELAY = 60 * 1000; // Throttle activity events to once per minute

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);
  const lastActivity = useRef(Date.now());

  // Clear all tokens from localStorage
  const clearTokens = useCallback(() => {
    localStorage.removeItem('jb_access_token');
    localStorage.removeItem('jb_refresh_token');
  }, []);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      clearTokens();
      setUser(null);
      navigate('/login');
      toast('You\'ve been logged out due to inactivity.', { icon: '🔒' });
    }, INACTIVITY_LIMIT);
  }, [clearTokens, navigate]);

  // Throttled activity handler
  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivity.current < THROTTLE_DELAY) return;
    lastActivity.current = now;
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Set up inactivity listeners when user is authenticated
  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'keypress', 'scroll', 'click'];
    events.forEach((event) => document.addEventListener(event, handleActivity));
    resetInactivityTimer();

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, handleActivity),
      );
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [user, handleActivity, resetInactivityTimer]);

  // Validate session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('jb_access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        setUser(response.data.user);
      } catch {
        clearTokens();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [clearTokens]);

  const login = useCallback(
    async (credentials) => {
      const response = await authService.login(credentials);
      const { user: userData, accessToken, refreshToken } = response.data;
      localStorage.setItem('jb_access_token', accessToken);
      localStorage.setItem('jb_refresh_token', refreshToken);
      setUser(userData);
      // Return the inner payload so callers can read `data.user` directly
      return response.data;
    },
    [],
  );

  const register = useCallback(
    async (formData) => {
      const response = await authService.register(formData);
      const { user: userData, accessToken, refreshToken } = response.data;
      localStorage.setItem('jb_access_token', accessToken);
      localStorage.setItem('jb_refresh_token', refreshToken);
      setUser(userData);
      // Return the inner payload so callers can read `data.user` directly
      return response.data;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('jb_refresh_token');
      if (refreshToken) await authService.logout(refreshToken);
    } catch {
      // Server-side logout may fail — continue with local cleanup
    } finally {
      clearTokens();
      setUser(null);
      navigate('/');
    }
  }, [clearTokens, navigate]);

  const logoutAll = useCallback(async () => {
    try {
      await authService.logoutAll();
      toast.success('All sessions logged out.');
    } catch {
      // Continue with local cleanup
    } finally {
      clearTokens();
      setUser(null);
      navigate('/');
    }
  }, [clearTokens, navigate]);

  const updateUser = useCallback((updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  }, []);

  const isAuthenticated = !!user;
  const isCompany = user?.role === 'company';
  const isCandidate = user?.role === 'candidate';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        logoutAll,
        updateUser,
        isAuthenticated,
        isCompany,
        isCandidate,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
