import React, { useState, useEffect } from 'react';
import SidebarLayout from '../components/loggedAdminComponents/loggedAdminSidebar';
import LoggedHeader from '../components/loggedHeader';
import Footer from '../components/Footer';

import AdminRequestsManager from '../components/loggedAdminComponents/loggedAdminRequestsManager';
import AdminSolicitudes from '../components/loggedAdminComponents/loggedAdminRequests';

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
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  let content;
  if (selectedKey === '1') content = <DashboardPlaceholder />;
  else if (selectedKey === '2') content = <AdminSolicitudes />;
  else if (selectedKey === '3') content = <AdminRequestsManager />;
  else if (selectedKey === '4') content = <PerfilPlaceholder />;
  else content = <DashboardPlaceholder />;

  return (
    <div className="min-h-screen flex flex-col">
      <LoggedHeader />
      <div className="flex flex-1 pt-16">
        <SidebarLayout
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
        />
        <div
          className="flex-1 flex flex-col overflow-auto"
          style={{
            marginLeft: isMobile ? 0 : (collapsed ? '80px' : '220px'),
            transition: 'margin-left 0.3s ease',
            marginBottom: isMobile ? '60px' : 0,
          }}
        >
          {content}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoggedAdmin;