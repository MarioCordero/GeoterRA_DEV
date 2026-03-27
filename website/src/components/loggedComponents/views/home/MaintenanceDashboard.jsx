import "../../../../colorModule.css";
import '../../../../fontsModule.css';
import React, { useState, useEffect } from 'react';
import { useSession } from '../../../../hooks/useSession';
import { Card, Row, Col, Statistic, Tag, Spin } from 'antd';
import { maintenance } from '../../../../config/apiConf';
import { HddOutlined, TeamOutlined, DatabaseOutlined, FileTextOutlined } from '@ant-design/icons';

const MaintenanceDashboard = () => {
  const { user: sessionUser, loading: sessionLoading } = useSession();

  console.log('Session User:', sessionUser);
  
  // State Management
  const [dashboardData, setDashboardData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    try {
      // API CALL
      const res = await fetch(maintenance.dashboardInfo(), {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to fetch dashboard stats');

      const data = await res.json();
      if (data.data) {
        setDashboardData(data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (sessionUser) {
      fetchDashboardStats();
    }
  }, [sessionUser]);

  // Helper function to get status color
  const getStatusColor = (status) => {
    return status === 'Online' ? 'green' : 'red';
  };

  // Helper function to get load color
  const getLoadColor = (load) => {
    switch(load) {
      case 'Low':
        return '#52c41a';
      case 'Moderate':
        return '#faad14';
      case 'High':
        return '#ff4d4f';
      default:
        return '#1890ff';
    }
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
            <p className="text-gray-600 text-sm">Acceso a Datos (MOCK)</p>
            <Tag color="blue">🔍 Solo Lectura</Tag>
          </Card>
        </Col>
      </Row>

      {/* System Statistics */}
      <h2 className="text-2xl font-bold mb-4">📈 Estado del Sistema (MOCK)</h2>
      <Row gutter={16} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Estado del Servidor"
              value={dashboardData?.serverStatus || 'N/A'}
              icon={<HddOutlined />}
              valueStyle={{ color: dashboardData?.serverStatus === 'Online' ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Usuarios Activos"
              value={dashboardData?.activeUsers || 0}
              icon={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Solicitudes Pendientes"
              value={dashboardData?.pendingRequests || 0}
              icon={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Carga del Sistema"
              value={dashboardData?.systemLoad || 'N/A'}
              icon={<DatabaseOutlined />}
              valueStyle={{ color: getLoadColor(dashboardData?.systemLoad) }}
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
              <li>Ver todos los datos del sistema</li>
              <li>Monitorear estado del servidor</li>
              <li>Ver estadísticas en tiempo real</li>
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