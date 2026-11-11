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
  BulbOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  FilterOutlined,
  FireOutlined,
} from '@ant-design/icons';
import EntityNavigatorPicker from '../../../common/EntityNavigatorPicker';
import { renderDateWithProse } from '../../../../utils/dateFormatter';
import { useSession } from '../../../../hooks/useSession';
import {
  insituTestsIndex,
  insituTestsStore,
  insituTestsUpdate,
  insituTestsDelete,
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

const InsituTestsManager = () => {
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
      const res = await insituTestsIndex({ geomanifestation_id: geoId });
      if (res.ok && res.data) {
        const list = extractList(res.data);
        setTests(list);
      } else {
        setTests([]);
      }
    } catch (err) {
      console.error('❌ Error loading insitu tests:', err);
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
      insitu_test_name: record.insitu_test_name || '',
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
        insitu_test_name: values.insitu_test_name ? values.insitu_test_name.trim() : '',
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

  const filteredTests = useMemo(() => {
    if (!searchText) return tests;
    const term = searchText.toLowerCase();
    return tests.filter((t) => {
      const name = (t.insitu_test_name || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      return name.includes(term) || desc.includes(term);
    });
  }, [tests, searchText]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = tests.length;
    const highTemp = tests.filter((t) => t.temperature != null && t.temperature >= 40).length;
    const withConductivity = tests.filter((t) => t.conductivity != null).length;
    return { total, highTemp, withConductivity };
  }, [tests]);

  const columns = [
    {
      title: 'Nombre de la Medición',
      dataIndex: 'insitu_test_name',
      key: 'insitu_test_name',
      render: (val) => <span className="font-semibold text-gray-900">{val || 'Sin nombre'}</span>,
    },
    ...(isMaintenance ? [{
      title: 'ID Prueba',
      dataIndex: 'insitu_test_id',
      key: 'insitu_test_id',
      render: (val, record) => <span className="font-mono text-xs font-semibold text-gray-700">{val || record.id}</span>,
    }] : []),
    {
      title: 'Temperatura (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
      render: (val) => {
        if (val == null) return <span className="text-gray-400">N/A</span>;
        const isHigh = val >= 50;
        const isWarm = val >= 30;
        return (
          <Tag className={`rounded-full font-semibold text-xs ${
            isHigh
              ? 'bg-orange-50 text-orange-700 border-orange-200'
              : isWarm
              ? 'bg-blue-50 text-geoterra-blue border-blue-200'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}>
            {val}°C
          </Tag>
        );
      },
    },
    {
      title: 'Conductividad (μS/cm)',
      dataIndex: 'conductivity',
      key: 'conductivity',
      render: (val) => val != null ? `${val} μS/cm` : <span className="text-gray-400">N/A</span>,
    },
    {
      title: 'pH de Campo',
      dataIndex: 'ph',
      key: 'ph',
      render: (val) => val != null ? (
        <span className="font-medium text-gray-800">{val}</span>
      ) : <span className="text-gray-400">N/A</span>,
    },
    {
      title: 'Notas / Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (val) => val ? <span className="text-gray-600">{val}</span> : <span className="text-gray-400 italic">Sin notas</span>,
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
            title="¿Eliminar prueba in-situ?"
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
              GEOTERMIA DE CAMPO • MEDICIONES DIRECTAS
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-geoterra-blue m-0 poppins">
            Pruebas de Campo (In-Situ)
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-0 max-w-2xl">
            Mediciones de temperatura, conductividad y pH tomadas directamente en campo.
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
            Nueva Prueba In-Situ
          </Button>
        </div>
      </div>

      {/* 2. KPI Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Mediciones
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12467E] flex items-center justify-center text-lg">
              <BulbOutlined />
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

        {/* KPI 2: Alta Temperatura */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Térmicas (≥40°C)
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-geoterra-orange flex items-center justify-center text-lg">
              <FireOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loading ? '...' : stats.highTemp}
            </span>
            <span className="text-xs text-gray-500 font-medium">Puntos</span>
          </div>
          <div className="mt-2 text-xs text-orange-700 font-medium flex items-center gap-1">
            <GlobalOutlined /> Anomalías termales activas
          </div>
        </div>

        {/* KPI 3: Conductividad */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Conductividad
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-geoterra-blue flex items-center justify-center text-lg">
              <FilterOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loading ? '...' : stats.withConductivity}
            </span>
            <span className="text-xs text-gray-500 font-medium">Lecturas</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Salinidad y sólidos disueltos
          </div>
        </div>

        {/* KPI 4: Control Instrumental */}
        <div className="bg-[#12467E] p-5 rounded-2xl border border-blue-900 text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Instrumentación
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center text-lg">
              <SafetyCertificateOutlined />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold poppins text-white">Calibrada</span>
            <p className="text-xs text-blue-200 m-0 mt-0.5 font-normal">
              Sondas multiparamétricas de campo
            </p>
          </div>
          <div className="mt-3 text-[11px] text-blue-100 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Validación in-situ
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
              placeholder="Buscar medición por nombre o notas..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="rounded-lg py-2"
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Mostrando {filteredTests.length} de {tests.length} pruebas in-situ
          </span>
        </div>

        {/* Table */}
        <Table
          dataSource={filteredTests}
          columns={columns}
          rowKey={(item) => item.insitu_test_id || item.id}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} pruebas in-situ`,
          }}
          locale={{
            emptyText: selectedGeoId
              ? 'No hay pruebas in-situ registradas para esta manifestación'
              : 'Selecciona una geomanifestación',
          }}
          className="poppins border border-gray-100 rounded-xl overflow-hidden"
        />
      </div>

      {/* 4. Create / Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-geoterra-blue font-bold text-lg">
            <BulbOutlined />
            <span>{editingTest ? 'Editar Prueba In-Situ Oficial' : 'Nueva Prueba In-Situ Oficial'}</span>
          </div>
        }
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        okText={editingTest ? 'Guardar Cambios' : 'Registrar Medición'}
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: '#12467E', borderColor: '#12467E' },
          className: 'poppins-bold',
        }}
        width={560}
      >
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-4 space-y-4">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="insitu_test_name"
              label={<span className="font-semibold text-gray-700">Nombre de la Prueba In-Situ</span>}
              rules={[
                { required: true, message: 'El nombre de la prueba es obligatorio' },
                { max: 55, message: 'Máximo 55 caracteres' },
              ]}
            >
              <Input placeholder="Ej: Medición Manantial Termal A" maxLength={55} className="rounded-lg" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Form.Item
                name="temperature"
                label={<span className="font-semibold text-gray-700">Temperatura (°C)</span>}
                rules={[{ type: 'number', min: 0, max: 200, message: '0-200°C' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Ej: 55.4" step={0.1} className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="conductivity"
                label={<span className="font-semibold text-gray-700">Conductividad (μS/cm)</span>}
                rules={[{ type: 'number', min: 0, message: '≥ 0' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Ej: 1200" step={1} className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="ph"
                label={<span className="font-semibold text-gray-700">pH Campo</span>}
                rules={[{ type: 'number', min: 0, max: 14, message: '0-14' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="Ej: 6.5" step={0.01} className="rounded-lg" />
              </Form.Item>
            </div>

            <Form.Item name="description" label={<span className="font-semibold text-gray-700">Notas / Descripción</span>} className="m-0">
              <Input.TextArea rows={3} placeholder="Condiciones ambientales, aspecto visual del agua..." className="rounded-lg" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default InsituTestsManager;
