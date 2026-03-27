import { Navigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import Footer from '../components/common/Footer';
import Sidebar from '../components/loggedComponents/Sidebar';
import React, { useState, useEffect } from 'react';
import AppHeader from '../components/common/Header';
import DashboardContentController from '../components/dashboard/DashboardContentController';

const Dashboard = () => {
  const { user, isLogged, loading } = useSession();
  const [selectedKey, setSelectedKey] = useState('1');
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive logic
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

  // TODO : CREATE A LOADING SCREEN COMPONENT AND USE IT HERE INSTEAD OF THIS    
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  // If not authenticated, redirect to Login
  if (!isLogged || !user) {
    return <Navigate to="/Login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Header */}
      <AppHeader />

      <div className="flex flex-1 pt-16">
        {/* Navigation Sidebar (Desktop/Mobile) */}
        <Sidebar
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobile={isMobile}
        />

        {/* Main Content Area */}
        <main
          className="flex-1 flex flex-col overflow-auto"
          style={{
            marginLeft: isMobile ? 0 : (collapsed ? '80px' : '220px'),
            transition: 'margin-left 0.3s ease',
            marginBottom: isMobile ? '60px' : 0,
          }}
        >
          <div className="flex-1 relative">
            <DashboardContentController
              selectedKey={selectedKey}
              user={user}
              setSelectedKey={setSelectedKey}
            />
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;