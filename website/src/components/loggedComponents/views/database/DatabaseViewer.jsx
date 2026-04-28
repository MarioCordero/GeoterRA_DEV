import React, { useState, useEffect } from 'react';
import { Card, Tabs, Input, Button, Space, Table, Empty, Spin, message } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import "../../../../colorModule.css";
import '../../../../fontsModule.css';
import { useSession } from '../../../../hooks/useSession';
import { maintenanceAllTables } from '../../../../config/apiConf';

/**
 * DatabaseViewer Component
 * Dynamically displays all database tables
 * Maintenance role only - read-only access
 */
const DatabaseViewer = () => {
  const { user: sessionUser, loading: sessionLoading } = useSession();
  
  // State Management
  const [tables, setTables] = useState({});
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQueries, setSearchQueries] = useState({});

  // Fetch all database tables
  const fetchAllTables = async () => {
    setLoading(true);
    try {
      // API CALL
      const result = await maintenanceAllTables();

      if (!result.ok) throw new Error(result.error || 'Failed to fetch database tables');

      setTables(result.data || {});
      
      // Set first table as active tab
      const tableNames = Object.keys(result.data || {});
      if (tableNames.length > 0) {
        setActiveTab(tableNames[0]);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
      message.error('Error al cargar las tablas de la base de datos');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (sessionUser) {
      fetchAllTables();
    }
  }, [sessionUser]);

  // Generate columns dynamically based on table structure
  const generateColumns = (tableName) => {
    const table = tables[tableName];
    if (!table || !table.columns || table.columns.length === 0) {
      return [];
    }

    return table.columns.map((col) => ({
      title: col.Field,
      dataIndex: col.Field,
      key: col.Field,
      width: 150,
      render: (value) => {
        if (value === null) return '-';
        if (typeof value === 'object') return JSON.stringify(value);
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        return String(value);
      },
      sorter: (a, b) => {
        const aVal = a[col.Field] || '';
        const bVal = b[col.Field] || '';
        if (typeof aVal === 'string') return aVal.localeCompare(bVal);
        return aVal - bVal;
      },
      ellipsis: true,
    }));
  };

  // Filter table data based on search query
  const getFilteredData = (tableName) => {
    const table = tables[tableName];
    if (!table || !table.data) return [];

    const searchQuery = searchQueries[tableName] || '';
    if (!searchQuery) return table.data;

    return table.data.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (sessionLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Cargando..." />
      </div>
    );
  }

  // Generate tab items dynamically
  const tabItems = Object.keys(tables).map((tableName) => {
    const table = tables[tableName];
    const filteredData = getFilteredData(tableName);

    return {
      key: tableName,
      label: `${table.displayName} (${table.count})`,
      children: (
        <div className="w-full">
          <Card className="mb-4">
            <Space className="w-full justify-between" wrap>
              <Input.Search
                placeholder={`Buscar en ${table.displayName}...`}
                prefix={<SearchOutlined />}
                style={{ maxWidth: 300 }}
                value={searchQueries[tableName] || ''}
                onChange={(e) =>
                  setSearchQueries({
                    ...searchQueries,
                    [tableName]: e.target.value,
                  })
                }
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAllTables}
                disabled={loading}
              >
                Actualizar
              </Button>
            </Space>
          </Card>

          <Table
            columns={generateColumns(tableName)}
            dataSource={filteredData.map((row, idx) => ({
              ...row,
              key: idx,
            }))}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} registros`,
              pageSizeOptions: ['5', '10', '20', '50'],
            }}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: <Empty description={`No hay registros en ${table.displayName}`} />,
            }}
            bordered
          />
        </div>
      ),
    };
  });

  return (
    <div className="w-full min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Base de Datos</h1>
        <p className="text-gray-600">
          Visualiza todos los datos de la base de datos (solo lectura)
        </p>

        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>¿Para qué sirve este panel?</strong>
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ Visualizar todas las tablas de la base de datos en una interfaz unificada</li>
            <li>✓ Acceder a datos completos de cada tabla con navegación sencilla</li>
            <li>✓ Buscar registros específicos dentro de cualquier tabla</li>
            <li>✓ Ordenar los datos por diferentes columnas</li>
            <li>✓ Ver el número total de registros de cada tabla</li>
            <li>✓ Paginar resultados para una mejor visualización</li>
            <li>✓ Acceso de solo lectura para proteger la integridad de los datos</li>
            <li>✓ Refrescar datos en tiempo real</li>
          </ul>
        </div>
      </div>

      <Spin spinning={loading}>
        {Object.keys(tables).length === 0 ? (
          <Card>
            <Empty description="No hay tablas disponibles" />
          </Card>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />
        )}
      </Spin>
    </div>
  );
};

export default DatabaseViewer;
