import { useNavigate } from "react-router-dom";
import React from "react";
import { Layout, Menu, Button } from "antd";
import {
  UserOutlined,
  DashboardOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import '../../fontsModule.css';
import '../../colorModule.css';
import { buildApiUrl } from '../../config/apiConf';

const { Sider } = Layout;

const SidebarLayout = ({ selectedKey, setSelectedKey }) => {
  const navigate = useNavigate();

  // Session token management functions
  const getSessionToken = () => {
    return localStorage.getItem('geoterra_session_token');
  };

  const clearSessionToken = () => {
    localStorage.removeItem('geoterra_session_token');
  };

  const buildHeaders = () => {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = getSessionToken();
    if (token) {
      headers['X-Session-Token'] = token;
    }
    return headers;
  };

  // Enhanced logout function with token management
  const handleLogout = async () => {
    try {
      // console.log("Starting logout process...");
      
      // Check if we have a session token
      const token = getSessionToken();
      // console.log("Session token present:", !!token);
      
      // Call logout endpoint with token in headers
      const response = await fetch(buildApiUrl("logout.php"), { 
        method: "POST",
        credentials: "include", // Include cookies
        headers: buildHeaders(), // Include session token
      });

      // console.log("Logout response status:", response.status);
      // console.log("Logout response ok:", response.ok);
      
      // Try to get the response data
      let data = {};
      try {
        data = await response.json();
        // console.log("Logout response data:", data);
      } catch (jsonError) {
        console.log("No JSON response from logout endpoint");
      }

      // Always clear the token and redirect, regardless of server response
      // console.log("Clearing session token and redirecting...");
      clearSessionToken();
      
      if (response.ok || response.status === 200) {
        // console.log("✅ Logout successful, redirecting to home");
        navigate("/");
      } else {
        // console.log("⚠️ Logout API failed but token cleared, redirecting anyway");
        navigate("/");
      }
      
    } catch (err) {
      console.error("Logout error:", err);
      // Even if the API call fails, clear the token and redirect
      console.log("🔧 Network error during logout - clearing token anyway");
      clearSessionToken();
      navigate("/");
    }
  };

  return (
    <Sider
      width={220}
      style={{
        background: '#fff',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={(e) => setSelectedKey(e.key)}
        style={{ 
          marginTop: '2rem',
          borderRight: 'none',
          background: 'transparent',
        }}
        items={[
          { 
            key: '1', 
            icon: <DashboardOutlined style={{ fontSize: '18px' }} />, 
            label: 'Dashboard',
            style: { 
              margin: '8px 0',
              fontSize: '16px',
              fontWeight: selectedKey === '1' ? 'bold' : 'normal',
              color: selectedKey === '1' ? '#1890ff' : '#333',
            }
          },
          { 
            key: '2', 
            icon: <FileTextOutlined style={{ fontSize: '18px' }} />, 
            label: 'Solicitudes',
            style: { 
              margin: '8px 0',
              fontSize: '16px',
              fontWeight: selectedKey === '2' ? 'bold' : 'normal',
              color: selectedKey === '2' ? '#1890ff' : '#333',
            }
          },
          { 
            key: '3', 
            icon: <ExperimentOutlined style={{ fontSize: '18px' }} />, 
            label: 'Análisis de laboratorios',
            style: { 
              margin: '8px 0',
              fontSize: '16px',
              fontWeight: selectedKey === '3' ? 'bold' : 'normal',
              color: selectedKey === '3' ? '#1890ff' : '#333',
            }
          },
          { 
            key: '4', 
            icon: <UserOutlined style={{ fontSize: '18px' }} />, 
            label: 'Perfil',
            style: { 
              margin: '8px 0',
              fontSize: '16px',
              fontWeight: selectedKey === '4' ? 'bold' : 'normal',
              color: selectedKey === '4' ? '#1890ff' : '#333',
            }
          },
        ]}
      />

      <div style={{ flexGrow: 1 }} />

      <div style={{ padding: '1rem', textAlign: 'center', position: 'absolute', bottom: 0, width: '100%' }}>
        <Button
          type="text"
          danger
          block
          onClick={handleLogout}
          className="bg-geoterra-orange"
          icon={<LogoutOutlined />}
          style={{
            textAlign: 'left',
            paddingLeft: '24px',
            height: '40px',
            fontSize: '16px',
            color: '#fff',
          }}
        >
          Cerrar sesión
        </Button>
      </div>
    </Sider>
  );
};

export default SidebarLayout;