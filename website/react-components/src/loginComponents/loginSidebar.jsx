import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  UserOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;

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

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <div>Dashboard Content</div>;
      case '2':
        return <div>Profile Content</div>;
      case '3':
        return <div>Requests Content</div>;
      default:
        return null;
    }
  };

  return (
    <Layout
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '220px',
        zIndex: 99,
      }}
    >
      <Sider width={220} style={{ display: 'flex', flexDirection: 'column' }}>
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
    </Layout>
  );
};

export default SidebarLayout;