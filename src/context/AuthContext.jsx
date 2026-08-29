import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const WORKER_URL = 'https://shunnyo-backend.mail-cde.workers.dev';

// Check if auth bypass mode (for demo/development)
const IS_DEMO_MODE = false; // Set true to skip login for testing

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [isLoading, setIsLoading] = useState(true); // checking stored token
  const [authError, setAuthError] = useState('');

  // On mount: validate stored token
  useEffect(() => {
    const validateToken = async () => {
      if (IS_DEMO_MODE) {
        setIsAuthenticated(true);
        setAuthUser({ id: 'demo', name: 'Demo User', username: '@demo', email: 'demo@shunnyo.app' });
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('shunnyo_auth_token');
        const savedUser = localStorage.getItem('shunnyo_auth_user');
        if (token && savedUser) {
          // Verify token with backend
          const res = await fetch(`${WORKER_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            setAuthUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('shunnyo_auth_token');
            localStorage.removeItem('shunnyo_auth_user');
          }
        }
      } catch (err) {
        console.warn('[Auth] Token validation failed:', err);
        // Fallback: if backend unreachable but token exists, allow login
        const token = localStorage.getItem('shunnyo_auth_token');
        const savedUser = localStorage.getItem('shunnyo_auth_user');
        if (token && savedUser) {
          setAuthUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = async (identifier, password) => {
    setAuthError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'লগইন ব্যর্থ হয়েছে');

      localStorage.setItem('shunnyo_auth_token', data.token);
      localStorage.setItem('shunnyo_auth_user', JSON.stringify(data.user));
      setAuthUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      // Fallback demo login for testing when backend unavailable
      if (identifier === 'demo' && password === 'demo123') {
        const demoUser = { id: 'demo-1', name: 'Demo User', username: '@demo', email: 'demo@shunnyo.app' };
        localStorage.setItem('shunnyo_auth_token', 'demo-token');
        localStorage.setItem('shunnyo_auth_user', JSON.stringify(demoUser));
        setAuthUser(demoUser);
        setIsAuthenticated(true);
      } else {
        setAuthError(err.message || 'সংযোগ ব্যর্থ। ইন্টারনেট সংযোগ পরীক্ষা করুন।');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, username, email, password) => {
    setAuthError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${WORKER_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'নিবন্ধন ব্যর্থ হয়েছে');

      localStorage.setItem('shunnyo_auth_token', data.token);
      localStorage.setItem('shunnyo_auth_user', JSON.stringify(data.user));
      setAuthUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError(err.message || 'নিবন্ধন ব্যর্থ। পরে আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('shunnyo_auth_token');
    localStorage.removeItem('shunnyo_auth_user');
    setAuthUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      authUser,
      authView,
      setAuthView,
      isLoading,
      authError,
      setAuthError,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
