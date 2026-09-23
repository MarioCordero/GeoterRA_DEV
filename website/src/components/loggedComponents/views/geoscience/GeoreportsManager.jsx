import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Button, Modal, Form, Input, Checkbox, Table, message, Space, Spin, Popconfirm, Tooltip } from 'antd';
import {
  FileSearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  BulbOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import EntityNavigatorPicker from '../../../common/EntityNavigatorPicker';
import { renderDateWithProse } from '../../../../utils/dateFormatter';
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

const { Title, Paragraph, Text } = Typography;

const extractList = (resData) => {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData.data)) return resData.data;
  if (Array.isArray(resData.data?.data)) return resData.data.data;
  if (Array.isArray(resData.items)) return resData.items;
  return [];
};

const GeoreportsManager = () => {
  const [manifestations, setManifestations] = useState([]);
  const [selectedGeoId, setSelectedGeoId] = useState(null);
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [insituOptions, setInsituOptions] = useState([]);
  const [inlabOptions, setInlabOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGeos, setLoadingGeos] = useState(true);
  const [promotingId, setPromotingId] = useState(null);

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

      // Load all reports for this geomanifestation
      const resIndex = await georeportsAdminIndex({ geomanifestation_id: geoId });
      if (resIndex.ok && resIndex.data) {
        const list = extractList(resIndex.data);
        setReports(list);
      } else {
        setReports([]);
      }

      // Load current report
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
            <StarFilled style={{ color: '#fa8c16', fontSize: 20 }} />
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
                icon={<StarOutlined style={{ color: '#fa8c16', fontSize: 18 }} />}
              />
            </Tooltip>
          </Popconfirm>
        );
      },
    },
    {
      title: 'ID Georeporte',
      dataIndex: 'georeport_id',
      key: 'georeport_id',
      render: (val, record) => <span className="font-mono text-xs font-semibold text-gray-700">{val || record.id}</span>,
    },
    {
      title: 'Prueba In-Situ',
      dataIndex: 'insitu_test_id',
      key: 'insitu_test_id',
      render: (val) => (
        <span className="font-mono text-xs flex items-center gap-1 text-cyan-700">
          <BulbOutlined style={{ color: '#13c2c2' }} />
          {val || 'Ninguna'}
        </span>
      ),
    },
    {
      title: 'Prueba Laboratorio',
      dataIndex: 'inlab_test_id',
      key: 'inlab_test_id',
      render: (val) => (
        <span className="font-mono text-xs flex items-center gap-1 text-purple-700">
          <ExperimentOutlined style={{ color: '#722ed1' }} />
          {val || 'Ninguna'}
        </span>
      ),
    },
    {
      title: 'Detalles / Notas',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (val) => val || <Text type="secondary">Sin detalles</Text>,
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
          <Space size="small">
            {!isCurrent && (
              <Popconfirm
                title="¿Promover a vigente?"
                onConfirm={() => handlePromote(record)}
                okText="Sí"
                cancelText="No"
              >
                <Tooltip title="Promover a vigente">
                  <Button
                    size="small"
                    style={{ color: '#fa8c16', borderColor: '#ffd591' }}
                    loading={promotingId === id}
                    icon={<StarOutlined />}
                  >
                    Promover
                  </Button>
                </Tooltip>
              </Popconfirm>
            )}
            <Button icon={<EditOutlined />} size="small" type="primary" onClick={() => handleOpenEdit(record)} />
            <Popconfirm title="¿Eliminar este georeporte?" onConfirm={() => handleDelete(record)} okText="Sí" cancelText="No">
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileSearchOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Gestión de Georeportes</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Navega y consolida geomanifestaciones con sus pruebas in-situ y de laboratorio.
              </Paragraph>
            </div>
          </div>

          <Space flexWrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              disabled={!selectedGeoId}
              style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
            >
              Nuevo Georeporte
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => loadReports(selectedGeoId)}
              loading={loading}
              disabled={!selectedGeoId}
            >
              Actualizar Listado
            </Button>
          </Space>
        </div>

        <EntityNavigatorPicker
          entityType="geomanifestations"
          selectedId={selectedGeoId}
          onSelect={(id) => setSelectedGeoId(id)}
          items={manifestations}
          loading={loadingGeos}
          onRefresh={loadGeomanifestations}
          label="GEOMANIFESTACIÓN SELECCIONADA:"
        />

        {currentReport && (
          <Card size="small" style={{ marginBottom: 16, borderLeft: '4px solid #fa8c16', background: '#fffbe6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <StarFilled style={{ color: '#fa8c16', fontSize: 18 }} />
              <Text strong style={{ color: '#d46b08' }}>Reporte Vigente Actual:</Text>
              <span className="font-mono text-xs bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                {currentReport.georeport_id || currentReport.id}
              </span>
              <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>
              <Text type="secondary">{currentReport.details || 'Sin detalles'}</Text>
            </div>
          </Card>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="Cargando georeportes..." />
          </div>
        ) : (
          <Table
            dataSource={reports}
            columns={columns}
            rowKey={(item) => item.georeport_id || item.id}
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
            locale={{ emptyText: selectedGeoId ? 'No hay georeportes registrados para esta manifestación' : 'Selecciona una geomanifestación' }}
          />
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        title={editingReport ? 'Editar Georeporte' : 'Nuevo Georeporte'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        okText={editingReport ? 'Guardar Cambios' : 'Crear Georeporte'}
        cancelText="Cancelar"
        width={650}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="insitu_test_id"
            label="Prueba In-Situ"
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
            label="Prueba de Laboratorio"
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
            label="Notas / Detalles del Georeporte"
            rules={[{ max: 500, message: 'Máximo 500 caracteres' }]}
          >
            <Input.TextArea rows={3} placeholder="Notas consolidadas del reporte..." maxLength={500} showCount />
          </Form.Item>

          <Form.Item name="set_as_current" valuePropName="checked">
            <Checkbox>Establecer como el reporte vigente de la manifestación</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GeoreportsManager;