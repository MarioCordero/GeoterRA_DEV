import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Tag, Button } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import "../../../../colorModule.css";
import '../../../../fontsModule.css';
import { useSession } from '../../../../hooks/useSession';
import { usePermissions } from '../../../../hooks/usePermissions';
import { Spin } from 'antd';
import { analysisRequest } from '../../../../config/apiConf';

/**
 * AdminDashboard Component
 * Shown to admins and maintenance users
 * Displays admin stats, user info, and quick actions
 */
const AdminDashboard = () => {
  const { user: sessionUser, loading, error } = useSession();
  const { hasPermission, PERMISSIONS } = usePermissions();
  const [stats, setStats] = useState({ total: 0, pending: 0, analyzed: 0, rejected: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  // ✅ Fetch request statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!hasPermission(PERMISSIONS.REVIEW_REQUESTS)) return;

      try {
        setStatsLoading(true);
        const res = await fetch(analysisRequest.adminIndex(), {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });

        if (!res.ok) throw new Error('Failed to fetch stats');

        const result = await res.json();
        if (result.data && Array.isArray(result.data)) {
          const data = result.data;
          setStats({
            total: data.length,
            pending: data.filter(r => r.state === 'Pendiente').length,
            analyzed: data.filter(r => r.state === 'Analizada').length,
            rejected: data.filter(r => r.state === 'Eliminada').length,
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [hasPermission, PERMISSIONS]);

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
    <div className="w-full min-h-screen p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-8 mb-6">
        <h1 className="text-4xl font-bold mb-2">
          ¡Bienvenido, {sessionUser?.first_name || sessionUser?.email}!
        </h1>
        <p className="text-blue-100">Panel de administración - GeoterRA</p>
      </div>

      {/* User Info */}
      <Row gutter={16} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <p className="text-gray-600 text-sm">Rol</p>
            <Tag color={sessionUser?.role === 'admin' ? 'blue' : 'green'}>
              {sessionUser?.role === 'admin' ? '👨‍💼 Administrador' : sessionUser?.role === 'maintenance' ? '🔧 Mantenimiento' : '👤 Usuario'}
            </Tag>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="font-semibold">{sessionUser?.email}</p>
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

      {/* Statistics (Admin/Maintenance only) */}
      {hasPermission(PERMISSIONS.REVIEW_REQUESTS) && (
        <>
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
                  title="Pendientes"
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
        </>
      )}

      {/* Quick Actions */}
      <h2 className="text-2xl font-bold mb-4">⚡ Acciones Rápidas</h2>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Button type="primary" block size="large">
            📋 Ver Mis Solicitudes
          </Button>
        </Col>
        {hasPermission(PERMISSIONS.REVIEW_REQUESTS) && (
          <Col xs={24} sm={12} md={6}>
            <Button type="primary" block size="large">
              🔧 Gestionar Solicitudes
            </Button>
          </Col>
        )}
        <Col xs={24} sm={12} md={6}>
          <Button block size="large">
            👤 Perfil
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
