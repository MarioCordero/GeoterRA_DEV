// sidebar.jsx
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="demo-logo" />
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
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SidebarLayout;

