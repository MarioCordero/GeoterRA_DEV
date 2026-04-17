import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Button, Modal } from "antd";
import {
  LogoutOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useSession } from '../../../hooks/useSession';
import { usePermissions } from '../../../hooks/usePermissions';
import { auth } from '../../../config/apiConf';
import '../../../fontsModule.css';
import '../../../colorModule.css';
import { getMenuItems, createPermissionsObject } from '../../../utils/menuConfig.jsx';

const SidebarMobile = ({ selectedKey, setSelectedKey }) => {
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
      console.log("🔵 [SidebarMobile] Starting logout process...");

      const response = await fetch(auth.logout(), {
        method: "POST",
        credentials: "include",
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        console.log("✅ [SidebarMobile] Logout successful, clearing session and redirecting...");
        await sessionLogout();
        setLogoutModalVisible(false);
        navigate("/");
      } else {
        const data = await response.json();
        console.error("❌ [SidebarMobile] Logout failed:", data);
        Modal.error({
          title: 'Error al cerrar sesión',
          content: data.message || "Error desconocido",
        });
      }
    } catch (err) {
      console.error("❌ [SidebarMobile] Logout error:", err);
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
            onClick={() => handleMenuClick(item.key)}
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
          disabled={loggingOut}
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
};

export default SidebarMobile;