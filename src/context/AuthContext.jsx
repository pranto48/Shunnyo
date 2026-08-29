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

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('shunnyo_auth_token', data.token);
        localStorage.setItem('shunnyo_auth_user', JSON.stringify(data.user));
        setAuthUser(data.user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('[Auth] Backend unreachable, trying local fallback:', err.message);
    }

    // ─── Local Fallback Auth (works without backend) ───
    const id = identifier.trim().toLowerCase();
    const pw = password.trim();

    // Admin credentials
    if ((id === 'mail@arifmahmud.com' || id === 'admin') && pw === 'Aa329093+-') {
      const adminUser = { id: 'admin-1', name: 'Arif Mahmud', username: '@admin', email: 'mail@arifmahmud.com', role: 'Super Admin' };
      localStorage.setItem('shunnyo_auth_token', `admin-token-${Date.now()}`);
      localStorage.setItem('shunnyo_auth_user', JSON.stringify(adminUser));
      setAuthUser(adminUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // Demo credentials
    if ((id === 'demo' || id === 'demo@shunnyo.app') && pw === 'demo123') {
      const demoUser = { id: 'demo-1', name: 'Demo User', username: '@demo', email: 'demo@shunnyo.app', role: 'User' };
      localStorage.setItem('shunnyo_auth_token', `demo-token-${Date.now()}`);
      localStorage.setItem('shunnyo_auth_user', JSON.stringify(demoUser));
      setAuthUser(demoUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // Check locally registered users
    try {
      const localUsers = JSON.parse(localStorage.getItem('shunnyo_local_users') || '[]');
      const found = localUsers.find(u =>
        (u.email.toLowerCase() === id || u.username.toLowerCase() === id) && u.password === pw
      );
      if (found) {
        const user = { id: found.id, name: found.name, username: found.username, email: found.email, role: 'User' };
        localStorage.setItem('shunnyo_auth_token', `user-token-${Date.now()}`);
        localStorage.setItem('shunnyo_auth_user', JSON.stringify(user));
        setAuthUser(user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
    } catch {}

    setAuthError('ইমেইল বা পাসওয়ার্ড ভুল। পুনরায় চেষ্টা করুন।');
    setIsLoading(false);
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

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('shunnyo_auth_token', data.token);
        localStorage.setItem('shunnyo_auth_user', JSON.stringify(data.user));
        setAuthUser(data.user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('[Auth] Register backend unreachable, using local storage:', err.message);
    }

    // ─── Local Registration Fallback ───
    try {
      const localUsers = JSON.parse(localStorage.getItem('shunnyo_local_users') || '[]');
      const emailExists = localUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
      const usernameExists = localUsers.some(u => u.username.toLowerCase() === username.toLowerCase());

      if (emailExists) {
        setAuthError('এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে।');
        setIsLoading(false);
        return;
      }
      if (usernameExists) {
        setAuthError('এই ইউজারনেম ইতোমধ্যে ব্যবহৃত হচ্ছে।');
        setIsLoading(false);
        return;
      }

      const newUser = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        username: username.trim().startsWith('@') ? username.trim() : `@${username.trim()}`,
        email: email.trim().toLowerCase(),
        password: password, // Note: local-only, no security needed
        role: 'User',
        createdAt: new Date().toISOString()
      };

      localUsers.push(newUser);
      localStorage.setItem('shunnyo_local_users', JSON.stringify(localUsers));

      const userForSession = { id: newUser.id, name: newUser.name, username: newUser.username, email: newUser.email, role: 'User' };
      localStorage.setItem('shunnyo_auth_token', `user-token-${Date.now()}`);
      localStorage.setItem('shunnyo_auth_user', JSON.stringify(userForSession));
      setAuthUser(userForSession);
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError('নিবন্ধন ব্যর্থ। পরে আবার চেষ্টা করুন।');
    }
    setIsLoading(false);
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
