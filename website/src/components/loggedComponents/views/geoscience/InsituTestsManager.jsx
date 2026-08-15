import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { BulbOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const InsituTestsManager = () => (
  <div style={{ padding: '24px' }}>
    <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <BulbOutlined style={{ fontSize: 32, color: '#52c41a' }} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Pruebas de Campo (In-Situ)</Title>
          <Tag color="processing">Solo Administrador</Tag>
        </div>
      </div>
      <Paragraph type="secondary" style={{ fontSize: 16 }}>
        Esta sección permitirá registrar y gestionar las pruebas in-situ realizadas en campo:
        temperatura, conductividad y pH tomados directamente en la manifestación geotermal.
      </Paragraph>
      <Paragraph type="secondary">
        Endpoints: <code>GET/POST/PUT/DELETE /admin/insitu-tests</code>
      </Paragraph>
      <div style={{
        marginTop: 32, padding: 40, background: '#f5f5f5', borderRadius: 8,
        textAlign: 'center', color: '#aaa', fontSize: 18
      }}>
        🚧 En desarrollo
      </div>
    </Card>
  </div>
);

export default InsituTestsManager;
