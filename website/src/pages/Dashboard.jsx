import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import Sidebar from '../components/common/Sidebar';
import LoggedHeader from '../components/common/loggedHeader';
import Footer from '../components/common/Footer';
import DashboardContentController from '../components/dashboard/DashboardContentController';

/**
 * Dashboard Page
 * 
 * Unified landing page for all authenticated users.
 * Uses a side sidebar and a header, rendering the appropriate 
 * content based on user role and menu selection.
 */
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

  // Show a loading screen while resolving the session context
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
      <LoggedHeader />

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
            marginBottom: isMobile ? '60px' : 0, // Bottom space for mobile nav
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