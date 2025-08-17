import React, { useEffect, useState } from 'react';
import MapContainer from '../components/mapComponents/mapComponent';
import LoggedHeader from '../components/loggedHeader';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { buildApiUrl } from '../config/apiConf';

const Map = () => {
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);

  // Session token management functions (same as in loginForm)
  const getSessionToken = () => {
    return localStorage.getItem('geoterra_session_token');
  };

  const buildHeaders = () => {
    const headers = {};
    const token = getSessionToken();
    if (token) {
      headers['X-Session-Token'] = token;
    }
    return headers;
  };

  useEffect(() => {
    // Check session on mount with token support
    const checkSession = async () => {
      try {
        setLoading(true);
        const token = getSessionToken();
        const response = await fetch(buildApiUrl("check_session.php"), {
          method: "GET",
          credentials: "include",
          headers: buildHeaders(), // Include token in headers
        });
        const apiResponse = await response.json();
        if (apiResponse.response === 'Ok' && 
            apiResponse.data && 
            apiResponse.data.status === 'logged_in') {
            setIsLogged(true);
        } else {
          setIsLogged(false);
          // Optionally clear invalid token
          if (token) {
            console.log('Clearing invalid session token');
            localStorage.removeItem('geoterra_session_token');
          }
        }
      } catch (err) {
        console.error("Session check failed:", err);
        console.log('Session check failed');
        setIsLogged(false);
        // Clear token on error
        localStorage.removeItem('geoterra_session_token');
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  // Show loading state while checking session
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {isLogged ? <LoggedHeader /> : <Header />}
      <div style={{ flex: 1 }}>
        <MapContainer />
      </div>
      <Footer />
    </div>
  );
};

export default Map;