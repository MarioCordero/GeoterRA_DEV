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
import { useSession } from '../../../../hooks/useSession';
import PillTabs from '../../../common/crud/PillTabs';
import CrudToolbar from '../../../common/crud/CrudToolbar';
import { CodeBadge, NameCell, DateCell, SystemIdCell, RowActions } from '../../../common/crud/cells';
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
  const { user } = useSession();
  const isMaintenance = user?.role === 'maintenance';
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
  const [allCantons, setAllCantons] = useState([]);
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState(null);
  const [loadingCantons, setLoadingCantons] = useState(false);
  const [cantonModalVisible, setCantonModalVisible] = useState(false);
  const [editingCanton, setEditingCanton] = useState(null);
  const [cantonForm] = Form.useForm();
  const [submittingCanton, setSubmittingCanton] = useState(false);

  // Districts state
  const [districts, setDistricts] = useState([]);
  const [selectedDistrictProvince, setSelectedDistrictProvince] = useState(null);
  const [selectedDistrictCanton, setSelectedDistrictCanton] = useState(null);
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
  const loadAllCantons = async () => {
    try {
      const res = await cantonsIndex(null);
      if (res.ok && Array.isArray(res.data)) {
        setAllCantons(res.data);
      }
    } catch (err) {
      console.error('❌ Error loading all cantons:', err);
    }
  };

  const loadCantons = async (provCode) => {
    try {
      setLoadingCantons(true);
      const res = await cantonsIndex(provCode);
      if (res.ok && Array.isArray(res.data)) {
        setCantons(res.data);
        if (!provCode) {
          setAllCantons(res.data);
        }
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
        loadAllCantons();
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
        loadAllCantons();
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
    if (selectedDistrictCanton) {
      districtForm.setFieldsValue({ canton_snit_code: selectedDistrictCanton });
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
        loadDistricts(null);
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
        loadDistricts(null);
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
    loadAllCantons();
    loadDistricts(null);
  };

  useEffect(() => {
    loadProvinces();
    loadCantons(null);
    loadDistricts(null);
  }, []);

  // Lookups and maps for hierarchy
  const provinceMap = useMemo(() => {
    const map = new Map();
    provinces.forEach(p => {
      map.set(Number(p.province_snit_code), p);
    });
    return map;
  }, [provinces]);

  const cantonMap = useMemo(() => {
    const map = new Map();
    const source = allCantons.length > 0 ? allCantons : cantons;
    source.forEach(c => {
      map.set(Number(c.canton_snit_code), c);
    });
    return map;
  }, [allCantons, cantons]);

  const availableDistrictCantons = useMemo(() => {
    const source = allCantons.length > 0 ? allCantons : cantons;
    if (!selectedDistrictProvince) return source;
    return source.filter(c => Number(c.province_snit_code) === Number(selectedDistrictProvince));
  }, [allCantons, cantons, selectedDistrictProvince]);

  // Filtered lists based on search terms and hierarchy filters
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
    return districts.filter(d => {
      // 1. Canton filter
      if (selectedDistrictCanton && Number(d.canton_snit_code) !== Number(selectedDistrictCanton)) {
        return false;
      }

      // 2. Province filter
      if (selectedDistrictProvince) {
        const canton = cantonMap.get(Number(d.canton_snit_code));
        if (!canton || Number(canton.province_snit_code) !== Number(selectedDistrictProvince)) {
          return false;
        }
      }

      // 3. Search term
      if (searchDistrict) {
        const term = searchDistrict.toLowerCase();
        const canton = cantonMap.get(Number(d.canton_snit_code));
        const province = canton ? provinceMap.get(Number(canton.province_snit_code)) : null;

        const matchName = d.district_name && d.district_name.toLowerCase().includes(term);
        const matchCode = String(d.district_snit_code).includes(term);
        const matchCantonCode = String(d.canton_snit_code).includes(term);
        const matchCantonName = canton?.canton_name && canton.canton_name.toLowerCase().includes(term);
        const matchProvName = province?.province_name && province.province_name.toLowerCase().includes(term);
        const matchId = d.district_id && d.district_id.toLowerCase().includes(term);

        if (!matchName && !matchCode && !matchCantonCode && !matchCantonName && !matchProvName && !matchId) {
          return false;
        }
      }

      return true;
    });
  }, [districts, selectedDistrictProvince, selectedDistrictCanton, searchDistrict, cantonMap, provinceMap]);

  // Province columns
  const columnsProvinces = [
    {
      title: 'Código SNIT',
      dataIndex: 'province_snit_code',
      key: 'province_snit_code',
      width: 140,
      render: (val) => <CodeBadge>SNIT: {val}</CodeBadge>,
    },
    {
      title: 'Nombre de Provincia',
      dataIndex: 'province_name',
      key: 'province_name',
      render: (val) => (
        <NameCell icon={<CompassOutlined />}>{val}</NameCell>
      ),
    },
    ...(isMaintenance ? [{
      title: 'ID Sistema (ULID)',
      dataIndex: 'province_id',
      key: 'province_id',
      render: (val, r) => (
        <SystemIdCell value={val || r.id} />
      ),
    }] : []),
    {
      title: 'Fecha Registro',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (val) => (
        <DateCell value={val} fallback="Oficial Base" />
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <RowActions
          entity="provincia"
          onEdit={() => handleOpenEditProvince(record)}
          onDelete={() => handleDeleteProvince(record)}
          deleteDescription="Se eliminarán cantones y distritos asociados a esta provincia."
        />
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
      render: (val) => <CodeBadge>SNIT: {val}</CodeBadge>,
    },
    {
      title: 'Nombre del Cantón',
      dataIndex: 'canton_name',
      key: 'canton_name',
      render: (val) => (
        <NameCell icon={<ApartmentOutlined />}>{val}</NameCell>
      ),
    },
    {
      title: 'Provincia Perteneciente',
      dataIndex: 'province_snit_code',
      key: 'province_snit_code',
      render: (val) => {
        const prov = provinces.find(p => p.province_snit_code === val);
        return (
          <span className="font-mono bg-blue-50 text-[#12467E] border border-blue-200 px-2.5 py-0.5 rounded text-xs font-semibold">
            {prov ? `${prov.province_name} (${val})` : `Provincia #${val}`}
          </span>
        );
      },
    },
    ...(isMaintenance ? [{
      title: 'ID Sistema (ULID)',
      dataIndex: 'canton_id',
      key: 'canton_id',
      render: (val, r) => (
        <SystemIdCell value={val || r.id} />
      ),
    }] : []),
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <RowActions
          entity="cantón"
          onEdit={() => handleOpenEditCanton(record)}
          onDelete={() => handleDeleteCanton(record)}
          deleteDescription="Se eliminarán los distritos asociados a este cantón."
        />
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
      render: (val) => <CodeBadge>SNIT: {val}</CodeBadge>,
    },
    {
      title: 'Nombre del Distrito',
      dataIndex: 'district_name',
      key: 'district_name',
      render: (val) => (
        <NameCell icon={<EnvironmentOutlined />}>{val}</NameCell>
      ),
    },
    {
      title: 'Cantón y Provincia',
      dataIndex: 'canton_snit_code',
      key: 'canton_snit_code',
      render: (val) => {
        const canton = cantonMap.get(Number(val));
        const province = canton ? provinceMap.get(Number(canton.province_snit_code)) : null;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 text-xs">
              {canton ? `${canton.canton_name} (${val})` : `Cantón #${val}`}
            </span>
            {province && (
              <span className="text-[11px] text-gray-500 font-normal">
                {province.province_name}
              </span>
            )}
          </div>
        );
      },
    },
    ...(isMaintenance ? [{
      title: 'ID Sistema (ULID)',
      dataIndex: 'district_id',
      key: 'district_id',
      render: (val, r) => (
        <SystemIdCell value={val || r.id} />
      ),
    }] : []),
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <RowActions
          entity="distrito"
          onEdit={() => handleOpenEditDistrict(record)}
          onDelete={() => handleDeleteDistrict(record)}
        />
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
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-geoterra-blue m-0 poppins">
            División Territorial de Costa Rica
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-0 max-w-2xl">
            Gestión y codificación oficial de Provincias, Cantones y Distritos según la estructura geográfica del SNIT.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
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
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${activeTab === '1' ? 'border-[#12467E] ring-2 ring-blue-100' : 'border-gray-200'
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
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${activeTab === '2' ? 'border-[#12467E] ring-2 ring-blue-100' : 'border-gray-200'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Nivel 2 • Cantones
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-geoterra-orange flex items-center justify-center text-lg">
              <ApartmentOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loadingCantons ? '...' : (allCantons.length || cantons.length)}
            </span>
            <span className="text-xs text-gray-500 font-medium">Activos</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 font-medium flex items-center gap-1">
            <FilterOutlined /> Filtrables por provincia
          </div>
        </div>

        {/* KPI 3: Distritos */}
        <div
          onClick={() => setActiveTab('3')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${activeTab === '3' ? 'border-[#12467E] ring-2 ring-blue-100' : 'border-gray-200'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Nivel 3 • Distritos
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-lg">
              <EnvironmentOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {loadingDistricts ? '...' : districts.length}
            </span>
            <span className="text-xs text-gray-500 font-medium">Unidades</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 font-medium flex items-center gap-1">
            <GlobalOutlined /> Cobertura geotérmica
          </div>
        </div>

        {/* KPI 4: Cartografía SNIT */}
        <div className="bg-[#12467E] p-5 rounded-2xl border border-blue-900 text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Estándar Cartográfico
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center text-lg">
              <SafetyCertificateOutlined />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold poppins text-white">CRTM05</span>
            <p className="text-xs text-blue-200 m-0 mt-0.5 font-normal">
              Proyección cartográfica oficial del IGN / SNIT
            </p>
          </div>
          <div className="mt-3 text-[11px] text-blue-100 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Coordenadas WGS84 compatibles
          </div>
        </div>
      </div>

      {/* Tabs and Content Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        {/* Navigation Tabs Header */}
        <PillTabs
          items={[
            { key: '1', label: 'Provincias', icon: <CompassOutlined />, count: provinces.length },
            { key: '2', label: 'Cantones', icon: <ApartmentOutlined />, count: cantons.length },
            { key: '3', label: 'Distritos', icon: <EnvironmentOutlined />, count: districts.length },
          ]}
          activeKey={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab 1: Provincias */}
        {activeTab === '1' && (
          <div className="space-y-4">
            <CrudToolbar
              searchPlaceholder="Buscar provincia por nombre o código..."
              searchValue={searchProvince}
              onSearchChange={setSearchProvince}
              shown={filteredProvinces.length}
              total={provinces.length}
              noun="provincias"
              onReload={refreshAll}
              loading={loadingProvinces}
            />

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
            <CrudToolbar
              searchPlaceholder="Buscar cantón por nombre o código..."
              searchValue={searchCanton}
              onSearchChange={setSearchCanton}
              filters={
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
              }
              shown={filteredCantons.length}
              total={cantons.length}
              noun="cantones"
              onReload={refreshAll}
              loading={loadingCantons}
            />

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
            <CrudToolbar
              searchPlaceholder="Buscar distrito por nombre o código..."
              searchValue={searchDistrict}
              onSearchChange={setSearchDistrict}
              filters={
                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    style={{ minWidth: 190 }}
                    placeholder="Filtrar por Provincia"
                    allowClear
                    value={selectedDistrictProvince}
                    onChange={(val) => {
                      setSelectedDistrictProvince(val);
                      if (val && selectedDistrictCanton) {
                        const c = cantonMap.get(Number(selectedDistrictCanton));
                        if (!c || Number(c.province_snit_code) !== Number(val)) {
                          setSelectedDistrictCanton(null);
                        }
                      }
                    }}
                    className="rounded-lg"
                  >
                    {provinces.map((p) => (
                      <Select.Option key={p.province_snit_code} value={p.province_snit_code}>
                        {p.province_name} ({p.province_snit_code})
                      </Select.Option>
                    ))}
                  </Select>

                  <Select
                    style={{ minWidth: 210 }}
                    placeholder="Filtrar por Cantón"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    value={selectedDistrictCanton}
                    onChange={(val) => {
                      setSelectedDistrictCanton(val);
                      if (val && !selectedDistrictProvince) {
                        const c = cantonMap.get(Number(val));
                        if (c && c.province_snit_code) {
                          setSelectedDistrictProvince(c.province_snit_code);
                        }
                      }
                    }}
                    filterOption={(input, option) =>
                      (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
                    }
                    className="rounded-lg"
                  >
                    {availableDistrictCantons.map((c) => (
                      <Select.Option key={c.canton_snit_code} value={c.canton_snit_code}>
                        {c.canton_name} ({c.canton_snit_code})
                      </Select.Option>
                    ))}
                  </Select>

                  {(selectedDistrictProvince || selectedDistrictCanton) && (
                    <Button
                      onClick={() => {
                        setSelectedDistrictProvince(null);
                        setSelectedDistrictCanton(null);
                      }}
                      size="small"
                      className="poppins text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              }
              shown={filteredDistricts.length}
              total={districts.length}
              noun="distritos"
              onReload={refreshAll}
              loading={loadingDistricts}
            />

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
              label={<span className="font-semibold text-gray-700">Cantón Perteneciente (SNIT)</span>}
              rules={[{ required: true, message: 'El cantón es obligatorio' }]}
            >
              <Select
                showSearch
                placeholder="Selecciona el cantón padre"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
                className="rounded-lg"
              >
                {(allCantons.length > 0 ? allCantons : cantons).map((c) => {
                  const p = provinceMap.get(Number(c.province_snit_code));
                  return (
                    <Select.Option key={c.canton_snit_code} value={c.canton_snit_code}>
                      {c.canton_name} (SNIT #{c.canton_snit_code}){p ? ` • ${p.province_name}` : ''}
                    </Select.Option>
                  );
                })}
              </Select>
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