import React, { useState } from 'react';
import { Layout, Button, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/GeoterRA-Logo-Color.svg';
import '../colorModule.css';
import '../fontsModule.css';
import { buildApiUrl } from '../config/apiConf';

const { Header } = Layout;

export default function AppHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // Session token management functions
  const getSessionToken = () => {
    return localStorage.getItem('geoterra_session_token');
  };

  const clearSessionToken = () => {
    localStorage.removeItem('geoterra_session_token');
  };

  const buildHeaders = () => {
    const headers = {};
    const token = getSessionToken();
    if (token) {
      headers['X-Session-Token'] = token;
    }
    return headers;
  };

  // Function to check session before navigating to profile
  const handleProfileClick = async (e) => {
    e.preventDefault(); // Prevent default link behavior
    
    try {
      // console.log("Checking session before profile access...");
      
      // Check if token exists first
      const token = getSessionToken();
      // console.log("Session token present:", !!token);

      const response = await fetch(buildApiUrl("check_session.php"), {
        method: "GET",
        credentials: "include",
        headers: buildHeaders(), // Include session token
      });
      
      const apiResponse = await response.json();
      // console.log("Session check response:", apiResponse);
      
      // Check if API response is successful
      if (apiResponse.response === 'Ok' && 
          apiResponse.data && 
          apiResponse.data.status === 'logged_in') {
        // console.log('✅ Session is active - checking user type');
        
        const userData = apiResponse.data;
        
        // Check if user is admin
        if (userData.user_type === 'admin' || userData.is_admin === true || userData.admin === true) {
          // console.log('User is admin - redirecting to admin panel');
          navigate('/LoggedAdmin');
        } else {
          // console.log('User is regular user - redirecting to user profile');
          navigate('/Logged');
        }
      } else {
        // console.log('❌ Session is not active - clearing token and redirecting to login');
        clearSessionToken(); // Clear invalid token
        navigate('/Login');
      }
    } catch (err) {
      console.error("Session check failed:", err);
      // console.log('Session check failed - clearing token and redirecting to login');
      clearSessionToken(); // Clear token on error
      navigate('/Login');
    }
  };

  // Enhanced logout function
  const handleLogout = async () => {
    try {
      // Call logout endpoint if you have one
      await fetch(buildApiUrl("logout.php"), {
        method: "POST",
        credentials: "include",
        headers: buildHeaders(),
      });
      // console.log("Logout API called successfully");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      clearSessionToken(); // Always clear token
      navigate("/");
    }
  };

  const navItems = [
    { key: 'about', path: '/#about-us', label: 'Acerca de nosotros' },
    { key: 'how', path: '/#how-works', label: 'Cómo funciona' },
    { key: 'contact', path: '/#contact-us', label: 'Contacto' },
    { key: 'map', path: '/map', label: 'Mapa' },
    { key: 'profile', path: '/Logged', label: 'Mi Perfil', requiresAuth: true },
    { key: 'logout', label: 'Cerrar Sesión', requiresAuth: true, isLogout: true }, // Add logout option
  ];

  const renderNavButton = (item) => {
    if (item.isLogout) {
      // Special handling for logout button
      return (
        <Button
          key={item.key}
          type="text"
          className="poppins text-white! bg-red-500 poppins-bold"
          style={{ transition: 'transform 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          onClick={handleLogout}
        >
          {item.label}
        </Button>
      );
    } else if (item.requiresAuth) {
      // For "Mi Perfil", use click handler instead of Link
      return (
        <Button
          key={item.key}
          type="text"
          className="poppins text-white! bg-geoterra-orange poppins-bold"
          style={{ transition: 'transform 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          onClick={handleProfileClick}
        >
          {item.label}
        </Button>
      );
    } else {
      // For other items, use regular Link
      return (
        <Button
          key={item.key}
          type="text"
          className="poppins text-geoterra-blue"
          style={{ transition: 'transform 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Link to={item.path}>{item.label}</Link>
        </Button>
      );
    }
  };

  const renderMobileNavButton = (item) => {
    if (item.isLogout) {
      return (
        <Button
          key={item.key}
          type="text"
          block
          style={{ marginBottom: '8px', backgroundColor: '#ef4444', color: 'white' }}
          onClick={() => {
            setDrawerOpen(false);
            handleLogout();
          }}
        >
          {item.label}
        </Button>
      );
    } else if (item.requiresAuth) {
      return (
        <Button
          key={item.key}
          type="text"
          block
          style={{ marginBottom: '8px' }}
          onClick={(e) => {
            setDrawerOpen(false);
            handleProfileClick(e);
          }}
        >
          {item.label}
        </Button>
      );
    } else {
      return (
        <Button
          key={item.key}
          type="text"
          block
          style={{ marginBottom: '8px' }}
          onClick={() => setDrawerOpen(false)}
        >
          <Link to={item.path}>{item.label}</Link>
        </Button>
      );
    }
  };

  return (
    <Header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        background: '#fff',
        padding: '0 24px',
        boxShadow: '0 2px 8px #f0f1f2',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <div style={{ height: '100%' }}>
        <Link to="/">
          <img src={logo} alt="GeoTerRA Logo" style={{ height: '50%', marginTop: '12px' }} />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="desktop-menu" style={{ display: 'flex', gap: '16px' }}>
        {navItems.map((item) => renderNavButton(item))}
      </div>

      {/* Mobile Menu Button */}
      <Button
        className="mobile-menu"
        type="text"
        icon={<MenuOutlined />}
        onClick={() => setDrawerOpen(true)}
        style={{ display: 'none' }}
      />

      {/* Mobile Drawer */}
      <Drawer
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        title={
          <Link to="/">
            <img src={logo} alt="GeoTerRA Logo" style={{ height: '40px' }} />
          </Link>
        }
      >
        {navItems.map((item) => renderMobileNavButton(item))}
      </Drawer>
    </Header>
  );
}