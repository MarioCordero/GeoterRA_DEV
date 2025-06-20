import React from 'react';
import MapContainer from '../components/mapComponents/mapComponent';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Map = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1 }}>
        <MapContainer />
      </div>
      <Footer />
    </div>
  );
};

export default Map;