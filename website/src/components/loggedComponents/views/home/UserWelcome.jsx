import { Card, Row, Col, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useSession } from '../../../../hooks/useSession';
import UserInfo from './userInfo';

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
        <p className="text-amber-100">Portal de App - GeoterRA</p>
      </div>

      {/* User Info Cards */}
      <UserInfo />

      {/* Dashboard Specific Stats */}
      <Row gutter={16} className="mb-8">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <p className="text-gray-600 text-sm">Puntos Solicitados</p>
            <p className="text-xl font-bold text-amber-500">{user?.requestedPoints ?? 0}</p>
          </Card>
        </Col>
      </Row>

      {/* Role Description: User */}
      <Card className="mb-8 bg-blue-50 border-l-4 border-blue-500">
        <h3 className="text-xl font-bold mb-3">📋 Descripción del Rol: Usuario</h3>
        <p className="text-gray-700 mb-4">
          Como Usuario, eres responsable de iniciar y dar seguimiento a los estudios de puntos de manifestación geotérmica (Común).
          Tu rol te permite documentar nuevos estudios, revisar su avance, eliminar registros obsoletos y gestionar tu información personal.
        </p>
        <h4 className="font-semibold text-gray-800 mb-2">🎯 Responsabilidades Principales:</h4>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#333' }}>
          <li>Iniciar estudios de un punto de manifestación (Común).</li>
          <li>Revisar estudios iniciados (Común).</li>
          <li>Eliminar estudios iniciados (Común).</li>
          <li>Actualizar tu información personal en la plataforma.</li>
        </ul>
      </Card>

      {/* Capabilities: User */}
      <Card className="mb-8 bg-amber-50 border-l-4 border-amber-500">
        <h3 className="text-lg font-bold mb-4">🎯 ¿Qué puedes hacer aquí?</h3>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">🔬 Iniciar Estudio</h4>
              <p className="text-sm text-gray-600">Comienza un nuevo estudio común sobre una manifestación geotérmica.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">📋 Revisar Estudios</h4>
              <p className="text-sm text-gray-600">Consulta el progreso y los detalles de tus estudios iniciados.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">❌ Eliminar Estudios</h4>
              <p className="text-sm text-gray-600">Remueve del sistema estudios iniciados que ya no sean requeridos.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">⚙️ Mi Perfil</h4>
              <p className="text-sm text-gray-600">Actualiza tus datos de contacto y detalles personales en cualquier momento.</p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default UserWelcome;