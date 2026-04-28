import React, { useState, useEffect } from 'react';
import { maintenanceAllUsers, maintenanceUpdateUserRole } from '../../../../config/apiConf';
import { usePermissions } from '../../../../hooks/usePermissions';
import { Table, Card, Spin, Tag, message, Button, Space, Modal, Select } from 'antd';
import { ReloadOutlined, EditOutlined } from '@ant-design/icons';

const UserManagement = () => {
  const { hasPermission, PERMISSIONS } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // API CALL
      const result = await maintenanceAllUsers();

      if (!result.ok) {
        throw new Error(result.error || 'Error fetching users');
      }

      setUsers(result.data || []);
      setTotal(result.data?.length || 0);
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
      message.warning('Please select a new role');
      return;
    }

    if (selectedRole === editingUser.role) {
      message.info('Role is the same as the current role');
      setIsModalVisible(false);
      return;
    }

    setIsSaving(true);
    try {
      const result = await maintenanceUpdateUserRole(editingUser.user_id, {
        role: selectedRole,
      });

      if (!result.ok) {
        throw new Error(result.error || 'Error updating user role');
      }

      // Update user in the list
      const updatedUsers = users.map((user) =>
        user.user_id === editingUser.user_id ? { ...user, role: selectedRole } : user
      );
      setUsers(updatedUsers);

      message.success(`User role updated to ${selectedRole}`);
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

  if (!hasPermission(PERMISSIONS.MANAGE_USERS)) {
    return (
      <div className="p-6 text-center text-red-500">
        <h1>Acceso Denegado</h1>
        <p>No tienes permiso para acceder a esta sección</p>
      </div>
    );
  }

  const columns = [
    {
      title: 'Nombre',
      key: 'fullName',
      render: (_, record) => `${record.first_name} ${record.last_name}`,
      sorter: (a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone_number',
      key: 'phone_number',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colors = {
          admin: 'blue',
          maintenance: 'green',
          user: 'default',
        };
        return <Tag color={colors[role] || 'default'}>{role.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Maintenance', value: 'maintenance' },
        { text: 'User', value: 'user' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Estado',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '✅ Activo' : '❌ Inactivo'}
        </Tag>
      ),
      filters: [
        { text: 'Activo', value: 1 },
        { text: 'Inactivo', value: 0 },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
          >
            Editar Rol
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestionar Usuarios</h1>
        <p className="text-gray-500">Administra todos los usuarios del sistema</p>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>¿Qué puedes hacer aquí?</strong>
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ Ver la lista completa de usuarios del sistema</li>
            <li>✓ Consultar detalles de cada usuario (nombre, email, teléfono, rol, estado)</li>
            <li>✓ Editar el rol de los usuarios (Admin, Maintenance, User)</li>
            <li>✓ Filtrar usuarios por rol o estado (Activo/Inactivo)</li>
            <li>✓ Ordenar la tabla por diferentes columnas</li>
            <li>✓ Ver la fecha de registro de cada usuario</li>
            <li>✓ Actualizar la lista de usuarios</li>
          </ul>
        </div>
      </div>

      <Card
        title={
          <div className="flex items-center justify-between">
            <span>Lista de Usuarios ({total})</span>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchUsers}
              loading={loading}
            >
              Actualizar
            </Button>
          </div>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="user_id"
            pagination={{
              pageSize: 10,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['5', '10', '20', '50'],
            }}
            bordered
            striped
          />
        </Spin>
      </Card>

      {/* Edit Role Modal */}
      <Modal
        title="Editar Rol de Usuario"
        open={isModalVisible}
        onOk={handleSaveRole}
        onCancel={handleCancel}
        confirmLoading={isSaving}
        okText="Guardar"
        cancelText="Cancelar"
      >
        {editingUser && (
          <div className="space-y-4">
            <div>
              <p className="font-semibold">
                {editingUser.first_name} {editingUser.last_name}
              </p>
              <p className="text-gray-500 text-sm">{editingUser.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nuevo Rol</label>
              <Select
                style={{ width: '100%' }}
                value={selectedRole}
                onChange={setSelectedRole}
                options={[
                  { label: 'Admin', value: 'admin' },
                  { label: 'Maintenance', value: 'maintenance' },
                  { label: 'User', value: 'user' },
                ]}
                placeholder="Seleccionar rol"
              />
            </div>
            <div className="bg-blue-50 p-3 rounded text-sm">
              <p className="font-semibold mb-1">Rol actual:</p>
              <p>{editingUser.role.toUpperCase()}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;