import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Button, Modal, Form, Input, InputNumber, Select, Table, message, Space, Spin, Tabs, Switch, Popconfirm } from 'antd';
import { EnvironmentOutlined, PlusOutlined, ReloadOutlined, EyeOutlined, EyeInvisibleOutlined, CheckCircleOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import MapCoordinatePicker from '../../../common/MapCoordinatePicker';
import {
  geomanifestationsIndex,
  geomanifestationsAdminIndex,
  geomanifestationsAdminShow,
  geomanifestationsAdminStore,
  geomanifestationsAdminUpdate,
  geomanifestationsAdminDelete,
  geomanifestationsAdminSetVisibility,
  provincesIndex,
  cantonsIndex,
  districtsIndex
} from '../../../../config/apiConf';

const { Title, Paragraph, Text } = Typography;

const extractList = (resData) => {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData.data)) return resData.data;
  if (Array.isArray(resData.data?.data)) return resData.data.data;
  if (Array.isArray(resData.items)) return resData.items;
  return [];
};

const GeomanifeStationsManager = () => {
  const [manifestations, setManifestations] = useState([]);
  const [acceptedRequestsManifestations, setAcceptedRequestsManifestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');

  // Search & Filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Manual point & Edit modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = create, object = edit
  const [form] = Form.useForm();
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [cantons, setCantons] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Normalize backend record
  const normalizeItem = (item, provincesList = provinces) => {
    const id = item.geomanifestation_id || item.id;
    const name = item.geomanifestation_name || item.name || `Geomanifestación ${id}`;
    const lat = item.location?.latitude ?? item.latitude;
    const lng = item.location?.longitude ?? item.longitude;
    const vis = item.visibility;
    const isVisible = vis === true || vis === 1 || vis === '1';

    let provName = item.location?.province || item.province;
    if (!provName && item.province_snit_code) {
      const foundProv = provincesList.find(p => p.province_snit_code == item.province_snit_code || p.province_id == item.province_snit_code);
      if (foundProv) provName = foundProv.province_name;
    }

    const cantonName = item.location?.canton || item.canton || (item.canton_snit_code ? `Cantón ${item.canton_snit_code}` : '');
    const districtName = item.location?.district || item.district || (item.district_snit_code ? `Distrito ${item.district_snit_code}` : '');

    const parts = [provName, cantonName, districtName].filter(Boolean);
    const locationText = parts.length > 0 ? parts.join(', ') : 'Costa Rica';

    return {
      ...item,
      id,
      geomanifestation_id: id,
      name,
      geomanifestation_name: name,
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
      locationText,
      isVisible,
      visibility: isVisible ? 1 : 0,
      hasRequestId: Boolean(item.request_id && String(item.request_id).trim() !== ''),
    };
  };

  // Load provinces for form select
  const loadProvinces = async () => {
    try {
      const res = await provincesIndex();
      if (res.ok && Array.isArray(res.data)) {
        setProvinces(res.data);
        return res.data;
      }
    } catch (err) {
      console.error('❌ Error loading provinces:', err);
    }
    return [];
  };

  // Load geomanifestations
  const loadManifestations = async (currentProvinces = provinces) => {
    try {
      setLoading(true);
      
      // Fetch with limit=1000 to ensure all records are returned without page truncation
      let res = await geomanifestationsAdminIndex({ limit: 1000 });
      if (!res.ok) {
        res = await geomanifestationsIndex({ limit: 1000 });
      }

      if (res.ok && res.data) {
        const rawList = extractList(res.data);
        const normalizedList = rawList.map(item => normalizeItem(item, currentProvinces));

        const acceptedDrafts = normalizedList.filter(item => !item.isVisible || item.hasRequestId);

        setManifestations(normalizedList);
        setAcceptedRequestsManifestations(acceptedDrafts);
      } else {
        setManifestations([]);
        setAcceptedRequestsManifestations([]);
      }
    } catch (err) {
      console.error('❌ Error loading geomanifestations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load cantons on province select
  const handleProvinceChange = async (provCode) => {
    form.setFieldsValue({ canton_snit_code: undefined, district_snit_code: undefined });
    setCantons([]);
    setDistricts([]);
    if (!provCode) return;
    try {
      const res = await cantonsIndex(provCode);
      if (res.ok && Array.isArray(res.data)) {
        setCantons(res.data);
      }
    } catch (err) {
      console.error('❌ Error loading cantons:', err);
    }
  };

  // Load districts on canton select
  const handleCantonChange = async (cantonCode) => {
    form.setFieldsValue({ district_snit_code: undefined });
    setDistricts([]);
    if (!cantonCode) return;
    try {
      const res = await districtsIndex(cantonCode);
      if (res.ok && Array.isArray(res.data)) {
        setDistricts(res.data);
      }
    } catch (err) {
      console.error('❌ Error loading districts:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      const provs = await loadProvinces();
      await loadManifestations(provs);
    };
    initData();
  }, []);

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingItem(null);
    setSelectedCoordinates(null);
    form.resetFields();
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setSelectedCoordinates(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleOpenEdit = (record) => {
    setEditingItem(record);
    const lat = record.latitude;
    const lng = record.longitude;
    if (lat && lng) {
      setSelectedCoordinates({ lat: parseFloat(lat), lng: parseFloat(lng) });
    } else {
      setSelectedCoordinates(null);
    }

    const provCode = record.location?.province_snit_code ?? record.province_snit_code;
    const cantonCode = record.location?.canton_snit_code ?? record.canton_snit_code;
    const distCode = record.location?.district_snit_code ?? record.district_snit_code;

    if (provCode) handleProvinceChange(provCode);
    if (cantonCode) handleCantonChange(cantonCode);

    form.setFieldsValue({
      name: record.name || record.geomanifestation_name,
      description: record.description,
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lng ? parseFloat(lng) : undefined,
      province_snit_code: provCode,
      canton_snit_code: cantonCode,
      district_snit_code: distCode,
      visibility: record.isVisible,
    });

    setModalVisible(true);
  };

  const handleToggleVisibility = async (record, currentVal) => {
    const id = record.geomanifestation_id || record.id;
    const newVisibility = !currentVal;
    try {
      const res = await geomanifestationsAdminSetVisibility(id, { visibility: newVisibility });
      if (res.ok) {
        message.success(`Visibilidad ${newVisibility ? 'pública' : 'oculta'} actualizada`);
        loadManifestations();
      } else {
        message.error(res.error || 'Error al cambiar la visibilidad');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  const handleDelete = async (record) => {
    const id = record.geomanifestation_id || record.id;
    try {
      const res = await geomanifestationsAdminDelete(id);
      if (res.ok) {
        message.success('Geomanifestación eliminada permanentemente');
        loadManifestations();
      } else {
        message.error(res.error || 'Error al eliminar');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  const handleShowDetail = async (record) => {
    const id = record.geomanifestation_id || record.id;
    setDetailModalVisible(true);
    setLoadingDetail(true);
    try {
      const res = await geomanifestationsAdminShow(id);
      if (res.ok && res.data) {
        setDetailData(res.data.data || res.data);
      } else {
        setDetailData(record);
      }
    } catch {
      setDetailData(record);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const lat = selectedCoordinates ? selectedCoordinates.lat : values.latitude;
      const lng = selectedCoordinates ? selectedCoordinates.lng : values.longitude;

      if (!lat || !lng) {
        message.error('Por favor selecciona las coordenadas en el mapa o ingrésalas');
        return;
      }

      setSubmitting(true);

      const payload = {
        name: values.name,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        province_snit_code: values.province_snit_code || null,
        canton_snit_code: values.canton_snit_code || null,
        district_snit_code: values.district_snit_code || null,
        description: values.description || null,
        visibility: values.visibility !== undefined ? values.visibility : false,
      };

      let result;
      if (editingItem) {
        const id = editingItem.geomanifestation_id || editingItem.id;
        result = await geomanifestationsAdminUpdate(id, payload);
      } else {
        result = await geomanifestationsAdminStore(payload);
      }

      if (!result.ok) {
        throw new Error(result.error || 'Error al guardar la geomanifestación');
      }

      message.success(`📍 Geomanifestación ${editingItem ? 'actualizada' : 'registrada'} correctamente`);
      handleModalClose();
      loadManifestations();
    } catch (err) {
      console.error('❌ Error submitting:', err);
      message.error(err.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredManifestations = manifestations.filter(item => {
    const matchesSearch = !searchText ||
      (item.name && item.name.toLowerCase().includes(searchText.toLowerCase())) ||
      (item.geomanifestation_id && item.geomanifestation_id.toLowerCase().includes(searchText.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchText.toLowerCase()));

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'public' && item.isVisible) ||
      (statusFilter === 'hidden' && !item.isVisible);

    return matchesSearch && matchesStatus;
  });

  const columnsActive = [
    {
      title: 'Nombre / ID',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <span className="font-semibold text-gray-800 block">
            {text || record.geomanifestation_name || `Punto ${record.geomanifestation_id || record.id}`}
          </span>
          <Text type="secondary" style={{ fontSize: '11px' }} className="font-mono">
            ID: {record.geomanifestation_id || record.id}
          </Text>
        </div>
      ),
    },
    {
      title: 'Ubicación',
      dataIndex: 'locationText',
      key: 'locationText',
      render: (text) => text || 'Costa Rica',
    },
    {
      title: 'Coordenadas GPS',
      key: 'coords',
      render: (_, record) => {
        const lat = record.latitude;
        const lng = record.longitude;
        return lat && lng ? (
          <span className="font-mono text-xs text-gray-600">
            {parseFloat(lat).toFixed(4)}°, {parseFloat(lng).toFixed(4)}°
          </span>
        ) : 'N/A';
      },
    },
    {
      title: 'Temperatura (°C)',
      key: 'temp',
      render: (_, record) => {
        const temp = record.insitu_test?.temperature ?? record.temperature;
        return temp !== undefined && temp !== null ? (
          <Tag color={temp > 50 ? 'red' : temp > 30 ? 'orange' : 'blue'}>
            {temp}°C
          </Tag>
        ) : <span className="text-gray-400">Sin datos</span>;
      },
    },
    {
      title: 'Visibilidad',
      dataIndex: 'isVisible',
      key: 'visibility',
      render: (isVisible, record) => (
        <Space>
          {isVisible ? <Tag icon={<EyeOutlined />} color="success">Pública</Tag> : <Tag icon={<EyeInvisibleOutlined />} color="default">Oculta / Borrador</Tag>}
          <Switch
            size="small"
            checked={isVisible}
            onChange={() => handleToggleVisibility(record, isVisible)}
          />
        </Space>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<InfoCircleOutlined />} size="small" onClick={() => handleShowDetail(record)} title="Ver Detalles" />
          <Button icon={<EditOutlined />} size="small" type="primary" onClick={() => handleOpenEdit(record)} title="Editar" />
          <Popconfirm title="¿Eliminar geomanifestación?" onConfirm={() => handleDelete(record)} okText="Sí" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger title="Eliminar" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columnsAcceptedRequests = [
    {
      title: 'Nombre de Geomanifestación',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <span className="font-semibold text-gray-800 block">
            {text || record.geomanifestation_name || `Geomanifestación-${record.geomanifestation_id || record.id}`}
          </span>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {record.hasRequestId ? `Solicitud: ${record.request_id}` : 'Borrador sin publicar'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Ubicación',
      dataIndex: 'locationText',
      key: 'locationText',
      render: (text) => text || 'Costa Rica',
    },
    {
      title: 'Coordenadas GPS',
      key: 'coords',
      render: (_, record) => {
        const lat = record.latitude;
        const lng = record.longitude;
        return lat && lng ? (
          <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
            Lat: {parseFloat(lat).toFixed(4)}° | Lng: {parseFloat(lng).toFixed(4)}°
          </span>
        ) : 'Sin coordenadas';
      },
    },
    {
      title: 'Estado del Estudio',
      key: 'study_status',
      render: (_, record) => {
        const hasInsitu = Boolean(record.insitu_test || record.temperature);
        const hasInlab = Boolean(record.inlab_test || record.cl);

        if (hasInsitu && hasInlab) {
          return <Tag color="green">Estudio Completo</Tag>;
        } else if (hasInsitu) {
          return <Tag color="gold">Estudio In-Situ Registrado</Tag>;
        } else {
          return <Tag color="cyan">Borrador / Pendiente de Mediciones</Tag>;
        }
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<InfoCircleOutlined />} size="small" onClick={() => handleShowDetail(record)} title="Ver Detalles" />
          <Button icon={<EditOutlined />} size="small" type="primary" onClick={() => handleOpenEdit(record)} title="Editar" />
          <Popconfirm title="¿Eliminar borrador?" onConfirm={() => handleDelete(record)} okText="Sí" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger title="Eliminar" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <EnvironmentOutlined />
          Todas las Geomanifestaciones ({manifestations.length})
        </span>
      ),
      children: (
        <div>
          {/* Controls bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <Space flexWrap style={{ gap: 12 }}>
              <Input
                placeholder="Buscar por nombre, ID o descripción..."
                prefix={<SearchOutlined style={{ color: '#aaa' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280 }}
                allowClear
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 180 }}
              >
                <Select.Option value="all">Todos los estados</Select.Option>
                <Select.Option value="public">Solo Públicas</Select.Option>
                <Select.Option value="hidden">Solo Ocultas / Borradores</Select.Option>
              </Select>
            </Space>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ backgroundColor: '#1890ff' }}
            >
              Agregar Punto Manualmente
            </Button>
          </div>

          <Table
            dataSource={filteredManifestations}
            columns={columnsActive}
            rowKey={(item) => item.geomanifestation_id || item.id}
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
            locale={{ emptyText: 'No hay geomanifestaciones registradas' }}
          />
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <CheckCircleOutlined />
          Solicitudes Aceptadas / Borradores ({acceptedRequestsManifestations.length})
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              Geomanifestaciones creadas en borrador u originadas de solicitudes de usuarios aceptadas. Listas para el registro de estudios in-situ y análisis químicos.
            </Text>
          </div>

          <Table
            dataSource={acceptedRequestsManifestations}
            columns={columnsAcceptedRequests}
            rowKey={(item) => item.geomanifestation_id || item.id}
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
            locale={{ emptyText: 'No hay solicitudes aceptadas pendientes de estudio' }}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <EnvironmentOutlined style={{ fontSize: 32, color: '#1890ff' }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Gestión de Geomanifestaciones</Title>
              <Tag color="processing">Módulo Integral de Puntos Geotérmicos ({manifestations.length} puntos totales)</Tag>
            </div>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadManifestations()}
            loading={loading}
          >
            Actualizar
          </Button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="Cargando geomanifestaciones..." />
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        )}
      </Card>

      {/* Manual Point / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EnvironmentOutlined style={{ color: '#1890ff' }} />
            <span>{editingItem ? 'Editar Geomanifestación' : 'Agregar Punto Manualmente'}</span>
          </div>
        }
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={handleModalClose}
        okText={editingItem ? 'Guardar Cambios' : 'Guardar Geomanifestación'}
        cancelText="Cancelar"
        confirmLoading={submitting}
        width={800}
        centered
        styles={{
          body: {
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto',
            paddingRight: 8
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item label="Seleccionar Coordenadas GPS en el Mapa">
            <MapCoordinatePicker
              latLng={selectedCoordinates}
              onCoordinatesChange={(coords) => {
                setSelectedCoordinates(coords);
                form.setFieldsValue({
                  latitude: coords.lat,
                  longitude: coords.lng,
                });
              }}
              title="Coordenadas GPS"
              mapHeight="320px"
              showApplyButton={false}
              showClearButton={true}
            />
          </Form.Item>

          <Form.Item name="latitude" hidden>
            <InputNumber />
          </Form.Item>

          <Form.Item name="longitude" hidden>
            <InputNumber />
          </Form.Item>

          <hr className="my-4" />
          <h3 className="font-semibold text-base mb-4">ℹ️ Información del Punto</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Nombre del Punto"
              rules={[{ required: true, message: 'El nombre es requerido' }]}
            >
              <Input placeholder="Ej: Termal Sitio U1" />
            </Form.Item>

            <Form.Item
              name="province_snit_code"
              label="Provincia"
            >
              <Select placeholder="Selecciona una provincia" onChange={handleProvinceChange} allowClear>
                {provinces.map((prov) => (
                  <Select.Option key={prov.province_snit_code || prov.province_id} value={prov.province_snit_code}>
                    {prov.province_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="canton_snit_code" label="Cantón">
              <Select placeholder="Selecciona un cantón" onChange={handleCantonChange} allowClear disabled={cantons.length === 0}>
                {cantons.map((c) => (
                  <Select.Option key={c.canton_snit_code || c.canton_id} value={c.canton_snit_code}>
                    {c.canton_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="district_snit_code" label="Distrito">
              <Select placeholder="Selecciona un distrito" allowClear disabled={districts.length === 0}>
                {districts.map((d) => (
                  <Select.Option key={d.district_snit_code || d.district_id} value={d.district_snit_code}>
                    {d.district_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="description" label="Descripción">
            <Input.TextArea rows={2} placeholder="Descripción de la manifestación geotermal" />
          </Form.Item>

          <Form.Item name="visibility" valuePropName="checked" label="Visibilidad pública">
            <Switch checkedChildren="Pública" unCheckedChildren="Oculta" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Detalle de la Geomanifestación"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[<Button key="close" onClick={() => setDetailModalVisible(false)}>Cerrar</Button>]}
        width={700}
      >
        {loadingDetail ? (
          <Spin style={{ display: 'block', margin: '20px auto' }} />
        ) : detailData ? (
          <div>
            <Title level={4}>{detailData.geomanifestation_name || detailData.name}</Title>
            <p><strong>ID:</strong> <span className="font-mono">{detailData.geomanifestation_id || detailData.id}</span></p>
            <p><strong>Descripción:</strong> {detailData.description || 'Sin descripción'}</p>
            <p><strong>Visibilidad:</strong> {detailData.visibility || detailData.isVisible ? <Tag color="green">Pública</Tag> : <Tag color="gray">Oculta / Borrador</Tag>}</p>
            {detailData.request_id && <p><strong>Origen Solicitud ID:</strong> <span className="font-mono text-blue-600">{detailData.request_id}</span></p>}
            <p><strong>Ubicación:</strong> {detailData.locationText || [detailData.location?.province, detailData.location?.canton, detailData.location?.district].filter(Boolean).join(', ') || 'Costa Rica'}</p>
            <p><strong>Coordenadas GPS:</strong> Lat {detailData.location?.latitude ?? detailData.latitude}, Lng {detailData.location?.longitude ?? detailData.longitude}</p>

            {detailData.insitu_test && (
              <div style={{ marginTop: 16, background: '#fafafa', padding: 12, borderRadius: 6 }}>
                <Text strong>Prueba In-Situ:</Text>
                <div>Temp: {detailData.insitu_test.temperature}°C | pH: {detailData.insitu_test.ph} | Cond: {detailData.insitu_test.conductivity}</div>
              </div>
            )}

            {detailData.inlab_test && (
              <div style={{ marginTop: 16, background: '#fafafa', padding: 12, borderRadius: 6 }}>
                <Text strong>Prueba de Laboratorio (Geoquímica):</Text>
                <div>pH: {detailData.inlab_test.ph} | Cond: {detailData.inlab_test.conductivity}</div>
                <div>Cl: {detailData.inlab_test.cl} | Ca: {detailData.inlab_test.ca} | HCO3: {detailData.inlab_test.hco3} | SO4: {detailData.inlab_test.so4}</div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default GeomanifeStationsManager;