import React, { useState } from 'react';
import SidebarLayout from '../components/loggedAdminComponents/loggedAdminSidebar';
import LoggedHeader from '../components/loggedHeader';
import Footer from '../components/Footer';
// Import admin components
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
    📊 Panel de Administración - Dashboard
  </div>
);

const AnalisisLaboratoriosPlaceholder = () => (
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
    🧪 Análisis de Laboratorios - En construcción...
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
    👤 Perfil de Administrador - En construcción...
  </div>
);

const LoggedAdmin = () => {
  const [selectedKey, setSelectedKey] = useState('1');

  let content;
  if (selectedKey === '1') content = <DashboardPlaceholder />;
  else if (selectedKey === '2') content = <Solicitudes />;
  else if (selectedKey === '3') content = <AnalisisLaboratoriosPlaceholder />;
  else if (selectedKey === '4') content = <PerfilPlaceholder />;
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

export default LoggedAdmin;