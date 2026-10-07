import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Table,
  Empty,
  Spin,
  message,
  Tag,
  Tooltip,
  Modal
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  TableOutlined,
  CheckCircleOutlined,
  HddOutlined
} from '@ant-design/icons';
import '../../../../colorModule.css';
import '../../../../fontsModule.css';
import { useSession } from '../../../../hooks/useSession';
import { maintenanceAllTables } from '../../../../config/apiConf';

/**
 * DatabaseViewer Component
 * Redesigned to executive dashboard standards
 * Maintenance and Admin roles - safe read-only access
 */
const DatabaseViewer = () => {
  const { user: sessionUser, loading: sessionLoading } = useSession();

  // State Management
  const [tables, setTables] = useState({});
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQueries, setSearchQueries] = useState({});
  const [guideModalVisible, setGuideModalVisible] = useState(false);

  // Fetch all database tables
  const fetchAllTables = async () => {
    setLoading(true);
    try {
      const result = await maintenanceAllTables();
      if (!result.ok) throw new Error(result.error || 'Failed to fetch database tables');

      const data = result.data || {};
      setTables(data);

      const tableNames = Object.keys(data);
      if (tableNames.length > 0 && (!activeTab || !data[activeTab])) {
        setActiveTab(tableNames[0]);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
      message.error('Error al cargar las tablas de la base de datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionUser) {
      fetchAllTables();
    }
  }, [sessionUser]);

  // Total system records calculation
  const totalRecordsCount = useMemo(() => {
    return Object.values(tables).reduce((acc, t) => acc + (Number(t?.count) || 0), 0);
  }, [tables]);

  // Generate columns dynamically based on table structure
  const generateColumns = (tableName) => {
    const table = tables[tableName];
    if (!table || !table.columns || table.columns.length === 0) {
      return [];
    }

    return table.columns.map((col) => ({
      title: (
        <span className="font-semibold text-gray-700 font-mono text-xs">
          {col.Field}
        </span>
      ),
      dataIndex: col.Field,
      key: col.Field,
      width: 170,
      render: (value) => {
        if (value === null || value === undefined) {
          return <span className="text-gray-300 italic text-xs">NULL</span>;
        }
        if (typeof value === 'object') {
          return (
            <span className="font-mono text-xs bg-gray-50 p-1 rounded border border-gray-200">
              {JSON.stringify(value)}
            </span>
          );
        }
        if (typeof value === 'boolean') {
          return (
            <Tag color={value ? 'success' : 'default'} className="rounded text-xs">
              {value ? 'True' : 'False'}
            </Tag>
          );
        }
        // If it looks like a ULID/UUID
        const strVal = String(value);
        if (strVal.length >= 26 && /^[0-9A-Z_]+$/i.test(strVal)) {
          return (
            <span className="font-mono text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
              {strVal}
            </span>
          );
        }
        return <span className="text-sm text-gray-800">{strVal}</span>;
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
        <Spin size="large" tip="Cargando estructura..." />
      </div>
    );
  }

  const currentTable = tables[activeTab];
  const currentFilteredData = activeTab ? getFilteredData(activeTab) : [];

  return (
    <div className="w-full p-4 md:p-8 space-y-6 poppins">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-geoterra-orange poppins">
              INFRAESTRUCTURA • AUDITORÍA Y LECTURA
            </span>
            <Tag color="cyan" className="m-0 text-[11px] font-semibold">
              Solo Lectura
            </Tag>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-geoterra-blue m-0 poppins">
            Explorador de Base de Datos
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-0 max-w-2xl">
            Visualización unificada y auditoría en tiempo real de todas las entidades y tablas relacionales del sistema.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => setGuideModalVisible(true)}
            className="poppins font-medium border-gray-300"
          >
            Guía de Auditoría
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAllTables}
            disabled={loading}
            className="poppins font-medium border-gray-300"
          >
            Actualizar Tablas
          </Button>
        </div>
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Tablas */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tablas Activas
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12467E] flex items-center justify-center text-lg">
              <TableOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loading ? '...' : Object.keys(tables).length}
            </span>
            <span className="text-xs text-gray-500 font-medium">Entidades</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Esquema relacional MySQL
          </div>
        </div>

        {/* KPI 2: Total Registros Globales */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Registros Globales
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg">
              <HddOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loading ? '...' : totalRecordsCount.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 font-medium">Filas</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Sincronizado en tiempo real
          </div>
        </div>

        {/* KPI 3: Tabla Seleccionada */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tabla Seleccionada
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg">
              <DatabaseOutlined />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-gray-800 poppins truncate block">
              {currentTable?.displayName || activeTab || 'Ninguna'}
            </span>
            <p className="text-xs text-gray-500 m-0 mt-1 font-medium">
              {currentTable ? `${currentTable.count} registros almacenados` : 'Selecciona una tabla'}
            </p>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium flex items-center gap-1">
            <span className="font-mono text-[11px] bg-amber-100/60 px-1.5 py-0.5 rounded text-amber-900">
              {activeTab || 'N/A'}
            </span>
          </div>
        </div>

        {/* KPI 4: Nivel de Seguridad */}
        <div className="bg-gradient-to-br from-slate-900 to-[#12467E] p-5 rounded-2xl border border-gray-800 text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Acceso Seguro
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center text-lg">
              <SafetyCertificateOutlined />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold poppins text-white">Read-Only</span>
            <p className="text-xs text-blue-200 m-0 mt-0.5 font-normal">
              Integridad de base de datos blindada
            </p>
          </div>
          <div className="mt-3 text-[11px] text-emerald-300 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Sin mutaciones directas
          </div>
        </div>
      </div>

      {/* Main Content Card: Dynamic Tabs & Search & Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        {/* Table Selector Pills */}
        <div className="border-b border-gray-100 pb-4">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-3">
            Selecciona la Entidad para Inspeccionar:
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.keys(tables).map((tableName) => {
              const table = tables[tableName];
              const isSelected = activeTab === tableName;
              return (
                <button
                  key={tableName}
                  onClick={() => setActiveTab(tableName)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#12467E] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <DatabaseOutlined className={isSelected ? 'text-blue-200' : 'text-gray-400'} />
                  <span>{table.displayName || tableName}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {table.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Table Content */}
        {activeTab && currentTable ? (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="w-full md:w-96">
                <Input
                  prefix={<SearchOutlined className="text-gray-400" />}
                  placeholder={`Buscar registros en ${currentTable.displayName}...`}
                  value={searchQueries[activeTab] || ''}
                  onChange={(e) =>
                    setSearchQueries({
                      ...searchQueries,
                      [activeTab]: e.target.value,
                    })
                  }
                  allowClear
                  className="rounded-lg py-2"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium">
                  Mostrando {currentFilteredData.length} de {currentTable.count} registros
                </span>
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={fetchAllTables}
                  loading={loading}
                >
                  Refrescar
                </Button>
              </div>
            </div>

            <Table
              columns={generateColumns(activeTab)}
              dataSource={currentFilteredData.map((row, idx) => ({
                ...row,
                key: idx,
              }))}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total: ${total} filas`,
                pageSizeOptions: ['10', '25', '50', '100'],
              }}
              scroll={{ x: 1200 }}
              locale={{
                emptyText: <Empty description={`No se encontraron registros en ${currentTable.displayName}`} />,
              }}
              className="poppins border border-gray-100 rounded-xl overflow-hidden"
            />
          </div>
        ) : (
          <Card className="text-center py-12">
            <Empty description="No hay tablas disponibles en la base de datos" />
          </Card>
        )}
      </div>

      {/* Guide / Documentation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-geoterra-blue font-bold text-lg">
            <SafetyCertificateOutlined />
            <span>Guía de Auditoría de Base de Datos GeoterRA</span>
          </div>
        }
        open={guideModalVisible}
        onCancel={() => setGuideModalVisible(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setGuideModalVisible(false)}
            style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
            className="poppins-bold"
          >
            Entendido
          </Button>,
        ]}
        width={600}
      >
        <div className="space-y-4 py-3">
          <p className="text-gray-600 text-sm">
            Este panel proporciona a los administradores e ingenieros de mantenimiento una ventana
            de auditoría transparente y segura a la base de datos relacional de GeoterRA.
          </p>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2">
            <h4 className="font-bold text-[#12467E] text-sm mb-1">Capacidades del Módulo:</h4>
            <ul className="text-xs text-gray-700 space-y-1.5 list-disc pl-4">
              <li><strong>Inspección Unificada:</strong> Navegación fluida por todas las tablas registradas en el sistema.</li>
              <li><strong>Búsqueda en Tiempo Real:</strong> Filtro textual dinámico en cualquier campo o columna visible.</li>
              <li><strong>Ordenamiento por Columnas:</strong> Haz clic en el encabezado de cualquier columna para ordenar ascendentemente o descendentemente.</li>
              <li><strong>Integridad Blindada:</strong> Acceso estrictamente de solo lectura (SELECT), protegiendo la base de datos contra alteraciones accidentales.</li>
            </ul>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <InfoCircleOutlined className="mt-0.5 text-sm" />
            <span>
              Para modificaciones estructurales de datos o corrección de información, utiliza los módulos de gestión específicos (Territorio, Usuarios, Geociencias).
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DatabaseViewer;
