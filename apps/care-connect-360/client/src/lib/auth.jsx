import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem('careconnect_token'));
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('careconnect_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const setAuth = useCallback((t, u) => {
    setTokenState(t);
    setUser(u);
    if (t) localStorage.setItem('careconnect_token', t); else localStorage.removeItem('careconnect_token');
    if (u) localStorage.setItem('careconnect_user', JSON.stringify(u)); else localStorage.removeItem('careconnect_user');
  }, []);

  const logout = useCallback(() => setAuth(null, null), [setAuth]);

  return (
    <AuthContext.Provider value={{ token, user, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
