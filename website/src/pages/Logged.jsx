import React, { useState } from 'react';
import SidebarLayout from '../components/loggedComponents/loggedSidebar';
import LoggedMainPage from '../components/loggedComponents/loggedMainPage';
import LoggedHeader from '../components/loggedHeader';
import Footer from '../components/Footer';
// Import other pages as needed
import Solicitudes from '../components/loggedComponents/loggedRequests';

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

const PerfilPlaceholder = () => (
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
    👤 Perfil de usuario - En construcción...
  </div>
);

const Logged = () => {
  const [selectedKey, setSelectedKey] = useState('1');

  let content;
  if (selectedKey === '1') content = <LoggedMainPage />;
  else if (selectedKey === '2') content = <PerfilPlaceholder />;
  else if (selectedKey === '3') content = <Solicitudes />;
  else content = <DashboardPlaceholder />;

  return (
    <div className="min-h-screen flex flex-col">
      <LoggedHeader />
      <div className="flex flex-1 pt-16"> 
        <SidebarLayout selectedKey={selectedKey} setSelectedKey={setSelectedKey} />
        <div className="flex-1 flex flex-col overflow-auto">
          {content}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Logged;