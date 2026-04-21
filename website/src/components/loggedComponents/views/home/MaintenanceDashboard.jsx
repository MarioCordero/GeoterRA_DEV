import "../../../../colorModule.css";
import '../../../../fontsModule.css';
import React, { useState, useEffect } from 'react';
import { useSession } from '../../../../hooks/useSession';
import { Card, Row, Col, Statistic, Tag, Spin } from 'antd';
import { maintenanceDashboardInfo } from '../../../../config/apiConf';
import { HddOutlined, TeamOutlined, DatabaseOutlined, FileTextOutlined } from '@ant-design/icons';

const MaintenanceDashboard = () => {
  const { user: sessionUser, loading: sessionLoading } = useSession();
  
  // State Management
  const [dashboardData, setDashboardData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    try {
      // API CALL
      const result = await maintenanceDashboardInfo();

      if (result.ok && result.data) {
        setDashboardData(result.data);
      } else {
        console.error('Error fetching dashboard stats:', result.error);
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

      {/* Role Description */}
      <Card className="mb-8 bg-blue-50 border-l-4 border-blue-500">
        <h3 className="text-xl font-bold mb-3">📋 Descripción del Rol: Mantenimiento</h3>
        <p className="text-gray-700 mb-4">
          Como administrador de <strong>Mantenimiento</strong>, eres responsable de monitorear y mantener la integridad del sistema GeoterRA. 
          Tu rol te permite supervisar el estado de la infraestructura, gestionar usuarios y acceder a información crítica del sistema.
        </p>
        <h4 className="font-semibold text-gray-800 mb-2">🎯 Responsabilidades Principales:</h4>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#333' }}>
          <li>Monitorear el estado y rendimiento del servidor en tiempo real</li>
          <li>Supervisar usuarios activos en el sistema</li>
          <li>Revisar solicitudes pendientes y su estado</li>
          <li>Acceder a registros del sistema para auditoría y diagnóstico</li>
          <li>Gestionar la información de usuarios registrados</li>
          <li>Visualizar la estructura y contenido de la base de datos</li>
        </ul>
      </Card>

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

      {/* Available Features */}
      <Card className="mb-8 bg-amber-50 border-l-4 border-amber-500">
        <h3 className="text-lg font-bold mb-4">🔧 Opciones Disponibles para tu Rol</h3>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">📊 Registros del Sistema</h4>
              <p className="text-sm text-gray-600">Accede a los últimos 500 registros de eventos, errores y acciones realizadas en el sistema para auditoría y diagnóstico.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">👥 Gestionar Usuarios</h4>
              <p className="text-sm text-gray-600">Visualiza la lista completa de usuarios registrados en el sistema, incluyendo su información de contacto y estado.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">🗄️ Base de Datos</h4>
              <p className="text-sm text-gray-600">Accede a todas las tablas de la base de datos, consulta la estructura y visualiza los datos almacenados (hasta 1000 registros por tabla).</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">📈 Panel de Control</h4>
              <p className="text-sm text-gray-600">Monitorea las estadísticas del sistema en tiempo real: estado del servidor, usuarios activos y carga del sistema.</p>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Database Access Info */}
      <Card className="mb-8">
        <h3 className="text-lg font-bold mb-4">🔐 Permisos de Acceso y Restricciones</h3>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <h4 className="font-semibold mb-3 text-green-600">✅ Permitido (Lee):</h4>
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>Ver todos los datos del sistema sin restricción</li>
              <li>Monitorear estado del servidor en tiempo real</li>
              <li>Ver estadísticas y métricas del sistema</li>
              <li>Acceder a registros del sistema (logs)</li>
              <li>Gestionar usuarios (crear, editar información básica)</li>
              <li>Visualizar toda la estructura de la base de datos</li>
              <li>Consultar datos de todas las tablas (hasta 1000 registros)</li>
            </ul>
          </Col>
          <Col xs={24} sm={12}>
            <h4 className="font-semibold mb-3 text-red-600">❌ No Permitido (Escribe/Elimina):</h4>
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>Modificar registros existentes directamente</li>
              <li>Eliminar registros de la base de datos</li>
              <li>Crear nuevos registros manualmente</li>
              <li>Cambiar configuración crítica del sistema</li>
              <li>Borrar registros de auditoría (logs)</li>
              <li>Modificar roles y permisos de otros usuarios</li>
              <li>Cambiar configuración de la base de datos</li>
            </ul>
          </Col>
        </Row>
        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#e6f7ff', borderRadius: '4px', borderLeft: '4px solid #1890ff' }}>
          <p style={{ margin: '0', fontSize: '14px', color: '#0050b3' }}>
            <strong>💡 Nota:</strong> El rol de Mantenimiento es de solo lectura para la base de datos y datos del sistema. 
            Esto garantiza que no se modificarán datos críticos accidentalmente. Para hacer cambios en los datos, 
            contacta con un administrador de base de datos.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default MaintenanceDashboard;