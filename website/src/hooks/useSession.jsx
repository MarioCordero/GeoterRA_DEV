import { useState, useEffect } from 'react';
import { users, auth } from '../config/apiConf';

export const useSession = () => {
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Token management
  const getAccessToken = () => {
    return localStorage.getItem('geoterra_access_token');
  };

  const getRefreshToken = () => {
    return localStorage.getItem('geoterra_refresh_token');
  };

  const setTokens = (accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem('geoterra_access_token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('geoterra_refresh_token', refreshToken);
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('geoterra_access_token');
    localStorage.removeItem('geoterra_refresh_token');
  };

  // Build headers with Bearer token
  const buildHeaders = () => {
    const token = getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  // Check if user is logged in (verify token validity)
  const checkSession = async () => {
    try {
      setLoading(true);
      const token = getAccessToken();
      
      if (!token) {
        setIsLogged(false);
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch(users.me(), {
        method: 'GET',
        headers: buildHeaders(),
      });

      if (!response.ok) {
        // Token expired or invalid
        if (response.status === 401) {
          console.log('Token expired, attempting refresh...');
          await refreshAccessToken();
        } else {
          clearTokens();
          setIsLogged(false);
          setUser(null);
        }
        return;
      }

      const apiResponse = await response.json();
      
      if (apiResponse.errors && apiResponse.errors.length === 0 && apiResponse.data) {
        setIsLogged(true);
        setUser(apiResponse.data);
      } else {
        clearTokens();
        setIsLogged(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Session check failed:', err);
      setIsLogged(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh access token using refresh token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        clearTokens();
        setIsLogged(false);
        return false;
      }

      const response = await fetch(auth.refresh(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        clearTokens();
        setIsLogged(false);
        return false;
      }

      const apiResponse = await response.json();
      
      if (apiResponse.data && apiResponse.data.access_token) {
        setTokens(apiResponse.data.access_token, refreshToken);
        await checkSession();
        return true;
      } else {
        clearTokens();
        setIsLogged(false);
        return false;
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      clearTokens();
      setIsLogged(false);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    if (isLoggingOut) {
      console.log('Logout already in progress...');
      return;
    }

    try {
      setIsLoggingOut(true);
      
      const response = await fetch(auth.logout(), {
        method: 'POST',
        headers: buildHeaders(),
      });

      if (!response.ok) {
        console.warn('Server logout failed:', response.status);
      }
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      clearTokens();
      setIsLogged(false);
      setUser(null);
      setIsLoggingOut(false);
    }
  };

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  return {
    isLogged,
    loading,
    user,
    checkSession,
    logout,
    getAccessToken,
    setTokens,
    buildHeaders,
    refreshAccessToken,
  };
};