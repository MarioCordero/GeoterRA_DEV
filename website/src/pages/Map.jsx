import React, { useEffect, useState } from 'react';
import MapContainer from '../components/mapComponents/mapComponent';
import LoggedHeader from '../components/loggedHeader';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Map = () => {
  const [isLogged, setIsLogged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session...");
        // http://geoterra.com/API/check_session.php
        // http://163.178.171.105/API/check_session.php
        const response = await fetch("http://163.178.171.105/API/check_session.php", {
          method: "GET",
          credentials: "include",
        });
        const apiResponse = await response.json();
        console.log("Session check response:", apiResponse);
        
        if (apiResponse.response === 'Ok' && apiResponse.data.status === 'logged_in') {
          console.log('Session is active');
          setIsLogged(true);
        } else {
          console.log('Session is not active');
          setIsLogged(false);
        }
      } catch (err) {
        console.error("Session check failed:", err);
        console.log('Session check failed');
        setIsLogged(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Show loading state while checking session
  if (isLoading) {
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