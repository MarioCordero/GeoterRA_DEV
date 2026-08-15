import React from 'react';
import { Card, Typography, Tag } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const InlabTestsManager = () => (
  <div style={{ padding: '24px' }}>
    <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <BarChartOutlined style={{ fontSize: 32, color: '#722ed1' }} />
        <div>
          <Title level={3} style={{ margin: 0 }}>Pruebas de Laboratorio (In-Lab)</Title>
          <Tag color="processing">Solo Administrador</Tag>
        </div>
      </div>
      <Paragraph type="secondary" style={{ fontSize: 16 }}>
        Esta sección permitirá registrar y consultar los análisis geoquímicos de laboratorio:
        pH, conductividad, iones mayores (Cl, Ca, HCO3, SO4, Na, K, Mg) y elementos traza (Fe, Si, B, Li, F).
      </Paragraph>
      <Paragraph type="secondary">
        Endpoints: <code>GET/POST/PUT/DELETE /admin/inlab-tests</code>
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

export default InlabTestsManager;
