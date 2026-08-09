import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  TagOutlined
} from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { userMe } from '../../../../config/apiConf';
import { Card, Row, Col, Tag, Spin, Alert } from 'antd';

const UserInfo = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const result = await userMe();
        if (result.ok && result.data) {
          setUserData(result.data);
        } else {
          setError(result.error || 'No se pudieron cargar los datos del usuario.');
        }
      } catch (err) {
        setError(err.message || 'Error de conexión.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <Spin size="medium" tip="Cargando información de usuario..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        className="mb-8"
      />
    );
  }

  if (!userData) return null;

  // Helper to translate roles and assign colors
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Tag color="blue" icon={<UserOutlined />}>👨‍💼 Administrador de App</Tag>;
      case 'maintenance':
        return <Tag color="green" icon={<UserOutlined />}>🔧 Mantenimiento</Tag>;
      case 'field_investigator':
      case 'fieldInvestigator':
      case 'fieldInvestigastor':
        return <Tag color="green" icon={<UserOutlined />}>⛏️ Investigador de campo</Tag>;
      case 'investigator':
        return <Tag color="green" icon={<UserOutlined />}>🔬 Investigador</Tag>;
      default:
        return <Tag color="orange" icon={<UserOutlined />}>👤 Usuario</Tag>;
    }
  };

  const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Usuario';

  return (
    <Card className="mb-8 shadow-sm hover:shadow-md transition-shadow duration-300" title="👤 Información del Usuario Autenticado">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center">
              <IdcardOutlined className="mr-1" /> Nombre Completo
            </span>
            <span className="font-medium text-gray-800 text-sm truncate">{fullName}</span>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center">
              <MailOutlined className="mr-1" /> Correo Electrónico
            </span>
            <span className="font-medium text-gray-800 text-sm truncate">{userData.email}</span>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center">
              <TagOutlined className="mr-1" /> Rol Asignado
            </span>
            <div className="mt-0.5">{getRoleBadge(userData.role)}</div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center">
              <SafetyCertificateOutlined className="mr-1" /> Verificación
            </span>
            <div className="mt-0.5">
              <Tag color={userData.is_verified ? 'green' : 'orange'}>
                {userData.is_verified ? '✅ Verificado' : '⏳ Pendiente'}
              </Tag>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center">
              <PhoneOutlined className="mr-1" /> Teléfono
            </span>
            <span className="font-medium text-gray-800 text-sm">
              {userData.phone_number || 'No especificado'}
            </span>
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center">
              <CalendarOutlined className="mr-1" /> Fecha de Registro
            </span>
            <span className="font-medium text-gray-800 text-sm">
              {userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default UserInfo;