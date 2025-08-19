import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Layout, Menu, Button, Modal } from "antd";
import {
  UserOutlined,
  DashboardOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  LogoutOutlined,
  MenuOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import '../../fontsModule.css';
import '../../colorModule.css';
import { buildApiUrl } from '../../config/apiConf';

const { Sider } = Layout;

const SidebarLayout = ({ selectedKey, setSelectedKey, collapsed, setCollapsed, isMobile }) => {
  const navigate = useNavigate();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      console.log("Starting logout process...");
      localStorage.removeItem('geoterra_session_token');

      const response = await fetch(buildApiUrl("logout.php"), {
        method: "POST",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Logout successful, redirecting to login");
        setLogoutModalVisible(false);
        navigate("/Login");
      } else {
        console.error("Logout failed:", data);
        Modal.error({
          title: 'Error al cerrar sesión',
          content: data.message || "Error desconocido",
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
      Modal.error({
        title: 'Error de conexión',
        content: err.message,
      });
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

  const menuItems = [
    { 
      key: '1', 
      icon: <DashboardOutlined style={{ fontSize: '18px' }} />, 
      label: 'Dashboard',
      shortLabel: 'Inicio'
    },
    { 
      key: '2', 
      icon: <FileTextOutlined style={{ fontSize: '18px' }} />, 
      label: 'Solicitudes',
      shortLabel: 'Solicitudes'
    },
    { 
      key: '3', 
      icon: <ExperimentOutlined style={{ fontSize: '18px' }} />, 
      label: 'Análisis de laboratorios',
      shortLabel: 'Análisis'
    },
    { 
      key: '4', 
      icon: <UserOutlined style={{ fontSize: '18px' }} />, 
      label: 'Perfil',
      shortLabel: 'Perfil'
    },
  ];

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
  };

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
          {menuItems.map((item) => (
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

        {/* Logout Confirmation Modal */}
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
          marginTop: '64px' // Account for header
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
          items={menuItems.map(item => ({
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

      {/* Logout Confirmation Modal */}
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
    </>
  );
};

export default SidebarLayout;