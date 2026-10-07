import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Drawer, Divider } from "antd";
import {
  LogoutOutlined,
  ExclamationCircleOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { useSession } from '../../../hooks/useSession';
import { usePermissions } from '../../../hooks/usePermissions';
import { authLogout } from '../../../config/apiConf';
import '../../../fontsModule.css';
import '../../../colorModule.css';
import { getMenuItems, createPermissionsObject } from '../../../utils/menuConfig.jsx';

const SidebarMobile = ({ selectedKey, setSelectedKey }) => {
  const navigate = useNavigate();
  const { logout: sessionLogout } = useSession();
  const { hasPermission, PERMISSIONS } = usePermissions();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Bottom drawer state for grouped items (Solicitudes, Otros)
  const [activeDrawer, setActiveDrawer] = useState(null);

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

  const handleMenuClick = (key) => {
    setSelectedKey(key);
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
      {/* Bottom Navigation Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '62px',
        padding: '0 0.5rem',
      }}>
        {menuItems.map((item) => {
          const isSelected = selectedKey === item.key || item.children?.some(c => c.key === selectedKey);
          const hasMultipleChildren = item.children && item.children.length > 1;

          return (
            <Button
              key={item.key}
              type="text"
              icon={React.cloneElement(item.icon, { 
                style: { 
                  fontSize: isSelected ? '20px' : '18px',
                  color: isSelected ? '#1890ff' : '#666'
                } 
              })}
              onClick={() => {
                if (hasMultipleChildren) {
                  setActiveDrawer(item);
                } else if (item.children && item.children.length === 1) {
                  handleMenuClick(item.children[0].key);
                } else {
                  handleMenuClick(item.key);
                }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '52px',
                flex: 1,
                maxWidth: '85px',
                padding: '4px',
                background: isSelected ? '#f0f8ff' : 'transparent',
                borderRadius: '8px',
                border: 'none',
                boxShadow: 'none',
              }}
            >
              <span style={{
                fontSize: '11px',
                marginTop: '2px',
                color: isSelected ? '#1890ff' : '#666',
                fontWeight: isSelected ? 'bold' : 'normal',
                lineHeight: '1',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {item.shortLabel || item.label}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Sub-options Bottom Sheet (Drawer) */}
      <Drawer
        placement="bottom"
        open={Boolean(activeDrawer)}
        onClose={() => setActiveDrawer(null)}
        height="auto"
        styles={{
          body: { padding: '16px 20px 24px' }
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {activeDrawer?.icon && React.cloneElement(activeDrawer.icon, { style: { color: '#1890ff' } })}
            <span>{activeDrawer?.label}</span>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activeDrawer?.children?.map((child) => {
            const isChildActive = selectedKey === child.key;
            return (
              <Button
                key={child.key}
                type={isChildActive ? 'primary' : 'default'}
                ghost={isChildActive}
                block
                size="large"
                icon={child.icon}
                onClick={() => {
                  handleMenuClick(child.key);
                  setActiveDrawer(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  height: '48px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: isChildActive ? 'bold' : 'normal',
                  borderColor: isChildActive ? '#1890ff' : '#e8e8e8',
                }}
              >
                <span style={{ marginLeft: 8, flex: 1, textAlign: 'left' }}>
                  {child.label}
                </span>
                {isChildActive && <CheckCircleFilled style={{ color: '#1890ff' }} />}
              </Button>
            );
          })}

          {activeDrawer?.key === 'sub-otros' && (
            <>
              <Divider style={{ margin: '12px 0 8px' }} />
              <Button
                danger
                block
                size="large"
                icon={<LogoutOutlined />}
                onClick={() => {
                  setActiveDrawer(null);
                  showLogoutConfirm();
                }}
                style={{
                  height: '46px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '500',
                }}
              >
                Cerrar Sesión
              </Button>
            </>
          )}
        </div>
      </Drawer>

      <LogoutModal />
    </>
  );
};

export default SidebarMobile;