import { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest, meRequest, registerRequest } from '../api/authApi';
import { setAuthToken } from '../api/http';

const AuthContext = createContext(null);
const storageKey = 'taskflow-dbms-auth';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(storageKey));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let active = true;

    meRequest()
      .then((profile) => {
        if (active) {
          setUser(profile);
        }
      })
      .catch(() => {
        localStorage.removeItem(storageKey);
        setToken(null);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const persistSession = (session) => {
    localStorage.setItem(storageKey, session.token);
    setToken(session.token);
    setUser(session.user);
  };

  const login = async (payload) => {
    const session = await loginRequest(payload);
    persistSession(session);
  };

  const register = async (payload) => {
    const session = await registerRequest(payload);
    persistSession(session);
  };

  const logout = () => {
    localStorage.removeItem(storageKey);
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const value = {
    token,
    user,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
