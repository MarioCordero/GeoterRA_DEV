import React, { useState } from 'react';
import { Drawer } from 'antd';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import logo from '../assets/images/GeoterRA-Logo-Color.svg';
import '../colorModule.css';
import '../fontsModule.css';

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
    <header className="fixed top-0 left-0 z-[1000] bg-white w-full h-16 shadow-md p-10">
      <div className="flex items-center justify-between h-full px-4">
        
        {/* Logo */}
        <div className="flex items-center h-full">
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="GeoTerRA Logo" 
              className="h-9 object-contain" 
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`
                px-4 py-2 rounded-md transition-all duration-200 transform hover:-translate-y-0.5 whitespace-nowrap
                ${item.key === 'login' 
                  ? 'bg-geoterra-orange text-white poppins-bold font-bold hover:bg-orange-600' 
                  : 'text-geoterra-blue poppins hover:text-blue-700 hover:bg-blue-50'
                }
              `}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-geoterra-blue hover:text-blue-700 transition-colors"
          onClick={showDrawer}
          aria-label="Open menu"
        >
          <MenuOutlined className="text-lg" />
        </button>

        {/* Mobile Drawer */}
        <Drawer
          placement="right"
          onClose={onClose}
          open={drawerOpen}
          title={
            <div className="flex items-center justify-between">
              <Link to="/" onClick={onClose} className="flex items-center">
                <img 
                  src={logo} 
                  alt="GeoTerRA Logo" 
                  className="h-10 max-w-[120px] object-contain" 
                />
              </Link>
            </div>
          }
          width={280}
          styles={{ 
            body: { padding: '20px' },
            header: { borderBottom: '1px solid #f0f0f0' }
          }}
          closeIcon={<CloseOutlined className="text-gray-600" />}
        >
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                onClick={onClose}
                className={`
                  block w-full px-4 py-3 rounded-lg text-left transition-all duration-200
                  ${item.key === 'login' 
                    ? 'bg-geoterra-orange text-white poppins-bold hover:bg-orange-600' 
                    : 'text-geoterra-blue poppins hover:text-blue-700 hover:bg-blue-50'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </Drawer>
      </div>
    </header>
  );
}