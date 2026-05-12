import { Spin, Card, Row, Col, Statistic, Tag, Button } from 'antd';
import "../../../../colorModule.css";
import '../../../../fontsModule.css';
import React, { useState, useEffect } from 'react';
import { useSession } from '../../../../hooks/useSession';
import { analysisRequest } from '../../../../config/apiConf';
import { usePermissions } from '../../../../hooks/usePermissions';
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';

const AdminDashboard = () => {
  const { user: sessionUser, loading, error } = useSession();
  const { hasPermission, PERMISSIONS } = usePermissions();
  const [stats, setStats] = useState({ total: 0, pending: 0, analyzed: 0, rejected: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  // useEffect(() => {

  //   const fetchStats = async () => {
  //     if (!hasPermission(PERMISSIONS.REVIEW_REQUESTS)) return;

  //     try {
  //       setStatsLoading(true);
  //       // API CALL
  //       const res = await fetch(analysisRequest.adminIndex(), {
  //         method: 'GET',
  //         credentials: 'include',
  //         headers: { 'Accept': 'application/json' },
  //       });

  //       if (!res.ok) throw new Error('Failed to fetch stats');

  //       const result = await res.json();
  //       if (result.data && Array.isArray(result.data)) {
  //         const data = result.data;
  //         setStats({
  //           total: data.length,
  //           pending: data.filter(r => r.state === 'Pendiente').length,
  //           analyzed: data.filter(r => r.state === 'Analizada').length,
  //           rejected: data.filter(r => r.state === 'Eliminada').length,
  //         });
  //       }
  //     } catch (err) {
  //       console.error('Error fetching stats:', err);
  //     } finally {
  //       setStatsLoading(false);
  //     }
  //   };

  //   fetchStats();
  // }, [hasPermission, PERMISSIONS]);

  if (loading) {
    return (
      <div className="w-full min-h-96 flex items-center justify-center">
        <Spin size="large" tip="Cargando..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-96 flex items-center justify-center text-2xl text-red-600 bg-red-50 border border-red-200 rounded-lg m-8 p-8">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-8 mb-6">
        <h1 className="text-4xl font-bold mb-2">
          ¡Bienvenido, {sessionUser?.first_name || sessionUser?.email}!
        </h1>
        <p className="text-blue-100">Panel de Administración - GeoterRA</p>
      </div>

      {/* User Info Cards */}
      <Row gutter={16} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <p className="text-gray-600 text-sm">Rol</p>
            <Tag color="blue">👨‍💼 Coordinador Científico</Tag>
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
            <p className="text-gray-600 text-sm">Estado de Cuenta</p>
            <Tag color={sessionUser?.is_active ? 'green' : 'red'}>
              {sessionUser?.is_active ? '✅ Activa' : '❌ Inactiva'}
            </Tag>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <p className="text-gray-600 text-sm">Verificación</p>
            <Tag color={sessionUser?.is_verified ? 'green' : 'orange'}>
              {sessionUser?.is_verified ? '✅ Verificado' : '⏳ Pendiente'}
            </Tag>
          </Card>
        </Col>
      </Row>

      {/* Role Description */}
      <Card className="mb-8 bg-blue-50 border-l-4 border-blue-500">
        <h3 className="text-xl font-bold mb-3">📋 Descripción del Rol: Coordinador Científico</h3>
        <p className="text-gray-700 mb-4">
          Como Coordinador Científico, eres responsable de revisar, validar y procesar las solicitudes de análisis geotérmico. 
          Tu rol te permite evaluar la calidad de los datos, confirmar ubicaciones, completar análisis químicos y garantizar 
          que solo los datos verificados se publiquen en el sistema.
        </p>
        <h4 className="font-semibold text-gray-800 mb-2">🎯 Responsabilidades Principales:</h4>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#333' }}>
          <li>Revisar todas las solicitudes de análisis pendientes</li>
          <li>Validar la precisión de datos GPS y observaciones de campo</li>
          <li>Completar mediciones de laboratorio (pH, conductividad, iones)</li>
          <li>Procesar análisis y crear registros de manifestaciones verificadas</li>
          <li>Publicar puntos en el mapa interactivo del sistema</li>
          <li>Gestionar rechazos y coordinar con investigadores cuando sea necesario</li>
        </ul>
      </Card>

      {/* Statistics */}
      <h2 className="text-2xl font-bold mb-4">📊 Estadísticas de Solicitudes</h2>
      <Row gutter={16} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Total de Solicitudes"
              value={stats.total}
              icon={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Pendientes de Revisión"
              value={stats.pending}
              icon={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Analizadas"
              value={stats.analyzed}
              icon={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Rechazadas"
              value={stats.rejected}
              icon={<DeleteOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Capabilities */}
      <Card className="mb-8 bg-blue-100 border-l-4 border-blue-500">
        <h3 className="text-lg font-bold mb-4">🎯 ¿Qué puedes hacer aquí?</h3>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">📋 Revisar Solicitudes</h4>
              <p className="text-sm text-gray-600">Accede al panel de gestión para revisar, validar y procesar todas las solicitudes pendientes de análisis.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">🔬 Análisis Químico</h4>
              <p className="text-sm text-gray-600">Ingresa mediciones de laboratorio (pH, conductividad, iones) para completar el análisis geoquímico.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">📍 Confirmar Ubicación</h4>
              <p className="text-sm text-gray-600">Verifica y ajusta las coordenadas GPS de los puntos antes de procesarlos al mapa.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">🗺️ Ver Mapa</h4>
              <p className="text-sm text-gray-600">Visualiza todas las manifestaciones geotermales aprobadas en el mapa interactivo.</p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AdminDashboard;
