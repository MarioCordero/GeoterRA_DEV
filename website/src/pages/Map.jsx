import React from 'react';
import MapContainer from '../components/mapComponents/mapComponent';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../App.css';

const Map = () => {
  return (
    <div className="">
      {/* TODO: Replace with <Navbar /> */}
      <Header />

      <div className="general-container">
        <MapContainer />
      </div>

      {/* TODO: Replace with <Footer /> */}
      <Footer />
    </div>
  );
};

export default Map;