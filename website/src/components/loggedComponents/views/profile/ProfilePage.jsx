import React, { useState, useEffect } from 'react';
import { users } from '../../../../config/apiConf';
import { useSession } from '../../../../hooks/useSession';
import { Form, Input, Button, Card, Spin, Modal, Divider, Row, Col, message } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined, PhoneOutlined, SaveOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const ProfilePage = () => {
  const { user, refresh: refreshSession } = useSession();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [pendingData, setPendingData] = useState(null);

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
      // API CALL
      const endpoint = users.me();
      const response = await fetch(endpoint, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          firstName: pendingData.firstName,
          lastName: pendingData.lastName,
          email: pendingData.email,
          phoneNumber: pendingData.phone,
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
      // API CALL
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

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeleteModalVisible(false);
    setDeleteLoading(true);

    try {
      // API CALL
      const endpoint = users.me();
      const response = await fetch(endpoint, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        throw new Error('No autorizado');
      }

      if (!response.ok) {
        const errorMessage = data.errors?.[0]?.message || `Error: ${response.status}`;
        throw new Error(errorMessage);
      }

      message.success('✅ Cuenta eliminada correctamente');
      // Redirect to home after successful deletion
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      console.error('Account deletion error:', error);
      message.error(`Error: ${error.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Perfil de Usuario</h1>
        <p className="text-gray-500 m-0">Gestiona tu información personal y seguridad</p>
      </div>

      {/* Profile Information Card */}
      <Card
        title={
          <div className="flex items-center justify-between">
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
        className="mb-6"
      >
        <Spin spinning={loading}>
          {!isEditing ? (
            // View Mode
            <div>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="py-3">
                    <p className="text-gray-400 m-0 text-xs">Nombre</p>
                    <p className="m-0 text-base font-medium">{user.first_name || '-'}</p>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="py-3">
                    <p className="text-gray-400 m-0 text-xs">Apellido</p>
                    <p className="m-0 text-base font-medium">{user.last_name || '-'}</p>
                  </div>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="py-3">
                    <p className="text-gray-400 m-0 text-xs">Email</p>
                    <p className="m-0 text-base font-medium">{user.email || '-'}</p>
                  </div>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="py-3">
                    <p className="text-gray-400 m-0 text-xs">Número de Teléfono</p>
                    <p className="m-0 text-base font-medium">{user.phone_number || '-'}</p>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="py-3">
                    <p className="text-gray-400 m-0 text-xs">Rol</p>
                    <p className="m-0 text-base font-medium capitalize">
                      {user.role || '-'}
                    </p>
                  </div>
                </Col>
              </Row>
              {user.created_at && (
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <div className="py-3">
                      <p className="text-gray-400 m-0 text-xs">Miembro desde</p>
                      <p className="m-0 text-base font-medium">
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
              initialValues={{
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                email: user.email || '',
                phone: user.phone_number || '',
              }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Nombre"
                    name="firstName"
                    rules={[
                      { required: true, message: 'Ingresa tu nombre' },
                      { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Tu nombre"
                      disabled={loading}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Apellido"
                    name="lastName"
                    rules={[
                      { required: true, message: 'Ingresa tu apellido' },
                      { min: 2, message: 'El apellido debe tener al menos 2 caracteres' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Tu apellido"
                      disabled={loading}
                    />
                  </Form.Item>
                </Col>
              </Row>

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

              <div className="flex gap-3 mt-6">
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
      <Card title="Cambiar Contraseña" className="mb-6">
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

              <div className="flex gap-3 mt-6">
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

      {/* Delete Account Card - Danger Zone */}
      <Card
        title={
          <div className="flex items-center gap-2 text-red-500">
            <ExclamationCircleOutlined />
            <span>Zona de Peligro</span>
          </div>
        }
        className="mb-6 border-red-500"
      >
        <div className="py-3">
          <h4 className="m-0 mb-2 text-red-500">Eliminar Cuenta</h4>
          <p className="text-gray-500 m-0 mb-4">
            Una vez que elimines tu cuenta, no hay forma de recuperarla. Por favor, asegúrate de que deseas hacer esto.
          </p>
          <Spin spinning={deleteLoading}>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeleteModalVisible(true)}
              disabled={deleteLoading}
            >
              Eliminar mi Cuenta
            </Button>
          </Spin>
        </div>
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
        <ul className="mt-3">
          {pendingData?.firstName !== user.first_name && (
            <li>Nombre: <strong>{user.first_name}</strong> → <strong>{pendingData?.firstName}</strong></li>
          )}
          {pendingData?.lastName !== user.last_name && (
            <li>Apellido: <strong>{user.last_name}</strong> → <strong>{pendingData?.lastName}</strong></li>
          )}
          {pendingData?.email !== user.email && (
            <li>Email: <strong>{user.email}</strong> → <strong>{pendingData?.email}</strong></li>
          )}
          {pendingData?.phone !== (user.phone_number || '') && (
            <li>Teléfono: <strong>{user.phone_number || '(No especificado)'}</strong> → <strong>{pendingData?.phone || '(No especificado)'}</strong></li>
          )}
        </ul>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        title={<div className="flex items-center gap-2 text-red-500">
          <ExclamationCircleOutlined />
          <span>Eliminar Cuenta Permanentemente</span>
        </div>}
        open={deleteModalVisible}
        onOk={handleDeleteAccount}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Sí, eliminar mi cuenta"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
        confirmLoading={deleteLoading}
      >
        <div className="py-3">
          <p className="text-red-500 font-bold mb-3">
            ⚠️ Esta acción es irreversible y permanente.
          </p>
          <p>Se eliminarán los siguientes datos:</p>
          <ul className="my-3">
            <li>Tu perfil de usuario</li>
            <li>Todas tus solicitudes de análisis</li>
            <li>Tu historial de sesiones</li>
            <li>Todos tus datos personales almacenados</li>
          </ul>
          <p className="mt-3">
            <strong>¿Estás completamente seguro de que deseas continuar?</strong>
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;