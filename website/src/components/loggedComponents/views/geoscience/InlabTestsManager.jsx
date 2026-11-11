import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Table,
  message,
  Space,
  Spin,
  Popconfirm,
  Tooltip
} from 'antd';
import {
  ExperimentOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import EntityNavigatorPicker from '../../../common/EntityNavigatorPicker';
import { renderDateWithProse } from '../../../../utils/dateFormatter';
import { useSession } from '../../../../hooks/useSession';
import {
  inlabTestsIndex,
  inlabTestsStore,
  inlabTestsUpdate,
  inlabTestsDelete,
  geomanifestationsAdminIndex,
  geomanifestationsIndex
} from '../../../../config/apiConf';

const extractList = (resData) => {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData.data)) return resData.data;
  if (Array.isArray(resData.data?.data)) return resData.data.data;
  if (Array.isArray(resData.items)) return resData.items;
  return [];
};

const InlabTestsManager = () => {
  const { user } = useSession();
  const isMaintenance = user?.role === 'maintenance';
  const [manifestations, setManifestations] = useState([]);
  const [selectedGeoId, setSelectedGeoId] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGeos, setLoadingGeos] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Form & modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Load list of geomanifestations for picker
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
      inlab_test_name: record.inlab_test_name || '',
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
        inlab_test_name: values.inlab_test_name ? values.inlab_test_name.trim() : '',
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

  const filteredTests = useMemo(() => {
    if (!searchText) return tests;
    const term = searchText.toLowerCase();
    return tests.filter((t) => {
      const name = (t.inlab_test_name || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      return name.includes(term) || desc.includes(term);
    });
  }, [tests, searchText]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = tests.length;
    const withIons = tests.filter((t) => t.cl != null || t.na != null || t.so4 != null).length;
    const withTrace = tests.filter((t) => t.fe != null || t.si != null || t.li != null).length;
    return { total, withIons, withTrace };
  }, [tests]);

  const columns = [
    {
      title: 'Nombre de la Prueba',
      dataIndex: 'inlab_test_name',
      key: 'inlab_test_name',
      render: (val) => <span className="font-semibold text-gray-900">{val || 'Sin nombre'}</span>,
    },
    ...(isMaintenance ? [{
      title: 'ID Prueba',
      dataIndex: 'inlab_test_id',
      key: 'inlab_test_id',
      render: (val, record) => <span className="font-mono text-xs font-semibold text-gray-700">{val || record.id}</span>,
    }] : []),
    {
      title: 'pH',
      dataIndex: 'ph',
      key: 'ph',
      width: 90,
      render: (val) => val !== null && val !== undefined ? (
        <Tag className="bg-blue-50 text-geoterra-blue border-blue-200 rounded-full font-semibold text-xs">
          {val}
        </Tag>
      ) : <span className="text-gray-400">N/A</span>,
    },
    {
      title: 'Conductividad (μS/cm)',
      dataIndex: 'conductivity',
      key: 'conductivity',
      render: (val) => val !== null && val !== undefined ? `${val} μS/cm` : <span className="text-gray-400">N/A</span>,
    },
    {
      title: 'Iones Principales (mg/L)',
      key: 'ions',
      render: (_, r) => (
        <span className="text-xs text-gray-600 font-mono">
          Cl: {r.cl ?? '-'} | Ca: {r.ca ?? '-'} | HCO3: {r.hco3 ?? '-'} | SO4: {r.so4 ?? '-'} | Na: {r.na ?? '-'} | K: {r.k ?? '-'}
        </span>
      ),
    },
    {
      title: 'Elementos Traza (mg/L)',
      key: 'trace',
      render: (_, r) => (
        <span className="text-xs text-gray-600 font-mono">
          Fe: {r.fe ?? '-'} | Si: {r.si ?? '-'} | B: {r.b ?? '-'} | Li: {r.li ?? '-'} | F: {r.f ?? '-'}
        </span>
      ),
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => renderDateWithProse(val, { showIcon: true }),
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Editar prueba">
            <Button
              icon={<EditOutlined />}
              size="middle"
              onClick={() => handleOpenEdit(record)}
              className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
            />
          </Tooltip>
          <Popconfirm
            title="¿Eliminar prueba de laboratorio?"
            description="Esta acción es irreversible y eliminará la prueba."
            onConfirm={() => handleDelete(record)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Eliminar prueba">
              <Button icon={<DeleteOutlined />} size="middle" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full p-4 md:p-8 space-y-6 poppins">
      {/* 1. Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-geoterra-orange poppins">
              GEOQUÍMICA • ANÁLISIS DE LABORATORIO
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-geoterra-blue m-0 poppins">
            Pruebas de Laboratorio (In-Lab)
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-0 max-w-2xl">
            Análisis geoquímicos detallados: pH, conductividad, iones mayores y elementos traza.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={() => loadTests(selectedGeoId)}
            loading={loading}
            disabled={!selectedGeoId}
            className="poppins font-medium border-gray-300"
          >
            Actualizar
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            disabled={!selectedGeoId}
            style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
            className="poppins-bold shadow-sm"
          >
            Nueva Prueba de Laboratorio
          </Button>
        </div>
      </div>

      {/* 2. KPI Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Pruebas
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12467E] flex items-center justify-center text-lg">
              <ExperimentOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loading ? '...' : stats.total}
            </span>
            <span className="text-xs text-gray-500 font-medium">Registradas</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Manifestación seleccionada
          </div>
        </div>

        {/* KPI 2: Con Iones Principales */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Con Iones Mayores
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-geoterra-blue flex items-center justify-center text-lg">
              <FilterOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loading ? '...' : stats.withIons}
            </span>
            <span className="text-xs text-gray-500 font-medium">Completas</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Cl, SO4, HCO3, Na, K, Ca, Mg
          </div>
        </div>

        {/* KPI 3: Con Elementos Traza */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Elementos Traza
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-geoterra-orange flex items-center justify-center text-lg">
              <GlobalOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loading ? '...' : stats.withTrace}
            </span>
            <span className="text-xs text-gray-500 font-medium">Con trazas</span>
          </div>
          <div className="mt-2 text-xs text-orange-700 font-medium flex items-center gap-1">
            <GlobalOutlined /> Fe, Si, B, Li, F
          </div>
        </div>

        {/* KPI 4: Control Técnico */}
        <div className="bg-[#12467E] p-5 rounded-2xl border border-blue-900 text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Protocolo Analítico
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center text-lg">
              <SafetyCertificateOutlined />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold poppins text-white">Geoquímica UCR</span>
            <p className="text-xs text-blue-200 m-0 mt-0.5 font-normal">
              Estándares certificados de laboratorio
            </p>
          </div>
          <div className="mt-3 text-[11px] text-blue-100 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Control de calidad verificado
          </div>
        </div>
      </div>

      {/* 3. Main Data Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        {/* Entity Navigator Picker */}
        <EntityNavigatorPicker
          entityType="geomanifestations"
          selectedId={selectedGeoId}
          onSelect={(id) => setSelectedGeoId(id)}
          items={manifestations}
          loading={loadingGeos}
          onRefresh={loadGeomanifestations}
          label="GEOMANIFESTACIÓN DE LA PRUEBA:"
        />

        {/* Filter and Search Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="w-full md:w-96">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Buscar prueba por nombre o notas..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="rounded-lg py-2"
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Mostrando {filteredTests.length} de {tests.length} pruebas de laboratorio
          </span>
        </div>

        {/* Table */}
        <Table
          dataSource={filteredTests}
          columns={columns}
          rowKey={(item) => item.inlab_test_id || item.id}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} pruebas de laboratorio`,
          }}
          locale={{
            emptyText: selectedGeoId
              ? 'No hay pruebas de laboratorio registradas para esta manifestación'
              : 'Selecciona una geomanifestación',
          }}
          className="poppins border border-gray-100 rounded-xl overflow-hidden"
        />
      </div>

      {/* 4. Create / Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-geoterra-blue font-bold text-lg">
            <ExperimentOutlined />
            <span>{editingTest ? 'Editar Prueba de Laboratorio Oficial' : 'Nueva Prueba de Laboratorio Oficial'}</span>
          </div>
        }
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        okText={editingTest ? 'Guardar Cambios' : 'Registrar Prueba'}
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: '#12467E', borderColor: '#12467E' },
          className: 'poppins-bold',
        }}
        width={750}
      >
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-4 space-y-4">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="inlab_test_name"
              label={<span className="font-semibold text-gray-700">Nombre de la Prueba de Laboratorio</span>}
              rules={[
                { required: true, message: 'El nombre de la prueba es obligatorio' },
                { max: 55, message: 'Máximo 55 caracteres' },
              ]}
            >
              <Input placeholder="Ej: Análisis Químico Muestra #1" maxLength={55} className="rounded-lg" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item name="ph" label={<span className="font-semibold text-gray-700">pH Laboratorio</span>} rules={[{ type: 'number', min: 0, max: 14 }]}>
                <InputNumber style={{ width: '100%' }} placeholder="7.2" step={0.01} className="rounded-lg" />
              </Form.Item>

              <Form.Item name="conductivity" label={<span className="font-semibold text-gray-700">Conductividad (μS/cm)</span>} rules={[{ type: 'number', min: 0 }]}>
                <InputNumber style={{ width: '100%' }} placeholder="1250" step={1} className="rounded-lg" />
              </Form.Item>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-geoterra-blue mb-3 flex items-center gap-1.5 poppins">
                <FilterOutlined /> Iones Mayores (mg/L)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Form.Item name="cl" label={<span className="text-xs font-semibold text-gray-600">Cloruro (Cl)</span>}><InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" /></Form.Item>
                <Form.Item name="ca" label={<span className="text-xs font-semibold text-gray-600">Calcio (Ca)</span>}><InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" /></Form.Item>
                <Form.Item name="hco3" label={<span className="text-xs font-semibold text-gray-600">Bicarbonato (HCO3)</span>}><InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" /></Form.Item>
                <Form.Item name="so4" label={<span className="text-xs font-semibold text-gray-600">Sulfato (SO4)</span>}><InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" /></Form.Item>
                <Form.Item name="na" label={<span className="text-xs font-semibold text-gray-600">Sodio (Na)</span>}><InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" /></Form.Item>
                <Form.Item name="k" label={<span className="text-xs font-semibold text-gray-600">Potasio (K)</span>}><InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" /></Form.Item>
                <Form.Item name="mg" label={<span className="text-xs font-semibold text-gray-600">Magnesio (Mg)</span>}><InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" /></Form.Item>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-geoterra-orange mb-3 flex items-center gap-1.5 poppins">
                <GlobalOutlined /> Elementos Traza (mg/L)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Form.Item name="fe" label={<span className="text-xs font-semibold text-gray-600">Hierro (Fe)</span>}><InputNumber style={{ width: '100%' }} min={0} step={0.001} className="rounded-lg" /></Form.Item>
                <Form.Item name="si" label={<span className="text-xs font-semibold text-gray-600">Sílice (Si)</span>}><InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" /></Form.Item>
                <Form.Item name="b" label={<span className="text-xs font-semibold text-gray-600">Boro (B)</span>}><InputNumber style={{ width: '100%' }} min={0} step={0.001} className="rounded-lg" /></Form.Item>
                <Form.Item name="li" label={<span className="text-xs font-semibold text-gray-600">Litio (Li)</span>}><InputNumber style={{ width: '100%' }} min={0} step={0.001} className="rounded-lg" /></Form.Item>
                <Form.Item name="f" label={<span className="text-xs font-semibold text-gray-600">Fluoruro (F)</span>}><InputNumber style={{ width: '100%' }} min={0} step={0.001} className="rounded-lg" /></Form.Item>
              </div>
            </div>

            <Form.Item name="description" label={<span className="font-semibold text-gray-700">Notas de Laboratorio</span>} className="m-0">
              <Input.TextArea rows={2} placeholder="Análisis realizado en laboratorio de Geoquímica UCR" className="rounded-lg" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default InlabTestsManager;
