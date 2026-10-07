import React, { useState } from 'react';
import {
  userMeUpdate,
  userMeDelete,
  userUpdatePassword
} from '../../../../config/apiConf';
import { useSession } from '../../../../hooks/useSession';
import ConfirmationModal from '../../../common/ConfirmationModal';
import SuccessModal from '../../../common/SuccessModal';
import ErrorModal from '../../../common/ErrorModal';
import {
  Form,
  Input,
  Button,
  Card,
  Spin,
  Row,
  Col,
  Tag,
  message,
  Divider
} from 'antd';
import {
  LockOutlined,
  MailOutlined,
  UserOutlined,
  PhoneOutlined,
  SaveOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  IdcardOutlined,
  KeyOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import '../../../../colorModule.css';
import '../../../../fontsModule.css';

const ProfilePage = () => {
  const { user, refresh: refreshSession } = useSession();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modals state
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [profileUpdateSuccessVisible, setProfileUpdateSuccessVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [pendingData, setPendingData] = useState(null);

  const showError = (msg) => {
    setErrorMessage(msg);
    setErrorModalVisible(true);
  };

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
        first_name: pendingData.firstName,
        last_name: pendingData.lastName,
        email: pendingData.email,
        phone_number: pendingData.phone ? pendingData.phone.replace(/\D/g, '') : null,
      };

      const result = await userMeUpdate(payload);
      if (!result.ok) throw new Error(result.error || 'Error al actualizar el perfil');

      setLoading(false);
      setPendingData(null);
      setProfileUpdateSuccessVisible(true);
    } catch (error) {
      setLoading(false);
      showError(error.message || 'Error al actualizar la información del perfil');
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
      showError('Las contraseñas no coinciden');
      return;
    }
    setPasswordLoading(true);

    try {
      const payload = {
        current_password: values.currentPassword,
        new_password: values.newPassword,
      };

      const response = await userUpdatePassword(payload);
      if (!response.ok) {
        throw new Error(response.error || 'Error al cambiar la contraseña');
      }

      setSuccessModalVisible(true);
      passwordForm.resetFields();
    } catch (error) {
      console.error('❌ [handlePasswordChange] Error:', error);
      showError(error.message || 'Error al cambiar la contraseña');
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
        throw new Error(result.error || 'Error al eliminar la cuenta');
      }

      message.success('Cuenta eliminada correctamente');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      console.error('Account deletion error:', error);
      showError(error.message || 'Error al eliminar la cuenta');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Cargando perfil..." />
      </div>
    );
  }

  const roleLabels = {
    admin: 'Administrador Global',
    maintenance: 'Mantenimiento e Infraestructura',
    investigator: 'Investigador Principal',
    field_investigator: 'Investigador de Campo',
    user: 'Usuario General',
  };

  const roleColors = {
    admin: 'magenta',
    maintenance: 'orange',
    investigator: 'blue',
    field_investigator: 'cyan',
    user: 'default',
  };

  const initials = `${(user.first_name || user.firstName || 'G')[0] || ''}${(user.last_name || user.lastName || 'T')[0] || ''}`.toUpperCase();

  return (
    <div className="w-full p-4 md:p-8 space-y-6 poppins max-w-5xl mx-auto">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-geoterra-orange poppins">
              MI CUENTA • CONFIGURACIÓN Y SEGURIDAD
            </span>
            <Tag color={roleColors[user.role] || 'blue'} className="m-0 text-[11px] font-semibold">
              {roleLabels[user.role] || user.role}
            </Tag>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-geoterra-blue m-0 poppins">
            Perfil de Usuario
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-0 max-w-2xl">
            Gestiona tu información de contacto personal, credenciales de acceso y credenciales institucionales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tag color="success" className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircleOutlined /> Cuenta Activa
          </Tag>
        </div>
      </div>

      {/* User Hero Overview Card */}
      <div className="bg-gradient-to-r from-[#12467E] to-[#1c5d9e] p-6 rounded-2xl shadow-sm text-white flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl font-extrabold text-amber-300 shadow-inner shrink-0">
          {initials}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-bold text-white m-0 poppins">
              {user.first_name || user.firstName} {user.last_name || user.lastName}
            </h2>
            <span className="bg-white/20 text-blue-100 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {roleLabels[user.role] || user.role}
            </span>
          </div>

          <p className="text-blue-100 text-sm m-0 flex items-center justify-center sm:justify-start gap-1">
            <MailOutlined className="text-blue-300" />
            <span>{user.email}</span>
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-blue-200">
            {user.phone_number || user.phoneNumber ? (
              <span className="flex items-center gap-1">
                <PhoneOutlined /> {user.phone_number || user.phoneNumber}
              </span>
            ) : null}
            {user.created_at && (
              <span className="flex items-center gap-1">
                <CalendarOutlined /> Miembro desde{' '}
                {new Date(user.created_at).toLocaleDateString('es-ES', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details & Form */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <IdcardOutlined className="text-xl text-[#12467E]" />
            <h3 className="text-lg font-bold text-gray-800 m-0 poppins">
              Información Personal
            </h3>
          </div>

          {!isEditing && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setIsEditing(true)}
              style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
              className="poppins-bold shadow-sm"
            >
              Editar Datos
            </Button>
          )}
        </div>

        <Spin spinning={loading}>
          {!isEditing ? (
            // View Mode
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                  Nombre de Pila
                </span>
                <span className="text-base font-bold text-gray-800 poppins">
                  {user.first_name || user.firstName || '-'}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                  Apellidos
                </span>
                <span className="text-base font-bold text-gray-800 poppins">
                  {user.last_name || user.lastName || '-'}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                  Correo Electrónico
                </span>
                <span className="text-base font-bold text-gray-800 poppins">
                  {user.email || '-'}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                  Número Telefónico
                </span>
                <span className="text-base font-bold text-gray-800 poppins">
                  {user.phone_number || user.phoneNumber || 'No especificado'}
                </span>
              </div>
            </div>
          ) : (
            // Edit Mode Form
            <Form
              form={form}
              layout="vertical"
              onFinish={handleProfileUpdate}
              initialValues={{
                firstName: user.first_name || user.firstName || '',
                lastName: user.last_name || user.lastName || '',
                email: user.email || '',
                phone: user.phone_number || user.phoneNumber || '',
              }}
              className="space-y-4"
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<span className="font-semibold text-gray-700">Nombre</span>}
                    name="firstName"
                    rules={[
                      { required: true, message: 'Ingresa tu nombre' },
                      { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Tu nombre"
                      disabled={loading}
                      className="rounded-lg py-2"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<span className="font-semibold text-gray-700">Apellidos</span>}
                    name="lastName"
                    rules={[
                      { required: true, message: 'Ingresa tu apellido' },
                      { min: 2, message: 'El apellido debe tener al menos 2 caracteres' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Tu apellido"
                      disabled={loading}
                      className="rounded-lg py-2"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<span className="font-semibold text-gray-700">Correo Electrónico</span>}
                    name="email"
                    rules={[
                      { required: true, message: 'Ingresa tu email' },
                      { type: 'email', message: 'Email inválido' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined className="text-gray-400" />}
                      placeholder="tu@email.com"
                      disabled={loading}
                      className="rounded-lg py-2"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={<span className="font-semibold text-gray-700">Teléfono</span>}
                    name="phone"
                    rules={[
                      { min: 7, message: 'El teléfono debe tener al menos 7 dígitos' },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      placeholder="8888-8888"
                      disabled={loading}
                      className="rounded-lg py-2"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="flex gap-3 pt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                  style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
                  className="poppins-bold shadow-sm"
                >
                  Guardar Cambios
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    form.resetFields();
                  }}
                  disabled={loading}
                  className="border-gray-300"
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          )}
        </Spin>
      </div>

      {/* Security & Password Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <KeyOutlined className="text-xl text-[#12467E]" />
            <div>
              <h3 className="text-lg font-bold text-gray-800 m-0 poppins">
                Seguridad de la Cuenta
              </h3>
              <p className="text-xs text-gray-500 m-0">
                Actualiza tu contraseña periódicamente para proteger tu acceso.
              </p>
            </div>
          </div>

          {!isChangingPassword && (
            <Button
              onClick={() => setIsChangingPassword(true)}
              disabled={passwordLoading}
              className="border-gray-300 poppins font-medium"
            >
              Cambiar Contraseña
            </Button>
          )}
        </div>

        <Spin spinning={passwordLoading}>
          {!isChangingPassword ? (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12467E] flex items-center justify-center text-lg">
                  <SafetyCertificateOutlined />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-800 block">
                    Contraseña activa y segura
                  </span>
                  <span className="text-xs text-gray-500">
                    Última actualización de credenciales protegida con hashing bcrypt.
                  </span>
                </div>
              </div>
              <Tag color="blue" className="rounded-md font-medium">Protegido</Tag>
            </div>
          ) : (
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
              className="space-y-4 max-w-xl"
            >
              <Form.Item
                label={<span className="font-semibold text-gray-700">Contraseña Actual</span>}
                name="currentPassword"
                rules={[{ required: true, message: 'Ingresa tu contraseña actual' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Tu contraseña actual"
                  disabled={passwordLoading}
                  className="rounded-lg py-2"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-gray-700">Nueva Contraseña</span>}
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
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Mínimo 8 caracteres, mayúsculas y números"
                  disabled={passwordLoading}
                  className="rounded-lg py-2"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-gray-700">Confirmar Nueva Contraseña</span>}
                name="confirmPassword"
                rules={[{ required: true, message: 'Confirma tu nueva contraseña' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Repite la nueva contraseña"
                  disabled={passwordLoading}
                  className="rounded-lg py-2"
                />
              </Form.Item>

              <div className="flex gap-3 pt-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={passwordLoading}
                  style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
                  className="poppins-bold shadow-sm"
                >
                  Actualizar Contraseña
                </Button>
                <Button
                  onClick={() => {
                    setIsChangingPassword(false);
                    passwordForm.resetFields();
                  }}
                  disabled={passwordLoading}
                  className="border-gray-300"
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          )}
        </Spin>
      </div>

      {/* Danger Zone Card */}
      <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-rose-600">
          <ExclamationCircleOutlined className="text-xl" />
          <h3 className="text-lg font-bold text-rose-600 m-0 poppins">
            Zona de Peligro
          </h3>
        </div>
        <p className="text-sm text-gray-600 m-0">
          Una vez que elimines tu cuenta, no hay forma de recuperarla. Toda tu información de perfil,
          solicitudes e historial serán eliminados permanentemente del sistema.
        </p>

        <div className="pt-2">
          <Spin spinning={deleteLoading}>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeleteModalVisible(true)}
              disabled={deleteLoading}
              className="poppins-semibold rounded-lg"
            >
              Eliminar Permanentemente mi Cuenta
            </Button>
          </Spin>
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        open={modalVisible}
        title="Confirmar cambios"
        message="¿Estás seguro de que deseas actualizar tu información personal?"
        items={[
          ...(pendingData?.firstName !== (user.first_name || user.firstName) ? [{
            label: 'Nombre',
            old: user.first_name || user.firstName,
            new: pendingData?.firstName,
          }] : []),
          ...(pendingData?.lastName !== (user.last_name || user.lastName) ? [{
            label: 'Apellido',
            old: user.last_name || user.lastName,
            new: pendingData?.lastName,
          }] : []),
          ...(pendingData?.email !== user.email ? [{
            label: 'Email',
            old: user.email,
            new: pendingData?.email,
          }] : []),
          ...(pendingData?.phone !== (user.phone_number || user.phoneNumber || '') ? [{
            label: 'Teléfono',
            old: user.phone_number || user.phoneNumber || '(No especificado)',
            new: pendingData?.phone || '(No especificado)',
          }] : []),
        ]}
        okText="Confirmar"
        cancelText="Cancelar"
        onOk={confirmProfileUpdate}
        onCancel={() => setModalVisible(false)}
        loading={loading}
      />

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

      <SuccessModal
        open={successModalVisible}
        title="¡Éxito!"
        subtitle="Contraseña actualizada"
        message="Tu contraseña ha sido actualizada correctamente."
        status="success"
        confirmText="Continuar"
        onConfirm={handlePasswordChangeSuccess}
      />

      <SuccessModal
        open={profileUpdateSuccessVisible}
        title="¡Éxito!"
        subtitle="Perfil actualizado"
        message="Tu información personal ha sido actualizada correctamente."
        status="success"
        confirmText="Continuar"
        onConfirm={handleProfileUpdateSuccess}
      />

      <ErrorModal
        open={errorModalVisible}
        errorMessage={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    </div>
  );
};

export default ProfilePage;