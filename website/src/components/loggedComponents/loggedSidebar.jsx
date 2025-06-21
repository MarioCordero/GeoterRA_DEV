import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  UserOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import '../../fontsModule.css';

const { Sider } = Layout;

const SidebarLayout = () => {
  const [selectedKey, setSelectedKey] = useState('1');

  const handleLogout = () => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "../API/logout.php", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        window.location.href = "login.php";
      }
    };
    xhr.send();
  };

  return (
    <Sider
      width={220}
      style={{
        background: '#001529',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative', // Not fixed
      }}
    >
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        onClick={(e) => setSelectedKey(e.key)}
        items={[
          { key: '1', icon: <DashboardOutlined />, label: 'Dashboard' },
          { key: '2', icon: <UserOutlined />, label: 'Profile' },
          { key: '3', icon: <FileTextOutlined />, label: 'Requests' },
        ]}
      />

      <div style={{ flexGrow: 1 }} />

      <div style={{ padding: '1rem' }}>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          block
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </Sider>
  );
};

export default SidebarLayout;