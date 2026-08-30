import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Button, Modal, Form, Input, InputNumber, Select, Table, message, Space, Spin, Tabs, Switch, Popconfirm, Badge, Progress, Tooltip } from 'antd';
import {
  EnvironmentOutlined, PlusOutlined, ReloadOutlined, EyeOutlined, EyeInvisibleOutlined,
  CheckCircleOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, SearchOutlined,
  RocketOutlined, ExperimentOutlined, BarChartOutlined, FileSearchOutlined, BulbOutlined
} from '@ant-design/icons';
import MapCoordinatePicker from '../../../common/MapCoordinatePicker';
import {
  geomanifestationsIndex,
  geomanifestationsAdminIndex,
  geomanifestationsAdminShow,
  geomanifestationsAdminStore,
  geomanifestationsAdminUpdate,
  geomanifestationsAdminDelete,
  geomanifestationsAdminSetVisibility,
  provincesIndex,
  cantonsIndex,
  districtsIndex,
  insituTestsStore,
  insituTestsUpdate,
  insituTestsIndex,
  inlabTestsStore,
  inlabTestsUpdate,
  inlabTestsIndex,
  georeportsAdminStore,
  georeportsAdminUpdate,
  georeportsAdminIndex
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

const GeomanifeStationsManager = () => {
  const [manifestations, setManifestations] = useState([]);
  const [acceptedRequestsManifestations, setAcceptedRequestsManifestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');

  // Search
  const [searchText, setSearchText] = useState('');

  // Main Point Form / Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = create, object = edit
  const [form] = Form.useForm();
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [cantons, setCantons] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Quick Study Modals
  const [quickInsituModalVisible, setQuickInsituModalVisible] = useState(false);
  const [quickInlabModalVisible, setQuickInlabModalVisible] = useState(false);
  const [quickGeoreportModalVisible, setQuickGeoreportModalVisible] = useState(false);
  const [quickTarget, setQuickTarget] = useState(null);
  const [submittingQuick, setSubmittingQuick] = useState(false);

  const [insituOptions, setInsituOptions] = useState([]);
  const [inlabOptions, setInlabOptions] = useState([]);

  const [quickInsituForm] = Form.useForm();
  const [quickInlabForm] = Form.useForm();
  const [quickGeoreportForm] = Form.useForm();

  // Normalize backend record
  const normalizeItem = (item, provincesList = provinces) => {
    const id = item.geomanifestation_id || item.id;
    const name = item.geomanifestation_name || item.name || `Geomanifestación ${id}`;
    const lat = item.location?.latitude ?? item.latitude;
    const lng = item.location?.longitude ?? item.longitude;

    // Visibility resolution: check visibility property, fallback to current_georeport presence if property is omitted
    const vis = item.visibility;
    let isVisible;
    if (vis !== undefined && vis !== null) {
      isVisible = vis === true || vis === 1 || vis === '1';
    } else {
      isVisible = Boolean(item.current_georeport || (item.current_georeport_id && String(item.current_georeport_id).trim() !== ''));
    }

    let provName = item.location?.province || item.province;
    if (!provName && item.province_snit_code) {
      const foundProv = provincesList.find(p => p.province_snit_code == item.province_snit_code || p.province_id == item.province_snit_code);
      if (foundProv) provName = foundProv.province_name;
    }

    const cantonName = item.location?.canton || item.canton || (item.canton_snit_code ? `Cantón ${item.canton_snit_code}` : '');
    const districtName = item.location?.district || item.district || (item.district_snit_code ? `Distrito ${item.district_snit_code}` : '');

    const parts = [provName, cantonName, districtName].filter(Boolean);
    const locationText = parts.length > 0 ? parts.join(', ') : 'Costa Rica';

    return {
      ...item,
      id,
      geomanifestation_id: id,
      name,
      geomanifestation_name: name,
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
      locationText,
      isVisible,
      visibility: isVisible ? 1 : 0,
      hasRequestId: Boolean(item.request_id && String(item.request_id).trim() !== ''),
    };
  };

  // Load provinces for form select
  const loadProvinces = async () => {
    try {
      const res = await provincesIndex();
      if (res.ok && Array.isArray(res.data)) {
        setProvinces(res.data);
        return res.data;
      }
    } catch (err) {
      console.error('❌ Error loading provinces:', err);
    }
    return [];
  };

  // Load geomanifestations
  const loadManifestations = async (currentProvinces = provinces) => {
    try {
      setLoading(true);
      
      let res = await geomanifestationsAdminIndex({ show_all: 'true', limit: 1000 });
      if (!res.ok) {
        res = await geomanifestationsIndex({ show_all: 'true', limit: 1000 });
      }

      if (res.ok && res.data) {
        const rawList = extractList(res.data);
        const normalizedList = rawList.map(item => normalizeItem(item, currentProvinces));

        // Strictly separate Public vs Drafts:
        // Tab 1 (Public): visibility === 1 (isVisible === true)
        // Tab 2 (Drafts / Requests): visibility === 0 (isVisible === false)
        const publicList = normalizedList.filter(item => item.isVisible);
        const draftList = normalizedList.filter(item => !item.isVisible);

        setManifestations(publicList);
        setAcceptedRequestsManifestations(draftList);
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

  // Load cantons on province select
  const handleProvinceChange = async (provCode) => {
    form.setFieldsValue({ canton_snit_code: undefined, district_snit_code: undefined });
    setCantons([]);
    setDistricts([]);
    if (!provCode) return;
    try {
      const res = await cantonsIndex(provCode);
      if (res.ok && Array.isArray(res.data)) {
        setCantons(res.data);
      }
    } catch (err) {
      console.error('❌ Error loading cantons:', err);
    }
  };

  // Load districts on canton select
  const handleCantonChange = async (cantonCode) => {
    form.setFieldsValue({ district_snit_code: undefined });
    setDistricts([]);
    if (!cantonCode) return;
    try {
      const res = await districtsIndex(cantonCode);
      if (res.ok && Array.isArray(res.data)) {
        setDistricts(res.data);
      }
    } catch (err) {
      console.error('❌ Error loading districts:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      const provs = await loadProvinces();
      await loadManifestations(provs);
    };
    initData();
  }, []);

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingItem(null);
    setSelectedCoordinates(null);
    form.resetFields();
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setSelectedCoordinates(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleOpenEdit = (record) => {
    setEditingItem(record);
    const lat = record.latitude;
    const lng = record.longitude;
    if (lat && lng) {
      setSelectedCoordinates({ lat: parseFloat(lat), lng: parseFloat(lng) });
    } else {
      setSelectedCoordinates(null);
    }

    const provCode = record.location?.province_snit_code ?? record.province_snit_code;
    const cantonCode = record.location?.canton_snit_code ?? record.canton_snit_code;
    const distCode = record.location?.district_snit_code ?? record.district_snit_code;

    if (provCode) handleProvinceChange(provCode);
    if (cantonCode) handleCantonChange(cantonCode);

    form.setFieldsValue({
      name: record.name || record.geomanifestation_name,
      description: record.description,
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lng ? parseFloat(lng) : undefined,
      province_snit_code: provCode,
      canton_snit_code: cantonCode,
      district_snit_code: distCode,
      visibility: record.isVisible,
    });

    setModalVisible(true);
  };

  // Toggle Visibility: Public <-> Draft
  const handleSendToDraft = async (record) => {
    const id = record.geomanifestation_id || record.id;
    try {
      const res = await geomanifestationsAdminSetVisibility(id, { visibility: false });
      if (res.ok) {
        message.success(`" ${record.name}" movida a Borradores`);
        loadManifestations();
      } else {
        message.error(res.error || 'Error al mover a borrador');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  const handlePublishToMap = async (record) => {
    const id = record.geomanifestation_id || record.id;
    try {
      const res = await geomanifestationsAdminSetVisibility(id, { visibility: true });
      if (res.ok) {
        message.success(`🚀 "${record.name}" publicada exitosamente en el mapa geotérmico`);
        loadManifestations();
      } else {
        message.error(res.error || 'Error al publicar en el mapa');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  const handleDelete = async (record) => {
    const id = record.geomanifestation_id || record.id;
    try {
      const res = await geomanifestationsAdminDelete(id);
      if (res.ok) {
        message.success('Geomanifestación eliminada permanentemente');
        loadManifestations();
      } else {
        message.error(res.error || 'Error al eliminar');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  const handleShowDetail = async (record) => {
    const id = record.geomanifestation_id || record.id;
    setDetailModalVisible(true);
    setLoadingDetail(true);
    try {
      const res = await geomanifestationsAdminShow(id);
      if (res.ok && res.data) {
        setDetailData(res.data.data || res.data);
      } else {
        setDetailData(record);
      }
    } catch {
      setDetailData(record);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const lat = selectedCoordinates ? selectedCoordinates.lat : values.latitude;
      const lng = selectedCoordinates ? selectedCoordinates.lng : values.longitude;

      if (!lat || !lng) {
        message.error('Por favor selecciona las coordenadas en el mapa o ingrésalas');
        return;
      }

      setSubmitting(true);

      const payload = {
        name: values.name,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        province_snit_code: values.province_snit_code || null,
        canton_snit_code: values.canton_snit_code || null,
        district_snit_code: values.district_snit_code || null,
        description: values.description || null,
        visibility: values.visibility !== undefined ? values.visibility : false,
      };

      let result;
      if (editingItem) {
        const id = editingItem.geomanifestation_id || editingItem.id;
        result = await geomanifestationsAdminUpdate(id, payload);
      } else {
        result = await geomanifestationsAdminStore(payload);
      }

      if (!result.ok) {
        throw new Error(result.error || 'Error al guardar la geomanifestación');
      }

      message.success(`📍 Geomanifestación ${editingItem ? 'actualizada' : 'registrada en borrador'} correctamente`);
      handleModalClose();
      loadManifestations();
    } catch (err) {
      console.error('❌ Error submitting:', err);
      message.error(err.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  // --- QUICK STUDY MODALS HANDLERS ---
  const handleOpenQuickInsitu = (record) => {
    setQuickTarget(record);
    quickInsituForm.resetFields();
    if (record.insitu_test) {
      quickInsituForm.setFieldsValue({
        temperature: record.insitu_test.temperature,
        conductivity: record.insitu_test.conductivity,
        ph: record.insitu_test.ph,
        description: record.insitu_test.description,
      });
    } else if (record.temperature !== undefined && record.temperature !== null) {
      quickInsituForm.setFieldsValue({
        temperature: record.temperature,
      });
    }
    setQuickInsituModalVisible(true);
  };

  const handleSaveQuickInsitu = async (values) => {
    if (!quickTarget) return;
    try {
      setSubmittingQuick(true);
      const geoId = quickTarget.geomanifestation_id || quickTarget.id;
      const payload = {
        geomanifestation_id: geoId,
        temperature: values.temperature !== undefined && values.temperature !== null ? parseFloat(values.temperature) : null,
        conductivity: values.conductivity !== undefined && values.conductivity !== null ? parseFloat(values.conductivity) : null,
        ph: values.ph !== undefined && values.ph !== null ? parseFloat(values.ph) : null,
        description: values.description || null,
      };

      let res;
      if (quickTarget.insitu_test?.insitu_test_id) {
        delete payload.geomanifestation_id;
        res = await insituTestsUpdate(quickTarget.insitu_test.insitu_test_id, payload);
      } else {
        res = await insituTestsStore(payload);
      }

      if (res.ok) {
        message.success('🧪 Prueba In-Situ guardada exitosamente');
        setQuickInsituModalVisible(false);
        loadManifestations();
      } else {
        message.error(res.error || 'Error al guardar prueba in-situ');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setSubmittingQuick(false);
    }
  };

  const handleOpenQuickInlab = (record) => {
    setQuickTarget(record);
    quickInlabForm.resetFields();
    if (record.inlab_test) {
      quickInlabForm.setFieldsValue({
        ph: record.inlab_test.ph,
        conductivity: record.inlab_test.conductivity,
        cl: record.inlab_test.cl,
        ca: record.inlab_test.ca,
        hco3: record.inlab_test.hco3,
        so4: record.inlab_test.so4,
        fe: record.inlab_test.fe,
        si: record.inlab_test.si,
        b: record.inlab_test.b,
        li: record.inlab_test.li,
        f: record.inlab_test.f,
        na: record.inlab_test.na,
        k: record.inlab_test.k,
        mg: record.inlab_test.mg,
        description: record.inlab_test.description,
      });
    }
    setQuickInlabModalVisible(true);
  };

  const handleSaveQuickInlab = async (values) => {
    if (!quickTarget) return;
    try {
      setSubmittingQuick(true);
      const geoId = quickTarget.geomanifestation_id || quickTarget.id;
      const fields = ['ph', 'conductivity', 'cl', 'ca', 'hco3', 'so4', 'fe', 'si', 'b', 'li', 'f', 'na', 'k', 'mg'];
      const payload = {
        geomanifestation_id: geoId,
        description: values.description || null,
      };

      fields.forEach(f => {
        payload[f] = values[f] !== undefined && values[f] !== null ? parseFloat(values[f]) : null;
      });

      let res;
      if (quickTarget.inlab_test?.inlab_test_id) {
        delete payload.geomanifestation_id;
        res = await inlabTestsUpdate(quickTarget.inlab_test.inlab_test_id, payload);
      } else {
        res = await inlabTestsStore(payload);
      }

      if (res.ok) {
        message.success('⚗️ Prueba de Laboratorio guardada exitosamente');
        setQuickInlabModalVisible(false);
        loadManifestations();
      } else {
        message.error(res.error || 'Error al guardar prueba de laboratorio');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setSubmittingQuick(false);
    }
  };

  const handleOpenQuickGeoreport = async (record) => {
    setQuickTarget(record);
    quickGeoreportForm.resetFields();
    const geoId = record.geomanifestation_id || record.id;

    try {
      // Load available insitu & inlab test options for this geomanifestation
      const resInsitu = await insituTestsIndex({ geomanifestation_id: geoId });
      if (resInsitu.ok && Array.isArray(resInsitu.data)) {
        setInsituOptions(resInsitu.data);
      } else {
        setInsituOptions([]);
      }

      const resInlab = await inlabTestsIndex({ geomanifestation_id: geoId });
      if (resInlab.ok && Array.isArray(resInlab.data)) {
        setInlabOptions(resInlab.data);
      } else {
        setInlabOptions([]);
      }

      const currentInsituId = record.insitu_test?.insitu_test_id;
      const currentInlabId = record.inlab_test?.inlab_test_id;
      const currentReport = record.current_georeport;

      quickGeoreportForm.setFieldsValue({
        insitu_test_id: currentReport?.insitu_test_id || currentInsituId,
        inlab_test_id: currentReport?.inlab_test_id || currentInlabId,
        details: currentReport?.details || `Georeporte consolidado para ${record.name}`,
      });

      setQuickGeoreportModalVisible(true);
    } catch (err) {
      console.error(err);
      message.error('Error al cargar opciones de pruebas');
    }
  };

  const handleSaveQuickGeoreport = async (values) => {
    if (!quickTarget) return;
    try {
      setSubmittingQuick(true);
      const geoId = quickTarget.geomanifestation_id || quickTarget.id;
      const payload = {
        geomanifestation_id: geoId,
        insitu_test_id: values.insitu_test_id,
        inlab_test_id: values.inlab_test_id,
        details: values.details || null,
        set_as_current: true,
      };

      let res;
      if (quickTarget.current_georeport?.georeport_id) {
        delete payload.geomanifestation_id;
        res = await georeportsAdminUpdate(quickTarget.current_georeport.georeport_id, payload);
      } else {
        res = await georeportsAdminStore(payload);
      }

      if (res.ok) {
        message.success('📋 Georeporte creado y consolidado correctamente');
        setQuickGeoreportModalVisible(false);
        loadManifestations();
      } else {
        message.error(res.error || 'Error al guardar georeporte');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setSubmittingQuick(false);
    }
  };

  // Calculate completeness status for draft items
  const getDraftCompletionStatus = (record) => {
    const hasInsitu = Boolean(record.insitu_test || (record.temperature !== undefined && record.temperature !== null));
    const hasInlab = Boolean(record.inlab_test || record.cl !== undefined);
    const hasGeoreport = Boolean(record.current_georeport || record.current_georeport_id);

    let count = 0;
    if (hasInsitu) count++;
    if (hasInlab) count++;
    if (hasGeoreport) count++;

    return { hasInsitu, hasInlab, hasGeoreport, count, isReady: count >= 1 };
  };

  // Filter helper for lists
  const filterList = (list) => {
    return list.filter(item => {
      const matchesSearch = !searchText ||
        (item.name && item.name.toLowerCase().includes(searchText.toLowerCase())) ||
        (item.geomanifestation_id && item.geomanifestation_id.toLowerCase().includes(searchText.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchText.toLowerCase()));
      return matchesSearch;
    });
  };

  const filteredPublicList = filterList(manifestations);
  const filteredDraftList = filterList(acceptedRequestsManifestations);

  // Columns for Tab 1 (Geomanifestaciones Públicas)
  const columnsPublic = [
    {
      title: 'Nombre / ID',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <span className="font-semibold text-gray-800 block">
            {text || record.geomanifestation_name || `Punto ${record.geomanifestation_id || record.id}`}
          </span>
          <Text type="secondary" style={{ fontSize: '11px' }} className="font-mono">
            ID: {record.geomanifestation_id || record.id}
          </Text>
        </div>
      ),
    },
    {
      title: 'Ubicación',
      dataIndex: 'locationText',
      key: 'locationText',
      render: (text) => text || 'Costa Rica',
    },
    {
      title: 'Coordenadas GPS',
      key: 'coords',
      render: (_, record) => {
        const lat = record.latitude;
        const lng = record.longitude;
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
      title: 'Estado Visibilidad',
      key: 'visibility',
      render: () => <Tag icon={<EyeOutlined />} color="success">Pública en Mapa</Tag>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<InfoCircleOutlined />} size="small" onClick={() => handleShowDetail(record)} title="Ver Detalles" />
          <Button icon={<EditOutlined />} size="small" type="primary" onClick={() => handleOpenEdit(record)} title="Editar Punto" />
          
          <Popconfirm
            title="¿Mover a borradores?"
            description="La geomanifestación dejará de ser visible públicamente en el mapa."
            onConfirm={() => handleSendToDraft(record)}
            okText="Sí, enviar a borrador"
            cancelText="Cancelar"
          >
            <Button
              size="small"
              icon={<EyeInvisibleOutlined />}
              style={{ backgroundColor: '#fa8c16', color: '#fff', borderColor: '#fa8c16' }}
            >
              Enviar a Borrador
            </Button>
          </Popconfirm>

          <Popconfirm title="¿Eliminar geomanifestación?" onConfirm={() => handleDelete(record)} okText="Sí" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger title="Eliminar" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Columns for Tab 2 (Solicitudes Aceptadas / Borradores)
  const columnsDrafts = [
    {
      title: 'Geomanifestación en Borrador',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <span className="font-semibold text-gray-800 block">
            {text || record.geomanifestation_name || `Geomanifestación-${record.geomanifestation_id || record.id}`}
          </span>
          <Text type="secondary" style={{ fontSize: '11px' }} className="block font-mono">
            {record.hasRequestId ? `Originada de Solicitud: ${record.request_id}` : `ID Borrador: ${record.geomanifestation_id || record.id}`}
          </Text>
        </div>
      ),
    },
    {
      title: 'Ubicación GPS',
      key: 'location',
      render: (_, record) => (
        <div>
          <div className="text-xs text-gray-800 font-medium">{record.locationText || 'Costa Rica'}</div>
          {record.latitude && record.longitude ? (
            <span className="font-mono text-xs text-gray-500">
              {parseFloat(record.latitude).toFixed(4)}°, {parseFloat(record.longitude).toFixed(4)}°
            </span>
          ) : <Text type="danger" style={{ fontSize: '11px' }}>Sin GPS</Text>}
        </div>
      ),
    },
    {
      title: '1. Prueba In-Situ',
      key: 'insitu_step',
      render: (_, record) => {
        const hasInsitu = Boolean(record.insitu_test || (record.temperature !== undefined && record.temperature !== null));
        const temp = record.insitu_test?.temperature ?? record.temperature;

        return (
          <Space direction="vertical" size={2}>
            {hasInsitu ? (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                In-Situ: {temp !== undefined && temp !== null ? `${temp}°C` : 'Registrada'}
              </Tag>
            ) : (
              <Tag color="orange">Falta In-Situ</Tag>
            )}
            <Button
              size="small"
              type={hasInsitu ? 'default' : 'primary'}
              ghost={!hasInsitu}
              icon={<BulbOutlined />}
              onClick={() => handleOpenQuickInsitu(record)}
              style={{ fontSize: '11px' }}
            >
              {hasInsitu ? 'Editar In-Situ' : '+ Agregar In-Situ'}
            </Button>
          </Space>
        );
      },
    },
    {
      title: '2. Prueba Laboratorio',
      key: 'inlab_step',
      render: (_, record) => {
        const hasInlab = Boolean(record.inlab_test || record.cl !== undefined);

        return (
          <Space direction="vertical" size={2}>
            {hasInlab ? (
              <Tag color="purple" icon={<CheckCircleOutlined />}>
                Lab Registrado
              </Tag>
            ) : (
              <Tag color="orange">Falta Lab</Tag>
            )}
            <Button
              size="small"
              type={hasInlab ? 'default' : 'primary'}
              ghost={!hasInlab}
              icon={<BarChartOutlined />}
              onClick={() => handleOpenQuickInlab(record)}
              style={{ fontSize: '11px' }}
            >
              {hasInlab ? 'Editar Lab' : '+ Agregar Lab'}
            </Button>
          </Space>
        );
      },
    },
    {
      title: '3. Georeporte',
      key: 'georeport_step',
      render: (_, record) => {
        const hasGeoreport = Boolean(record.current_georeport || record.current_georeport_id);

        return (
          <Space direction="vertical" size={2}>
            {hasGeoreport ? (
              <Tag color="blue" icon={<CheckCircleOutlined />}>
                Georeporte Vigente
              </Tag>
            ) : (
              <Tag color="orange">Falta Georeporte</Tag>
            )}
            <Button
              size="small"
              type={hasGeoreport ? 'default' : 'primary'}
              ghost={!hasGeoreport}
              icon={<FileSearchOutlined />}
              onClick={() => handleOpenQuickGeoreport(record)}
              style={{ fontSize: '11px' }}
            >
              {hasGeoreport ? 'Editar Reporte' : '+ Crear Reporte'}
            </Button>
          </Space>
        );
      },
    },
    {
      title: 'Progreso de Estudios',
      key: 'progress',
      render: (_, record) => {
        const { count } = getDraftCompletionStatus(record);
        const percent = Math.round((count / 3) * 100);
        return (
          <div style={{ width: 110 }}>
            <Progress percent={percent} size="small" status={count === 3 ? 'success' : 'active'} format={() => `${count}/3 estudios`} />
          </div>
        );
      },
    },
    {
      title: 'Publicación / Acciones',
      key: 'actions',
      render: (_, record) => {
        return (
          <Space direction="vertical" size={4}>
            <Popconfirm
              title="¿Publicar en el mapa geotérmico?"
              description="La geomanifestación pasará a ser visible públicamente para todos los usuarios."
              onConfirm={() => handlePublishToMap(record)}
              okText="Sí, publicar"
              cancelText="Cancelar"
            >
              <Button
                type="primary"
                size="small"
                icon={<RocketOutlined />}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', fontWeight: 'bold' }}
              >
                Publicar en Mapa
              </Button>
            </Popconfirm>

            <Space size="small">
              <Button icon={<InfoCircleOutlined />} size="small" onClick={() => handleShowDetail(record)} title="Ver Detalles" />
              <Button icon={<EditOutlined />} size="small" onClick={() => handleOpenEdit(record)} title="Editar Punto" />
              <Popconfirm title="¿Eliminar borrador?" onConfirm={() => handleDelete(record)} okText="Sí" cancelText="No">
                <Button icon={<DeleteOutlined />} size="small" danger title="Eliminar" />
              </Popconfirm>
            </Space>
          </Space>
        );
      },
    },
  ];

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <EnvironmentOutlined />
          Geomanifestaciones Públicas ({manifestations.length})
        </span>
      ),
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <Input
              placeholder="Buscar por nombre, ID o descripción..."
              prefix={<SearchOutlined style={{ color: '#aaa' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 320 }}
              allowClear
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ backgroundColor: '#1890ff' }}
            >
              Agregar Punto Manualmente
            </Button>
          </div>

          <Table
            dataSource={filteredPublicList}
            columns={columnsPublic}
            rowKey={(item) => item.geomanifestation_id || item.id}
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
            locale={{ emptyText: 'No hay geomanifestaciones públicas publicadas en el mapa' }}
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
          <div style={{ marginBottom: 16, background: '#e6f7ff', padding: '12px 16px', borderRadius: 8, border: '1px solid #91d5ff' }}>
            <Text strong style={{ color: '#0050b3' }}>💡 Flujo de Preparación para Publicación en Mapa:</Text>
            <Paragraph style={{ margin: 0, fontSize: '12px', color: '#002766' }}>
              Completa los 3 estudios clave de la geomanifestación (<strong>In-Situ</strong>, <strong>Laboratorio</strong> y <strong>Georeporte</strong>) usando los botones directos de cada fila. Cuando esté lista, haz clic en <strong>"Publicar en Mapa"</strong> para moverla al mapa geotérmico público.
            </Paragraph>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <Input
              placeholder="Buscar borradores por nombre, ID o descripción..."
              prefix={<SearchOutlined style={{ color: '#aaa' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 320 }}
              allowClear
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ backgroundColor: '#1890ff' }}
            >
              Crear Nuevo Borrador
            </Button>
          </div>

          <Table
            dataSource={filteredDraftList}
            columns={columnsDrafts}
            rowKey={(item) => item.geomanifestation_id || item.id}
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
            locale={{ emptyText: 'No hay solicitudes aceptadas o borradores pendientes de estudio' }}
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
              <Paragraph type="secondary" style={{ margin: 0 }}>
                {manifestations.length} Públicas en Mapa | {acceptedRequestsManifestations.length} En Borrador / Estudio
              </Paragraph>
            </div>
          </div>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => loadManifestations()}
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

      {/* Manual Point / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EnvironmentOutlined style={{ color: '#1890ff' }} />
            <span>{editingItem ? 'Editar Geomanifestación' : 'Agregar Punto Manualmente'}</span>
          </div>
        }
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={handleModalClose}
        okText={editingItem ? 'Guardar Cambios' : 'Guardar Geomanifestación'}
        cancelText="Cancelar"
        confirmLoading={submitting}
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
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item label="Seleccionar Coordenadas GPS en el Mapa">
            <MapCoordinatePicker
              latLng={selectedCoordinates}
              onCoordinatesChange={(coords) => {
                setSelectedCoordinates(coords);
                form.setFieldsValue({
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
              name="province_snit_code"
              label="Provincia"
            >
              <Select placeholder="Selecciona una provincia" onChange={handleProvinceChange} allowClear>
                {provinces.map((prov) => (
                  <Select.Option key={prov.province_snit_code || prov.province_id} value={prov.province_snit_code}>
                    {prov.province_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="canton_snit_code" label="Cantón">
              <Select placeholder="Selecciona un cantón" onChange={handleCantonChange} allowClear disabled={cantons.length === 0}>
                {cantons.map((c) => (
                  <Select.Option key={c.canton_snit_code || c.canton_id} value={c.canton_snit_code}>
                    {c.canton_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="district_snit_code" label="Distrito">
              <Select placeholder="Selecciona un distrito" allowClear disabled={districts.length === 0}>
                {districts.map((d) => (
                  <Select.Option key={d.district_snit_code || d.district_id} value={d.district_snit_code}>
                    {d.district_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="description" label="Descripción">
            <Input.TextArea rows={2} placeholder="Descripción de la manifestación geotermal" />
          </Form.Item>

          <Form.Item name="visibility" valuePropName="checked" label="Visibilidad pública">
            <Switch checkedChildren="Pública" unCheckedChildren="Oculta / Borrador" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Detalle de la Geomanifestación"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[<Button key="close" onClick={() => setDetailModalVisible(false)}>Cerrar</Button>]}
        width={700}
      >
        {loadingDetail ? (
          <Spin style={{ display: 'block', margin: '20px auto' }} />
        ) : detailData ? (
          <div>
            <Title level={4}>{detailData.geomanifestation_name || detailData.name}</Title>
            <p><strong>ID:</strong> <span className="font-mono">{detailData.geomanifestation_id || detailData.id}</span></p>
            <p><strong>Descripción:</strong> {detailData.description || 'Sin descripción'}</p>
            <p><strong>Visibilidad:</strong> {detailData.visibility || detailData.isVisible ? <Tag color="green">Pública</Tag> : <Tag color="gray">Oculta / Borrador</Tag>}</p>
            {detailData.request_id && <p><strong>Origen Solicitud ID:</strong> <span className="font-mono text-blue-600">{detailData.request_id}</span></p>}
            <p><strong>Ubicación:</strong> {detailData.locationText || [detailData.location?.province, detailData.location?.canton, detailData.location?.district].filter(Boolean).join(', ') || 'Costa Rica'}</p>
            <p><strong>Coordenadas GPS:</strong> Lat {detailData.location?.latitude ?? detailData.latitude}, Lng {detailData.location?.longitude ?? detailData.longitude}</p>

            {detailData.insitu_test && (
              <div style={{ marginTop: 16, background: '#fafafa', padding: 12, borderRadius: 6 }}>
                <Text strong>Prueba In-Situ:</Text>
                <div>Temp: {detailData.insitu_test.temperature}°C | pH: {detailData.insitu_test.ph} | Cond: {detailData.insitu_test.conductivity}</div>
              </div>
            )}

            {detailData.inlab_test && (
              <div style={{ marginTop: 16, background: '#fafafa', padding: 12, borderRadius: 6 }}>
                <Text strong>Prueba de Laboratorio (Geoquímica):</Text>
                <div>pH: {detailData.inlab_test.ph} | Cond: {detailData.inlab_test.conductivity}</div>
                <div>Cl: {detailData.inlab_test.cl} | Ca: {detailData.inlab_test.ca} | HCO3: {detailData.inlab_test.hco3} | SO4: {detailData.inlab_test.so4}</div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* QUICK MODAL 1: IN-SITU TEST */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BulbOutlined style={{ color: '#52c41a' }} />
            <span>Prueba In-Situ — {quickTarget?.name}</span>
          </div>
        }
        open={quickInsituModalVisible}
        onOk={() => quickInsituForm.submit()}
        onCancel={() => setQuickInsituModalVisible(false)}
        confirmLoading={submittingQuick}
        okText="Guardar In-Situ"
        cancelText="Cancelar"
      >
        <Form form={quickInsituForm} layout="vertical" onFinish={handleSaveQuickInsitu}>
          <Form.Item name="temperature" label="Temperatura (°C)" rules={[{ required: true, message: 'Requerido' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="Ej: 55.4" step={0.1} min={0} max={200} />
          </Form.Item>
          <Form.Item name="conductivity" label="Conductividad (μS/cm)">
            <InputNumber style={{ width: '100%' }} placeholder="Ej: 1200" min={0} />
          </Form.Item>
          <Form.Item name="ph" label="pH Campo">
            <InputNumber style={{ width: '100%' }} placeholder="Ej: 6.5" min={0} max={14} step={0.01} />
          </Form.Item>
          <Form.Item name="description" label="Notas / Descripción Campo">
            <Input.TextArea rows={2} placeholder="Condiciones de medición..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* QUICK MODAL 2: IN-LAB TEST */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChartOutlined style={{ color: '#722ed1' }} />
            <span>Prueba de Laboratorio (Geoquímica) — {quickTarget?.name}</span>
          </div>
        }
        open={quickInlabModalVisible}
        onOk={() => quickInlabForm.submit()}
        onCancel={() => setQuickInlabModalVisible(false)}
        confirmLoading={submittingQuick}
        okText="Guardar Análisis Lab"
        cancelText="Cancelar"
        width={700}
      >
        <Form form={quickInlabForm} layout="vertical" onFinish={handleSaveQuickInlab}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="ph" label="pH Laboratorio"><InputNumber style={{ width: '100%' }} min={0} max={14} step={0.01} /></Form.Item>
            <Form.Item name="conductivity" label="Conductividad (μS/cm)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          </div>
          <h4 className="font-semibold text-sm my-2 text-gray-700">Iones Mayores (mg/L)</h4>
          <div className="grid grid-cols-4 gap-2">
            <Form.Item name="cl" label="Cl"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
            <Form.Item name="ca" label="Ca"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
            <Form.Item name="hco3" label="HCO3"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
            <Form.Item name="so4" label="SO4"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
            <Form.Item name="na" label="Na"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
            <Form.Item name="k" label="K"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
            <Form.Item name="mg" label="Mg"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
            <Form.Item name="si" label="Si"><InputNumber style={{ width: '100%' }} min={0} step={0.01} /></Form.Item>
          </div>
          <h4 className="font-semibold text-sm my-2 text-gray-700">Elementos Traza (mg/L)</h4>
          <div className="grid grid-cols-4 gap-2">
            <Form.Item name="fe" label="Fe"><InputNumber style={{ width: '100%' }} min={0} step={0.001} /></Form.Item>
            <Form.Item name="b" label="B"><InputNumber style={{ width: '100%' }} min={0} step={0.001} /></Form.Item>
            <Form.Item name="li" label="Li"><InputNumber style={{ width: '100%' }} min={0} step={0.001} /></Form.Item>
            <Form.Item name="f" label="F"><InputNumber style={{ width: '100%' }} min={0} step={0.001} /></Form.Item>
          </div>
          <Form.Item name="description" label="Notas de Laboratorio">
            <Input.TextArea rows={2} placeholder="Notas del análisis geoquímico..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* QUICK MODAL 3: GEOREPORT */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileSearchOutlined style={{ color: '#fa8c16' }} />
            <span>Crear / Consolidar Georeporte — {quickTarget?.name}</span>
          </div>
        }
        open={quickGeoreportModalVisible}
        onOk={() => quickGeoreportForm.submit()}
        onCancel={() => setQuickGeoreportModalVisible(false)}
        confirmLoading={submittingQuick}
        okText="Guardar Georeporte"
        cancelText="Cancelar"
      >
        <Form form={quickGeoreportForm} layout="vertical" onFinish={handleSaveQuickGeoreport}>
          <Form.Item name="insitu_test_id" label="Vincular Prueba In-Situ">
            <Select placeholder="Selecciona la prueba in-situ para consolidar" allowClear>
              {insituOptions.map(t => (
                <Select.Option key={t.insitu_test_id || t.id} value={t.insitu_test_id || t.id}>
                  {t.insitu_test_id || t.id} — Temp: {t.temperature}°C, pH: {t.ph}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="inlab_test_id" label="Vincular Prueba de Laboratorio">
            <Select placeholder="Selecciona la prueba de laboratorio para consolidar" allowClear>
              {inlabOptions.map(t => (
                <Select.Option key={t.inlab_test_id || t.id} value={t.inlab_test_id || t.id}>
                  {t.inlab_test_id || t.id} — pH: {t.ph}, Cond: {t.conductivity}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="details" label="Detalles / Conclusión del Reporte" rules={[{ max: 500 }]}>
            <Input.TextArea rows={3} placeholder="Reporte de evaluación geotérmica..." maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GeomanifeStationsManager;