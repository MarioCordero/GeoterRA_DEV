import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userMeSession, authLogout } from '../config/apiConf';

const SessionContext = createContext({
  user: null,
  loading: false,
  error: null,
  refresh: async () => { },
  logout: async () => { },
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
      // API CALL - using userMeSession() function
      console.log('🔍 [useSession] Verificando sesión con userMeSession()...');
      const result = await userMeSession();

      if (result.ok && result.data) {
        console.log('✅ [useSession] Sesión activa confirmada:', result.data.email, `(Rol: ${result.data.role})`);
        setUser(result.data);
        return result.data;
      }

      if (result.status === 401) {
        console.warn('⚠️ [useSession] 401 Unauthorized - No hay sesión activa o el token no pudo renovarse');
        setUser(null);
        return null;
      }

      console.error('❌ [useSession] Error al obtener sesión:', {
        status: result.status,
        error: result.error,
        raw: result.raw,
      });
      setError(result.error);
      setUser(null);
      return null;

    } catch (err) {
      console.error('❌ [useSession] Excepción al comprobar sesión:', err);
      setError(err.message);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // API CALL - using authLogout() function
      const result = await authLogout();

      if (!result.ok) {
        console.warn('⚠️ [useSession] Logout failed:', result.error);
      }
    } catch (err) {
      console.error('❌ [useSession] Logout exception:', err);
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Always check session on mount, regardless of cookie presence
    fetchSession().then((userData) => {
      setInitialized(true);
    }).catch(() => {
      setInitialized(true);
    });
  }, [fetchSession]);

  return (
    <SessionContext.Provider value={{ isLogged: !!user, user, loading, error, refresh: fetchSession, checkSession: fetchSession, logout }}>
      {initialized && children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
export default SessionContext;