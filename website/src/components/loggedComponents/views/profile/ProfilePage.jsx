import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Spin, Modal, Divider, Row, Col, message } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined, PhoneOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import { useSession } from '../../../../hooks/useSession';
import { users } from '../../../../config/apiConf';

/**
 * ProfilePage View
 * User profile management page
 * Allows authenticated users to view and edit their profile information
 */
const ProfilePage = () => {
  const { user, refresh: refreshSession } = useSession();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone_number || '',
      });
    }
  }, [user, form]);

  // Handle profile update submission
  const handleProfileUpdate = async (values) => {
    setPendingData(values);
    setModalVisible(true);
  };

  // Confirm and submit profile update
  const confirmProfileUpdate = async () => {
    setModalVisible(false);
    setLoading(true);

    try {
      const endpoint = users.me();
      const response = await fetch(endpoint, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: pendingData.name,
          email: pendingData.email,
          phone_number: pendingData.phone,
        }),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        throw new Error('No autorizado');
      }

      if (!response.ok) {
        const errorMessage = data.errors?.[0]?.message || `Error: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Refresh session to update user data
      await refreshSession();
      message.success('✅ Perfil actualizado correctamente');
      setIsEditing(false);
      setPendingData(null);
    } catch (error) {
      console.error('Profile update error:', error);
      message.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle password change submission
  const handlePasswordChange = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Las contraseñas no coinciden');
      return;
    }

    setPasswordLoading(true);

    try {
      const endpoint = users.me();
      const response = await fetch(endpoint, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          password: values.newPassword,
        }),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        throw new Error('Contraseña actual incorrecta');
      }

      if (!response.ok) {
        const errorMessage = data.errors?.[0]?.message || `Error: ${response.status}`;
        throw new Error(errorMessage);
      }

      message.success('✅ Contraseña actualizada correctamente');
      passwordForm.resetFields();
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Password change error:', error);
      message.error(`Error: ${error.message}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px' }}>Perfil de Usuario</h1>
        <p style={{ color: '#666', margin: '0' }}>Gestiona tu información personal y seguridad</p>
      </div>

      {/* Profile Information Card */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Información Personal</span>
            {!isEditing && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
              >
                Editar
              </Button>
            )}
          </div>
        }
        style={{ marginBottom: '24px' }}
      >
        <Spin spinning={loading}>
          {!isEditing ? (
            // View Mode
            <div>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div style={{ padding: '12px 0' }}>
                    <p style={{ color: '#999', margin: '0 0 4px 0', fontSize: '12px' }}>Nombre</p>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: '500' }}>{user.name || '-'}</p>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ padding: '12px 0' }}>
                    <p style={{ color: '#999', margin: '0 0 4px 0', fontSize: '12px' }}>Email</p>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: '500' }}>{user.email || '-'}</p>
                  </div>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div style={{ padding: '12px 0' }}>
                    <p style={{ color: '#999', margin: '0 0 4px 0', fontSize: '12px' }}>Número de Teléfono</p>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: '500' }}>{user.phone_number || '-'}</p>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ padding: '12px 0' }}>
                    <p style={{ color: '#999', margin: '0 0 4px 0', fontSize: '12px' }}>Rol</p>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: '500', textTransform: 'capitalize' }}>
                      {user.role || '-'}
                    </p>
                  </div>
                </Col>
              </Row>
              {user.created_at && (
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <div style={{ padding: '12px 0' }}>
                      <p style={{ color: '#999', margin: '0 0 4px 0', fontSize: '12px' }}>Miembro desde</p>
                      <p style={{ margin: '0', fontSize: '16px', fontWeight: '500' }}>
                        {new Date(user.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </Col>
                </Row>
              )}
            </div>
          ) : (
            // Edit Mode
            <Form
              form={form}
              layout="vertical"
              onFinish={handleProfileUpdate}
            >
              <Form.Item
                label="Nombre Completo"
                name="name"
                rules={[
                  { required: true, message: 'Ingresa tu nombre completo' },
                  { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Tu nombre completo"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Ingresa tu email' },
                  { type: 'email', message: 'Email inválido' },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="tu@email.com"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                label="Número de Teléfono"
                name="phone"
                rules={[
                  { min: 7, message: 'El teléfono debe tener al menos 7 dígitos' },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="+1 (555) 000-0000"
                  disabled={loading}
                />
              </Form.Item>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Guardar Cambios
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    form.resetFields();
                  }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          )}
        </Spin>
      </Card>

      {/* Password Change Card */}
      <Card title="Cambiar Contraseña" style={{ marginBottom: '24px' }}>
        <Spin spinning={passwordLoading}>
          {!isChangingPassword ? (
            <Button
              onClick={() => setIsChangingPassword(true)}
              disabled={passwordLoading}
            >
              Cambiar Contraseña
            </Button>
          ) : (
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                label="Contraseña Actual"
                name="currentPassword"
                rules={[
                  { required: true, message: 'Ingresa tu contraseña actual' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Tu contraseña actual"
                  disabled={passwordLoading}
                />
              </Form.Item>

              <Form.Item
                label="Nueva Contraseña"
                name="newPassword"
                rules={[
                  { required: true, message: 'Ingresa una nueva contraseña' },
                  { min: 8, message: 'La contraseña debe tener al menos 8 caracteres' },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Debe contener letras mayúsculas, minúsculas y números',
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nueva contraseña"
                  disabled={passwordLoading}
                />
              </Form.Item>

              <Form.Item
                label="Confirmar Contraseña"
                name="confirmPassword"
                rules={[
                  { required: true, message: 'Confirma tu nueva contraseña' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirma tu contraseña"
                  disabled={passwordLoading}
                />
              </Form.Item>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={passwordLoading}
                >
                  Actualizar Contraseña
                </Button>
                <Button
                  onClick={() => {
                    setIsChangingPassword(false);
                    passwordForm.resetFields();
                  }}
                  disabled={passwordLoading}
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          )}
        </Spin>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        title="Confirmar cambios"
        open={modalVisible}
        onOk={confirmProfileUpdate}
        onCancel={() => setModalVisible(false)}
        okText="Confirmar"
        cancelText="Cancelar"
        confirmLoading={loading}
      >
        <p>¿Estás seguro de que deseas actualizar tu información personal?</p>
        <ul style={{ marginTop: '12px' }}>
          {pendingData?.email !== user.email && (
            <li>Email: <strong>{user.email}</strong> → <strong>{pendingData?.email}</strong></li>
          )}
          {pendingData?.name !== user.name && (
            <li>Nombre: <strong>{user.name}</strong> → <strong>{pendingData?.name}</strong></li>
          )}
          {pendingData?.phone !== (user.phone_number || '') && (
            <li>Teléfono: <strong>{user.phone_number || '(No especificado)'}</strong> → <strong>{pendingData?.phone || '(No especificado)'}</strong></li>
          )}
        </ul>
      </Modal>
    </div>
  );
};

export default ProfilePage;