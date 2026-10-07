import React, { useState, useEffect } from "react";
import {
  LogoutOutlined,
  MenuOutlined,
  ExclamationCircleOutlined,
  MenuFoldOutlined,
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

  // Maintain open submenus state (e.g. Solicitudes, Otros)
  const [openKeys, setOpenKeys] = useState(() => {
    const parent = menuItems.find(item => item.children?.some(c => c.key === selectedKey));
    return parent ? [parent.key] : [];
  });

  useEffect(() => {
    const parent = menuItems.find(item => item.children?.some(c => c.key === selectedKey));
    if (parent && !openKeys.includes(parent.key)) {
      setOpenKeys(prev => [...prev, parent.key]);
    }
  }, [selectedKey]);

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

  // Format menu items recursively for Ant Design Menu
  const formatDesktopMenuItems = (items) => {
    return items.map(({ shortLabel, children, ...rest }) => {
      const isSelected = selectedKey === rest.key;
      const hasActiveChild = children?.some(c => c.key === selectedKey);

      const formatted = {
        ...rest,
        style: {
          margin: '4px 0',
          fontSize: '15px',
          fontWeight: isSelected || hasActiveChild ? 'bold' : 'normal',
          color: isSelected ? '#1890ff' : '#333',
        },
      };

      if (children && children.length > 0) {
        formatted.children = formatDesktopMenuItems(children);
      }

      return formatted;
    });
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
          padding: '0.75rem 1rem', 
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
          marginTop: '100px',
          transition: 'all 0.3s ease',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}
          />
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={(keys) => setOpenKeys(keys)}
          onClick={handleMenuClick}
          style={{ 
            marginTop: '1rem',
            borderRight: 'none',
            background: 'transparent',
            flex: 1,
          }}
          items={formatDesktopMenuItems(menuItems)}
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