import React, { useState } from "react";
import {
  LogoutOutlined,
  MenuOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import '../../../fontsModule.css';
import '../../../colorModule.css';
import { useNavigate } from "react-router-dom";
import { authLogout } from '../../../config/apiConf';
import { Layout, Menu, Button, Modal } from "antd";
import { useSession } from '../../../hooks/useSession';
import { usePermissions } from '../../../hooks/usePermissions';
import { getMenuItems, createPermissionsObject } from '../../../utils/menuConfig.jsx';

const { Sider } = Layout;

const SidebarDesktop = ({ selectedKey, setSelectedKey, collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { logout: sessionLogout } = useSession();
  const { hasPermission, PERMISSIONS } = usePermissions();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Get menu items from centralized configuration
  const permissionsObj = createPermissionsObject(hasPermission, PERMISSIONS);
  const menuItems = getMenuItems(permissionsObj);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const result = await authLogout();

      if (result.ok) {
        await sessionLogout();
        setLogoutModalVisible(false);
        navigate("/");
      } else {
        Modal.error({
          title: 'Error al cerrar sesión',
          content: result.error || "Error desconocido",
        });
      }
    } catch (err) {
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