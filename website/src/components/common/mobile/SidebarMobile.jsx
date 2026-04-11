import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Button, Modal } from "antd";
import {
  UserOutlined,
  DashboardOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useSession } from '../../../hooks/useSession';
import { auth } from '../../../config/apiConf';
import '../../../fontsModule.css';
import '../../../colorModule.css';

const SidebarMobile = ({ selectedKey, setSelectedKey }) => {
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
        key: '3', 
        icon: <UserOutlined style={{ fontSize: '18px' }} />, 
        label: 'Perfil',
        shortLabel: 'Perfil'
      },
    ];

    if (isAdmin) {
      baseItems.splice(2, 0, {
        key: '4',
        icon: <ExperimentOutlined style={{ fontSize: '18px' }} />,
        label: 'Análisis de laboratorios',
        shortLabel: 'Análisis'
      });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

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