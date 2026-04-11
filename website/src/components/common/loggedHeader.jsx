import React, { useState } from 'react';
import { Layout, Button, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/GeoterRA-Logo-Color.svg';
import '../../colorModule.css';
import '../../fontsModule.css';
import { useSession } from '../../hooks/useSession';

const { Header } = Layout;

export default function AppHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { isLogged, user, logout: sessionLogout, checkSession } = useSession();

  // Function to check session before navigating to profile
  const handleProfileClick = async (e) => {
    e.preventDefault();
    
    try {
      await checkSession();
      if (isLogged && user) {
        if (user.role === 'admin' || user.user_type === 'admin' || user.is_admin === true || user.admin === true) {
          navigate('/LoggedAdmin');
        } else {
          navigate('/Logged');
        }
      } else {
        navigate('/Login');
      }
    } catch (err) {
      console.error("Session check failed:", err);
      navigate('/Login');
    }
  };

  const handleLogout = async () => {
    try {
      await sessionLogout();
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/");
    }
  };

  const showDrawer = () => {
    setDrawerOpen(true);
  };

  const onClose = () => {
    setDrawerOpen(false);
  };

  const navItems = [
    { key: 'about', path: '/#about-us', label: 'Acerca de nosotros' },
    { key: 'how', path: '/#how-works', label: 'Cómo funciona' },
    { key: 'contact', path: '/#contact-us', label: 'Contacto' },
    { key: 'map', path: '/map', label: 'Mapa' },
    { key: 'profile', path: '/Logged', label: 'Mi Perfil', requiresAuth: true },
  ];

  const renderNavButton = (item) => {
    if (item.isLogout) {
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
          className="bg-geoterra-orange poppins-bold text-blanco"
          style={{ 
            marginBottom: '8px',
            textAlign: 'left',
            height: '48px',
            borderRadius: '8px'
          }}
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
          className="poppins text-geoterra-blue"
          style={{ 
            marginBottom: '8px',
            textAlign: 'left',
            height: '48px',
            borderRadius: '8px'
          }}
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
        padding: '0 16px',
        boxShadow: '0 2px 8px #f0f1f2',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}
    >
      {/* Logo */}
      <div style={{ height: '100%', display: 'flex', alignItems: 'center' }}>
        <Link to="/">
          <img 
            src={logo} 
            alt="GeoTerRA Logo" 
            style={{ 
              height: '40px',
              maxWidth: '150px',
              objectFit: 'contain'
            }} 
          />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div 
        className="desktop-menu" 
        style={{ 
          display: 'flex', 
          gap: '16px'
        }}
      >
        {navItems.map((item) => (
          <Button
            key={item.key}
            type="text"
            className={item.key === 'profile' ? 'bg-geoterra-orange poppins-bold text-blanco font-bold!' : 'poppins text-geoterra-blue'}
            style={{ 
              transition: 'transform 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            onClick={item.key === 'profile' ? handleProfileClick : undefined}
          >
            {item.key === 'profile' ? (
              item.label
            ) : (
              <Link to={item.path} style={{ textDecoration: 'none' }}>
                {item.label}
              </Link>
            )}
          </Button>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <Button
        className="mobile-menu-button"
        type="text"
        icon={<MenuOutlined />}
        onClick={showDrawer}
        style={{
          display: 'none',
          fontSize: '18px',
          color: '#1890ff'
        }}
      />

      {/* Mobile Drawer */}
      <Drawer
        placement="right"
        onClose={onClose}
        open={drawerOpen}
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" onClick={onClose}>
              <img 
                src={logo} 
                alt="GeoTerRA Logo" 
                style={{ height: '40px', maxWidth: '120px', objectFit: 'contain' }} 
              />
            </Link>
          </div>
        }
        width={280}
        styles={{ body: { padding: '20px' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {navItems.map(renderMobileNavButton)}
        </div>
      </Drawer>

      <style jsx="true">{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-button {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu-button {
            display: none !important;
          }
        }
      `}</style>
    </Header>
  );
}