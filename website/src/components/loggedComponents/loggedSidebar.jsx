import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  UserOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import '../../fontsModule.css';
import '../../colorModule.css';

const { Sider } = Layout;

const SidebarLayout = () => {
  const [selectedKey, setSelectedKey] = useState('1');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://geoterra.com/API/logout.php", { method: "GET" });
      if (response.ok) {
        navigate("/Login");
      } else {
        alert("Error al cerrar sesión");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      alert("Error de conexión");
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
        defaultSelectedKeys={['1']}
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
            key: '3', 
            icon: <FileTextOutlined style={{ fontSize: '18px' }} />, 
            label: 'Solicitudes',
            style: { 
              margin: '8px 0',
              fontSize: '16px',
              fontWeight: selectedKey === '3' ? 'bold' : 'normal',
              color: selectedKey === '3' ? '#1890ff' : '#333',
            }
          },
          { 
            key: '2', 
            icon: <UserOutlined style={{ fontSize: '18px' }} />, 
            label: 'Perfil',
            style: { 
              margin: '8px 0',
              fontSize: '16px',
              fontWeight: selectedKey === '2' ? 'bold' : 'normal',
              color: selectedKey === '2' ? '#1890ff' : '#333',
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