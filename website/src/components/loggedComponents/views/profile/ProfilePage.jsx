import React, { useState, useEffect } from 'react';
import { userMeUpdate, userMeDelete } from '../../../../config/apiConf';
import { useSession } from '../../../../hooks/useSession';
import ConfirmationModal from '../../../../common/ConfirmationModal';
import SuccessModal from '../../../common/SuccessModal';
import { Form, Input, Button, Card, Spin, Row, Col, message } from 'antd';
import { LockOutlined, MailOutlined, UserOutlined, PhoneOutlined, SaveOutlined, ExclamationCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

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
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [profileUpdateSuccessVisible, setProfileUpdateSuccessVisible] = useState(false);
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
      const payload = {
        firstName: pendingData.firstName,
        lastName: pendingData.lastName,
        email: pendingData.email,
        phoneNumber: pendingData.phone,
      };
      const result = await userMeUpdate(payload);
      if (!result.ok) throw new Error(result.error || 'Error updating profile');

      setLoading(false);
      setPendingData(null);
      setProfileUpdateSuccessVisible(true);
    } catch (error) {
      message.error(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  const handleProfileUpdateSuccess = async () => {
    setProfileUpdateSuccessVisible(false);
    setIsEditing(false);
    await refreshSession();
  };

  // Handle password change submission
  const handlePasswordChange = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Las contraseñas no coinciden');
      return;
    }
    setPasswordLoading(true);

    try {
      const payload = {
        currentPassword: values.currentPassword,
        password: values.newPassword,
        firstName: user.first_name || user.firstName,
        lastName: user.last_name || user.lastName,
        email: user.email,
        phoneNumber: user.phone_number || user.phoneNumber,
      };

      const response = await userMeUpdate(payload);
      if (!response.ok) {
        throw new Error(response.error || 'Password change failed');
      }

      setSuccessModalVisible(true);
      console.log('✅ [handlePasswordChange] Password changed successfully - Success modal is now visible');
      passwordForm.resetFields();
    } catch (error) {
      console.error('❌ [handlePasswordChange] Error:', error);
      message.error(`Error: ${error.message}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle success modal confirmation
  const handlePasswordChangeSuccess = async () => {
    setSuccessModalVisible(false);
    setIsChangingPassword(false);
    await refreshSession();
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeleteModalVisible(false);
    setDeleteLoading(true);

    try {
      const result = await userMeDelete();

      if (!result.ok) {
        throw new Error(result.error || 'Account deletion failed');
      }

      message.success('✅ Cuenta eliminada correctamente');
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

      {/* Profile Update Confirmation Modal */}
      <ConfirmationModal
        open={modalVisible}
        title="Confirmar cambios"
        message="¿Estás seguro de que deseas actualizar tu información personal?"
        items={[
          ...(pendingData?.firstName !== user.first_name ? [{
            label: 'Nombre',
            old: user.first_name,
            new: pendingData?.firstName,
          }] : []),
          ...(pendingData?.lastName !== user.last_name ? [{
            label: 'Apellido',
            old: user.last_name,
            new: pendingData?.lastName,
          }] : []),
          ...(pendingData?.email !== user.email ? [{
            label: 'Email',
            old: user.email,
            new: pendingData?.email,
          }] : []),
          ...(pendingData?.phone !== (user.phone_number || '') ? [{
            label: 'Teléfono',
            old: user.phone_number || '(No especificado)',
            new: pendingData?.phone || '(No especificado)',
          }] : []),
        ]}
        okText="Confirmar"
        cancelText="Cancelar"
        onOk={confirmProfileUpdate}
        onCancel={() => setModalVisible(false)}
        loading={loading}
      />

      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        open={deleteModalVisible}
        title="Eliminar Cuenta Permanentemente"
        message="⚠️ Esta acción es irreversible y permanente."
        icon="danger"
        danger={true}
        items={[
          'Tu perfil de usuario',
          'Todas tus solicitudes de análisis',
          'Tu historial de sesiones',
          'Todos tus datos personales almacenados',
        ]}
        okText="Sí, eliminar mi cuenta"
        cancelText="Cancelar"
        onOk={handleDeleteAccount}
        onCancel={() => setDeleteModalVisible(false)}
        loading={deleteLoading}
      />

      {/* Password Change Success Modal */}
      <SuccessModal
        open={successModalVisible}
        title="¡Éxito!"
        subtitle="Contraseña actualizada"
        message="Tu contraseña ha sido actualizada correctamente."
        status="success"
        confirmText="Continuar"
        onConfirm={handlePasswordChangeSuccess}
      />

      {/* Profile Update Success Modal */}
      <SuccessModal
        open={profileUpdateSuccessVisible}
        title="¡Éxito!"
        subtitle="Perfil actualizado"
        message="Tu información personal ha sido actualizada correctamente."
        status="success"
        confirmText="Continuar"
        onConfirm={handleProfileUpdateSuccess}
      />
    </div>
  );
};

export default ProfilePage;