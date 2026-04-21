import React, { useState, useEffect } from 'react';
import { maintenanceAllUsers } from '../../../../config/apiConf';
import { usePermissions } from '../../../../hooks/usePermissions';
import { Table, Card, Spin, Tag, message, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const UserManagement = () => {
  const { hasPermission, PERMISSIONS } = usePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

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
          <Button type="primary" size="small">Editar</Button>
          <Button danger size="small">Eliminar</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestionar Usuarios</h1>
        <p className="text-gray-500">Administra todos los usuarios del sistema</p>
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
    </div>
  );
};

export default UserManagement;