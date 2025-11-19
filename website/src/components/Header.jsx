import React, { useState, useEffect } from 'react';
import { Drawer } from 'antd';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/images/GeoterRA-Logo-Color.svg';
import '../colorModule.css';
import '../fontsModule.css';

export default function AppHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { key: 'about', path: '/#about-us', label: 'Acerca de nosotros', sectionId: 'about-us' },
    { key: 'how', path: '/#how-works', label: 'Cómo funciona', sectionId: 'how-works' },
    { key: 'contact', path: '/#contact-us', label: 'Contacto', sectionId: 'contact-us' },
    { key: 'map', path: '/map', label: 'Mapa', sectionId: null },
    { key: 'login', path: '/login', label: 'Iniciar Sesión', sectionId: null },
  ];

  const showDrawer = () => {
    setDrawerOpen(true);
  };

  const onClose = () => {
    setDrawerOpen(false);
  };

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 64; // Header height (h-16 = 64px)
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle hash-based navigation on page load and hash changes
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = location.hash.replace('#', '');
      if (hash && location.pathname === '/') {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          scrollToSection(hash);
        }, 100);
      }
    };

    // Handle initial load with hash
    handleHashNavigation();

    // Handle hash changes (back/forward browser navigation)
    window.addEventListener('hashchange', handleHashNavigation);

    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, [location.hash, location.pathname]);

  // Handle navigation with smooth scroll
  const handleNavigation = (item, closeMobile = false) => {
    if (closeMobile) {
      onClose();
    }

    // If it's a section link (has sectionId)
    if (item.sectionId) {
      // If we're already on the home page, just scroll
      if (location.pathname === '/') {
        // Update URL hash
        window.history.pushState(null, null, `#${item.sectionId}`);
        scrollToSection(item.sectionId);
      } else {
        // Navigate to home first, then scroll
        navigate(`/#${item.sectionId}`);
        // The useEffect will handle the scrolling after navigation
      }
    } else {
      // Regular navigation for non-section links
      navigate(item.path);
    }
  };

  return (
    <header className="fixed top-0 left-0 z-[1000] bg-white w-full h-16 shadow-md">
      <div className="flex items-center justify-between h-full px-4 p-10">
        
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
            <button
              key={item.key}
              onClick={() => handleNavigation(item)}
              className={`
                px-4 py-2 rounded-md transition-all duration-200 transform hover:-translate-y-0.5 whitespace-nowrap cursor-pointer
                ${item.key === 'login' 
                  ? 'bg-geoterra-orange text-white poppins-bold font-bold hover:bg-orange-600' 
                  : 'text-geoterra-blue poppins hover:text-blue-700 hover:bg-blue-50'
                }
              `}
            >
              {item.label}
            </button>
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
              <button
                key={item.key}
                onClick={() => handleNavigation(item, true)}
                className={`
                  block w-full px-4 py-3 rounded-lg text-left transition-all duration-200 cursor-pointer
                  ${item.key === 'login' 
                    ? 'bg-geoterra-orange text-white poppins-bold hover:bg-orange-600' 
                    : 'text-geoterra-blue poppins hover:text-blue-700 hover:bg-blue-50'
                  }
                `}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </Drawer>
      </div>
    </header>
  );
}