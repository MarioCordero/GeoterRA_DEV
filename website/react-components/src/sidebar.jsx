import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  DashboardOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;

const SidebarLayout = () => {
  const [selectedKey, setSelectedKey] = useState('1');

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
        position: 'fixed',         // fixed instead of sticky
        top: 0,                    // stick to the top
        left: 0,                   // stick to left
        height: '100vh',
        width: '220px',            // width for sidebar
        zIndex: 99,                // must be higher than navbar (which is 20)
      }}
    >
      <Sider width={220}>
        <div
          className="demo-logo"
          style={{ height: 64, background: 'rgba(255,255,255,0.2)', margin: 16 }}
        />
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
      </Sider>
    </Layout>
  );

};

export default SidebarLayout;

