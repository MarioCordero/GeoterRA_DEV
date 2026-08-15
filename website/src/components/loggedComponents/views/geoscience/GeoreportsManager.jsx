import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const GeoreportsManager = () => (
  <div style={{ padding: '24px' }}>
    <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <FileSearchOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Georeportes</Title>
          <Tag color="processing">Solo Administrador</Tag>
        </div>
      </div>
      <Paragraph type="secondary" style={{ fontSize: 16 }}>
        Esta sección permitirá crear y gestionar los georeportes asociados a cada geomanifestación,
        vinculando pruebas in-situ y de laboratorio para generar un reporte consolidado.
      </Paragraph>
      <Paragraph type="secondary">
        Endpoints: <code>GET/POST/DELETE /admin/georeports</code> · <code>GET /georeports</code>
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

export default GeoreportsManager;
