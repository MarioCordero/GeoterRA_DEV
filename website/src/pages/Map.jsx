import React from 'react';
import MapContainer from '../components/mapComponents/mapComponent';
import LoggedHeader from '../components/loggedHeader';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSession } from '../hooks/useSession';

const Map = () => {
  const { isLogged, loading } = useSession();

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