import React, { useState, useEffect, useMemo } from 'react';
import { maintenanceAllUsers, userAdminUpdateRole } from '../../../../config/apiConf';
import { usePermissions } from '../../../../hooks/usePermissions';
import {
  Table,
  Card,
  Spin,
  Tag,
  message,
  Button,
  Space,
  Modal,
  Select,
  Input,
  Tooltip,
  Empty,
} from 'antd';
import {
  ReloadOutlined,
  EditOutlined,
  UserOutlined,
  SearchOutlined,
  ClearOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ExperimentOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { renderDateWithProse } from '../../../../utils/dateFormatter';

const UserManagement = () => {
  const { hasPermission, PERMISSIONS } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filters state
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await maintenanceAllUsers();

      if (!result.ok) {
        throw new Error(result.error || 'Error al obtener usuarios');
      }

      setUsers(result.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (record) => {
    setEditingUser(record);
    setSelectedRole(record.role);
    setIsModalVisible(true);
  };

  const handleSaveRole = async () => {
    if (!selectedRole) {
      message.warning('Por favor selecciona un rol para el usuario');
      return;
    }

    if (selectedRole === editingUser.role) {
      message.info('El usuario ya cuenta con ese rol asignado');
      setIsModalVisible(false);
      return;
    }

    setIsSaving(true);
    try {
      const result = await userAdminUpdateRole(editingUser.user_id, {
        role: selectedRole,
      });

      if (!result.ok) {
        throw new Error(result.error || 'Error al actualizar el rol de usuario');
      }

      const updatedUsers = users.map((user) =>
        user.user_id === editingUser.user_id ? { ...user, role: selectedRole } : user
      );
      setUsers(updatedUsers);

      message.success(`Rol de usuario actualizado a "${selectedRole}" correctamente`);
      setIsModalVisible(false);
      setEditingUser(null);
      setSelectedRole(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      message.error(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    setSelectedRole(null);
  };

  useEffect(() => {
    if (hasPermission(PERMISSIONS.MANAGE_USERS)) {
      fetchUsers();
    }
  }, []);

  // Compute metrics
  const stats = useMemo(() => {
    const total = users.length;
    const adminCount = users.filter((u) => u.role === 'admin' || u.role === 'maintenance').length;
    const investigatorCount = users.filter(
      (u) => u.role === 'investigator' || u.role === 'field_investigator'
    ).length;
    const generalUsers = users.filter((u) => u.role === 'user' || !u.role).length;
    return { total, adminCount, investigatorCount, generalUsers };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchText.trim().toLowerCase();
      const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone_number && u.phone_number.includes(q));

      let matchesRole = true;
      if (roleFilter !== 'ALL') {
        if (roleFilter === 'ADMINS') matchesRole = u.role === 'admin' || u.role === 'maintenance';
        else if (roleFilter === 'INVESTIGATORS')
          matchesRole = u.role === 'investigator' || u.role === 'field_investigator';
        else matchesRole = u.role === roleFilter;
      }

      let matchesStatus = true;
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'active') matchesStatus = !u.is_deleted;
        else if (statusFilter === 'deleted') matchesStatus = !!u.is_deleted;
      }

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchText, roleFilter, statusFilter]);

  if (!hasPermission(PERMISSIONS.MANAGE_USERS)) {
    return (
      <div className="p-8 text-center poppins max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-2">
          <CloseCircleOutlined className="text-3xl text-red-500" />
          <h2 className="text-lg font-bold text-red-800 m-0">Acceso Restringido</h2>
          <p className="text-xs text-red-600 m-0">
            No tienes los permisos requeridos para gestionar roles de usuario en GeoterRA.
          </p>
        </div>
      </div>
    );
  }

  const roleTagConfig = {
    admin: { color: 'blue', label: 'Administrador' },
    maintenance: { color: 'cyan', label: 'Mantenimiento' },
    field_investigator: { color: 'orange', label: 'Investigador de Campo' },
    investigator: { color: 'purple', label: 'Investigador Lab' },
    user: { color: 'default', label: 'Usuario General' },
  };

  const columns = [
    {
      title: 'Usuario / Nombre Completo',
      key: 'fullName',
      sorter: (a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
      render: (_, record) => (
        <div className="flex items-center gap-3 poppins">
          <div className="w-9 h-9 rounded-full bg-blue-50 text-geoterra-blue flex items-center justify-center font-bold text-sm border border-blue-100 flex-shrink-0">
            {(record.first_name?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-gray-900 block text-sm">
              {record.first_name} {record.last_name}
            </span>
            <span className="text-xs text-gray-400 font-mono">ID: #{record.user_id || record.id}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Contacto',
      key: 'contact',
      render: (_, record) => (
        <div className="space-y-0.5 text-xs poppins">
          <div className="text-gray-700 flex items-center gap-1.5">
            <MailOutlined className="text-gray-400 text-[11px]" />
            <span>{record.email}</span>
          </div>
          {record.phone_number && (
            <div className="text-gray-500 flex items-center gap-1.5">
              <PhoneOutlined className="text-gray-400 text-[11px]" />
              <span>{record.phone_number}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Rol Asignado',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const conf = roleTagConfig[role] || { color: 'default', label: role || 'Sin Rol' };
        return (
          <Tag color={conf.color} className="rounded-full px-2.5 py-0.5 font-semibold text-xs poppins">
            {conf.label}
          </Tag>
        );
      },
    },
    {
      title: 'Estado',
      dataIndex: 'is_deleted',
      key: 'is_deleted',
      render: (isDeleted) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            !isDeleted
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {!isDeleted ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          {!isDeleted ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
      render: (date) => (
        <span className="text-xs text-gray-500 poppins">
          {renderDateWithProse(date, { showIcon: false })}
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
            style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
            className="poppins-bold text-xs"
          >
            Editar Rol
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full p-4 md:p-8 space-y-6 poppins">
      {/* ========================================================================= */}
      {/* HEADER SECTION                                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-geoterra-orange poppins">
              Control de Accesos • Administración
            </span>
            <Tag className="rounded-full font-semibold text-[11px] bg-blue-50 text-geoterra-blue border-blue-200">
              {users.length} Cuentas Registradas
            </Tag>
          </div>
          <h1 className="text-2xl md:text-3xl poppins-bold text-geoterra-blue m-0 flex items-center gap-2.5">
            <UserOutlined className="text-geoterra-blue" /> Gestión de Usuarios y Roles
          </h1>
          <p className="text-xs md:text-sm text-gray-500 m-0 mt-1 poppins">
            Supervisión de cuentas de usuario, asignación de privilegios de acceso y control de investigadores de GeoterRA.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchUsers}
            loading={loading}
            className="poppins font-medium border-gray-300"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* METRICS DASHBOARD                                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div
          onClick={() => {
            setRoleFilter('ALL');
            setStatusFilter('ALL');
          }}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            roleFilter === 'ALL' && statusFilter === 'ALL'
              ? 'border-geoterra-blue shadow-md ring-2 ring-blue-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Usuarios</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-geoterra-blue flex items-center justify-center text-base">
              <UserOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-gray-900">{stats.total}</span>
            <span className="text-xs text-gray-400">cuentas</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">Registrados en la plataforma</div>
        </div>

        {/* Administracion */}
        <div
          onClick={() => setRoleFilter('ADMINS')}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            roleFilter === 'ADMINS'
              ? 'border-geoterra-blue shadow-md ring-2 ring-blue-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Admin & Mantenimiento
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-base">
              <SafetyCertificateOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-blue-900">{stats.adminCount}</span>
            <span className="text-xs text-blue-600">administradores</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium">Control total del sistema</div>
        </div>

        {/* Investigadores */}
        <div
          onClick={() => setRoleFilter('INVESTIGATORS')}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            roleFilter === 'INVESTIGATORS'
              ? 'border-amber-400 shadow-md ring-2 ring-amber-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Investigadores
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-base">
              <ExperimentOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-amber-900">{stats.investigatorCount}</span>
            <span className="text-xs text-amber-600">científicos</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium">Campo y laboratorio</div>
        </div>

        {/* Usuarios Generales */}
        <div
          onClick={() => setRoleFilter('user')}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            roleFilter === 'user'
              ? 'border-emerald-400 shadow-md ring-2 ring-emerald-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Usuarios Generales
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-base">
              <IdcardOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-emerald-900">{stats.generalUsers}</span>
            <span className="text-xs text-emerald-600">usuarios</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium">Consulta y solicitudes</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER & DATA TABLE CARD                                                  */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row gap-3 items-center">
            <Input
              placeholder="Buscar por nombre, correo o teléfono..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="w-full sm:max-w-md rounded-lg py-1.5"
            />

            <Select
              value={roleFilter}
              onChange={(val) => setRoleFilter(val)}
              className="w-full sm:w-52"
            >
              <Select.Option value="ALL">Todos los Roles</Select.Option>
              <Select.Option value="ADMINS">🛡️ Administradores & Mantenimiento</Select.Option>
              <Select.Option value="INVESTIGATORS">🧪 Investigadores (Campo/Lab)</Select.Option>
              <Select.Option value="admin">Administrador</Select.Option>
              <Select.Option value="maintenance">Mantenimiento</Select.Option>
              <Select.Option value="field_investigator">Investigador de Campo</Select.Option>
              <Select.Option value="investigator">Investigador</Select.Option>
              <Select.Option value="user">Usuario General</Select.Option>
            </Select>

            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              className="w-full sm:w-40"
            >
              <Select.Option value="ALL">Todos los Estados</Select.Option>
              <Select.Option value="active">🟢 Solo Activos</Select.Option>
              <Select.Option value="deleted">🔴 Inactivos</Select.Option>
            </Select>

            {(searchText || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <Button
                icon={<ClearOutlined />}
                onClick={() => {
                  setSearchText('');
                  setRoleFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="poppins text-xs text-gray-500"
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-400 poppins whitespace-nowrap self-end sm:self-center">
            Mostrando <strong className="text-gray-700">{filteredUsers.length}</strong> de{' '}
            <strong className="text-gray-700">{users.length}</strong> usuarios
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16">
            <Spin size="large" tip="Cargando usuarios..." />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Empty
              description={
                <span className="text-gray-500 text-sm poppins">
                  No se encontraron usuarios que coincidan con los filtros aplicados
                </span>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <Table
              columns={columns}
              dataSource={filteredUsers}
              rowKey={(r) => r.user_id || r.id}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                className: 'poppins py-2',
              }}
              className="poppins"
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER ROLE                                                     */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-xl text-geoterra-blue flex items-center gap-2">
              <EditOutlined className="text-geoterra-blue" />
              Editar Rol de Usuario
            </span>
          </div>
        }
        open={isModalVisible}
        onOk={handleSaveRole}
        onCancel={handleCancel}
        confirmLoading={isSaving}
        okText="Guardar Cambios"
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: '#12467E', borderColor: '#12467E' },
          className: 'poppins-bold',
        }}
        cancelButtonProps={{ className: 'poppins' }}
        centered
      >
        {editingUser && (
          <div className="py-2 space-y-4 poppins">
            {/* User Profile Card */}
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-geoterra-blue flex items-center justify-center font-bold text-lg border border-blue-200 flex-shrink-0">
                {(editingUser.first_name?.[0] || 'U').toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-base text-gray-900 m-0">
                  {editingUser.first_name} {editingUser.last_name}
                </p>
                <p className="text-xs text-gray-500 m-0">{editingUser.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-400 font-semibold uppercase">Rol actual:</span>
                  <Tag className="rounded text-[11px] m-0 font-semibold">
                    {(editingUser.role || '').toUpperCase()}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Select Role Section */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Nuevo Rol para el Usuario
              </label>
              <Select
                style={{ width: '100%' }}
                value={selectedRole}
                onChange={setSelectedRole}
                className="rounded-lg"
                options={[
                  { label: '🛡️ Administrador (admin)', value: 'admin' },
                  { label: '⚙️ Mantenimiento (maintenance)', value: 'maintenance' },
                  { label: '🧭 Investigador de Campo (field_investigator)', value: 'field_investigator' },
                  { label: '🧪 Investigador de Laboratorio (investigator)', value: 'investigator' },
                  { label: '👤 Usuario General (user)', value: 'user' },
                ]}
                placeholder="Seleccionar rol"
              />
              <p className="text-xs text-gray-400 m-0">
                El cambio de rol otorga o limita permisos inmediatamente al guardar.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;