import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import LoggedHeader from '../components/common/loggedHeader';
import Footer from '../components/common/Footer';
import LoggedAdminMainPage from '../components/loggedAdminComponents/loggedAdminDashboard';
import AdminRequests from '../components/common/UserRequests';
import AdminRequestsManager from '../components/loggedAdminComponents/loggedAdminRequestsManager';

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

  // ✅ Map menu keys to components
  let content;
  switch (selectedKey) {
    case '1':
      // Dashboard / Main Page
      content = <LoggedAdminMainPage />;
      break;
    case '2':
      // My Requests (User view)
      content = <AdminRequests />;
      break;
    case '3':
      // Manage All Requests (Admin view)
      content = <AdminRequestsManager />;
      break;
    case '4':
      // Profile
      content = <PerfilPlaceholder />;
      break;
    default:
      content = <LoggedAdminMainPage />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LoggedHeader />
      <div className="flex flex-1 pt-16">
        <Sidebar
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
            transition: 'margin-loss 0.3s ease',
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