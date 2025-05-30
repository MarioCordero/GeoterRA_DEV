import React, { useState } from 'react';
import { Layout, Button, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import logo from '../assets/images/GeoterRA-Logo-Color.svg';
import '../colorModule.css';

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
  {navItems.map((item) => (
    <Button
      key={item.key}
      type="text"
      className={item.key === 'login' ? 'bg-geoterra-orange text-blanco font-bold!' : ''}
      style={{ transition: 'transform 0.2s' }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <Link to={item.path}>{item.label}</Link>
    </Button>
  ))}
</div>

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
  {navItems.map((item) => (
    <Button
      key={item.key}
      type="text"
      className={item.key === 'login' ? 'bg-geoterra-orange text-blanco' : ''}
      block
      style={{ marginBottom: '8px' }}
      onClick={() => setDrawerOpen(false)}
    >
      <Link to={item.path}>{item.label}</Link>
    </Button>
  ))}
</Drawer>
    </Header>
  );
}

