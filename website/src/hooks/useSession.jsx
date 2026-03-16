import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { users, auth } from '../config/apiConf';

const SessionContext = createContext({
  user: null,
  loading: true,
  error: null,
  refresh: async () => {},
  logout: async () => {},
});

export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(users.me(), {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (res.status === 401) {
        setUser(null);
        return null;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${text}`);
      }

      const body = await res.json();
      if (body.response === 'Ok' && body.data) {
        setUser(body.data);
        return body.data;
      }

      setUser(null);
      return null;
    } catch (err) {
      setError(err.message || 'Error fetching session');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(auth.logout(), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });
    } catch (err) {
      // ignore network errors on logout, but clear client state
      console.error('Logout error', err);
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return (
    <SessionContext.Provider value={{ user, loading, error, refresh: fetchSession, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
export default SessionContext;