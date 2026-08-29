import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Button, Modal, Form, Input, InputNumber, Select, Table, message, Space, Spin, Tabs, Popconfirm } from 'antd';
import { GlobalOutlined, PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  provincesIndex,
  provincesAdminStore,
  provincesAdminUpdate,
  provincesAdminDelete,
  cantonsIndex,
  cantonsAdminStore,
  cantonsAdminUpdate,
  cantonsAdminDelete,
  districtsIndex,
  districtsAdminStore,
  districtsAdminUpdate,
  districtsAdminDelete
} from '../../../../config/apiConf';

const { Title, Paragraph, Text } = Typography;

const TerritoryManager = () => {
  const [activeTab, setActiveTab] = useState('1');

  // Provinces state
  const [provinces, setProvinces] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [provinceModalVisible, setProvinceModalVisible] = useState(false);
  const [editingProvince, setEditingProvince] = useState(null);
  const [provinceForm] = Form.useForm();
  const [submittingProvince, setSubmittingProvince] = useState(false);

  // Cantons state
  const [cantons, setCantons] = useState([]);
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState(null);
  const [loadingCantons, setLoadingCantons] = useState(false);
  const [cantonModalVisible, setCantonModalVisible] = useState(false);
  const [editingCanton, setEditingCanton] = useState(null);
  const [cantonForm] = Form.useForm();
  const [submittingCanton, setSubmittingCanton] = useState(false);

  // Districts state
  const [districts, setDistricts] = useState([]);
  const [selectedCantonFilter, setSelectedCantonFilter] = useState(null);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [districtForm] = Form.useForm();
  const [submittingDistrict, setSubmittingDistrict] = useState(false);

  // --- PROVINCES CRUD ---
  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const res = await provincesIndex();
      if (res.ok && Array.isArray(res.data)) {
        setProvinces(res.data);
      } else {
        setProvinces([]);
      }
    } catch (err) {
      console.error('❌ Error loading provinces:', err);
      setProvinces([]);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const handleOpenCreateProvince = () => {
    setEditingProvince(null);
    provinceForm.resetFields();
    setProvinceModalVisible(true);
  };

  const handleOpenEditProvince = (record) => {
    setEditingProvince(record);
    provinceForm.setFieldsValue({
      province_snit_code: record.province_snit_code,
      province_name: record.province_name,
    });
    setProvinceModalVisible(true);
  };

  const handleDeleteProvince = async (record) => {
    const id = record.province_id || record.id;
    try {
      const res = await provincesAdminDelete(id);
      if (res.ok) {
        message.success('Provincia eliminada correctamente');
        loadProvinces();
      } else {
        message.error(res.error || 'Error al eliminar la provincia');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  const handleSubmitProvince = async (values) => {
    try {
      setSubmittingProvince(true);
      const payload = {
        province_snit_code: parseInt(values.province_snit_code, 10),
        province_name: values.province_name,
      };

      let res;
      if (editingProvince) {
        const id = editingProvince.province_id || editingProvince.id;
        res = await provincesAdminUpdate(id, payload);
      } else {
        res = await provincesAdminStore(payload);
      }

      if (res.ok) {
        message.success(`Provincia ${editingProvince ? 'actualizada' : 'creada'} correctamente`);
        setProvinceModalVisible(false);
        provinceForm.resetFields();
        loadProvinces();
      } else {
        message.error(res.error || 'Error al guardar provincia');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setSubmittingProvince(false);
    }
  };

  // --- CANTONS CRUD ---
  const loadCantons = async (provCode) => {
    try {
      setLoadingCantons(true);
      const res = await cantonsIndex(provCode);
      if (res.ok && Array.isArray(res.data)) {
        setCantons(res.data);
      } else {
        setCantons([]);
      }
    } catch (err) {
      console.error('❌ Error loading cantons:', err);
      setCantons([]);
    } finally {
      setLoadingCantons(false);
    }
  };

  const handleOpenCreateCanton = () => {
    setEditingCanton(null);
    cantonForm.resetFields();
    if (selectedProvinceFilter) {
      cantonForm.setFieldsValue({ province_snit_code: selectedProvinceFilter });
    }
    setCantonModalVisible(true);
  };

  const handleOpenEditCanton = (record) => {
    setEditingCanton(record);
    cantonForm.setFieldsValue({
      province_snit_code: record.province_snit_code,
      canton_snit_code: record.canton_snit_code,
      canton_name: record.canton_name,
    });
    setCantonModalVisible(true);
  };

  const handleDeleteCanton = async (record) => {
    const id = record.canton_id || record.id;
    try {
      const res = await cantonsAdminDelete(id);
      if (res.ok) {
        message.success('Cantón eliminado correctamente');
        loadCantons(selectedProvinceFilter);
      } else {
        message.error(res.error || 'Error al eliminar cantón');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  const handleSubmitCanton = async (values) => {
    try {
      setSubmittingCanton(true);
      const payload = {
        province_snit_code: parseInt(values.province_snit_code, 10),
        canton_snit_code: parseInt(values.canton_snit_code, 10),
        canton_name: values.canton_name,
      };

      let res;
      if (editingCanton) {
        const id = editingCanton.canton_id || editingCanton.id;
        res = await cantonsAdminUpdate(id, payload);
      } else {
        res = await cantonsAdminStore(payload);
      }

      if (res.ok) {
        message.success(`Cantón ${editingCanton ? 'actualizado' : 'creado'} correctamente`);
        setCantonModalVisible(false);
        cantonForm.resetFields();
        loadCantons(selectedProvinceFilter);
      } else {
        message.error(res.error || 'Error al guardar cantón');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setSubmittingCanton(false);
    }
  };

  // --- DISTRICTS CRUD ---
  const loadDistricts = async (cantonCode) => {
    try {
      setLoadingDistricts(true);
      const res = await districtsIndex(cantonCode);
      if (res.ok && Array.isArray(res.data)) {
        setDistricts(res.data);
      } else {
        setDistricts([]);
      }
    } catch (err) {
      console.error('❌ Error loading districts:', err);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleOpenCreateDistrict = () => {
    setEditingDistrict(null);
    districtForm.resetFields();
    if (selectedCantonFilter) {
      districtForm.setFieldsValue({ canton_snit_code: selectedCantonFilter });
    }
    setDistrictModalVisible(true);
  };

  const handleOpenEditDistrict = (record) => {
    setEditingDistrict(record);
    districtForm.setFieldsValue({
      canton_snit_code: record.canton_snit_code,
      district_snit_code: record.district_snit_code,
      district_name: record.district_name,
    });
    setDistrictModalVisible(true);
  };

  const handleDeleteDistrict = async (record) => {
    const id = record.district_id || record.id;
    try {
      const res = await districtsAdminDelete(id);
      if (res.ok) {
        message.success('Distrito eliminado correctamente');
        loadDistricts(selectedCantonFilter);
      } else {
        message.error(res.error || 'Error al eliminar distrito');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  const handleSubmitDistrict = async (values) => {
    try {
      setSubmittingDistrict(true);
      const payload = {
        canton_snit_code: parseInt(values.canton_snit_code, 10),
        district_snit_code: parseInt(values.district_snit_code, 10),
        district_name: values.district_name,
      };

      let res;
      if (editingDistrict) {
        const id = editingDistrict.district_id || editingDistrict.id;
        res = await districtsAdminUpdate(id, payload);
      } else {
        res = await districtsAdminStore(payload);
      }

      if (res.ok) {
        message.success(`Distrito ${editingDistrict ? 'actualizado' : 'creado'} correctamente`);
        setDistrictModalVisible(false);
        districtForm.resetFields();
        loadDistricts(selectedCantonFilter);
      } else {
        message.error(res.error || 'Error al guardar distrito');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setSubmittingDistrict(false);
    }
  };

  useEffect(() => {
    loadProvinces();
    loadCantons(null);
    loadDistricts(null);
  }, []);

  const columnsProvinces = [
    {
      title: 'Código SNIT',
      dataIndex: 'province_snit_code',
      key: 'province_snit_code',
      render: (val) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: 'Nombre de Provincia',
      dataIndex: 'province_name',
      key: 'province_name',
      render: (val) => <span className="font-semibold text-gray-800">{val}</span>,
    },
    {
      title: 'ULID ID',
      dataIndex: 'province_id',
      key: 'province_id',
      render: (val, r) => <span className="font-mono text-xs text-gray-500">{val || r.id}</span>,
    },
    {
      title: 'Fecha Registro',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" type="primary" onClick={() => handleOpenEditProvince(record)} />
          <Popconfirm title="¿Eliminar provincia? Se eliminarán cantones y distritos asociados." onConfirm={() => handleDeleteProvince(record)} okText="Sí" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columnsCantons = [
    {
      title: 'Provincia (SNIT)',
      dataIndex: 'province_snit_code',
      key: 'province_snit_code',
      render: (val) => {
        const prov = provinces.find(p => p.province_snit_code === val);
        return prov ? `${prov.province_name} (${val})` : `SNIT: ${val}`;
      },
    },
    {
      title: 'Código SNIT Cantón',
      dataIndex: 'canton_snit_code',
      key: 'canton_snit_code',
      render: (val) => <Tag color="cyan">{val}</Tag>,
    },
    {
      title: 'Nombre de Cantón',
      dataIndex: 'canton_name',
      key: 'canton_name',
      render: (val) => <span className="font-semibold text-gray-800">{val}</span>,
    },
    {
      title: 'ULID ID',
      dataIndex: 'canton_id',
      key: 'canton_id',
      render: (val, r) => <span className="font-mono text-xs text-gray-500">{val || r.id}</span>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" type="primary" onClick={() => handleOpenEditCanton(record)} />
          <Popconfirm title="¿Eliminar cantón? Se eliminarán distritos asociados." onConfirm={() => handleDeleteCanton(record)} okText="Sí" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columnsDistricts = [
    {
      title: 'Cantón (SNIT)',
      dataIndex: 'canton_snit_code',
      key: 'canton_snit_code',
      render: (val) => `SNIT: ${val}`,
    },
    {
      title: 'Código SNIT Distrito',
      dataIndex: 'district_snit_code',
      key: 'district_snit_code',
      render: (val) => <Tag color="purple">{val}</Tag>,
    },
    {
      title: 'Nombre de Distrito',
      dataIndex: 'district_name',
      key: 'district_name',
      render: (val) => <span className="font-semibold text-gray-800">{val}</span>,
    },
    {
      title: 'ULID ID',
      dataIndex: 'district_id',
      key: 'district_id',
      render: (val, r) => <span className="font-mono text-xs text-gray-500">{val || r.id}</span>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" type="primary" onClick={() => handleOpenEditDistrict(record)} />
          <Popconfirm title="¿Eliminar distrito?" onConfirm={() => handleDeleteDistrict(record)} okText="Sí" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: '1',
      label: 'Provincias',
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text type="secondary">Provincias oficiales registradas en la división territorial del SNIT.</Text>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateProvince}>Nueva Provincia</Button>
          </div>
          <Table
            dataSource={provinces}
            columns={columnsProvinces}
            rowKey={(r) => r.province_id || r.province_snit_code}
            loading={loadingProvinces}
            pagination={{ pageSize: 10 }}
          />
        </div>
      ),
    },
    {
      key: '2',
      label: 'Cantones',
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text strong>Filtrar por Provincia:</Text>
              <Select
                style={{ width: 220 }}
                placeholder="Todas las provincias"
                allowClear
                value={selectedProvinceFilter}
                onChange={(val) => {
                  setSelectedProvinceFilter(val);
                  loadCantons(val);
                }}
              >
                {provinces.map(p => (
                  <Select.Option key={p.province_snit_code} value={p.province_snit_code}>
                    {p.province_name}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateCanton}>Nuevo Cantón</Button>
          </div>
          <Table
            dataSource={cantons}
            columns={columnsCantons}
            rowKey={(r) => r.canton_id || r.canton_snit_code}
            loading={loadingCantons}
            pagination={{ pageSize: 10 }}
          />
        </div>
      ),
    },
    {
      key: '3',
      label: 'Distritos',
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text strong>Filtrar por Cantón (SNIT):</Text>
              <InputNumber
                placeholder="Ej: 101"
                value={selectedCantonFilter}
                onChange={(val) => {
                  setSelectedCantonFilter(val);
                  loadDistricts(val);
                }}
              />
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateDistrict}>Nuevo Distrito</Button>
          </div>
          <Table
            dataSource={districts}
            columns={columnsDistricts}
            rowKey={(r) => r.district_id || r.district_snit_code}
            loading={loadingDistricts}
            pagination={{ pageSize: 10 }}
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
            <GlobalOutlined style={{ fontSize: 32, color: '#1890ff' }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Gestión de División Territorial</Title>
              <Tag color="processing">Administración de Provincias, Cantones y Distritos (SNIT)</Tag>
            </div>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              loadProvinces();
              loadCantons(selectedProvinceFilter);
              loadDistricts(selectedCantonFilter);
            }}
          >
            Actualizar
          </Button>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* Province Modal */}
      <Modal
        title={editingProvince ? 'Editar Provincia' : 'Nueva Provincia'}
        open={provinceModalVisible}
        onOk={() => provinceForm.submit()}
        onCancel={() => setProvinceModalVisible(false)}
        confirmLoading={submittingProvince}
        okText={editingProvince ? 'Guardar Cambios' : 'Crear Provincia'}
        cancelText="Cancelar"
      >
        <Form form={provinceForm} layout="vertical" onFinish={handleSubmitProvince}>
          <Form.Item name="province_snit_code" label="Código SNIT de Provincia" rules={[{ required: true, message: 'Requerido' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="Ej: 1" min={1} disabled={Boolean(editingProvince)} />
          </Form.Item>
          <Form.Item name="province_name" label="Nombre de Provincia" rules={[{ required: true, message: 'Requerido' }, { max: 55, message: 'Máx 55 caracteres' }]}>
            <Input placeholder="Ej: San José" maxLength={55} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Canton Modal */}
      <Modal
        title={editingCanton ? 'Editar Cantón' : 'Nuevo Cantón'}
        open={cantonModalVisible}
        onOk={() => cantonForm.submit()}
        onCancel={() => setCantonModalVisible(false)}
        confirmLoading={submittingCanton}
        okText={editingCanton ? 'Guardar Cambios' : 'Crear Cantón'}
        cancelText="Cancelar"
      >
        <Form form={cantonForm} layout="vertical" onFinish={handleSubmitCanton}>
          <Form.Item name="province_snit_code" label="Provincia Padre (SNIT)" rules={[{ required: true, message: 'Requerido' }]}>
            <Select placeholder="Selecciona provincia">
              {provinces.map(p => (
                <Select.Option key={p.province_snit_code} value={p.province_snit_code}>
                  {p.province_name} ({p.province_snit_code})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="canton_snit_code" label="Código SNIT de Cantón" rules={[{ required: true, message: 'Requerido' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="Ej: 101" min={1} disabled={Boolean(editingCanton)} />
          </Form.Item>
          <Form.Item name="canton_name" label="Nombre del Cantón" rules={[{ required: true, message: 'Requerido' }, { max: 55, message: 'Máx 55 caracteres' }]}>
            <Input placeholder="Ej: Central" maxLength={55} />
          </Form.Item>
        </Form>
      </Modal>

      {/* District Modal */}
      <Modal
        title={editingDistrict ? 'Editar Distrito' : 'Nuevo Distrito'}
        open={districtModalVisible}
        onOk={() => districtForm.submit()}
        onCancel={() => setDistrictModalVisible(false)}
        confirmLoading={submittingDistrict}
        okText={editingDistrict ? 'Guardar Cambios' : 'Crear Distrito'}
        cancelText="Cancelar"
      >
        <Form form={districtForm} layout="vertical" onFinish={handleSubmitDistrict}>
          <Form.Item name="canton_snit_code" label="Código SNIT del Cantón Padre" rules={[{ required: true, message: 'Requerido' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="Ej: 101" min={1} />
          </Form.Item>
          <Form.Item name="district_snit_code" label="Código SNIT de Distrito" rules={[{ required: true, message: 'Requerido' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="Ej: 10101" min={1} disabled={Boolean(editingDistrict)} />
          </Form.Item>
          <Form.Item name="district_name" label="Nombre del Distrito" rules={[{ required: true, message: 'Requerido' }, { max: 55, message: 'Máx 55 caracteres' }]}>
            <Input placeholder="Ej: Carmen" maxLength={55} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TerritoryManager;