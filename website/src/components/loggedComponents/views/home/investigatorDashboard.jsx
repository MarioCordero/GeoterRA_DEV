import React from 'react';
import { Card, Row, Col } from 'antd';
import { useSession } from '../../../../hooks/useSession';
import UserInfo from './userInfo';

const InvestigatorDashboard = () => {
  const { user: sessionUser, loading } = useSession();

  if (loading) {
    return (
      <div className="w-full min-h-96 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-8 mb-6">
        <h1 className="text-4xl font-bold mb-2">
          ¡Bienvenido, {sessionUser?.first_name || sessionUser?.email}!
        </h1>
        <p className="text-indigo-100">Panel de Investigador Principal - GeoterRA</p>
      </div>

      {/* User Info Cards */}
      <UserInfo />

      {/* Role Description: Investigator */}
      <Card className="mb-8 bg-indigo-50 border-l-4 border-indigo-500">
        <h3 className="text-xl font-bold mb-3">📋 Descripción del Rol: Investigador Principal</h3>
        <p className="text-gray-700 mb-4">
          Como Investigador, tienes una visión analítica global de la plataforma GeoterRA. Además de las labores de campo,
          estás a cargo de la gestión de la base de datos, el control del mapa interactivo y la supervisión de usuarios regulares.
        </p>
        <h4 className="font-semibold text-gray-800 mb-2">🎯 Responsabilidades Principales:</h4>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#333' }}>
          <li>Visualización completa de la base de datos de manifestaciones.</li>
          <li>Gestionar usuarios existentes (excluyendo a administradores).</li>
          <li>Agregar o quitar puntos directamente desde el mapa.</li>
          <li>Visualizar logs de la base de datos en tiempo real.</li>
        </ul>
      </Card>

      {/* Capabilities: Investigator */}
      <Card className="mb-8 bg-violet-50 border-l-4 border-violet-500">
        <h3 className="text-lg font-bold mb-4">🎯 ¿Qué puedes hacer aquí?</h3>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-indigo-600 mb-2">🗄️ Base de Datos</h4>
              <p className="text-sm text-gray-600">Accede y visualiza todos los registros de manifestaciones en la plataforma.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-indigo-600 mb-2">🗺️ Control del Mapa</h4>
              <p className="text-sm text-gray-600">Gestiona, agrega y elimina puntos de interés directamente en la interfaz geoespacial.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-indigo-600 mb-2">👥 Gestión de Usuarios</h4>
              <p className="text-sm text-gray-600">Administra cuentas y permisos de usuarios regulares y de campo.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-indigo-600 mb-2">📈 Monitoreo (Logs)</h4>
              <p className="text-sm text-gray-600">Visualiza en tiempo real los registros de actividad (logs) de la base de datos.</p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default InvestigatorDashboard;