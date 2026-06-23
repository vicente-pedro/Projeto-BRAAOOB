import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('agendo_token');
    if (!token) { setLoading(false); return; }

    api.me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('agendo_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { token, user } = await api.login({ email, password });
    localStorage.setItem('agendo_token', token);
    setUser(user);
  }

  async function register(name, email, password) {
    const { token, user } = await api.register({ name, email, password });
    localStorage.setItem('agendo_token', token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem('agendo_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
