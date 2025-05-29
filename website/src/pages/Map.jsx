import React from 'react';
import MapContainer from '../components/mapComponents/mapComponent';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Map = () => {
  return (
    <div className="general-container">
      {/* TODO: Replace with <Navbar /> */}
      <Header />

      <div className="index-container Montserrat-Regular">
        <MapContainer />
      </div>

      {/* TODO: Replace with <Footer /> */}
      <Footer />
    </div>
  );
};

export default Map;