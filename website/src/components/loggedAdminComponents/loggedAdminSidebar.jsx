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
import { buildApiUrl } from '../config/apiConf';

const { Sider } = Layout;

const SidebarLayout = ({ selectedKey, setSelectedKey }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log("Starting logout process...");
      
      const response = await fetch(buildApiUrl("logout.php"), { 
        method: "POST", // Try POST instead of GET
        credentials: "include", // Important: Include cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Logout response status:", response.status);
      console.log("Logout response ok:", response.ok);
      
      // Try to get the response data
      const data = await response.json();
      console.log("Logout response data:", data);

      if (response.ok) {
        console.log("Logout successful, redirecting to login");
        navigate("/Login");
      } else {
        console.error("Logout failed:", data);
        alert("Error al cerrar sesión: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Error de conexión: " + err.message);
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