import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tabs, Input, Button, Space, Tag, Empty, Spin, message } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import "../../../../colorModule.css";
import '../../../../fontsModule.css';
import { useSession } from '../../../../hooks/useSession';
import { analysisRequest } from '../../../../config/apiConf';

/**
 * DatabaseViewer Component
 * Shown to maintenance users via sidebar "Base de datos" option
 * Displays database tables with tabs for different data views
 * Read-only access to all tables
 */
const DatabaseViewer = () => {
  const { user: sessionUser, loading: sessionLoading } = useSession();
  
  // State Management
  const [activeTab, setActiveTab] = useState('requests');
  const [analysisRequests, setAnalysisRequests] = useState([]);
  const [regions, setRegions] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    requests: '',
    regions: '',
  });

  // Fetch Analysis Requests
  const fetchAnalysisRequests = async () => {
    setTableLoading(true);
    try {
      // API CALL
      const res = await fetch(analysisRequest.adminIndex(), {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to fetch requests');

      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setAnalysisRequests(data.data);
      }
    } catch (err) {
      console.error('Error fetching analysis requests:', err);
      message.error('Error al cargar solicitudes de análisis');
    } finally {
      setTableLoading(false);
    }
  };

  // Fetch Regions
  const fetchRegions = async () => {
    setTableLoading(true);
    try {
      // API CALL
      const res = await fetch('/API/public/regions', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to fetch regions');

      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setRegions(data.data);
      }
    } catch (err) {
      console.error('Error fetching regions:', err);
      message.error('Error al cargar regiones');
    } finally {
      setTableLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (sessionUser) {
      fetchAnalysisRequests();
      fetchRegions();
    }
  }, [sessionUser]);

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'requests') {
      fetchAnalysisRequests();
    } else if (key === 'regions') {
      fetchRegions();
    }
  };

  // Filter data based on search query
  const filteredRequests = analysisRequests.filter(req =>
    JSON.stringify(req).toLowerCase().includes(searchQuery.requests.toLowerCase())
  );

  const filteredRegions = regions.filter(reg =>
    JSON.stringify(reg).toLowerCase().includes(searchQuery.regions.toLowerCase())
  );

  // Analysis Requests Table Columns
  const requestsColumns = [
    {
      title: 'ID',
      dataIndex: 'id_soli',
      key: 'id_soli',
      width: 80,
      sorter: (a, b) => a.id_soli - b.id_soli,
    },
    {
      title: 'Usuario',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 100,
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Estado',
      dataIndex: 'state',
      key: 'state',
      width: 120,
      render: (state) => {
        let color = 'default';
        if (state === 'Pendiente') color = 'blue';
        else if (state === 'Analizada') color = 'green';
        else if (state === 'Eliminada') color = 'red';
        return <Tag color={color}>{state}</Tag>;
      },
    },
    {
      title: 'Temperatura (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
      width: 120,
      render: (temp) => temp ? `${temp}°C` : '-',
    },
    {
      title: 'pH',
      dataIndex: 'field_pH',
      key: 'field_pH',
      width: 80,
      render: (ph) => ph ? ph.toFixed(2) : '-',
    },
    {
      title: 'Conductividad',
      dataIndex: 'conductivity',
      key: 'conductivity',
      width: 120,
      render: (cond) => cond ? `${cond} µS/cm` : '-',
    },
    {
      title: 'Fecha Creada',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
  ];

  // Regions Table Columns
  const regionsColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Latitud',
      dataIndex: 'latitude',
      key: 'latitude',
      width: 120,
      render: (lat) => lat ? lat.toFixed(6) : '-',
    },
    {
      title: 'Longitud',
      dataIndex: 'longitude',
      key: 'longitude',
      width: 120,
      render: (lng) => lng ? lng.toFixed(6) : '-',
    },
    {
      title: 'Creada el',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => date ? new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }) : '-',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
  ];

  if (sessionLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Cargando..." />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'requests',
      label: '📋 Solicitudes de Análisis',
      children: (
        <div className="w-full">
          <Card className="mb-4">
            <Space className="w-full justify-between" wrap>
              <Input.Search
                placeholder="Buscar en solicitudes..."
                prefix={<SearchOutlined />}
                style={{ maxWidth: 300 }}
                value={searchQuery.requests}
                onChange={(e) => setSearchQuery({ ...searchQuery, requests: e.target.value })}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAnalysisRequests}
                disabled={tableLoading}
              >
                Actualizar
              </Button>
            </Space>
          </Card>

          <Table
            columns={requestsColumns}
            dataSource={filteredRequests.map((req, idx) => ({ ...req, key: idx }))}
            loading={tableLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} solicitudes`,
            }}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: <Empty description="No hay solicitudes" />,
            }}
          />
        </div>
      ),
    },
    {
      key: 'regions',
      label: '🗺️ Regiones',
      children: (
        <div className="w-full">
          <Card className="mb-4">
            <Space className="w-full justify-between" wrap>
              <Input.Search
                placeholder="Buscar en regiones..."
                prefix={<SearchOutlined />}
                style={{ maxWidth: 300 }}
                value={searchQuery.regions}
                onChange={(e) => setSearchQuery({ ...searchQuery, regions: e.target.value })}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchRegions}
                disabled={tableLoading}
              >
                Actualizar
              </Button>
            </Space>
          </Card>

          <Table
            columns={regionsColumns}
            dataSource={filteredRegions.map((reg, idx) => ({ ...reg, key: idx }))}
            loading={tableLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total: ${total} regiones`,
            }}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: <Empty description="No hay regiones" />,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Base de Datos</h1>
        <p className="text-gray-600">Visualiza y gestiona los datos de la base de datos (solo lectura)</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        size="large"
      />
    </div>
  );
};

export default DatabaseViewer;
