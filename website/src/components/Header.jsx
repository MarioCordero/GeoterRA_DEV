import React, { useState } from 'react';
import { Layout, Button, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import logo from '../assets/images/GeoterRA-Logo-Color.svg';
import '../colorModule.css';
import '../fontsModule.css';

const { Header } = Layout;

export default function AppHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { key: 'about', path: '/#about-us', label: 'Acerca de nosotros' },
    { key: 'how', path: '/#how-works', label: 'Cómo funciona' },
    { key: 'contact', path: '/#contact-us', label: 'Contacto' },
    { key: 'map', path: '/map', label: 'Mapa' },
    { key: 'login', path: '/login', label: 'Iniciar Sesión' },
  ];

  const showDrawer = () => {
    setDrawerOpen(true);
  };

  const onClose = () => {
    setDrawerOpen(false);
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
          gap: '16px',
          '@media (max-width: 768px)': {
            display: 'none'
          }
        }}
      >
        {navItems.map((item) => (
          <Button
            key={item.key}
            type="text"
            className={item.key === 'login' ? 'bg-geoterra-orange poppins-bold text-blanco font-bold!' : 'poppins text-geoterra-blue'}
            style={{ 
              transition: 'transform 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Link to={item.path} style={{ textDecoration: 'none' }}>
              {item.label}
            </Link>
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
          color: '#1890ff',
          '@media (max-width: 768px)': {
            display: 'flex'
          }
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
        bodyStyle={{ padding: '20px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {navItems.map((item) => (
            <Button
              key={item.key}
              type="text"
              className={item.key === 'login' ? 'bg-geoterra-orange poppins-bold text-blanco' : 'poppins text-geoterra-blue'}
              block
              size="large"
              style={{ 
                marginBottom: '8px',
                textAlign: 'left',
                height: '48px',
                borderRadius: '8px'
              }}
              onClick={onClose}
            >
              <Link to={item.path} style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
      </Drawer>

      <style jsx>{`
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