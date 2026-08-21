import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Button, Modal, Form, Input, InputNumber, Select, Table, message, Space, Spin, Tabs, Badge } from 'antd';
import { EnvironmentOutlined, PlusOutlined, ReloadOutlined, EyeOutlined, EyeInvisibleOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import MapCoordinatePicker from '../../../common/MapCoordinatePicker';
import { geomanifestationsIndex, geomanifestationsAdminIndex, registeredManifestationsStore, provincesIndex, regionsIndex } from '../../../../config/apiConf';

const { Title, Paragraph, Text } = Typography;

const GeomanifeStationsManager = () => {
  const [manifestations, setManifestations] = useState([]);
  const [acceptedRequestsManifestations, setAcceptedRequestsManifestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');

  // Manual point modal states
  const [addManualPointModalVisible, setAddManualPointModalVisible] = useState(false);
  const [addPointForm] = Form.useForm();
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [submittingManualPoint, setSubmittingManualPoint] = useState(false);

  // Load geomanifestations
  const loadManifestations = async () => {
    try {
      setLoading(true);
      
      // Try admin endpoint first, then public endpoint
      let res = await geomanifestationsAdminIndex();
      if (!res.ok) {
        res = await geomanifestationsIndex();
      }

      if (res.ok && res.data) {
        const list = Array.isArray(res.data) 
          ? res.data 
          : (res.data.data && Array.isArray(res.data.data) ? res.data.data : []);

        // Filter active/public manifestations vs accepted request drafts
        const activeList = list.filter(item => item.visibility !== false && item.visibility !== 0);
        const acceptedDrafts = list.filter(item => item.visibility === false || item.visibility === 0 || item.description?.includes('solicitud') || item.description?.includes('Solicitud'));

        // If no filter matched, put all in activeList
        setManifestations(list);
        setAcceptedRequestsManifestations(acceptedDrafts.length > 0 ? acceptedDrafts : list.filter(i => !i.visibility));
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

  // Load provinces for form select
  const loadProvinces = async () => {
    try {
      let res = await provincesIndex();
      if (!res.ok || !Array.isArray(res.data) || res.data.length === 0) {
        res = await regionsIndex();
      }
      if (res.ok && Array.isArray(res.data)) {
        setProvinces(res.data);
      }
    } catch (err) {
      console.error('❌ Error loading provinces:', err);
    }
  };

  useEffect(() => {
    loadManifestations();
    loadProvinces();
  }, []);

  const handleAddManualPointModalClose = () => {
    setAddManualPointModalVisible(false);
    setSelectedCoordinates(null);
    addPointForm.resetFields();
  };

  const handleSubmitManualPoint = async (values) => {
    try {
      if (!selectedCoordinates) {
        message.error('Por favor selecciona las coordenadas en el mapa primero');
        return;
      }

      setSubmittingManualPoint(true);

      const payload = {
        name: values.name,
        region_id: values.region_id || provinces[0]?.province_snit_code || 1,
        latitude: selectedCoordinates.lat,
        longitude: selectedCoordinates.lng,
        description: values.description || null,
        temperature: values.temperature ? parseFloat(values.temperature) : null,
        field_pH: values.field_pH ? parseFloat(values.field_pH) : null,
        field_conductivity: values.field_conductivity ? parseFloat(values.field_conductivity) : null,
        lab_pH: values.lab_pH ? parseFloat(values.lab_pH) : null,
        lab_conductivity: values.lab_conductivity ? parseFloat(values.lab_conductivity) : null,
        cl: values.cl ? parseFloat(values.cl) : null,
        ca: values.ca ? parseFloat(values.ca) : null,
        hco3: values.hco3 ? parseFloat(values.hco3) : null,
        so4: values.so4 ? parseFloat(values.so4) : null,
        fe: values.fe ? parseFloat(values.fe) : null,
        si: values.si ? parseFloat(values.si) : null,
        b: values.b ? parseFloat(values.b) : null,
        li: values.li ? parseFloat(values.li) : null,
        f: values.f ? parseFloat(values.f) : null,
        na: values.na ? parseFloat(values.na) : null,
        k: values.k ? parseFloat(values.k) : null,
        mg: values.mg ? parseFloat(values.mg) : null,
      };

      const result = await registeredManifestationsStore(payload);

      if (!result.ok) {
        throw new Error(result.error || 'Error al registrar geomanifestación');
      }

      message.success('📍 Geomanifestación registrada correctamente');
      handleAddManualPointModalClose();
      loadManifestations();
    } catch (err) {
      console.error('❌ Error submitting manual point:', err);
      message.error(err.message || 'Error al agregar la geomanifestación');
    } finally {
      setSubmittingManualPoint(false);
    }
  };

  const columnsActive = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span className="font-semibold text-gray-800">
          {text || record.geomanifestation_name || `Punto ${record.geomanifestation_id || record.id}`}
        </span>
      ),
    },
    {
      title: 'Ubicación',
      key: 'location',
      render: (_, record) => {
        const loc = record.location || {};
        const parts = [loc.province, loc.canton, loc.district].filter(Boolean);
        return parts.join(', ') || 'Costa Rica';
      },
    },
    {
      title: 'Coordenadas GPS',
      key: 'coords',
      render: (_, record) => {
        const lat = record.location?.latitude ?? record.latitude;
        const lng = record.location?.longitude ?? record.longitude;
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
      dataIndex: 'visibility',
      key: 'visibility',
      render: (val) => (
        val !== false && val !== 0 ? <Tag icon={<EyeOutlined />} color="success">Pública</Tag> : <Tag icon={<EyeInvisibleOutlined />} color="default">Oculta / Borrador</Tag>
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
            Originada de Solicitud Aceptada
          </Text>
        </div>
      ),
    },
    {
      title: 'Coordenadas GPS',
      key: 'coords',
      render: (_, record) => {
        const lat = record.location?.latitude ?? record.latitude;
        const lng = record.location?.longitude ?? record.longitude;
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
      title: 'Descripción / Origen',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || 'Sin descripción adicional',
    },
  ];

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <EnvironmentOutlined />
          Geomanifestaciones Registradas ({manifestations.length})
        </span>
      ),
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <Text type="secondary">
              Listado general de geomanifestaciones hidrogeotérmicas registradas en el sistema.
            </Text>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddManualPointModalVisible(true)}
              style={{ backgroundColor: '#1890ff' }}
            >
              Agregar Punto Manualmente
            </Button>
          </div>

          <Table
            dataSource={manifestations}
            columns={columnsActive}
            rowKey={(item) => item.geomanifestation_id || item.id}
            pagination={{ pageSize: 8 }}
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
              Geomanifestaciones creadas en borrador a partir de solicitudes de usuarios aceptadas por el equipo técnico. Listas para el registro de estudios in-situ y análisis químicos.
            </Text>
          </div>

          <Table
            dataSource={acceptedRequestsManifestations.length > 0 ? acceptedRequestsManifestations : manifestations}
            columns={columnsAcceptedRequests}
            rowKey={(item) => item.geomanifestation_id || item.id}
            pagination={{ pageSize: 8 }}
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
              <Tag color="processing">Módulo de Puntos Geotérmicos y Solicitudes Aceptadas</Tag>
            </div>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={loadManifestations}
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

      {/* Manual Point Form Modal with Embedded Map */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EnvironmentOutlined style={{ color: '#1890ff' }} />
            <span>Agregar Punto Manualmente</span>
          </div>
        }
        open={addManualPointModalVisible}
        onOk={() => addPointForm.submit()}
        onCancel={handleAddManualPointModalClose}
        okText="Guardar Geomanifestación"
        cancelText="Cancelar"
        confirmLoading={submittingManualPoint}
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
          form={addPointForm}
          layout="vertical"
          onFinish={handleSubmitManualPoint}
        >
          {/* Map Coordinate Picker */}
          <Form.Item label="Seleccionar Coordenadas GPS en el Mapa">
            <MapCoordinatePicker
              latLng={selectedCoordinates}
              onCoordinatesChange={(coords) => {
                setSelectedCoordinates(coords);
                addPointForm.setFieldsValue({
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
              name="region_id"
              label="Provincia / Región"
              rules={[{ required: true, message: 'Selecciona una provincia' }]}
            >
              <Select placeholder="Selecciona una provincia">
                {provinces.map((prov) => (
                  <Select.Option key={prov.province_snit_code || prov.id} value={prov.province_snit_code || prov.id}>
                    {prov.province_name || prov.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Descripción"
          >
            <Input.TextArea rows={2} placeholder="Descripción de la manifestación geotermal" />
          </Form.Item>

          <hr className="my-4" />
          <h3 className="font-semibold text-base mb-4">🌡️ Mediciones de Campo (Opcional)</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="temperature"
              label="Temperatura (°C)"
            >
              <InputNumber style={{ width: '100%' }} placeholder="45.5" step={0.1} />
            </Form.Item>

            <Form.Item
              name="field_pH"
              label="pH Campo"
            >
              <InputNumber style={{ width: '100%' }} placeholder="6.8" step={0.01} min={0} max={14} />
            </Form.Item>

            <Form.Item
              name="field_conductivity"
              label="Conductividad Campo (μS/cm)"
            >
              <InputNumber style={{ width: '100%' }} placeholder="500" step={0.01} />
            </Form.Item>
          </div>

          <hr className="my-4" />
          <h3 className="font-semibold text-base mb-4">🧪 Mediciones de Laboratorio (Opcional)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="lab_pH"
              label="pH Laboratorio"
            >
              <InputNumber style={{ width: '100%' }} placeholder="7.0" step={0.01} min={0} max={14} />
            </Form.Item>

            <Form.Item
              name="lab_conductivity"
              label="Conductividad Lab (μS/cm)"
            >
              <InputNumber style={{ width: '100%' }} placeholder="520" step={0.01} />
            </Form.Item>
          </div>

          <hr className="my-4" />
          <h3 className="font-semibold text-base mb-4">⚗️ Elementos Químicos (Opcional - mg/L)</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Form.Item name="cl" label="Cl">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="10" />
            </Form.Item>
            <Form.Item name="ca" label="Ca">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="20" />
            </Form.Item>
            <Form.Item name="hco3" label="HCO3">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="30" />
            </Form.Item>
            <Form.Item name="so4" label="SO4">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="40" />
            </Form.Item>
            <Form.Item name="fe" label="Fe">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="0.5" />
            </Form.Item>
            <Form.Item name="si" label="Si">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="50" />
            </Form.Item>
            <Form.Item name="b" label="B">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="1.0" />
            </Form.Item>
            <Form.Item name="li" label="Li">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="1" />
            </Form.Item>
            <Form.Item name="f" label="F">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="0.5" />
            </Form.Item>
            <Form.Item name="na" label="Na">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="60" />
            </Form.Item>
            <Form.Item name="k" label="K">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="70" />
            </Form.Item>
            <Form.Item name="mg" label="Mg">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="80" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default GeomanifeStationsManager;