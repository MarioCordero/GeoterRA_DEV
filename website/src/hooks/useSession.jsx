import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { users, auth } from '../config/apiConf';

const SessionContext = createContext({
  user: null,
  loading: false,
  error: null,
  refresh: async () => {},
  logout: async () => {},
});

export const SessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const meSessionUrl = users.meSession();
      
      const res = await fetch(meSessionUrl, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (res.status === 401) {
        console.warn('⚠️ [useSession] 401 Unauthorized - No hay sesión válida');
        setUser(null);
        return null;
      }
      
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('❌ [useSession] HTTP error:', res.status, text);
        throw new Error(`HTTP ${res.status}`);
      }

      const body = await res.json();
      
      if (body.data) {
        setUser(body.data);
        return body.data;
      }

      console.warn('⚠️ [useSession] Respuesta OK pero sin body.data');
      setUser(null);
      return null;
    } catch (err) {
      console.error('❌ [useSession] Error en fetchSession:', err);
      setError(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const logoutUrl = auth.logout();
      
      const res = await fetch(logoutUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });
      
    } catch (err) {
      console.error('[useSession] Logout error:', err);
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchSession().then((result) => {
      setInitialized(true);
    });

    return () => {};
  }, [fetchSession]);

  return (
    <SessionContext.Provider value={{ isLogged: !!user, user, loading, error, refresh: fetchSession, checkSession: fetchSession, logout }}>
      {initialized && children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
export default SessionContext;
