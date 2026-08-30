import React, { useState, useEffect } from 'react';
import { maintenanceAllUsers, userAdminUpdateRole } from '../../../../config/apiConf';
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
      const result = await userAdminUpdateRole(editingUser.user_id, {
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
          field_investigator: 'orange',
          investigator: 'purple',
          user: 'default',
        };
        return <Tag color={colors[role] || 'default'}>{(role || '').toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Maintenance', value: 'maintenance' },
        { text: 'Investigador de Campo', value: 'field_investigator' },
        { text: 'Investigador', value: 'investigator' },
        { text: 'Usuario', value: 'user' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Estado',
      dataIndex: 'is_deleted',
      key: 'is_deleted',
      render: (isDeleted) => (
        <Tag color={!isDeleted ? 'green' : 'red'}>
          {!isDeleted ? '✅ Activo' : '❌ Eliminado'}
        </Tag>
      ),
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) : 'N/A',
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
        <p className="text-gray-500">Administra todos los usuarios del sistema y sus roles</p>
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
            rowKey={(r) => r.user_id || r.id}
            pagination={{
              pageSize: 10,
              total: total,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['5', '10', '20', '50'],
            }}
            bordered
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
                  { label: 'Administrador (admin)', value: 'admin' },
                  { label: 'Mantenimiento (maintenance)', value: 'maintenance' },
                  { label: 'Investigador de Campo (field_investigator)', value: 'field_investigator' },
                  { label: 'Investigador (investigator)', value: 'investigator' },
                  { label: 'Usuario (user)', value: 'user' },
                ]}
                placeholder="Seleccionar rol"
              />
            </div>
            <div className="bg-blue-50 p-3 rounded text-sm">
              <p className="font-semibold mb-1">Rol actual:</p>
              <p>{(editingUser.role || '').toUpperCase()}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;