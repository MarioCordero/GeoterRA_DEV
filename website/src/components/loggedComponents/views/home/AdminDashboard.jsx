import "../../../../colorModule.css";
import '../../../../fontsModule.css';
import React, { useState, useEffect } from 'react';
import { useSession } from '../../../../hooks/useSession';
import { analysisRequest } from '../../../../config/apiConf';
import { usePermissions } from '../../../../hooks/usePermissions';
import { Spin, Card, Row, Col, Statistic, Tag, Button } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import UserInfo from './userInfo';

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
      <UserInfo />

      {/* Role Description: Admin */}
      <Card className="mb-8 bg-red-50 border-l-4 border-red-600">
        <h3 className="text-xl font-bold mb-3">📋 Descripción del Rol: Administrador Global</h3>
        <p className="text-gray-700 mb-4">
          Como Administrador, posees el nivel de autorización más alto en GeoterRA. Heredas todas las capacidades operativas
          y tienes control absoluto sobre la gestión del sistema, la base de datos y todos los niveles de usuarios.
        </p>
        <h4 className="font-semibold text-gray-800 mb-2">🎯 Responsabilidades Principales:</h4>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#333' }}>
          <li>Control total sobre todos los módulos de GeoterRA.</li>
          <li>Gestión irrestricta de TODOS los usuarios (incluyendo otros administradores e investigadores).</li>
          <li>Administración global de la base de datos y el mapa.</li>
          <li>Supervisión de toda la auditoría y logs del sistema.</li>
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

      {/* Capabilities: Admin */}
      <Card className="mb-8 bg-rose-50 border-l-4 border-rose-500">
        <h3 className="text-lg font-bold mb-4">🎯 ¿Qué puedes hacer aquí?</h3>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-red-700 mb-2">👑 Control Total</h4>
              <p className="text-sm text-gray-600">Acceso sin restricciones a todas las funciones, investigaciones y configuraciones.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-red-700 mb-2">👥 Gestión Global</h4>
              <p className="text-sm text-gray-600">Creación, edición y eliminación de cualquier cuenta, independientemente de su rol.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-red-700 mb-2">🗺️ Administrar Mapa</h4>
              <p className="text-sm text-gray-600">Control absoluto sobre los datos geoespaciales y puntos de manifestación.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-red-700 mb-2">🛡️ Seguridad y Logs</h4>
              <p className="text-sm text-gray-600">Revisión profunda de registros, auditorías en tiempo real y mantenimiento de DB.</p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AdminDashboard;