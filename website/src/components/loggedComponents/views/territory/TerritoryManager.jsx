import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Typography,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  message,
  Space,
  Spin,
  Tabs,
  Popconfirm,
  Tooltip
} from 'antd';
import {
  GlobalOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  CompassOutlined,
  ApartmentOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import '../../../../colorModule.css';
import '../../../../fontsModule.css';
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

const { Title, Text, Paragraph } = Typography;

const TerritoryManager = () => {
  const [activeTab, setActiveTab] = useState('1');

  // Search queries per tab
  const [searchProvince, setSearchProvince] = useState('');
  const [searchCanton, setSearchCanton] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');

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

  const refreshAll = () => {
    loadProvinces();
    loadCantons(selectedProvinceFilter);
    loadDistricts(selectedCantonFilter);
  };

  useEffect(() => {
    loadProvinces();
    loadCantons(null);
    loadDistricts(null);
  }, []);

  // Filtered lists based on search terms
  const filteredProvinces = useMemo(() => {
    if (!searchProvince) return provinces;
    const term = searchProvince.toLowerCase();
    return provinces.filter(p =>
      (p.province_name && p.province_name.toLowerCase().includes(term)) ||
      String(p.province_snit_code).includes(term) ||
      (p.province_id && p.province_id.toLowerCase().includes(term))
    );
  }, [provinces, searchProvince]);

  const filteredCantons = useMemo(() => {
    if (!searchCanton) return cantons;
    const term = searchCanton.toLowerCase();
    return cantons.filter(c =>
      (c.canton_name && c.canton_name.toLowerCase().includes(term)) ||
      String(c.canton_snit_code).includes(term) ||
      String(c.province_snit_code).includes(term) ||
      (c.canton_id && c.canton_id.toLowerCase().includes(term))
    );
  }, [cantons, searchCanton]);

  const filteredDistricts = useMemo(() => {
    if (!searchDistrict) return districts;
    const term = searchDistrict.toLowerCase();
    return districts.filter(d =>
      (d.district_name && d.district_name.toLowerCase().includes(term)) ||
      String(d.district_snit_code).includes(term) ||
      String(d.canton_snit_code).includes(term) ||
      (d.district_id && d.district_id.toLowerCase().includes(term))
    );
  }, [districts, searchDistrict]);

  // Province columns
  const columnsProvinces = [
    {
      title: 'Código SNIT',
      dataIndex: 'province_snit_code',
      key: 'province_snit_code',
      width: 140,
      render: (val) => (
        <span className="font-mono bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-md font-bold text-xs">
          SNIT: {val}
        </span>
      ),
    },
    {
      title: 'Nombre de Provincia',
      dataIndex: 'province_name',
      key: 'province_name',
      render: (val) => (
        <div className="flex items-center gap-2">
          <CompassOutlined className="text-[#12467E] text-base" />
          <span className="font-bold text-[#12467E] text-base">{val}</span>
        </div>
      ),
    },
    {
      title: 'ID Sistema (ULID)',
      dataIndex: 'province_id',
      key: 'province_id',
      render: (val, r) => (
        <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
          {val || r.id}
        </span>
      ),
    },
    {
      title: 'Fecha Registro',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => (
        <span className="text-xs text-gray-600">
          {val ? new Date(val).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Oficial Base'}
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar provincia">
            <Button
              icon={<EditOutlined />}
              size="middle"
              onClick={() => handleOpenEditProvince(record)}
              className="text-[#12467E] hover:text-[#0d3460] border-gray-300"
            />
          </Tooltip>
          <Popconfirm
            title="¿Eliminar provincia?"
            description="Se eliminarán cantones y distritos asociados a esta provincia."
            onConfirm={() => handleDeleteProvince(record)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Eliminar provincia">
              <Button icon={<DeleteOutlined />} size="middle" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Canton columns
  const columnsCantons = [
    {
      title: 'Código Cantón',
      dataIndex: 'canton_snit_code',
      key: 'canton_snit_code',
      width: 140,
      render: (val) => (
        <span className="font-mono bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-1 rounded-md font-bold text-xs">
          SNIT: {val}
        </span>
      ),
    },
    {
      title: 'Nombre del Cantón',
      dataIndex: 'canton_name',
      key: 'canton_name',
      render: (val) => (
        <div className="flex items-center gap-2">
          <ApartmentOutlined className="text-[#12467E] text-base" />
          <span className="font-bold text-[#12467E] text-base">{val}</span>
        </div>
      ),
    },
    {
      title: 'Provincia Perteneciente',
      dataIndex: 'province_snit_code',
      key: 'province_snit_code',
      render: (val) => {
        const prov = provinces.find(p => p.province_snit_code === val);
        return (
          <Tag color="geekblue" className="px-2.5 py-0.5 rounded font-medium">
            {prov ? `${prov.province_name} (${val})` : `Provincia #${val}`}
          </Tag>
        );
      },
    },
    {
      title: 'ID Sistema (ULID)',
      dataIndex: 'canton_id',
      key: 'canton_id',
      render: (val, r) => (
        <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
          {val || r.id}
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar cantón">
            <Button
              icon={<EditOutlined />}
              size="middle"
              onClick={() => handleOpenEditCanton(record)}
              className="text-[#12467E] hover:text-[#0d3460] border-gray-300"
            />
          </Tooltip>
          <Popconfirm
            title="¿Eliminar cantón?"
            description="Se eliminarán los distritos asociados a este cantón."
            onConfirm={() => handleDeleteCanton(record)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Eliminar cantón">
              <Button icon={<DeleteOutlined />} size="middle" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // District columns
  const columnsDistricts = [
    {
      title: 'Código Distrito',
      dataIndex: 'district_snit_code',
      key: 'district_snit_code',
      width: 140,
      render: (val) => (
        <span className="font-mono bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1 rounded-md font-bold text-xs">
          SNIT: {val}
        </span>
      ),
    },
    {
      title: 'Nombre del Distrito',
      dataIndex: 'district_name',
      key: 'district_name',
      render: (val) => (
        <div className="flex items-center gap-2">
          <EnvironmentOutlined className="text-[#12467E] text-base" />
          <span className="font-bold text-[#12467E] text-base">{val}</span>
        </div>
      ),
    },
    {
      title: 'Cantón SNIT',
      dataIndex: 'canton_snit_code',
      key: 'canton_snit_code',
      render: (val) => (
        <Tag color="cyan" className="px-2.5 py-0.5 rounded font-mono font-medium">
          Cantón #{val}
        </Tag>
      ),
    },
    {
      title: 'ID Sistema (ULID)',
      dataIndex: 'district_id',
      key: 'district_id',
      render: (val, r) => (
        <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
          {val || r.id}
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar distrito">
            <Button
              icon={<EditOutlined />}
              size="middle"
              onClick={() => handleOpenEditDistrict(record)}
              className="text-[#12467E] hover:text-[#0d3460] border-gray-300"
            />
          </Tooltip>
          <Popconfirm
            title="¿Eliminar distrito?"
            description="¿Estás seguro de que deseas eliminar este distrito?"
            onConfirm={() => handleDeleteDistrict(record)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Eliminar distrito">
              <Button icon={<DeleteOutlined />} size="middle" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full p-4 md:p-8 space-y-6 poppins">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-geoterra-orange poppins">
              DIVISIÓN TERRITORIAL • CARTOGRAFÍA SNIT
            </span>
            <Tag color="blue" className="m-0 text-[11px] font-semibold">
              Oficial GeoterRA
            </Tag>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-geoterra-blue m-0 poppins">
            División Territorial de Costa Rica
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-0 max-w-2xl">
            Gestión y codificación oficial de Provincias, Cantones y Distritos según la estructura geográfica del SNIT.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshAll}
            className="poppins font-medium border-gray-300"
          >
            Actualizar
          </Button>

          {activeTab === '1' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateProvince}
              style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
              className="poppins-bold shadow-sm"
            >
              Nueva Provincia
            </Button>
          )}

          {activeTab === '2' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateCanton}
              style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
              className="poppins-bold shadow-sm"
            >
              Nuevo Cantón
            </Button>
          )}

          {activeTab === '3' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateDistrict}
              style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
              className="poppins-bold shadow-sm"
            >
              Nuevo Distrito
            </Button>
          )}
        </div>
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Provincias */}
        <div
          onClick={() => setActiveTab('1')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeTab === '1' ? 'border-[#12467E] ring-2 ring-blue-100' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Nivel 1 • Provincias
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12467E] flex items-center justify-center text-lg">
              <CompassOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loadingProvinces ? '...' : provinces.length}
            </span>
            <span className="text-xs text-gray-500 font-medium">Registradas</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> División primaria SNIT
          </div>
        </div>

        {/* KPI 2: Cantones */}
        <div
          onClick={() => setActiveTab('2')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeTab === '2' ? 'border-[#12467E] ring-2 ring-blue-100' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Nivel 2 • Cantones
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center text-lg">
              <ApartmentOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loadingCantons ? '...' : cantons.length}
            </span>
            <span className="text-xs text-gray-500 font-medium">Activos</span>
          </div>
          <div className="mt-2 text-xs text-cyan-700 font-medium flex items-center gap-1">
            <FilterOutlined /> Filtrables por provincia
          </div>
        </div>

        {/* KPI 3: Distritos */}
        <div
          onClick={() => setActiveTab('3')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeTab === '3' ? 'border-[#12467E] ring-2 ring-blue-100' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Nivel 3 • Distritos
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-lg">
              <EnvironmentOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loadingDistricts ? '...' : districts.length}
            </span>
            <span className="text-xs text-gray-500 font-medium">Unidades</span>
          </div>
          <div className="mt-2 text-xs text-purple-700 font-medium flex items-center gap-1">
            <GlobalOutlined /> Cobertura geotérmica
          </div>
        </div>

        {/* KPI 4: Cartografía SNIT */}
        <div className="bg-gradient-to-br from-slate-900 to-[#12467E] p-5 rounded-2xl border border-gray-800 text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Estándar Cartográfico
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center text-lg">
              <SafetyCertificateOutlined />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold poppins text-white">CRTM05</span>
            <p className="text-xs text-blue-200 m-0 mt-0.5 font-normal">
              Proyección cartográfica oficial del IGN / SNIT
            </p>
          </div>
          <div className="mt-3 text-[11px] text-emerald-300 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Coordenadas WGS84 compatibles
          </div>
        </div>
      </div>

      {/* Tabs and Content Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        {/* Navigation Tabs Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('1')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === '1'
                  ? 'bg-[#12467E] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CompassOutlined />
              <span>Provincias</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === '1' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {provinces.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('2')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === '2'
                  ? 'bg-[#12467E] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ApartmentOutlined />
              <span>Cantones</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === '2' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {cantons.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('3')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === '3'
                  ? 'bg-[#12467E] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <EnvironmentOutlined />
              <span>Distritos</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === '3' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {districts.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Provincias */}
        {activeTab === '1' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="w-full md:w-96">
                <Input
                  prefix={<SearchOutlined className="text-gray-400" />}
                  placeholder="Buscar provincia por nombre o código..."
                  value={searchProvince}
                  onChange={(e) => setSearchProvince(e.target.value)}
                  allowClear
                  className="rounded-lg py-2"
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Mostrando {filteredProvinces.length} de {provinces.length} provincias
              </span>
            </div>

            <Table
              dataSource={filteredProvinces}
              columns={columnsProvinces}
              rowKey={(r) => r.province_id || r.province_snit_code}
              loading={loadingProvinces}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} provincias`,
              }}
              className="poppins border border-gray-100 rounded-xl overflow-hidden"
            />
          </div>
        )}

        {/* Tab 2: Cantones */}
        {activeTab === '2' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="w-full md:w-80">
                  <Input
                    prefix={<SearchOutlined className="text-gray-400" />}
                    placeholder="Buscar cantón por nombre o código..."
                    value={searchCanton}
                    onChange={(e) => setSearchCanton(e.target.value)}
                    allowClear
                    className="rounded-lg py-2"
                  />
                </div>

                <Select
                  style={{ minWidth: 220 }}
                  placeholder="Filtrar por Provincia"
                  allowClear
                  value={selectedProvinceFilter}
                  onChange={(val) => {
                    setSelectedProvinceFilter(val);
                    loadCantons(val);
                  }}
                  className="rounded-lg"
                >
                  {provinces.map((p) => (
                    <Select.Option key={p.province_snit_code} value={p.province_snit_code}>
                      {p.province_name} ({p.province_snit_code})
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <span className="text-xs text-gray-500 font-medium">
                Mostrando {filteredCantons.length} de {cantons.length} cantones
              </span>
            </div>

            <Table
              dataSource={filteredCantons}
              columns={columnsCantons}
              rowKey={(r) => r.canton_id || r.canton_snit_code}
              loading={loadingCantons}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} cantones`,
              }}
              className="poppins border border-gray-100 rounded-xl overflow-hidden"
            />
          </div>
        )}

        {/* Tab 3: Distritos */}
        {activeTab === '3' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="w-full md:w-80">
                  <Input
                    prefix={<SearchOutlined className="text-gray-400" />}
                    placeholder="Buscar distrito por nombre o código..."
                    value={searchDistrict}
                    onChange={(e) => setSearchDistrict(e.target.value)}
                    allowClear
                    className="rounded-lg py-2"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">Cantón SNIT:</span>
                  <InputNumber
                    placeholder="Ej: 101"
                    value={selectedCantonFilter}
                    onChange={(val) => {
                      setSelectedCantonFilter(val);
                      loadDistricts(val);
                    }}
                    className="rounded-lg"
                  />
                </div>
              </div>

              <span className="text-xs text-gray-500 font-medium">
                Mostrando {filteredDistricts.length} de {districts.length} distritos
              </span>
            </div>

            <Table
              dataSource={filteredDistricts}
              columns={columnsDistricts}
              rowKey={(r) => r.district_id || r.district_snit_code}
              loading={loadingDistricts}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} distritos`,
              }}
              className="poppins border border-gray-100 rounded-xl overflow-hidden"
            />
          </div>
        )}
      </div>

      {/* Province Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-geoterra-blue font-bold text-lg">
            <CompassOutlined />
            <span>{editingProvince ? 'Editar Provincia Oficial' : 'Nueva Provincia Oficial'}</span>
          </div>
        }
        open={provinceModalVisible}
        onOk={() => provinceForm.submit()}
        onCancel={() => setProvinceModalVisible(false)}
        confirmLoading={submittingProvince}
        okText={editingProvince ? 'Guardar Cambios' : 'Registrar Provincia'}
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: '#12467E', borderColor: '#12467E' },
          className: 'poppins-bold',
        }}
        width={520}
      >
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-4 space-y-4">
          <Form form={provinceForm} layout="vertical" onFinish={handleSubmitProvince}>
            <Form.Item
              name="province_snit_code"
              label={<span className="font-semibold text-gray-700">Código SNIT de Provincia</span>}
              rules={[{ required: true, message: 'El código SNIT es obligatorio' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Ej: 1 (San José), 2 (Alajuela), etc."
                min={1}
                disabled={Boolean(editingProvince)}
                className="rounded-lg"
              />
            </Form.Item>
            <Form.Item
              name="province_name"
              label={<span className="font-semibold text-gray-700">Nombre Oficial de la Provincia</span>}
              rules={[
                { required: true, message: 'El nombre es obligatorio' },
                { max: 55, message: 'Máximo 55 caracteres' },
              ]}
            >
              <Input placeholder="Ej: San José, Cartago, Guanacaste..." maxLength={55} className="rounded-lg" />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Canton Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-geoterra-blue font-bold text-lg">
            <ApartmentOutlined />
            <span>{editingCanton ? 'Editar Cantón Oficial' : 'Nuevo Cantón Oficial'}</span>
          </div>
        }
        open={cantonModalVisible}
        onOk={() => cantonForm.submit()}
        onCancel={() => setCantonModalVisible(false)}
        confirmLoading={submittingCanton}
        okText={editingCanton ? 'Guardar Cambios' : 'Registrar Cantón'}
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: '#12467E', borderColor: '#12467E' },
          className: 'poppins-bold',
        }}
        width={520}
      >
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-4 space-y-4">
          <Form form={cantonForm} layout="vertical" onFinish={handleSubmitCanton}>
            <Form.Item
              name="province_snit_code"
              label={<span className="font-semibold text-gray-700">Provincia Perteneciente (SNIT)</span>}
              rules={[{ required: true, message: 'Debes seleccionar una provincia' }]}
            >
              <Select placeholder="Selecciona provincia padre" className="rounded-lg">
                {provinces.map((p) => (
                  <Select.Option key={p.province_snit_code} value={p.province_snit_code}>
                    {p.province_name} (SNIT #{p.province_snit_code})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="canton_snit_code"
              label={<span className="font-semibold text-gray-700">Código SNIT del Cantón</span>}
              rules={[{ required: true, message: 'El código SNIT es obligatorio' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Ej: 101, 102, 201..."
                min={1}
                disabled={Boolean(editingCanton)}
                className="rounded-lg"
              />
            </Form.Item>
            <Form.Item
              name="canton_name"
              label={<span className="font-semibold text-gray-700">Nombre del Cantón</span>}
              rules={[
                { required: true, message: 'El nombre es obligatorio' },
                { max: 55, message: 'Máximo 55 caracteres' },
              ]}
            >
              <Input placeholder="Ej: Central, Escazú, Liberia..." maxLength={55} className="rounded-lg" />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* District Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-geoterra-blue font-bold text-lg">
            <EnvironmentOutlined />
            <span>{editingDistrict ? 'Editar Distrito Oficial' : 'Nuevo Distrito Oficial'}</span>
          </div>
        }
        open={districtModalVisible}
        onOk={() => districtForm.submit()}
        onCancel={() => setDistrictModalVisible(false)}
        confirmLoading={submittingDistrict}
        okText={editingDistrict ? 'Guardar Cambios' : 'Registrar Distrito'}
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: '#12467E', borderColor: '#12467E' },
          className: 'poppins-bold',
        }}
        width={520}
      >
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-4 space-y-4">
          <Form form={districtForm} layout="vertical" onFinish={handleSubmitDistrict}>
            <Form.Item
              name="canton_snit_code"
              label={<span className="font-semibold text-gray-700">Código SNIT del Cantón Padre</span>}
              rules={[{ required: true, message: 'El código del cantón es obligatorio' }]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="Ej: 101" min={1} className="rounded-lg" />
            </Form.Item>
            <Form.Item
              name="district_snit_code"
              label={<span className="font-semibold text-gray-700">Código SNIT del Distrito</span>}
              rules={[{ required: true, message: 'El código del distrito es obligatorio' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Ej: 10101"
                min={1}
                disabled={Boolean(editingDistrict)}
                className="rounded-lg"
              />
            </Form.Item>
            <Form.Item
              name="district_name"
              label={<span className="font-semibold text-gray-700">Nombre del Distrito</span>}
              rules={[
                { required: true, message: 'El nombre es obligatorio' },
                { max: 55, message: 'Máximo 55 caracteres' },
              ]}
            >
              <Input placeholder="Ej: Carmen, Merced, Hospital..." maxLength={55} className="rounded-lg" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default TerritoryManager;