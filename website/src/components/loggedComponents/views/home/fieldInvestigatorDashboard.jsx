import React from 'react';
import { Card, Row, Col } from 'antd';
import { useSession } from '../../../../hooks/useSession';
import UserInfo from './userInfo';

const FieldInvestigatorDashboard = () => {
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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg p-8 mb-6">
        <h1 className="text-4xl font-bold mb-2">
          ¡Bienvenido, {sessionUser?.first_name || sessionUser?.email}!
        </h1>
        <p className="text-emerald-100">Panel de Investigador de Campo - GeoterRA</p>
      </div>

      {/* User Info Cards */}
      <UserInfo />

      {/* Role Description: Field Investigator */}
      <Card className="mb-8 bg-green-50 border-l-4 border-green-500">
        <h3 className="text-xl font-bold mb-3">📋 Descripción del Rol: Investigador de Campo</h3>
        <p className="text-gray-700 mb-4">
          Como Investigador de Campo, tu enfoque principal está en el terreno. Tienes la autoridad para participar,
          iniciar y gestionar estudios directamente asociados a giras de campo.
        </p>
        <h4 className="font-semibold text-gray-800 mb-2">🎯 Responsabilidades Principales:</h4>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#333' }}>
          <li>Participar activamente en estudios de campo (Gira).</li>
          <li>Iniciar estudios de un punto de manifestación durante una gira.</li>
          <li>Revisar estudios iniciados en el contexto de giras.</li>
          <li>Eliminar estudios de giras cuando sea necesario.</li>
        </ul>
      </Card>

      {/* Capabilities: Field Investigator */}
      <Card className="mb-8 bg-emerald-50 border-l-4 border-emerald-500">
        <h3 className="text-lg font-bold mb-4">🎯 ¿Qué puedes hacer aquí?</h3>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-green-600 mb-2">🎒 Participar en Giras</h4>
              <p className="text-sm text-gray-600">Únete y colabora en estudios de campo programados en el sistema.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-green-600 mb-2">📍 Iniciar Estudio (Gira)</h4>
              <p className="text-sm text-gray-600">Registra un nuevo punto de manifestación encontrado durante el trabajo de campo.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-green-600 mb-2">📋 Revisar Giras</h4>
              <p className="text-sm text-gray-600">Visualiza el progreso y los detalles de los estudios de terreno iniciados.</p>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-green-600 mb-2">❌ Gestión de Giras</h4>
              <p className="text-sm text-gray-600">Elimina registros de estudios de campo que contengan errores o sean obsoletos.</p>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default FieldInvestigatorDashboard;