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
    console.log('🔵 [useSession] fetchSession() iniciado');
    setLoading(true);
    setError(null);
    try {
      const meSessionUrl = users.meSession();
      console.log('📍 [useSession] URL:', meSessionUrl);
      
      const res = await fetch(meSessionUrl, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      console.log('📥 [useSession] Respuesta recibida - Status:', res.status);
      console.log('📥 [useSession] Headers:', {
        'Content-Type': res.headers.get('content-type'),
        'Set-Cookie': res.headers.get('set-cookie'),
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
      console.log('✅ [useSession] Respuesta JSON:', body);
      
      if (body.data) {
        console.log('✅ [useSession] Usuario establecido:', body.data);
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
      console.log('🔵 [useSession] fetchSession() finalizado');
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('🔵 [useSession] logout() iniciado');
    try {
      const logoutUrl = auth.logout();
      console.log('📍 [useSession] Logout URL:', logoutUrl);
      
      const res = await fetch(logoutUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });
      
      console.log('📥 [useSession] Logout respuesta:', res.status);
    } catch (err) {
      console.error('❌ [useSession] Logout error:', err);
    } finally {
      console.log('✅ [useSession] Usuario limpiado');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    console.log('🔵 [useSession] useEffect iniciado (mount)');
    
    // ✅ CAMBIO: No revisar document.cookie (HttpOnly las hace invisibles)
    // Simplemente siempre intentar fetchear la sesión
    console.log('✅ [useSession] Intentando validar sesión con el servidor...');
    
    fetchSession().then((result) => {
      console.log('✅ [useSession] fetchSession completado, resultado:', result);
      setInitialized(true);
    });

    return () => {
      console.log('🔵 [useSession] useEffect cleanup');
    };
  }, [fetchSession]);

  console.log('📊 [useSession] Estado actual:', { user, loading, initialized });

  return (
    <SessionContext.Provider value={{ user, loading, error, refresh: fetchSession, logout }}>
      {initialized && children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
export default SessionContext;