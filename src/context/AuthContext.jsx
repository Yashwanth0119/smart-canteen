import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_canteen_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && parsed.name) {
        parsed.name = parsed.name.replace(/\s*\(Student\)/gi, '').trim();
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('smart_canteen_token') || (user ? 'canteen-token-' + (user.username || 'demo') : null);
  });

  const [loading, setLoading] = useState(false);

  // Sync balance from server
  const syncBalance = useCallback(async () => {
    if (!user || user.role !== 'student') return;
    try {
      const res = await fetch(`/api/auth/balance/${user.username}`);
      const data = await res.json();
      if (data.success && data.balance !== undefined) {
        setUser(prev => {
          if (!prev || prev.balance === data.balance) return prev;
          const updated = { ...prev, balance: data.balance };
          localStorage.setItem('smart_canteen_user', JSON.stringify(updated));
          return updated;
        });
      }
    } catch {
      // silent
    }
  }, [user?.username, user?.role]);

  useEffect(() => {
    if (user && user.role === 'student') {
      syncBalance();
      const interval = setInterval(syncBalance, 8000);
      return () => clearInterval(interval);
    }
  }, [user?.username, user?.role, syncBalance]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      const userData = data.user;
      if (userData.name) {
        userData.name = userData.name.replace(/\s*\(Student\)/gi, '').trim();
      }
      const authToken = data.token || ('token-' + userData.username + '-' + Date.now());

      setUser(userData);
      setToken(authToken);
      localStorage.setItem('smart_canteen_user', JSON.stringify(userData));
      localStorage.setItem('smart_canteen_token', authToken);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed. Please check the details.');
      }

      const userData = data.user;
      if (userData.name) {
        userData.name = userData.name.replace(/\s*\(Student\)/gi, '').trim();
      }
      const authToken = data.token || ('token-' + userData.username + '-' + Date.now());

      setUser(userData);
      setToken(authToken);
      localStorage.setItem('smart_canteen_user', JSON.stringify(userData));
      localStorage.setItem('smart_canteen_token', authToken);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('smart_canteen_user');
    localStorage.removeItem('smart_canteen_token');
  };

  const updateBalance = (newBalance) => {
    setUser(prev => {
      const updated = { ...prev, balance: newBalance };
      localStorage.setItem('smart_canteen_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateBalance,
    syncBalance
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
