import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Layout, Menu, Button, Modal } from "antd";
import {
  UserOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import '../../fontsModule.css';
import '../../colorModule.css';
import { useSession } from '../../hooks/useSession';
import { auth } from '../../config/apiConf';

const { Sider } = Layout;

const SidebarLayout = ({ selectedKey, setSelectedKey, collapsed, setCollapsed, isMobile }) => {
  const navigate = useNavigate();
  const { logout: sessionLogout, buildHeaders } = useSession();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      // Call the logout endpoint WITH the Authorization header
      const response = await fetch(auth.logout(), {
        method: "POST",
        credentials: "include",
        headers: buildHeaders(),
      });

      if (response.ok) {
        await sessionLogout();
        setLogoutModalVisible(false);
        navigate("/");
      } else {
        console.error("Logout failed on server, status:", response.status);
        const data = await response.json();
        
        await sessionLogout();
        
        Modal.error({
          title: 'Sesión cerrada',
          content: data.message || "Tu sesión ha sido cerrada",
        });
        
        setLogoutModalVisible(false);
        navigate("/");
      }
    } catch (err) {
      console.error("Logout error:", err);
      
      await sessionLogout();
      
      Modal.error({
        title: 'Error de conexión',
        content: 'Tu sesión ha sido cerrada localmente',
      });
      
      setLogoutModalVisible(false);
      navigate("/");
    } finally {
      setLoggingOut(false);
    }
  };

  const showLogoutConfirm = () => {
    setLogoutModalVisible(true);
  };

  const handleLogoutCancel = () => {
    setLogoutModalVisible(false);
  };

  const baseMenuItems = [
    { 
      key: '1', 
      icon: <DashboardOutlined style={{ fontSize: '18px' }} />, 
      label: 'Dashboard',
    },
    { 
      key: '3', 
      icon: <FileTextOutlined style={{ fontSize: '18px' }} />, 
      label: 'Solicitudes',
    },
    { 
      key: '2', 
      icon: <UserOutlined style={{ fontSize: '18px' }} />, 
      label: 'Perfil',
    },
  ];

  // Mobile items with shortLabel
  const mobileMenuItems = [
    { ...baseMenuItems[0], shortLabel: 'Inicio' },
    { ...baseMenuItems[2], shortLabel: 'Solicitudes' },
    { ...baseMenuItems[1], shortLabel: 'Perfil' },
  ];

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
  };

  // Logout Confirmation Modal Component
  const LogoutModal = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          Confirmar cierre de sesión
        </div>
      }
      open={logoutModalVisible}
      onOk={handleLogout}
      onCancel={handleLogoutCancel}
      okText="Sí, cerrar sesión"
      cancelText="Cancelar"
      okButtonProps={{
        danger: true,
        loading: loggingOut,
        className: 'bg-geoterra-orange'
      }}
      cancelButtonProps={{
        disabled: loggingOut
      }}
      closable={!loggingOut}
      maskClosable={!loggingOut}
      centered
    >
      <p style={{ margin: '16px 0', fontSize: '16px' }}>
        ¿Estás seguro de que quieres cerrar sesión?
      </p>
    </Modal>
  );

  // Mobile Bottom Navigation
  if (isMobile) {
    return (
      <>
        {/* Bottom Navigation Bar */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '60px',
          padding: '0 1rem',
        }}>
          {mobileMenuItems.map((item) => (
            <Button
              key={item.key}
              type="text"
              icon={React.cloneElement(item.icon, { 
                style: { 
                  fontSize: selectedKey === item.key ? '20px' : '18px',
                  color: selectedKey === item.key ? '#1890ff' : '#666'
                } 
              })}
              onClick={() => handleMenuClick({ key: item.key })}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '50px',
                minWidth: '60px',
                padding: '4px',
                background: selectedKey === item.key ? '#f0f8ff' : 'transparent',
                borderRadius: '8px',
                border: 'none',
                boxShadow: 'none',
              }}
            >
              <span style={{
                fontSize: '10px',
                marginTop: '2px',
                color: selectedKey === item.key ? '#1890ff' : '#666',
                fontWeight: selectedKey === item.key ? 'bold' : 'normal',
                lineHeight: '1',
              }}>
                {item.shortLabel}
              </span>
            </Button>
          ))}
          
          {/* Logout Button */}
          <Button
            type="text"
            icon={<LogoutOutlined style={{ fontSize: '18px', color: '#ff4d4f' }} />}
            onClick={showLogoutConfirm}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '50px',
              minWidth: '60px',
              padding: '4px',
              borderRadius: '8px',
              border: 'none',
              boxShadow: 'none',
            }}
          >
            <span style={{
              fontSize: '10px',
              marginTop: '2px',
              color: '#ff4d4f',
              lineHeight: '1',
            }}>
              Salir
            </span>
          </Button>
        </div>

        <LogoutModal />
      </>
    );
  }

  // Desktop Sidebar
  return (
    <>
      <Sider
        width={collapsed ? 80 : 220}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        style={{
          background: '#fff',
          minHeight: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100,
          boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
        }}
        breakpoint="md"
        collapsedWidth={80}
      >
        {/* Custom collapse trigger at the top */}
        <div style={{ 
          padding: '1rem', 
          textAlign: collapsed ? 'center' : 'right',
          borderBottom: '1px solid #f0f0f0',
          marginTop: '64px'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuOutlined /> : <MenuOutlined style={{ transform: 'rotate(180deg)' }} />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          style={{ 
            marginTop: '1rem',
            borderRight: 'none',
            background: 'transparent',
            flex: 1,
          }}
          items={baseMenuItems.map(item => ({
            ...item,
            style: {
              margin: '8px 0',
              fontSize: '16px',
              fontWeight: selectedKey === item.key ? 'bold' : 'normal',
              color: selectedKey === item.key ? '#1890ff' : '#333',
            }
          }))}
          inlineCollapsed={collapsed}
        />

        <div style={{ 
          padding: collapsed ? '0.5rem' : '1rem', 
          textAlign: 'center',
          marginTop: 'auto',
          marginBottom: '1rem'
        }}>
          <Button
            type="text"
            danger
            block
            onClick={showLogoutConfirm}
            loading={loggingOut}
            icon={<LogoutOutlined />}
            className="bg-geoterra-orange"
            style={{
              textAlign: collapsed ? 'center' : 'left',
              paddingLeft: collapsed ? '0' : '24px',
              height: '40px',
              fontSize: collapsed ? '14px' : '16px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            {!collapsed && 'Cerrar sesión'}
          </Button>
        </div>
      </Sider>

      <LogoutModal />
    </>
  );
};

export default SidebarLayout;