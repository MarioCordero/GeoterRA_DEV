import React, { useEffect, useState } from 'react';
import MapContainer from '../components/mapComponents/mapComponent';
import LoggedHeader from '../components/loggedHeader';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Map = () => {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://163.178.171.105/API/check_session.php", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setIsLogged(data.status === "logged_in");
      } catch (err) {
        setIsLogged(false);
      }
    };
    checkSession();
  }, []);

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