import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Button, Modal, Form, InputNumber, Input, Table, message, Space, Spin, Popconfirm } from 'antd';
import { BulbOutlined, PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import GeomanifestationPicker from '../../../common/GeomanifestationPicker';
import {
  insituTestsIndex,
  insituTestsStore,
  insituTestsUpdate,
  insituTestsDelete,
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

const InsituTestsManager = () => {
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

  // Load list of geomanifestations for picker
  const loadGeomanifestations = async () => {
    try {
      setLoadingGeos(true);
      console.log('📍 [InsituTestsManager] Fetching geomanifestations list...');
      let res = await geomanifestationsAdminIndex({ show_all: 'true', limit: 1000 });
      if (!res.ok) {
        res = await geomanifestationsIndex({ show_all: 'true', limit: 1000 });
      }
      if (res.ok && res.data) {
        const list = extractList(res.data);
        console.log('📍 [InsituTestsManager] Loaded geomanifestations count:', list.length, list);
        setManifestations(list);
        if (list.length > 0 && !selectedGeoId) {
          const firstId = list[0].geomanifestation_id || list[0].id;
          console.log('📍 [InsituTestsManager] Auto-selecting first geomanifestation_id:', firstId);
          setSelectedGeoId(firstId);
        }
      }
    } catch (err) {
      console.error('❌ [InsituTestsManager] Error loading geomanifestations:', err);
    } finally {
      setLoadingGeos(false);
    }
  };

  // Load tests for selected geomanifestation
  const loadTests = async (geoId) => {
    if (!geoId) return;
    try {
      setLoading(true);
      console.log('🧪 [InsituTestsManager] Loading insitu tests for geoId:', geoId);
      const res = await insituTestsIndex({ geomanifestation_id: geoId });
      console.log('🧪 [InsituTestsManager] insituTestsIndex res:', res);
      if (res.ok && res.data) {
        const list = extractList(res.data);
        console.log('✅ [InsituTestsManager] Extracted tests count:', list.length, list);
        setTests(list);
      } else {
        console.warn('⚠️ [InsituTestsManager] Failed to load insitu tests:', res);
        setTests([]);
      }
    } catch (err) {
      console.error('❌ [InsituTestsManager] Error loading insitu tests:', err);
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
      temperature: record.temperature,
      conductivity: record.conductivity,
      ph: record.ph,
      description: record.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    const id = record.insitu_test_id || record.id;
    try {
      const res = await insituTestsDelete(id);
      if (res.ok) {
        message.success('Prueba in-situ eliminada correctamente');
        loadTests(selectedGeoId);
      } else {
        message.error(res.error || 'Error al eliminar');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        geomanifestation_id: selectedGeoId,
        temperature: values.temperature !== undefined && values.temperature !== null ? parseFloat(values.temperature) : null,
        conductivity: values.conductivity !== undefined && values.conductivity !== null ? parseFloat(values.conductivity) : null,
        ph: values.ph !== undefined && values.ph !== null ? parseFloat(values.ph) : null,
        description: values.description || null,
      };

      let res;
      if (editingTest) {
        const id = editingTest.insitu_test_id || editingTest.id;
        delete payload.geomanifestation_id;
        res = await insituTestsUpdate(id, payload);
      } else {
        res = await insituTestsStore(payload);
      }

      if (res.ok) {
        message.success(`Prueba in-situ ${editingTest ? 'actualizada' : 'registrada'} correctamente`);
        setModalVisible(false);
        form.resetFields();
        loadTests(selectedGeoId);
      } else {
        message.error(res.error || 'Error al guardar la prueba in-situ');
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
      dataIndex: 'insitu_test_id',
      key: 'insitu_test_id',
      render: (val, record) => <span className="font-mono text-xs">{val || record.id}</span>,
    },
    {
      title: 'Temperatura (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (val) => val !== null && val !== undefined ? (
        <Tag color={val > 50 ? 'red' : val > 30 ? 'orange' : 'blue'}>{val}°C</Tag>
      ) : 'N/A',
    },
    {
      title: 'Conductividad (μS/cm)',
      dataIndex: 'conductivity',
      key: 'conductivity',
      render: (val) => val !== null && val !== undefined ? `${val} μS/cm` : 'N/A',
    },
    {
      title: 'pH',
      dataIndex: 'ph',
      key: 'ph',
      render: (val) => val !== null && val !== undefined ? val : 'N/A',
    },
    {
      title: 'Notas / Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (val) => val || 'Sin notas',
    },
    {
      title: 'Creado por',
      key: 'creator',
      render: (_, record) => {
        const name = [record.created_by_first_name, record.created_by_last_name].filter(Boolean).join(' ');
        return name || 'Sistema';
      },
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
          <Popconfirm title="¿Eliminar prueba in-situ?" onConfirm={() => handleDelete(record)} okText="Sí" cancelText="No">
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
            <BulbOutlined style={{ fontSize: 32, color: '#52c41a' }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Pruebas de Campo (In-Situ)</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Mediciones de temperatura, conductividad y pH tomadas directamente en campo.
              </Paragraph>
            </div>
          </div>

          <Space flexWrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              disabled={!selectedGeoId}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Nueva Prueba In-Situ
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
            <Spin size="large" tip="Cargando pruebas in-situ..." />
          </div>
        ) : (
          <Table
            dataSource={tests}
            columns={columns}
            rowKey={(item) => item.insitu_test_id || item.id}
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
            locale={{ emptyText: selectedGeoId ? 'No hay pruebas in-situ registradas para esta manifestación' : 'Selecciona una geomanifestación' }}
          />
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        title={editingTest ? 'Editar Prueba In-Situ' : 'Nueva Prueba In-Situ'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        okText={editingTest ? 'Guardar Cambios' : 'Crear Prueba'}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="temperature"
            label="Temperatura (°C)"
            rules={[{ type: 'number', min: 0, max: 200, message: 'Temperatura entre 0 y 200°C' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Ej: 55.4" step={0.1} />
          </Form.Item>

          <Form.Item
            name="conductivity"
            label="Conductividad Eléctrica (μS/cm)"
            rules={[{ type: 'number', min: 0, message: 'Debe ser ≥ 0' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Ej: 1200" step={1} />
          </Form.Item>

          <Form.Item
            name="ph"
            label="pH Campo"
            rules={[{ type: 'number', min: 0, max: 14, message: 'pH entre 0 y 14' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Ej: 6.5" step={0.01} />
          </Form.Item>

          <Form.Item name="description" label="Notas / Descripción de la Medición">
            <Input.TextArea rows={3} placeholder="Medición realizada a las 10:00 AM, clima despejado" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InsituTestsManager;
