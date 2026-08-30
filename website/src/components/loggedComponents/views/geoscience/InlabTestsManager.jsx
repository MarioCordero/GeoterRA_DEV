import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Button, Modal, Form, InputNumber, Input, Table, message, Space, Spin, Popconfirm } from 'antd';
import { BarChartOutlined, PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import GeomanifestationPicker from '../../../common/GeomanifestationPicker';
import {
  inlabTestsIndex,
  inlabTestsStore,
  inlabTestsUpdate,
  inlabTestsDelete,
  geomanifestationsAdminIndex,
  geomanifestationsIndex
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

const InlabTestsManager = () => {
  const [manifestations, setManifestations] = useState([]);
  const [selectedGeoId, setSelectedGeoId] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGeos, setLoadingGeos] = useState(true);

  // Form & modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Load list of geomanifestations for dropdown/picker
  const loadGeomanifestations = async () => {
    try {
      setLoadingGeos(true);
      let res = await geomanifestationsAdminIndex({ show_all: 'true', limit: 1000 });
      if (!res.ok) {
        res = await geomanifestationsIndex({ show_all: 'true', limit: 1000 });
      }
      if (res.ok && res.data) {
        const list = extractList(res.data);
        setManifestations(list);
        if (list.length > 0 && !selectedGeoId) {
          const firstId = list[0].geomanifestation_id || list[0].id;
          setSelectedGeoId(firstId);
        }
      }
    } catch (err) {
      console.error('❌ Error loading geomanifestations:', err);
    } finally {
      setLoadingGeos(false);
    }
  };

  // Load tests for selected geomanifestation
  const loadTests = async (geoId) => {
    if (!geoId) return;
    try {
      setLoading(true);
      const res = await inlabTestsIndex({ geomanifestation_id: geoId });
      if (res.ok && res.data) {
        const list = extractList(res.data);
        setTests(list);
      } else {
        setTests([]);
      }
    } catch (err) {
      console.error('❌ Error loading inlab tests:', err);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGeomanifestations();
  }, []);

  useEffect(() => {
    if (selectedGeoId) {
      loadTests(selectedGeoId);
    }
  }, [selectedGeoId]);

  const handleOpenCreate = () => {
    if (!selectedGeoId) {
      message.warning('Selecciona una geomanifestación primero');
      return;
    }
    setEditingTest(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleOpenEdit = (record) => {
    setEditingTest(record);
    form.setFieldsValue({
      ph: record.ph,
      conductivity: record.conductivity,
      cl: record.cl,
      ca: record.ca,
      hco3: record.hco3,
      so4: record.so4,
      fe: record.fe,
      si: record.si,
      b: record.b,
      li: record.li,
      f: record.f,
      na: record.na,
      k: record.k,
      mg: record.mg,
      description: record.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    const id = record.inlab_test_id || record.id;
    try {
      const res = await inlabTestsDelete(id);
      if (res.ok) {
        message.success('Prueba de laboratorio eliminada correctamente');
        loadTests(selectedGeoId);
      } else {
        message.error(res.error || 'Error al eliminar (puede estar vinculada a un georeporte)');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const fields = ['ph', 'conductivity', 'cl', 'ca', 'hco3', 'so4', 'fe', 'si', 'b', 'li', 'f', 'na', 'k', 'mg'];
      const payload = {
        geomanifestation_id: selectedGeoId,
        description: values.description || null,
      };

      fields.forEach(f => {
        payload[f] = values[f] !== undefined && values[f] !== null ? parseFloat(values[f]) : null;
      });

      let res;
      if (editingTest) {
        const id = editingTest.inlab_test_id || editingTest.id;
        delete payload.geomanifestation_id;
        res = await inlabTestsUpdate(id, payload);
      } else {
        res = await inlabTestsStore(payload);
      }

      if (res.ok) {
        message.success(`Prueba de laboratorio ${editingTest ? 'actualizada' : 'registrada'} correctamente`);
        setModalVisible(false);
        form.resetFields();
        loadTests(selectedGeoId);
      } else {
        message.error(res.error || 'Error al guardar la prueba de laboratorio');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'ID Prueba',
      dataIndex: 'inlab_test_id',
      key: 'inlab_test_id',
      render: (val, record) => <span className="font-mono text-xs">{val || record.id}</span>,
    },
    {
      title: 'pH',
      dataIndex: 'ph',
      key: 'ph',
      render: (val) => val !== null && val !== undefined ? <Tag color="purple">{val}</Tag> : 'N/A',
    },
    {
      title: 'Conductividad (μS/cm)',
      dataIndex: 'conductivity',
      key: 'conductivity',
      render: (val) => val !== null && val !== undefined ? `${val}` : 'N/A',
    },
    {
      title: 'Iones Principales (mg/L)',
      key: 'ions',
      render: (_, r) => (
        <span className="text-xs">
          Cl: {r.cl ?? '-'} | Ca: {r.ca ?? '-'} | HCO3: {r.hco3 ?? '-'} | SO4: {r.so4 ?? '-'} | Na: {r.na ?? '-'} | K: {r.k ?? '-'} | Mg: {r.mg ?? '-'}
        </span>
      ),
    },
    {
      title: 'Elementos Traza (mg/L)',
      key: 'trace',
      render: (_, r) => (
        <span className="text-xs">
          Fe: {r.fe ?? '-'} | Si: {r.si ?? '-'} | B: {r.b ?? '-'} | Li: {r.li ?? '-'} | F: {r.f ?? '-'}
        </span>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" type="primary" onClick={() => handleOpenEdit(record)} />
          <Popconfirm title="¿Eliminar prueba de laboratorio?" onConfirm={() => handleDelete(record)} okText="Sí" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <BarChartOutlined style={{ fontSize: 32, color: '#722ed1' }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Pruebas de Laboratorio (In-Lab)</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Análisis geoquímicos detallados: pH, conductividad, iones mayores y elementos traza.
              </Paragraph>
            </div>
          </div>

          <Space flexWrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              disabled={!selectedGeoId}
              style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
            >
              Nueva Prueba de Laboratorio
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadTests(selectedGeoId)}
              loading={loading}
              disabled={!selectedGeoId}
            >
              Actualizar Listado
            </Button>
          </Space>
        </div>

        {/* Scalable Geomanifestation Picker */}
        <GeomanifestationPicker
          selectedGeoId={selectedGeoId}
          onSelectGeo={(id) => setSelectedGeoId(id)}
          manifestations={manifestations}
          loading={loadingGeos}
          onRefresh={loadGeomanifestations}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="Cargando pruebas de laboratorio..." />
          </div>
        ) : (
          <Table
            dataSource={tests}
            columns={columns}
            rowKey={(item) => item.inlab_test_id || item.id}
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
            locale={{ emptyText: selectedGeoId ? 'No hay pruebas de laboratorio registradas para esta manifestación' : 'Selecciona una geomanifestación' }}
          />
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        title={editingTest ? 'Editar Prueba de Laboratorio' : 'Nueva Prueba de Laboratorio'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        okText={editingTest ? 'Guardar Cambios' : 'Crear Prueba'}
        cancelText="Cancelar"
        width={750}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="ph" label="pH Laboratorio" rules={[{ type: 'number', min: 0, max: 14 }]}>
              <InputNumber style={{ width: '100%' }} placeholder="7.2" step={0.01} />
            </Form.Item>

            <Form.Item name="conductivity" label="Conductividad (μS/cm)" rules={[{ type: 'number', min: 0 }]}>
              <InputNumber style={{ width: '100%' }} placeholder="1250" step={1} />
            </Form.Item>
          </div>

          <hr className="my-3" />
          <h4 className="font-semibold text-sm mb-3 text-gray-700">🧪 Iones Mayores (mg/L)</h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Form.Item name="cl" label="Cloruro (Cl)"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
            <Form.Item name="ca" label="Calcio (Ca)"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
            <Form.Item name="hco3" label="Bicarbonato (HCO3)"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
            <Form.Item name="so4" label="Sulfato (SO4)"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
            <Form.Item name="na" label="Sodio (Na)"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
            <Form.Item name="k" label="Potasio (K)"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
            <Form.Item name="mg" label="Magnesio (Mg)"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
          </div>

          <hr className="my-3" />
          <h4 className="font-semibold text-sm mb-3 text-gray-700">⚗️ Elementos Traza (mg/L)</h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Form.Item name="fe" label="Hierro (Fe)"><InputNumber style={{ width: '100%' }} min={0} step={0.001} /></Form.Item>
            <Form.Item name="si" label="Sílice (Si)"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
            <Form.Item name="b" label="Boro (B)"><InputNumber style={{ width: '100%' }} min={0} step={0.001} /></Form.Item>
            <Form.Item name="li" label="Litio (Li)"><InputNumber style={{ width: '100%' }} min={0} step={0.001} /></Form.Item>
            <Form.Item name="f" label="Fluoruro (F)"><InputNumber style={{ width: '100%' }} min={0} step={0.001} /></Form.Item>
          </div>

          <Form.Item name="description" label="Notas de Laboratorio">
            <Input.TextArea rows={2} placeholder="Análisis realizado en laboratorio de Geoquímica UCR" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InlabTestsManager;
