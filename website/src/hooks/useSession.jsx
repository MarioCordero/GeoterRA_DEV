import { useState, useEffect } from 'react';
import { buildApiUrl } from '../config/apiConf';

export const useSession = () => {
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const getSessionToken = () => {
    return localStorage.getItem('geoterra_session_token');
  };

  const setSessionToken = (token) => {
    if (token) {
      localStorage.setItem('geoterra_session_token', token);
    } else {
      localStorage.removeItem('geoterra_session_token');
    }
  };

  const buildHeaders = () => {
    const headers = {};
    const token = getSessionToken();
    if (token) {
      headers['X-Session-Token'] = token;
    }
    return headers;
  };

  const checkSession = async () => {
    try {
      setLoading(true);
      const token = getSessionToken();
      const response = await fetch(buildApiUrl("check_session.php"), {
        method: "GET",
        credentials: "include",
        headers: buildHeaders(),
      });
      const apiResponse = await response.json();
      if (apiResponse.response === 'Ok' && 
          apiResponse.data && 
          apiResponse.data.status === 'logged_in') {
        setIsLogged(true);
        setUser(apiResponse.data.user || null);
      } else {
        setIsLogged(false);
        setUser(null);
        if (token) {
          console.log('Clearing invalid session token');
          setSessionToken(null);
        }
      }
    } catch (err) {
      console.error("Session check failed:", err);
      setIsLogged(false);
      setUser(null);
      setSessionToken(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsLogged(false);
    setUser(null);
    setSessionToken(null);
  };

  useEffect(() => {
    checkSession();
  }, []);

  return {
    isLogged,
    loading,
    user,
    checkSession,
    logout,
    getSessionToken,
    setSessionToken,
    buildHeaders,
  };
};