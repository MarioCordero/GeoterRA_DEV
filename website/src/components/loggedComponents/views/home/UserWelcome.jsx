import { Card, Row, Col, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useSession } from '../../../../hooks/useSession';

/**
 * UserWelcome Component
 * Shown to regular users (non-admin)
 * Displays welcome message and requested points count
 */
const UserWelcome = () => {
  const navigate = useNavigate();
  const { isLogged, loading, user: sessionUser } = useSession();
  const [user, setUser] = useState({ name: '', requestedPoints: 0 });
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!loading && isLogged && sessionUser) {
      setUser({
        name: sessionUser.name || sessionUser.email || 'Usuario',
        requestedPoints: sessionUser.requestedPoints || 0,
      });
    } else if (!loading && !isLogged) {
      console.log('❌ Session invalid, redirecting to login');
      navigate('/');
    }
  }, [loading, isLogged, sessionUser, navigate]);

  if (loading || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-96 p-4">
        <p className="text-lg md:text-xl">
          Verificando sesión...
        </p>
      </div>
    );
  }

  if (!isLogged) {
    return (
      <div className="flex justify-center items-center min-h-96 p-4">
        <p className="text-lg md:text-xl text-center">
          Acceso no autorizado
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-lg p-8 mb-6">
        <h1 className="text-4xl font-bold mb-2">
          ¡Bienvenido, {user?.name || 'Usuario'}!
        </h1>
        <p className="text-amber-100">Portal de Investigador de Campo - GeoterRA</p>
      </div>

      {/* User Info Cards */}
      <Row gutter={16} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <p className="text-gray-600 text-sm">Rol</p>
            <Tag color="orange">👤 Investigador de Campo</Tag>
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
            <p className="text-gray-600 text-sm">Puntos Solicitados</p>
            <p className="text-xl font-bold text-amber-500">{user?.requestedPoints ?? 0}</p>
          </Card>
        </Col>
      </Row>

      {/* Role Description */}
      <Card className="mb-8 bg-blue-50 border-l-4 border-blue-500">
        <h3 className="text-xl font-bold mb-3">📋 Descripción del Rol: Investigador de Campo</h3>
        <p className="text-gray-700 mb-4">
          Como Investigador de Campo, eres responsable de recopilar datos sobre manifestaciones geotermales. 
          Tu rol te permite crear solicitudes de análisis, monitorear su estado en el proceso de revisión y 
          contribuir datos fundamentales para la investigación científica del potencial geotérmico.
        </p>
        <h4 className="font-semibold text-gray-800 mb-2">🎯 Responsabilidades Principales:</h4>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#333' }}>
          <li>Crear solicitudes de análisis para manifestaciones geotermales</li>
          <li>Proporcionar información precisa sobre temperatura, actividad de burbujeo y ubicación GPS</li>
          <li>Monitorear el estado de tus solicitudes en el proceso de revisión</li>
          <li>Editar o eliminar solicitudes pendientes de revisión</li>
          <li>Acceder a información detallada sobre cada solicitud enviada</li>
          <li>Exportar solicitudes en formato PDF cuando sea necesario</li>
        </ul>
      </Card>

      {/* Capabilities */}
      <Card className="mb-8 bg-amber-50 border-l-4 border-amber-500">
        <h3 className="text-lg font-bold mb-4">🎯 ¿Qué puedes hacer aquí?</h3>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">✅ Nueva Solicitud</h4>
              <p className="text-sm text-gray-600">Crea una nueva solicitud de análisis geotérmico indicando ubicación GPS, temperatura y características del sitio.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">📊 Ver Estado</h4>
              <p className="text-sm text-gray-600">Consulta el estado actual de todas tus solicitudes, desde registro inicial hasta aprobación final.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">✏️ Editar o Eliminar</h4>
              <p className="text-sm text-gray-600">Modifica o elimina tus solicitudes mientras estén en estado pendiente de revisión.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">📥 Exportar PDF</h4>
              <p className="text-sm text-gray-600">Descarga tus solicitudes en formato PDF con toda la información registrada.</p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default UserWelcome;