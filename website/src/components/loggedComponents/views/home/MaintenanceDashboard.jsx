import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Tag, Spin } from 'antd';
import { DatabaseOutlined, FileTextOutlined } from '@ant-design/icons';
import "../../../../colorModule.css";
import '../../../../fontsModule.css';
import { useSession } from '../../../../hooks/useSession';
import { analysisRequest } from '../../../../config/apiConf';

/**
 * MaintenanceDashboard Component
 * Shown to maintenance users
 * Displays quick overview and statistics
 */
const MaintenanceDashboard = () => {
  const { user: sessionUser, loading: sessionLoading } = useSession();
  
  // State Management
  const [analysisRequests, setAnalysisRequests] = useState([]);
  const [regions, setRegions] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch Analysis Requests
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(analysisRequest.adminIndex(), {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to fetch requests');

      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setAnalysisRequests(data.data);
      }
    } catch (err) {
      console.error('Error fetching analysis requests:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Regions
  const fetchRegions = async () => {
    try {
      const res = await fetch('/API/public/regions', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to fetch regions');

      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setRegions(data.data);
      }
    } catch (err) {
      console.error('Error fetching regions:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (sessionUser) {
      fetchStats();
      fetchRegions();
    }
  }, [sessionUser]);

  // Stats calculation
  const stats = {
    totalRequests: analysisRequests.length,
    pendingRequests: analysisRequests.filter(r => r.state === 'Pendiente').length,
    analyzedRequests: analysisRequests.filter(r => r.state === 'Analizada').length,
    totalRegions: regions.length,
  };

  if (sessionLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Cargando..." />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-8 mb-6">
        <h1 className="text-4xl font-bold mb-2">
          ¡Bienvenido, {sessionUser?.first_name || sessionUser?.email}!
        </h1>
        <p className="text-green-100">Panel de Mantenimiento - GeoterRA</p>
      </div>

      {/* User Info */}
      <Row gutter={16} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <p className="text-gray-600 text-sm">Rol</p>
            <Tag color="green">🔧 Mantenimiento</Tag>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="font-semibold text-sm">{sessionUser?.email}</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <p className="text-gray-600 text-sm">Estado</p>
            <Tag color={sessionUser?.is_active ? 'green' : 'red'}>
              {sessionUser?.is_active ? '✅ Activo' : '❌ Inactivo'}
            </Tag>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <p className="text-gray-600 text-sm">Acceso a Datos</p>
            <Tag color="blue">🔍 Solo Lectura</Tag>
          </Card>
        </Col>
      </Row>

      {/* Database Statistics */}
      <h2 className="text-2xl font-bold mb-4">📈 Estadísticas de la Base de Datos</h2>
      <Row gutter={16} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Total de Solicitudes"
              value={stats.totalRequests}
              icon={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Solicitudes Pendientes"
              value={stats.pendingRequests}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Solicitudes Analizadas"
              value={stats.analyzedRequests}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Total de Regiones"
              value={stats.totalRegions}
              icon={<DatabaseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Database Access Info */}
      <Card className="mb-8">
        <h3 className="text-lg font-bold mb-4">🔐 Permisos de Acceso</h3>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <h4 className="font-semibold mb-2">✅ Permitido:</h4>
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>Ver todos los datos de las tablas</li>
              <li>Buscar y filtrar registros</li>
              <li>Exportar datos para análisis</li>
              <li>Ver registros del sistema</li>
              <li>Gestionar usuarios</li>
            </ul>
          </Col>
          <Col xs={24} sm={12}>
            <h4 className="font-semibold mb-2">❌ No Permitido:</h4>
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>Modificar registros existentes</li>
              <li>Eliminar registros</li>
              <li>Crear nuevos registros</li>
              <li>Cambiar configuración del sistema</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MaintenanceDashboard;
