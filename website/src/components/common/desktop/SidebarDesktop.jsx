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
import { useSession } from '../../../hooks/useSession';
import { auth } from '../../../config/apiConf';
import '../../../fontsModule.css';
import '../../../colorModule.css';

const { Sider } = Layout;

const SidebarDesktop = ({ selectedKey, setSelectedKey, collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { logout: sessionLogout, user } = useSession();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Determine if user is admin
  const isAdmin = user?.is_admin || user?.role === 'admin';

  // Menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
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
        key: '4', 
        icon: <UserOutlined style={{ fontSize: '18px' }} />, 
        label: 'Perfil',
        shortLabel: 'Perfil'
      },
    ];

    // Add admin-only item if user is admin
    if (isAdmin) {
      baseItems.splice(2, 0, {
        key: '3',
        icon: <ExperimentOutlined style={{ fontSize: '18px' }} />,
        label: 'Gestionar Solicitudes',
        shortLabel: 'Gestionar'
      });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const response = await fetch(auth.logout(), {
        method: "POST",
        credentials: "include",
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        await sessionLogout();
        setLogoutModalVisible(false);
        navigate("/");
      } else {
        const data = await response.json();
        console.error("[SidebarDesktop] Logout failed:", data);
        Modal.error({
          title: 'Error al cerrar sesión',
          content: data.message || "Error desconocido",
        });
      }
    } catch (err) {
      console.error("[SidebarDesktop] Logout error:", err);
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

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
  };

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
          items={menuItems.map(({ shortLabel, ...rest }) => ({
            ...rest,
            style: {
              margin: '8px 0',
              fontSize: '16px',
              fontWeight: selectedKey === rest.key ? 'bold' : 'normal',
              color: selectedKey === rest.key ? '#1890ff' : '#333',
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
            disabled={loggingOut}
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

export default SidebarDesktop;