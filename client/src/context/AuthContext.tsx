import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_SERVER_URL || `http://${window.location.hostname}:3001`;

interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Set default Authorization header for all axios requests
const setAxiosAuth = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore auth from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('cc_token');
    const savedUser = localStorage.getItem('cc_user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        setAxiosAuth(savedToken);
      } catch {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password });
    if (!res.data.success) throw new Error(res.data.message || 'Login failed');
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    setAxiosAuth(t);
    localStorage.setItem('cc_token', t);
    localStorage.setItem('cc_user', JSON.stringify(u));
  }, []);

  const signup = useCallback(async (username: string, name: string, email: string, password: string) => {
    const res = await axios.post(`${API}/api/auth/register`, { username, name, email, password });
    if (!res.data.success) throw new Error(res.data.message || 'Signup failed');
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    setAxiosAuth(t);
    localStorage.setItem('cc_token', t);
    localStorage.setItem('cc_user', JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setAxiosAuth(null);
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
