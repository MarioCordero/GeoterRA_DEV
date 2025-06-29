import React from 'react';
import SidebarLayout from '../components/loggedComponents/loggedSidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DashboardPlaceholder = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      minHeight: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      color: '#888',
      background: '#f5f5f5',
      borderRadius: '8px',
      margin: '2rem 0',
    }}
  >
    Dashboard en construcción...
  </div>
);

const Logged = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <div className="flex flex-1 pt-16">
      <SidebarLayout />
      <div className="flex-1 flex flex-col overflow-auto">
        <DashboardPlaceholder />
        <Footer />
      </div>
    </div>
  </div>
);

export default Logged;