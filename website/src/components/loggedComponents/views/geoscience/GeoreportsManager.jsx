import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Checkbox,
  Table,
  message,
  Space,
  Spin,
  Popconfirm,
  Tooltip
} from 'antd';
import {
  FileSearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  BulbOutlined,
  ExperimentOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import EntityNavigatorPicker from '../../../common/EntityNavigatorPicker';
import { renderDateWithProse } from '../../../../utils/dateFormatter';
import { useSession } from '../../../../hooks/useSession';
import {
  georeportsCurrent,
  georeportsAdminIndex,
  georeportsAdminStore,
  georeportsAdminUpdate,
  georeportsAdminDelete,
  georeportsAdminPromote,
  insituTestsIndex,
  inlabTestsIndex,
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

const GeoreportsManager = () => {
  const { user } = useSession();
  const isMaintenance = user?.role === 'maintenance';
  const [manifestations, setManifestations] = useState([]);
  const [selectedGeoId, setSelectedGeoId] = useState(null);
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [insituOptions, setInsituOptions] = useState([]);
  const [inlabOptions, setInlabOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGeos, setLoadingGeos] = useState(true);
  const [promotingId, setPromotingId] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Form & modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
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

  // Load reports for selected geomanifestation
  const loadReports = async (geoId) => {
    if (!geoId) return;
    try {
      setLoading(true);

      const resIndex = await georeportsAdminIndex({ geomanifestation_id: geoId });
      if (resIndex.ok && resIndex.data) {
        const list = extractList(resIndex.data);
        setReports(list);
      } else {
        setReports([]);
      }

      const resCurrent = await georeportsCurrent({ geomanifestation_id: geoId });
      if (resCurrent.ok && resCurrent.data && (resCurrent.data.georeport_id || resCurrent.data.id)) {
        setCurrentReport(resCurrent.data);
      } else {
        setCurrentReport(null);
      }
    } catch (err) {
      console.error('❌ Error loading georeports:', err);
      setReports([]);
      setCurrentReport(null);
    } finally {
      setLoading(false);
    }
  };

  // Load insitu & inlab test options for modal dropdowns
  const loadTestOptions = async (geoId) => {
    if (!geoId) return;
    try {
      const resInsitu = await insituTestsIndex({ geomanifestation_id: geoId });
      if (resInsitu.ok && resInsitu.data) {
        setInsituOptions(extractList(resInsitu.data));
      } else {
        setInsituOptions([]);
      }

      const resInlab = await inlabTestsIndex({ geomanifestation_id: geoId });
      if (resInlab.ok && resInlab.data) {
        setInlabOptions(extractList(resInlab.data));
      } else {
        setInlabOptions([]);
      }
    } catch (err) {
      console.error('❌ Error loading test options:', err);
    }
  };

  useEffect(() => {
    loadGeomanifestations();
  }, []);

  useEffect(() => {
    if (selectedGeoId) {
      loadReports(selectedGeoId);
      loadTestOptions(selectedGeoId);
    }
  }, [selectedGeoId]);

  const handleOpenCreate = () => {
    if (!selectedGeoId) {
      message.warning('Selecciona una geomanifestación primero');
      return;
    }
    setEditingReport(null);
    form.resetFields();
    form.setFieldsValue({ set_as_current: true });
    setModalVisible(true);
  };

  const handleOpenEdit = (record) => {
    setEditingReport(record);
    const isCurrent = currentReport && (currentReport.georeport_id || currentReport.id) === (record.georeport_id || record.id);
    form.setFieldsValue({
      georeport_name: record.georeport_name || '',
      insitu_test_id: record.insitu_test_id,
      inlab_test_id: record.inlab_test_id,
      details: record.details,
      set_as_current: isCurrent,
    });
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    const id = record.georeport_id || record.id;
    try {
      const res = await georeportsAdminDelete(id);
      if (res.ok) {
        message.success('Georeporte eliminado correctamente');
        loadReports(selectedGeoId);
      } else {
        message.error(res.error || 'Error al eliminar el georeporte');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  const handlePromote = async (record) => {
    const id = record.georeport_id || record.id;
    try {
      setPromotingId(id);
      const res = await georeportsAdminPromote(id);
      if (res.ok) {
        message.success('Georeporte promovido como vigente exitosamente');
        loadReports(selectedGeoId);
      } else {
        message.error(res.error || 'Error al promover georeporte');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setPromotingId(null);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        geomanifestation_id: selectedGeoId,
        georeport_name: values.georeport_name ? values.georeport_name.trim() : '',
        insitu_test_id: values.insitu_test_id,
        inlab_test_id: values.inlab_test_id,
        details: values.details || null,
        set_as_current: Boolean(values.set_as_current),
      };

      let res;
      if (editingReport) {
        const id = editingReport.georeport_id || editingReport.id;
        delete payload.geomanifestation_id;
        res = await georeportsAdminUpdate(id, payload);
      } else {
        res = await georeportsAdminStore(payload);
      }

      if (res.ok) {
        message.success(`Georeporte ${editingReport ? 'actualizado' : 'creado'} correctamente`);
        setModalVisible(false);
        form.resetFields();
        loadReports(selectedGeoId);
      } else {
        message.error(res.error || 'Error al guardar el georeporte');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = useMemo(() => {
    if (!searchText) return reports;
    const term = searchText.toLowerCase();
    return reports.filter((r) => {
      const name = (r.georeport_name || '').toLowerCase();
      const details = (r.details || '').toLowerCase();
      const creator = `${r.created_by_first_name || ''} ${r.created_by_last_name || ''}`.toLowerCase();
      return name.includes(term) || details.includes(term) || creator.includes(term);
    });
  }, [reports, searchText]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = reports.length;
    const withInsitu = reports.filter((r) => r.insitu_test_id).length;
    const withInlab = reports.filter((r) => r.inlab_test_id).length;
    return { total, withInsitu, withInlab };
  }, [reports]);

  const columns = [
    {
      title: 'Vigente',
      key: 'current',
      width: 85,
      align: 'center',
      render: (_, record) => {
        const isCurrent = currentReport && (currentReport.georeport_id || currentReport.id) === (record.georeport_id || record.id);
        const id = record.georeport_id || record.id;
        return isCurrent ? (
          <Tooltip title="Reporte Vigente Actual">
            <StarFilled className="text-geoterra-orange text-xl" />
          </Tooltip>
        ) : (
          <Popconfirm
            title="¿Promover este georeporte a vigente?"
            description="Se actualizará como el reporte oficial público de la manifestación."
            onConfirm={() => handlePromote(record)}
            okText="Sí, promover"
            cancelText="Cancelar"
          >
            <Tooltip title="Clic para promover a vigente">
              <Button
                type="text"
                size="small"
                loading={promotingId === id}
                icon={<StarOutlined className="text-geoterra-orange text-lg" />}
              />
            </Tooltip>
          </Popconfirm>
        );
      },
    },
    {
      title: 'Nombre',
      dataIndex: 'georeport_name',
      key: 'georeport_name',
      render: (val) => <span className="font-semibold text-gray-900">{val || 'Sin nombre'}</span>,
    },
    ...(isMaintenance ? [{
      title: 'ID Georeporte',
      dataIndex: 'georeport_id',
      key: 'georeport_id',
      render: (val, record) => <span className="font-mono text-xs font-semibold text-gray-700">{val || record.id}</span>,
    }] : []),
    {
      title: 'Prueba In-Situ',
      dataIndex: 'insitu_test_id',
      key: 'insitu_test_id',
      render: (val) => (
        isMaintenance ? (
          <span className="font-mono text-xs flex items-center gap-1 text-slate-700">
            <BulbOutlined className="text-geoterra-blue" />
            {val || 'Ninguna'}
          </span>
        ) : (
          val ? (
            <Tag className="bg-blue-50 text-geoterra-blue border-blue-200 rounded-full font-semibold text-xs">
              Vinculada
            </Tag>
          ) : (
            <Tag className="rounded-full text-xs text-gray-400">Ninguna</Tag>
          )
        )
      ),
    },
    {
      title: 'Prueba Laboratorio',
      dataIndex: 'inlab_test_id',
      key: 'inlab_test_id',
      render: (val) => (
        isMaintenance ? (
          <span className="font-mono text-xs flex items-center gap-1 text-slate-700">
            <ExperimentOutlined className="text-geoterra-orange" />
            {val || 'Ninguna'}
          </span>
        ) : (
          val ? (
            <Tag className="bg-orange-50 text-geoterra-orange border-orange-200 rounded-full font-semibold text-xs">
              Vinculada
            </Tag>
          ) : (
            <Tag className="rounded-full text-xs text-gray-400">Ninguna</Tag>
          )
        )
      ),
    },
    {
      title: 'Detalles / Notas',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (val) => val ? <span className="text-gray-600">{val}</span> : <span className="text-gray-400 italic">Sin detalles</span>,
    },
    {
      title: 'Creado por',
      key: 'creator',
      render: (_, record) => {
        const name = [record.created_by_first_name, record.created_by_last_name].filter(Boolean).join(' ');
        return <span className="text-gray-700 text-xs">{name || 'Sistema'}</span>;
      },
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
      render: (_, record) => {
        const isCurrent = currentReport && (currentReport.georeport_id || currentReport.id) === (record.georeport_id || record.id);
        const id = record.georeport_id || record.id;
        return (
          <Space size="middle">
            {!isCurrent && (
              <Popconfirm
                title="¿Promover a vigente?"
                description="Se actualizará como el reporte oficial de la manifestación."
                onConfirm={() => handlePromote(record)}
                okText="Sí, promover"
                cancelText="Cancelar"
              >
                <Tooltip title="Promover a vigente">
                  <Button
                    size="middle"
                    className="text-orange-600 hover:text-orange-700 border-orange-200"
                    loading={promotingId === id}
                    icon={<StarOutlined />}
                  >
                    Promover
                  </Button>
                </Tooltip>
              </Popconfirm>
            )}
            <Tooltip title="Editar georeporte">
              <Button
                icon={<EditOutlined />}
                size="middle"
                onClick={() => handleOpenEdit(record)}
                className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
              />
            </Tooltip>
            <Popconfirm
              title="¿Eliminar este georeporte?"
              description="Esta acción es irreversible y eliminará el georeporte."
              onConfirm={() => handleDelete(record)}
              okText="Sí, eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Eliminar georeporte">
                <Button icon={<DeleteOutlined />} size="middle" danger />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="w-full p-4 md:p-8 space-y-6 poppins">
      {/* 1. Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-geoterra-orange poppins">
              GEOCIENCIAS • CONTROL CIENTÍFICO
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-geoterra-blue m-0 poppins">
            Gestión de Georeportes
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-0 max-w-2xl">
            Navega y consolida geomanifestaciones con sus pruebas in-situ y de laboratorio.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={() => loadReports(selectedGeoId)}
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
            Nuevo Georeporte
          </Button>
        </div>
      </div>

      {/* 2. KPI Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Georeportes
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12467E] flex items-center justify-center text-lg">
              <FileSearchOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loading ? '...' : stats.total}
            </span>
            <span className="text-xs text-gray-500 font-medium">Registrados</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Manifestación seleccionada
          </div>
        </div>

        {/* KPI 2: Con Pruebas In-Situ */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Con Prueba In-Situ
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-geoterra-blue flex items-center justify-center text-lg">
              <BulbOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loading ? '...' : stats.withInsitu}
            </span>
            <span className="text-xs text-gray-500 font-medium">Mediciones</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Datos de campo vinculados
          </div>
        </div>

        {/* KPI 3: Con Pruebas de Laboratorio */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Con Prueba In-Lab
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-geoterra-orange flex items-center justify-center text-lg">
              <ExperimentOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loading ? '...' : stats.withInlab}
            </span>
            <span className="text-xs text-gray-500 font-medium">Análisis</span>
          </div>
          <div className="mt-2 text-xs text-orange-700 font-medium flex items-center gap-1">
            <GlobalOutlined /> Geoquímica consolidada
          </div>
        </div>

        {/* KPI 4: Reporte Vigente */}
        <div className="bg-[#12467E] p-5 rounded-2xl border border-blue-900 text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Reporte Vigente
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center text-lg">
              <SafetyCertificateOutlined />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold poppins text-white">
              {currentReport ? (currentReport.georeport_name || 'Vigente Asignado') : 'Sin Definir'}
            </span>
            <p className="text-xs text-blue-200 m-0 mt-0.5 font-normal">
              {currentReport ? 'Reporte oficial de la manifestación' : 'Requiere promover un reporte'}
            </p>
          </div>
          <div className="mt-3 text-[11px] text-blue-100 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Publicación científica oficial
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
          label="GEOMANIFESTACIÓN SELECCIONADA:"
        />

        {/* Current Report Banner */}
        {currentReport && (
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-geoterra-blue flex items-center justify-center text-lg flex-shrink-0">
              <StarFilled />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-geoterra-blue poppins">
                  Reporte Vigente Actual
                </span>
                {isMaintenance && (
                  <span className="font-mono text-xs text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                    ID: #{currentReport.georeport_id || currentReport.id}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 m-0 mt-0.5">
                {currentReport.georeport_name || 'Reporte Oficial'}
              </p>
              {currentReport.details && (
                <p className="text-xs text-gray-500 m-0 mt-0.5">
                  {currentReport.details}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Filter and Search Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="w-full md:w-96">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Buscar georeporte por nombre, notas o autor..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="rounded-lg py-2"
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Mostrando {filteredReports.length} de {reports.length} georeportes
          </span>
        </div>

        {/* Table */}
        <Table
          dataSource={filteredReports}
          columns={columns}
          rowKey={(item) => item.georeport_id || item.id}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} georeportes`,
          }}
          locale={{
            emptyText: selectedGeoId
              ? 'No hay georeportes registrados para esta manifestación'
              : 'Selecciona una geomanifestación',
          }}
          className="poppins border border-gray-100 rounded-xl overflow-hidden"
        />
      </div>

      {/* 4. Create / Edit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-geoterra-blue font-bold text-lg">
            <FileSearchOutlined />
            <span>{editingReport ? 'Editar Georeporte Oficial' : 'Nuevo Georeporte Oficial'}</span>
          </div>
        }
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        okText={editingReport ? 'Guardar Cambios' : 'Registrar Georeporte'}
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: '#12467E', borderColor: '#12467E' },
          className: 'poppins-bold',
        }}
        width={650}
      >
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-4 space-y-4">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="georeport_name"
              label={<span className="font-semibold text-gray-700">Nombre del Georeporte</span>}
              rules={[
                { required: true, message: 'El nombre del georeporte es obligatorio' },
                { max: 55, message: 'Máximo 55 caracteres' },
              ]}
            >
              <Input placeholder="Ej: Reporte Hidrogeológico 2026-A" maxLength={55} className="rounded-lg" />
            </Form.Item>

            <Form.Item
              name="insitu_test_id"
              label={<span className="font-semibold text-gray-700">Prueba In-Situ</span>}
              rules={[{ required: true, message: 'Selecciona una prueba in-situ' }]}
            >
              <EntityNavigatorPicker
                entityType="insitu_tests"
                items={insituOptions}
                mode="compact"
              />
            </Form.Item>

            <Form.Item
              name="inlab_test_id"
              label={<span className="font-semibold text-gray-700">Prueba de Laboratorio</span>}
              rules={[{ required: true, message: 'Selecciona una prueba de laboratorio' }]}
            >
              <EntityNavigatorPicker
                entityType="inlab_tests"
                items={inlabOptions}
                mode="compact"
              />
            </Form.Item>

            <Form.Item
              name="details"
              label={<span className="font-semibold text-gray-700">Notas / Detalles del Georeporte</span>}
              rules={[{ max: 500, message: 'Máximo 500 caracteres' }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Notas consolidadas del reporte..."
                maxLength={500}
                showCount
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item name="set_as_current" valuePropName="checked" className="m-0">
              <Checkbox className="font-medium text-gray-700">
                Establecer como el reporte vigente de la manifestación
              </Checkbox>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default GeoreportsManager;
