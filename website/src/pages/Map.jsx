import React from 'react';
import MapContainer from '../components/mapComponents/mapComponent';
import LoggedHeader from '../components/common/loggedHeader';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useSession } from '../hooks/useSession';

const Map = () => {
  const { isLogged, loading } = useSession();

  if (loading) {
    // TODO MAKE A GEOTERRA LOADER COMPONENT 
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