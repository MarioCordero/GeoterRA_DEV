import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Tag,
  Button,
  Modal,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  message,
  Space,
  Spin,
  Tabs,
  Switch,
  Popconfirm,
  Badge,
  Progress,
  Tooltip,
  Divider,
  Row,
  Col,
  Statistic,
  Empty,
  Alert,
  Radio,
  Checkbox,
} from 'antd';
import {
  EnvironmentOutlined, PlusOutlined, ReloadOutlined, EyeOutlined, EyeInvisibleOutlined,
  CheckCircleOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, SearchOutlined,
  RocketOutlined, ExperimentOutlined, BarChartOutlined, FileSearchOutlined, BulbOutlined,
  CompassOutlined, StarOutlined, StarFilled, CommentOutlined,
} from '@ant-design/icons';
import MapCoordinatePicker from '../../../common/MapCoordinatePicker';
import CommentsPanel from '../../../common/CommentsPanel';
import { renderDateWithProse } from '../../../../utils/dateFormatter';
import { usePermissions } from '../../../../hooks/usePermissions';
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
  insituTestsDelete,
  inlabTestsStore,
  inlabTestsUpdate,
  inlabTestsIndex,
  inlabTestsDelete,
  georeportsCurrent,
  georeportsAdminStore,
  georeportsAdminUpdate,
  georeportsAdminDelete,
  georeportsAdminPromote,
  georeportsAdminIndex,
  fieldTripsIndex,
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
  const { hasPermission, PERMISSIONS } = usePermissions();

  const canManageInsitu = hasPermission(PERMISSIONS.MANAGE_INSITU_TESTS) || hasPermission(PERMISSIONS.MANAGE_GEOMANIFESTATIONS);
  const canManageInlab = hasPermission(PERMISSIONS.MANAGE_INLAB_TESTS) || hasPermission(PERMISSIONS.MANAGE_GEOMANIFESTATIONS);
  const canManageGeoreports = hasPermission(PERMISSIONS.MANAGE_GEOREPORTS) || hasPermission(PERMISSIONS.MANAGE_GEOMANIFESTATIONS);

  const [manifestations, setManifestations] = useState([]);
  const [acceptedRequestsManifestations, setAcceptedRequestsManifestations] = useState([]);
  const [fieldTripsList, setFieldTripsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');

  // Search & Filters
  const [searchText, setSearchText] = useState('');
  const [selectedFieldTripFilter, setSelectedFieldTripFilter] = useState('all');

  // Main Point Form / Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = create, object = edit
  const [form] = Form.useForm();
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [cantons, setCantons] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Dedicated Studies & Tests Drawer State
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedGeo, setSelectedGeo] = useState(null);
  const [drawerTab, setDrawerTab] = useState('georeports'); // default to hierarchical georeports tab
  const [georeportsList, setGeoreportsList] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [insituTests, setInsituTests] = useState([]);
  const [inlabTests, setInlabTests] = useState([]);
  const [loadingStudies, setLoadingStudies] = useState(false);
  const [promotingId, setPromotingId] = useState(null);

  // Hierarchical Georeport Modal (combines in-situ, in-lab & georeport)
  const [georeportModalVisible, setGeoreportModalVisible] = useState(false);
  const [editingGeoreport, setEditingGeoreport] = useState(null);
  const [submittingGeoreport, setSubmittingGeoreport] = useState(false);
  const [georeportForm] = Form.useForm();

  // In-Situ edit modal states
  const [quickInsituModalVisible, setQuickInsituModalVisible] = useState(false);
  const [editingInsituTest, setEditingInsituTest] = useState(null);
  const [submittingInsitu, setSubmittingInsitu] = useState(false);
  const [quickInsituForm] = Form.useForm();

  // In-Lab edit modal states
  const [quickInlabModalVisible, setQuickInlabModalVisible] = useState(false);
  const [editingInlabTest, setEditingInlabTest] = useState(null);
  const [submittingInlab, setSubmittingInlab] = useState(false);
  const [quickInlabForm] = Form.useForm();

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
      hasGeoreport: Boolean(item.current_georeport || (item.current_georeport_id && String(item.current_georeport_id).trim() !== '')),
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

  // Load field trips for association
  const loadFieldTrips = async () => {
    try {
      const res = await fieldTripsIndex({ limit: 1000 });
      if (res.ok && res.data) {
        setFieldTripsList(extractList(res.data));
      }
    } catch (err) {
      console.error('❌ Error loading field trips:', err);
    }
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

        // Update selectedGeo if drawer is open
        if (selectedGeo) {
          const freshGeo = normalizedList.find(
            item => (item.geomanifestation_id || item.id) === (selectedGeo.geomanifestation_id || selectedGeo.id)
          );
          if (freshGeo) {
            setSelectedGeo(prev => ({ ...prev, ...freshGeo }));
          }
        }
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

  // Load canton & district on province select
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
    const init = async () => {
      const provs = await loadProvinces();
      await loadManifestations(provs);
      loadFieldTrips();
    };
    init();
  }, []);

  // --- DRAWER & HIERARCHICAL STUDIES MANAGEMENT HANDLERS ---
  const handleOpenGeoDrawer = (record, tab = 'georeports') => {
    setSelectedGeo(record);
    setDrawerTab(tab);
    setDrawerVisible(true);
    const id = record.geomanifestation_id || record.id;
    loadStudiesForGeo(id, record);
  };

  const loadStudiesForGeo = async (geoId, currentRecord = selectedGeo) => {
    if (!geoId) return;
    try {
      setLoadingStudies(true);
      const [resDetail, resReports, resCurrent, resInsitu, resInlab] = await Promise.allSettled([
        geomanifestationsAdminShow(geoId),
        georeportsAdminIndex({ geomanifestation_id: geoId }),
        georeportsCurrent({ geomanifestation_id: geoId }),
        insituTestsIndex({ geomanifestation_id: geoId }),
        inlabTestsIndex({ geomanifestation_id: geoId }),
      ]);

      if (resDetail.status === 'fulfilled' && resDetail.value.ok && resDetail.value.data) {
        const fullDetail = resDetail.value.data.data || resDetail.value.data;
        setSelectedGeo(prev => ({ ...(prev || currentRecord), ...fullDetail }));
      }

      if (resReports.status === 'fulfilled' && resReports.value.ok && resReports.value.data) {
        setGeoreportsList(extractList(resReports.value.data));
      } else {
        setGeoreportsList([]);
      }

      if (resCurrent.status === 'fulfilled' && resCurrent.value.ok && resCurrent.value.data) {
        const curData = resCurrent.value.data.data || resCurrent.value.data;
        setCurrentReport(curData?.georeport_id || curData?.id ? curData : null);
      } else {
        setCurrentReport(null);
      }

      if (resInsitu.status === 'fulfilled' && resInsitu.value.ok && resInsitu.value.data) {
        setInsituTests(extractList(resInsitu.value.data));
      } else {
        setInsituTests([]);
      }

      if (resInlab.status === 'fulfilled' && resInlab.value.ok && resInlab.value.data) {
        setInlabTests(extractList(resInlab.value.data));
      } else {
        setInlabTests([]);
      }
    } catch (err) {
      console.error('Error loading studies for geo:', err);
    } finally {
      setLoadingStudies(false);
    }
  };

  // --- ASSOCIATE GEOREPORT (IN-SITU + IN-LAB) ---
  const handleOpenCreateGeoreportModal = (targetRecord = selectedGeo) => {
    const target = targetRecord || selectedGeo;
    setSelectedGeo(target);
    setEditingGeoreport(null);
    georeportForm.resetFields();
    georeportForm.setFieldsValue({
      set_as_current: true,
      insitu_test_id: insituTests.length > 0 ? (insituTests[0].insitu_test_id || insituTests[0].id) : undefined,
      inlab_test_id: inlabTests.length > 0 ? (inlabTests[0].inlab_test_id || inlabTests[0].id) : undefined,
    });
    setGeoreportModalVisible(true);
  };

  const handleOpenEditGeoreport = (report) => {
    setEditingGeoreport(report);
    const isCurrent = currentReport && (currentReport.georeport_id || currentReport.id) === (report.georeport_id || report.id);
    georeportForm.resetFields();
    georeportForm.setFieldsValue({
      insitu_test_id: report.insitu_test_id,
      inlab_test_id: report.inlab_test_id,
      details: report.details,
      set_as_current: isCurrent,
    });
    setGeoreportModalVisible(true);
  };

  const handleSaveGeoreport = async (values) => {
    const targetGeo = selectedGeo;
    if (!targetGeo) return;
    const geoId = targetGeo.geomanifestation_id || targetGeo.id;

    if (!values.insitu_test_id) {
      message.error('Debes seleccionar una prueba in-situ para asociar al georeporte');
      return;
    }

    if (!values.inlab_test_id) {
      message.error('Debes seleccionar una prueba de laboratorio para asociar al georeporte');
      return;
    }

    try {
      setSubmittingGeoreport(true);

      const georeportPayload = {
        geomanifestation_id: geoId,
        insitu_test_id: values.insitu_test_id,
        inlab_test_id: values.inlab_test_id,
        details: values.details || null,
        set_as_current: Boolean(values.set_as_current),
      };

      let resReport;
      if (editingGeoreport) {
        const reportId = editingGeoreport.georeport_id || editingGeoreport.id;
        delete georeportPayload.geomanifestation_id;
        resReport = await georeportsAdminUpdate(reportId, georeportPayload);
      } else {
        resReport = await georeportsAdminStore(georeportPayload);
      }

      if (!resReport.ok) {
        throw new Error(resReport.error || 'Error al guardar el georeporte');
      }

      message.success(`📋 Georeporte ${editingGeoreport ? 'actualizado' : 'asociado'} exitosamente`);
      setGeoreportModalVisible(false);
      setEditingGeoreport(null);
      georeportForm.resetFields();
      loadStudiesForGeo(geoId, targetGeo);
      loadManifestations();
    } catch (err) {
      console.error(err);
      message.error(err.message || 'Error al procesar el georeporte');
    } finally {
      setSubmittingGeoreport(false);
    }
  };

  const handlePromoteGeoreport = async (report) => {
    const id = report.georeport_id || report.id;
    try {
      setPromotingId(id);
      const res = await georeportsAdminPromote(id);
      if (res.ok) {
        message.success('⭐ Georeporte establecido como vigente oficial para el mapa');
        loadStudiesForGeo(selectedGeo?.geomanifestation_id || selectedGeo?.id);
        loadManifestations();
      } else {
        message.error(res.error || 'Error al promover georeporte');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setPromotingId(null);
    }
  };

  const handleDeleteGeoreport = async (report) => {
    const id = report.georeport_id || report.id;
    try {
      const res = await georeportsAdminDelete(id);
      if (res.ok) {
        message.success('Georeporte eliminado correctamente');
        loadStudiesForGeo(selectedGeo?.geomanifestation_id || selectedGeo?.id);
        loadManifestations();
      } else {
        message.error(res.error || 'Error al eliminar el georeporte');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  // --- INDIVIDUAL TEST CREATE/EDIT/DELETE HANDLERS ---
  const handleOpenCreateInsitu = () => {
    setEditingInsituTest(null);
    quickInsituForm.resetFields();
    setQuickInsituModalVisible(true);
  };

  const handleOpenEditInsitu = (testRecord) => {
    setEditingInsituTest(testRecord);
    quickInsituForm.resetFields();
    quickInsituForm.setFieldsValue({
      temperature: testRecord.temperature,
      conductivity: testRecord.conductivity,
      ph: testRecord.ph,
      description: testRecord.description,
    });
    setQuickInsituModalVisible(true);
  };

  const handleSaveQuickInsitu = async (values) => {
    const targetGeo = selectedGeo;
    if (!targetGeo) return;

    try {
      setSubmittingInsitu(true);
      const payload = {
        geomanifestation_id: targetGeo.geomanifestation_id || targetGeo.id,
        temperature: values.temperature !== undefined && values.temperature !== null ? parseFloat(values.temperature) : null,
        conductivity: values.conductivity !== undefined && values.conductivity !== null ? parseFloat(values.conductivity) : null,
        ph: values.ph !== undefined && values.ph !== null ? parseFloat(values.ph) : null,
        description: values.description || null,
      };

      let res;
      if (editingInsituTest) {
        const testId = editingInsituTest.insitu_test_id || editingInsituTest.id;
        delete payload.geomanifestation_id;
        res = await insituTestsUpdate(testId, payload);
      } else {
        res = await insituTestsStore(payload);
      }

      if (res.ok) {
        message.success(editingInsituTest ? '🌿 Prueba In-Situ actualizada exitosamente' : '🌿 Prueba In-Situ registrada exitosamente');
        setQuickInsituModalVisible(false);
        setEditingInsituTest(null);
        quickInsituForm.resetFields();
        loadStudiesForGeo(targetGeo.geomanifestation_id || targetGeo.id);
        loadManifestations();
      } else {
        message.error(res.error || 'Error al guardar prueba in-situ');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setSubmittingInsitu(false);
    }
  };

  const handleDeleteInsitu = async (testRecord) => {
    const testId = testRecord.insitu_test_id || testRecord.id;
    try {
      const res = await insituTestsDelete(testId);
      if (res.ok) {
        message.success('Prueba In-Situ eliminada correctamente');
        loadStudiesForGeo(selectedGeo?.geomanifestation_id || selectedGeo?.id);
        loadManifestations();
      } else {
        message.error(res.error || 'Error al eliminar');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  const handleOpenCreateInlab = () => {
    setEditingInlabTest(null);
    quickInlabForm.resetFields();
    setQuickInlabModalVisible(true);
  };

  const handleOpenEditInlab = (testRecord) => {
    setEditingInlabTest(testRecord);
    quickInlabForm.resetFields();
    quickInlabForm.setFieldsValue({
      ph: testRecord.ph,
      conductivity: testRecord.conductivity,
      cl: testRecord.cl,
      ca: testRecord.ca,
      hco3: testRecord.hco3,
      so4: testRecord.so4,
      fe: testRecord.fe,
      si: testRecord.si,
      b: testRecord.b,
      li: testRecord.li,
      f: testRecord.f,
      na: testRecord.na,
      k: testRecord.k,
      mg: testRecord.mg,
      description: testRecord.description,
    });
    setQuickInlabModalVisible(true);
  };

  const handleSaveQuickInlab = async (values) => {
    const targetGeo = selectedGeo;
    if (!targetGeo) return;

    try {
      setSubmittingInlab(true);
      const fields = ['ph', 'conductivity', 'cl', 'ca', 'hco3', 'so4', 'fe', 'si', 'b', 'li', 'f', 'na', 'k', 'mg'];
      const payload = {
        geomanifestation_id: targetGeo.geomanifestation_id || targetGeo.id,
        description: values.description || null,
      };

      fields.forEach(f => {
        payload[f] = values[f] !== undefined && values[f] !== null ? parseFloat(values[f]) : null;
      });

      let res;
      if (editingInlabTest) {
        const testId = editingInlabTest.inlab_test_id || editingInlabTest.id;
        delete payload.geomanifestation_id;
        res = await inlabTestsUpdate(testId, payload);
      } else {
        res = await inlabTestsStore(payload);
      }

      if (res.ok) {
        message.success(editingInlabTest ? '🧪 Prueba de Laboratorio actualizada exitosamente' : '🧪 Prueba de Laboratorio registrada exitosamente');
        setQuickInlabModalVisible(false);
        setEditingInlabTest(null);
        quickInlabForm.resetFields();
        loadStudiesForGeo(targetGeo.geomanifestation_id || targetGeo.id);
        loadManifestations();
      } else {
        message.error(res.error || 'Error al guardar prueba de laboratorio');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setSubmittingInlab(false);
    }
  };

  const handleDeleteInlab = async (testRecord) => {
    const testId = testRecord.inlab_test_id || testRecord.id;
    try {
      const res = await inlabTestsDelete(testId);
      if (res.ok) {
        message.success('Prueba de Laboratorio eliminada correctamente');
        loadStudiesForGeo(selectedGeo?.geomanifestation_id || selectedGeo?.id);
        loadManifestations();
      } else {
        message.error(res.error || 'Error al eliminar (puede estar vinculada a un georeporte)');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  // --- CRUD GEOMANIFESTATION MODAL ---
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
      field_trip_id: record.field_trip_id || undefined,
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lng ? parseFloat(lng) : undefined,
      province_snit_code: provCode,
      canton_snit_code: cantonCode,
      district_snit_code: distCode,
      visibility: record.isVisible,
    });

    setModalVisible(true);
  };

  const handleSendToDraft = async (record) => {
    const id = record.geomanifestation_id || record.id;
    try {
      const res = await geomanifestationsAdminSetVisibility(id, { visibility: false });
      if (res.ok) {
        message.success(`"${record.name}" movida a Borradores`);
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
        if (selectedGeo && (selectedGeo.geomanifestation_id || selectedGeo.id) === id) {
          setDrawerVisible(false);
        }
        loadManifestations();
      } else {
        message.error(res.error || 'Error al eliminar');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
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
        field_trip_id: values.field_trip_id || null,
        description: values.description || null,
        visibility: values.visibility !== undefined ? values.visibility : false,
      };

      let result;
      if (editingItem) {
        const id = editingItem.geomanifestation_id || editingItem.id;
        payload.geomanifestation_name = values.name;
        result = await geomanifestationsAdminUpdate(id, payload);
      } else {
        payload.geomanifestation_name = values.name;
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
  const filteredDraftList = acceptedRequestsManifestations.filter(item => {
    const matchesSearch = !searchText ||
      (item.name && item.name.toLowerCase().includes(searchText.toLowerCase())) ||
      (item.geomanifestation_id && item.geomanifestation_id.toLowerCase().includes(searchText.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchText.toLowerCase()));

    let matchesTrip = true;
    if (selectedFieldTripFilter && selectedFieldTripFilter !== 'all') {
      if (selectedFieldTripFilter === 'none') {
        matchesTrip = !item.field_trip_id;
      } else {
        matchesTrip = String(item.field_trip_id) === String(selectedFieldTripFilter);
      }
    }

    return matchesSearch && matchesTrip;
  });

  // --- COLUMNS FOR TAB 1 (PÚBLICAS) ---
  const columnsPublic = [
    {
      title: 'Nombre / ID',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <span className="font-semibold text-blue-600 hover:text-blue-800 block cursor-pointer">
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
      title: 'Georeporte Oficial',
      key: 'georeport_status',
      render: (_, record) => {
        return record.hasGeoreport ? (
          <Tag color="cyan" icon={<CheckCircleOutlined />}>
            Georeporte Vigente
          </Tag>
        ) : (
          <Tag color="default">Sin Georeporte</Tag>
        );
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
          <Popconfirm
            title="¿Mover a borradores?"
            description="La geomanifestación dejará de ser visible públicamente en el mapa."
            onConfirm={(e) => {
              e?.stopPropagation();
              handleSendToDraft(record);
            }}
            okText="Sí, enviar a borrador"
            cancelText="Cancelar"
          >
            <Button
              size="small"
              icon={<EyeInvisibleOutlined />}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: '#fa8c16', color: '#fff', borderColor: '#fa8c16' }}
            >
              A Borrador
            </Button>
          </Popconfirm>

          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(record);
            }}
            title="Editar Punto"
          />

          <Popconfirm
            title="¿Eliminar geomanifestación?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record);
            }}
            okText="Sí"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              title="Eliminar"
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // --- COLUMNS FOR TAB 2 (BORRADORES) ---
  const columnsDrafts = [
    {
      title: 'Geomanifestación en Borrador',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const linkedTrip = record.field_trip_id
          ? fieldTripsList.find(t => String(t.field_trip_id || t.id) === String(record.field_trip_id))
          : null;

        return (
          <div>
            <span className="font-semibold text-blue-600 hover:text-blue-800 block cursor-pointer">
              {text || record.geomanifestation_name || `Geomanifestación-${record.geomanifestation_id || record.id}`}
            </span>
            <Text type="secondary" style={{ fontSize: '11px' }} className="block font-mono">
              {record.hasRequestId ? `Originada de Solicitud: ${record.request_id}` : `ID Borrador: ${record.geomanifestation_id || record.id}`}
            </Text>
            {linkedTrip && (
              <Tag color="orange" icon={<CompassOutlined />} style={{ fontSize: '11px', marginTop: 3 }}>
                {linkedTrip.field_trip_name || `Gira #${record.field_trip_id}`}
              </Tag>
            )}
          </div>
        );
      },
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
      title: 'Georeporte Asociado',
      key: 'hierarchy_step',
      render: (_, record) => {
        const hasReport = record.hasGeoreport;
        const temp = record.insitu_test?.temperature ?? record.temperature;

        return (
          <Space direction="vertical" size={2}>
            {hasReport ? (
              <div>
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  Georeporte Vigente Configurado
                </Tag>
                {temp !== undefined && temp !== null && (
                  <span className="text-xs text-gray-500 block">In-Situ: {temp}°C</span>
                )}
              </div>
            ) : (
              <Tag color="orange">Falta Georeporte Asociado</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Listo para Publicar',
      key: 'ready_status',
      render: (_, record) => {
        return record.hasGeoreport ? (
          <Tag color="success">Listo para Mapa</Tag>
        ) : (
          <Tag color="warning">Requiere Georeporte</Tag>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="¿Publicar en el mapa geotérmico?"
            description="La geomanifestación y su georeporte pasarán a ser visibles públicamente para todos."
            onConfirm={(e) => {
              e?.stopPropagation();
              handlePublishToMap(record);
            }}
            disabled={!record.hasGeoreport}
            okText="Sí, publicar"
            cancelText="Cancelar"
          >
            <Button
              type="primary"
              size="small"
              icon={<RocketOutlined />}
              disabled={!record.hasGeoreport}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: record.hasGeoreport ? '#52c41a' : undefined,
                borderColor: record.hasGeoreport ? '#52c41a' : undefined,
                fontWeight: 'bold',
              }}
            >
              Publicar en Mapa
            </Button>
          </Popconfirm>

          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(record);
            }}
            title="Editar Punto"
          />

          <Popconfirm
            title="¿Eliminar borrador?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record);
            }}
            okText="Sí"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              title="Eliminar"
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
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
          <Alert
            message="💡 Jerarquía Geocientífica"
            description="Toca o haz clic sobre cualquier geomanifestación para gestionar sus Georeportes. Cada georeporte asocia una prueba de campo (in-situ) y una prueba de laboratorio (geoquímica)."
            type="info"
            showIcon
            style={{ marginBottom: 16, borderRadius: 8 }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <Input
              placeholder="Buscar por nombre, ID o descripción..."
              prefix={<SearchOutlined style={{ color: '#aaa' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 340 }}
              allowClear
            />
          </div>

          <Table
            dataSource={filteredPublicList}
            columns={columnsPublic}
            rowKey={(item) => item.geomanifestation_id || item.id}
            onRow={(record) => ({
              onClick: () => handleOpenGeoDrawer(record, 'georeports'),
              style: { cursor: 'pointer' },
            })}
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
            <Text strong style={{ color: '#0050b3' }}>💡 Flujo de Preparación Jerárquico para el Mapa:</Text>
            <Paragraph style={{ margin: 0, fontSize: '12px', color: '#002766' }}>
              Para publicar una geomanifestación en el mapa, debe asociarse a un <strong>Georeporte</strong> que integre tanto la <strong>Prueba In-Situ</strong> como la <strong>Prueba de Laboratorio</strong>.
            </Paragraph>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <Input
                placeholder="Buscar borradores por nombre, ID o descripción..."
                prefix={<SearchOutlined style={{ color: '#aaa' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fafafa', padding: '4px 12px', borderRadius: 6, border: '1px solid #d9d9d9' }}>
                <CompassOutlined style={{ color: '#fa8c16' }} />
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#595959' }}>
                  Mostrar borradores de:
                </span>
                <Select
                  value={selectedFieldTripFilter}
                  onChange={(val) => setSelectedFieldTripFilter(val)}
                  style={{ minWidth: 260 }}
                  placeholder="Seleccionar gira"
                >
                  <Select.Option value="all">Todas las giras ({acceptedRequestsManifestations.length})</Select.Option>
                  <Select.Option value="none">Sin gira asignada ({acceptedRequestsManifestations.filter(d => !d.field_trip_id).length})</Select.Option>
                  {fieldTripsList.map((trip) => {
                    const tripId = trip.field_trip_id || trip.id;
                    const tripName = trip.field_trip_name || trip.name || `Gira #${tripId}`;
                    const dateStr = trip.field_trip_scheduled_date || trip.scheduled_date;
                    const count = acceptedRequestsManifestations.filter(d => String(d.field_trip_id) === String(tripId)).length;
                    return (
                      <Select.Option key={tripId} value={tripId}>
                        {tripName} {dateStr ? `(${dateStr})` : ''} ({count})
                      </Select.Option>
                    );
                  })}
                </Select>
              </div>
            </div>

            {selectedFieldTripFilter && selectedFieldTripFilter !== 'all' && (
              <Tag color="orange" closable onClose={() => setSelectedFieldTripFilter('all')} style={{ margin: 0, padding: '4px 8px', fontSize: '12px' }}>
                Filtrado por:{' '}
                {selectedFieldTripFilter === 'none'
                  ? 'Sin gira asignada'
                  : (fieldTripsList.find(t => String(t.field_trip_id || t.id) === String(selectedFieldTripFilter))?.field_trip_name || `Gira #${selectedFieldTripFilter}`)}
                {' '}({filteredDraftList.length} de {acceptedRequestsManifestations.length})
              </Tag>
            )}
          </div>

          <Table
            dataSource={filteredDraftList}
            columns={columnsDrafts}
            rowKey={(item) => item.geomanifestation_id || item.id}
            onRow={(record) => ({
              onClick: () => handleOpenGeoDrawer(record, 'georeports'),
              style: { cursor: 'pointer' },
            })}
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
            locale={{ emptyText: 'No hay solicitudes aceptadas o borradores pendientes de estudio' }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="w-full p-4 md:p-8 space-y-6 poppins">
      {/* ========================================================================= */}
      {/* HEADER SECTION                                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-geoterra-orange poppins">
              Geociencias • Inventario Geotérmico
            </span>
            <Tag className="rounded-full font-semibold text-[11px] bg-blue-50 text-geoterra-blue border-blue-200">
              {manifestations.length + acceptedRequestsManifestations.length} Registros
            </Tag>
          </div>
          <h1 className="text-2xl md:text-3xl poppins-bold text-geoterra-blue m-0 flex items-center gap-2.5">
            <EnvironmentOutlined className="text-geoterra-blue" /> Gestión de Geomanifestaciones
          </h1>
          <p className="text-xs md:text-sm text-gray-500 m-0 mt-1 poppins">
            Inventario geoquímico, georeportes consolidados, mediciones geotermales y publicación cartográfica oficial.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={() => loadManifestations()}
            loading={loading}
            className="poppins font-medium border-gray-300"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* METRICS DASHBOARD                                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div
          onClick={() => setActiveTab('1')}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            activeTab === '1'
              ? 'border-geoterra-blue shadow-md ring-2 ring-blue-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sitios</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-geoterra-blue flex items-center justify-center text-base">
              <EnvironmentOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-gray-900">
              {manifestations.length + acceptedRequestsManifestations.length}
            </span>
            <span className="text-xs text-gray-400">sitios</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">Públicas y en estudio</div>
        </div>

        {/* Publicas en Mapa */}
        <div
          onClick={() => setActiveTab('1')}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            activeTab === '1'
              ? 'border-emerald-400 shadow-md ring-2 ring-emerald-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Públicas en Mapa</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-base">
              <EyeOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-emerald-900">{manifestations.length}</span>
            <span className="text-xs text-emerald-600">visibles</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium">Publicadas oficialmente</div>
        </div>

        {/* Borradores */}
        <div
          onClick={() => setActiveTab('2')}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            activeTab === '2'
              ? 'border-amber-400 shadow-md ring-2 ring-amber-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Borradores / En Estudio</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-base">
              <ExperimentOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-amber-900">{acceptedRequestsManifestations.length}</span>
            <span className="text-xs text-amber-600">en preparación</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium">Requieren completar georeporte</div>
        </div>

        {/* Listas para Publicar */}
        <div
          onClick={() => setActiveTab('2')}
          className="cursor-pointer bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Listas para Publicar</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-base">
              <RocketOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-blue-900">
              {acceptedRequestsManifestations.filter((d) => d.hasGeoreport).length}
            </span>
            <span className="text-xs text-blue-600">con georeporte</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium">Listas para subir al mapa</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DATA TABS CARD                                                            */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        {loading ? (
          <div className="text-center py-16">
            <Spin size="large" tip="Cargando geomanifestaciones..." />
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="poppins"
            items={tabItems}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* COMPREHENSIVE HIERARCHICAL DRAWER: GEOMANIFESTATION -> GEOREPORTS -> TESTS*/}
      {/* ========================================================================= */}
      <Drawer
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={Math.min(980, typeof window !== 'undefined' ? window.innerWidth * 0.95 : 980)}
        title={
          <div className="flex items-center justify-between w-full pr-6 py-1 border-b border-gray-100 poppins">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-geoterra-blue flex items-center justify-center text-lg flex-shrink-0">
                <EnvironmentOutlined />
              </div>
              <div>
                <span className="poppins-bold text-lg text-geoterra-blue block">
                  {selectedGeo?.name || selectedGeo?.geomanifestation_name || 'Geomanifestación'}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs text-gray-400">ID: #{selectedGeo?.geomanifestation_id || selectedGeo?.id}</span>
                  {selectedGeo?.isVisible ? (
                    <Tag color="success" icon={<EyeOutlined />} className="rounded-full text-[11px] m-0">Pública en Mapa</Tag>
                  ) : (
                    <Tag color="warning" icon={<EyeInvisibleOutlined />} className="rounded-full text-[11px] m-0">Borrador / Estudio</Tag>
                  )}
                  {selectedGeo?.locationText && <Tag color="blue" className="rounded-full text-[11px] m-0">{selectedGeo.locationText}</Tag>}
                </div>
              </div>
            </div>

            {!selectedGeo?.isVisible && (
              <Popconfirm
                title="¿Publicar en el mapa geotérmico?"
                description="La geomanifestación y su georeporte serán visibles públicamente."
                onConfirm={() => handlePublishToMap(selectedGeo)}
                disabled={!selectedGeo?.hasGeoreport}
                okText="Sí, publicar"
                cancelText="Cancelar"
              >
                <Button
                  type="primary"
                  icon={<RocketOutlined />}
                  size="small"
                  disabled={!selectedGeo?.hasGeoreport}
                  style={{ backgroundColor: selectedGeo?.hasGeoreport ? '#52c41a' : undefined, borderColor: selectedGeo?.hasGeoreport ? '#52c41a' : undefined }}
                  className="poppins-bold"
                >
                  Publicar en Mapa
                </Button>
              </Popconfirm>
            )}
          </div>
        }
      >
        {selectedGeo && (
          <div>
            {/* Top Quick Stats Row */}
            <Row gutter={12} style={{ marginBottom: 20 }}>
              <Col span={8}>
                <Card size="small" style={{ background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 8 }}>
                  <Statistic
                    title="Georeportes Registrados"
                    value={georeportsList.length}
                    prefix={<FileSearchOutlined style={{ color: '#fa8c16' }} />}
                    valueStyle={{ color: '#d46b08', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8 }}>
                  <Statistic
                    title="Pruebas de Campo (In-Situ)"
                    value={insituTests.length}
                    prefix={<BulbOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#389e0d', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ background: '#f9f0ff', border: '1px solid #d3adf7', borderRadius: 8 }}>
                  <Statistic
                    title="Pruebas de Lab (Geoquímica)"
                    value={inlabTests.length}
                    prefix={<BarChartOutlined style={{ color: '#722ed1' }} />}
                    valueStyle={{ color: '#531dab', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Inner Drawer Tabs - Hierarchical workflow */}
            <Tabs
              activeKey={drawerTab}
              onChange={setDrawerTab}
              type="card"
              items={[
                {
                  key: 'georeports',
                  label: (
                    <span>
                      <FileSearchOutlined />
                      Georeportes ({georeportsList.length})
                    </span>
                  ),
                  children: (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <Text strong style={{ fontSize: '15px' }}>📋 Georeportes de la Geomanifestación</Text>
                          <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                            Asocia una prueba de campo (in-situ) y un análisis geoquímico (laboratorio) para consolidar un georeporte oficial.
                          </Paragraph>
                        </div>

                        <Space>
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            disabled={!canManageGeoreports}
                            onClick={() => handleOpenCreateGeoreportModal(selectedGeo)}
                            style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                          >
                            + Asociar Georeporte
                          </Button>
                          <Button
                            icon={<ReloadOutlined />}
                            onClick={() => loadStudiesForGeo(selectedGeo.geomanifestation_id || selectedGeo.id)}
                            loading={loadingStudies}
                          />
                        </Space>
                      </div>

                      {loadingStudies ? (
                        <div style={{ textAlign: 'center', padding: '30px 0' }}><Spin tip="Cargando georeportes..." /></div>
                      ) : georeportsList.length === 0 ? (
                        <Empty
                          description="Esta geomanifestación aún no tiene georeportes asociados."
                          style={{ margin: '30px 0' }}
                        >
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            disabled={!canManageGeoreports}
                            onClick={() => handleOpenCreateGeoreportModal(selectedGeo)}
                            style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                          >
                            Asociar Primer Georeporte
                          </Button>
                        </Empty>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {georeportsList.map((report) => {
                            const repId = report.georeport_id || report.id;
                            const isCurrent = currentReport && (currentReport.georeport_id || currentReport.id) === repId;
                            const linkedInsitu = insituTests.find(t => (t.insitu_test_id || t.id) === report.insitu_test_id);
                            const linkedInlab = inlabTests.find(t => (t.inlab_test_id || t.id) === report.inlab_test_id);

                            return (
                              <Card
                                key={repId}
                                size="small"
                                style={{
                                  borderRadius: 10,
                                  border: isCurrent ? '2px solid #fa8c16' : '1px solid #e8e8e8',
                                  boxShadow: isCurrent ? '0 2px 8px rgba(250, 140, 22, 0.15)' : 'none',
                                }}
                              >
                                {/* Report Card Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FileSearchOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
                                    <Text strong style={{ fontSize: 14 }}>Georeporte #{repId}</Text>
                                    {isCurrent ? (
                                      <Tag color="gold" icon={<StarFilled />} style={{ fontWeight: 'bold' }}>
                                        ⭐ Vigente Oficial en Mapa
                                      </Tag>
                                    ) : (
                                      <Tag color="default">Histórico</Tag>
                                    )}
                                  </div>

                                  <Space size="small">
                                    <span className="text-xs text-gray-500">
                                      {renderDateWithProse(report.created_at, { showIcon: true })}
                                    </span>
                                    {report.created_by_first_name && (
                                      <span className="text-xs text-gray-400">
                                        | Por: {report.created_by_first_name} {report.created_by_last_name || ''}
                                      </span>
                                    )}
                                  </Space>
                                </div>

                                {/* Hierarchical Nested Components: In-Situ Test & In-Lab Test */}
                                <Row gutter={12}>
                                  {/* 1. Prueba In-Situ */}
                                  <Col span={12}>
                                    <Card
                                      size="small"
                                      title={
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                          <span style={{ color: '#237804', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <BulbOutlined /> 1. Prueba In-Situ (Campo)
                                          </span>
                                          {linkedInsitu && canManageInsitu && (
                                            <Button
                                              type="link"
                                              size="small"
                                              icon={<EditOutlined />}
                                              onClick={() => handleOpenEditInsitu(linkedInsitu)}
                                            >
                                              Editar
                                            </Button>
                                          )}
                                        </div>
                                      }
                                      style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8 }}
                                    >
                                      {linkedInsitu ? (
                                        <div className="space-y-1 text-xs">
                                          <div>
                                            <span className="text-gray-500">ID:</span> <span className="font-mono">{linkedInsitu.insitu_test_id || linkedInsitu.id}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Temperatura:</span>{' '}
                                            <Tag color={linkedInsitu.temperature > 50 ? 'red' : linkedInsitu.temperature > 30 ? 'orange' : 'blue'}>
                                              {linkedInsitu.temperature}°C
                                            </Tag>
                                            <span className="text-gray-500 ml-2">pH:</span> <Tag color="cyan">{linkedInsitu.ph ?? 'N/A'}</Tag>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Conductividad:</span> {linkedInsitu.conductivity ? `${linkedInsitu.conductivity} μS/cm` : 'N/A'}
                                          </div>
                                          {linkedInsitu.description && (
                                            <div className="text-gray-600 italic">"{linkedInsitu.description}"</div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-xs text-gray-500 font-mono">
                                          ID Prueba: {report.insitu_test_id}
                                        </div>
                                      )}
                                    </Card>
                                  </Col>

                                  {/* 2. Prueba de Laboratorio */}
                                  <Col span={12}>
                                    <Card
                                      size="small"
                                      title={
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                          <span style={{ color: '#531dab', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <BarChartOutlined /> 2. Prueba Laboratorio (Geoquímica)
                                          </span>
                                          {linkedInlab && canManageInlab && (
                                            <Button
                                              type="link"
                                              size="small"
                                              icon={<EditOutlined />}
                                              onClick={() => handleOpenEditInlab(linkedInlab)}
                                            >
                                              Editar
                                            </Button>
                                          )}
                                        </div>
                                      }
                                      style={{ background: '#f9f0ff', border: '1px solid #d3adf7', borderRadius: 8 }}
                                    >
                                      {linkedInlab ? (
                                        <div className="space-y-1 text-xs">
                                          <div>
                                            <span className="text-gray-500">ID:</span> <span className="font-mono">{linkedInlab.inlab_test_id || linkedInlab.id}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">pH Lab:</span> <Tag color="purple">{linkedInlab.ph ?? 'N/A'}</Tag>
                                            <span className="text-gray-500 ml-2">Cond:</span> {linkedInlab.conductivity ? `${linkedInlab.conductivity} μS/cm` : 'N/A'}
                                          </div>
                                          <div className="text-gray-600">
                                            <span className="font-semibold">Iones:</span> Cl: {linkedInlab.cl ?? '-'} | Ca: {linkedInlab.ca ?? '-'} | SO4: {linkedInlab.so4 ?? '-'} | HCO3: {linkedInlab.hco3 ?? '-'}
                                          </div>
                                          <div className="text-gray-600">
                                            <span className="font-semibold">Trazas:</span> Fe: {linkedInlab.fe ?? '-'} | Si: {linkedInlab.si ?? '-'} | B: {linkedInlab.b ?? '-'}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-xs text-gray-500 font-mono">
                                          ID Lab: {report.inlab_test_id}
                                        </div>
                                      )}
                                    </Card>
                                  </Col>
                                </Row>

                                {/* Report Diagnosis / Details */}
                                <div style={{ marginTop: 12, padding: '8px 12px', background: '#fafafa', borderRadius: 6, border: '1px solid #f0f0f0' }}>
                                  <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: 2 }}>
                                    📝 Conclusiones / Diagnóstico del Georeporte:
                                  </Text>
                                  <Paragraph style={{ margin: 0, fontSize: '13px', color: '#262626' }}>
                                    {report.details || 'Sin observaciones adicionales registradas.'}
                                  </Paragraph>
                                </div>

                                {/* Report Actions */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                                  {!isCurrent && (
                                    <Popconfirm
                                      title="¿Promover este georeporte a vigente?"
                                      description="Se convertirá en el reporte oficial para el mapa geotérmico público."
                                      onConfirm={() => handlePromoteGeoreport(report)}
                                      okText="Sí, promover"
                                      cancelText="Cancelar"
                                    >
                                      <Button
                                        size="small"
                                        icon={<StarOutlined />}
                                        loading={promotingId === repId}
                                        style={{ color: '#fa8c16', borderColor: '#ffd591' }}
                                      >
                                        Hacer Vigente
                                      </Button>
                                    </Popconfirm>
                                  )}

                                  <Button
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => handleOpenEditGeoreport(report)}
                                  >
                                    Editar Georeporte
                                  </Button>

                                  <Popconfirm
                                    title="¿Eliminar este georeporte?"
                                    description="Se desvinculará de la geomanifestación."
                                    onConfirm={() => handleDeleteGeoreport(report)}
                                    okText="Sí"
                                    cancelText="No"
                                  >
                                    <Button size="small" icon={<DeleteOutlined />} danger>
                                      Eliminar
                                    </Button>
                                  </Popconfirm>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'insitu',
                  label: (
                    <span>
                      <BulbOutlined />
                      Pruebas In-Situ ({insituTests.length})
                    </span>
                  ),
                  children: (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text strong style={{ fontSize: '15px' }}>🌿 Historial de Mediciones In-Situ</Text>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          disabled={!canManageInsitu}
                          onClick={handleOpenCreateInsitu}
                          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        >
                          + Agregar Medición In-Situ
                        </Button>
                      </div>

                      <Table
                        dataSource={insituTests}
                        rowKey={(r) => r.insitu_test_id || r.id}
                        pagination={false}
                        columns={[
                          {
                            title: 'ID Prueba',
                            dataIndex: 'insitu_test_id',
                            key: 'id',
                            render: (val, r) => <span className="font-mono text-xs">{val || r.id}</span>,
                          },
                          {
                            title: 'Temperatura',
                            dataIndex: 'temperature',
                            key: 'temp',
                            render: (val) => val !== null && val !== undefined ? (
                              <Tag color={val > 50 ? 'red' : val > 30 ? 'orange' : 'blue'}>{val}°C</Tag>
                            ) : 'N/A',
                          },
                          {
                            title: 'Conductividad',
                            dataIndex: 'conductivity',
                            key: 'cond',
                            render: (val) => val !== null && val !== undefined ? `${val} μS/cm` : 'N/A',
                          },
                          {
                            title: 'pH Campo',
                            dataIndex: 'ph',
                            key: 'ph',
                            render: (val) => val !== null && val !== undefined ? <Tag color="cyan">{val}</Tag> : 'N/A',
                          },
                          {
                            title: 'Notas',
                            dataIndex: 'description',
                            key: 'desc',
                            ellipsis: true,
                            render: (val) => val || 'Sin notas',
                          },
                          {
                            title: 'Fecha',
                            dataIndex: 'created_at',
                            key: 'date',
                            render: (val) => renderDateWithProse(val, { showIcon: false }),
                          },
                          {
                            title: 'Acciones',
                            key: 'acts',
                            render: (_, record) => (
                              <Space size="small">
                                <Button
                                  icon={<EditOutlined />}
                                  size="small"
                                  type="primary"
                                  ghost
                                  disabled={!canManageInsitu}
                                  onClick={() => handleOpenEditInsitu(record)}
                                />
                                <Popconfirm
                                  title="¿Eliminar prueba in-situ?"
                                  onConfirm={() => handleDeleteInsitu(record)}
                                  okText="Sí"
                                  cancelText="No"
                                >
                                  <Button icon={<DeleteOutlined />} size="small" danger disabled={!canManageInsitu} />
                                </Popconfirm>
                              </Space>
                            ),
                          },
                        ]}
                      />
                    </div>
                  ),
                },
                {
                  key: 'inlab',
                  label: (
                    <span>
                      <BarChartOutlined />
                      Pruebas de Laboratorio ({inlabTests.length})
                    </span>
                  ),
                  children: (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                          <Text strong style={{ fontSize: '15px' }}>🧪 Historial de Análisis Geoquímicos</Text>
                          <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                            Registra y consulta análisis químicos y de laboratorio para esta geomanifestación.
                          </Paragraph>
                        </div>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          disabled={!canManageInlab}
                          onClick={handleOpenCreateInlab}
                          style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
                        >
                          + Agregar Prueba de Lab
                        </Button>
                      </div>

                      <Table
                        dataSource={inlabTests}
                        rowKey={(r) => r.inlab_test_id || r.id}
                        pagination={false}
                        columns={[
                          {
                            title: 'ID Prueba',
                            dataIndex: 'inlab_test_id',
                            key: 'id',
                            render: (val, r) => <span className="font-mono text-xs">{val || r.id}</span>,
                          },
                          {
                            title: 'pH Lab',
                            dataIndex: 'ph',
                            key: 'ph',
                            render: (val) => val !== null && val !== undefined ? <Tag color="purple">{val}</Tag> : 'N/A',
                          },
                          {
                            title: 'Cond. (μS/cm)',
                            dataIndex: 'conductivity',
                            key: 'cond',
                            render: (val) => val ?? 'N/A',
                          },
                          {
                            title: 'Iones Principales (mg/L)',
                            key: 'ions',
                            render: (_, r) => (
                              <div className="text-xs">
                                Cl: {r.cl ?? '-'} | Ca: {r.ca ?? '-'} | SO4: {r.so4 ?? '-'} | HCO3: {r.hco3 ?? '-'}
                              </div>
                            ),
                          },
                          {
                            title: 'Fecha',
                            dataIndex: 'created_at',
                            key: 'date',
                            render: (val) => renderDateWithProse(val, { showIcon: false }),
                          },
                          {
                            title: 'Acciones',
                            key: 'acts',
                            render: (_, record) => (
                              <Space size="small">
                                <Button
                                  icon={<EditOutlined />}
                                  size="small"
                                  type="primary"
                                  ghost
                                  disabled={!canManageInlab}
                                  onClick={() => handleOpenEditInlab(record)}
                                />
                                <Popconfirm
                                  title="¿Eliminar prueba de laboratorio?"
                                  description="Fallará si está vinculada a un georeporte."
                                  onConfirm={() => handleDeleteInlab(record)}
                                  okText="Sí"
                                  cancelText="No"
                                >
                                  <Button icon={<DeleteOutlined />} size="small" danger disabled={!canManageInlab} />
                                </Popconfirm>
                              </Space>
                            ),
                          },
                        ]}
                      />
                    </div>
                  ),
                },
                {
                  key: 'comments',
                  label: (
                    <span>
                      <CommentOutlined />
                      Comentarios y Colaboración
                    </span>
                  ),
                  children: (
                    <div>
                      <div style={{ marginBottom: 16, background: '#f0f5ff', padding: '12px 16px', borderRadius: 8, border: '1px solid #adc6ff' }}>
                        <Text strong style={{ color: '#1d39c4' }}>
                          💬 Espacio Colaborativo para Investigadores
                        </Text>
                        <Paragraph style={{ margin: 0, fontSize: '12px', color: '#2f54eb' }}>
                          Utiliza este espacio para coordinar con otros investigadores, registrar notas sobre el muestreo, discutir resultados de laboratorio o dejar observaciones sobre esta geomanifestación.
                        </Paragraph>
                      </div>

                      <CommentsPanel
                        entityType="geomanifestation"
                        entityId={selectedGeo.geomanifestation_id || selectedGeo.id}
                        title="Bitácora y Comentarios de la Geomanifestación"
                      />
                    </div>
                  ),
                },
                {
                  key: 'info',
                  label: (
                    <span>
                      <InfoCircleOutlined />
                      Detalles Geográficos
                    </span>
                  ),
                  children: (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <Title level={5} style={{ marginTop: 0 }}>Información Geográfica y Origen</Title>
                      <p><strong>Descripción:</strong> {selectedGeo.description || 'Sin descripción'}</p>
                      <p><strong>Ubicación SNIT:</strong> {selectedGeo.locationText || 'Costa Rica'}</p>
                      <p><strong>Coordenadas:</strong> Lat {selectedGeo.latitude}, Lng {selectedGeo.longitude}</p>
                      {selectedGeo.field_trip_id && (
                        <p>
                          <strong>Gira de Campo:</strong>{' '}
                          <Tag color="orange" icon={<CompassOutlined />}>
                            {selectedGeo.field_trip_id}
                          </Tag>
                        </p>
                      )}
                      {selectedGeo.request_id && (
                        <p><strong>Origen Solicitud:</strong> <span className="font-mono text-blue-600">{selectedGeo.request_id}</span></p>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Drawer>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL: ASSOCIATE GEOREPORT (SELECT IN-SITU + SELECT IN-LAB)                */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL: ASSOCIATE GEOREPORT (SELECT IN-SITU + SELECT IN-LAB)                */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-xl text-geoterra-blue flex items-center gap-2">
              <FileSearchOutlined className="text-geoterra-blue" />
              {editingGeoreport ? 'Editar Asociación de Georeporte' : 'Asociar Georeporte'} — {selectedGeo?.name}
            </span>
          </div>
        }
        open={georeportModalVisible}
        onOk={() => georeportForm.submit()}
        onCancel={() => {
          setGeoreportModalVisible(false);
          setEditingGeoreport(null);
        }}
        confirmLoading={submittingGeoreport}
        okText={editingGeoreport ? 'Guardar Cambios' : 'Asociar Georeporte'}
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: '#12467E', borderColor: '#12467E' },
          className: 'poppins-bold',
        }}
        cancelButtonProps={{
          className: 'poppins',
        }}
        width={750}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 160px)',
            overflowY: 'auto',
            paddingRight: 8
          }
        }}
      >
        <Form
          form={georeportForm}
          layout="vertical"
          onFinish={handleSaveGeoreport}
          className="poppins space-y-4 py-2"
        >
          <p className="text-xs text-gray-500 m-0 poppins">
            Selecciona una medición de campo (In-Situ) y un análisis de laboratorio (Geoquímica) ya registrados para consolidar este georeporte.
          </p>

          {(insituTests.length === 0 || inlabTests.length === 0) && (
            <Alert
              type="warning"
              showIcon
              className="rounded-xl border border-amber-200"
              message={<span className="poppins-bold text-amber-900">Pruebas requeridas para asociar</span>}
              description={
                <div className="text-xs poppins text-amber-800">
                  Un georeporte requiere vincular tanto una prueba in-situ como una de laboratorio.
                  {insituTests.length === 0 && (
                    <div className="mt-1">
                      • <strong>Falta prueba in-situ:</strong> Puedes registrarla en la pestaña <em>Pruebas In-Situ</em>.
                    </div>
                  )}
                  {inlabTests.length === 0 && (
                    <div className="mt-1">
                      • <strong>Falta análisis de laboratorio:</strong> Puedes registrarlo en la pestaña <em>Pruebas de Laboratorio</em>.
                    </div>
                  )}
                </div>
              }
            />
          )}

          {/* 1. SECCIÓN: PRUEBA IN-SITU */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
              <BulbOutlined className="text-geoterra-blue" /> 1. Prueba de Campo (In-Situ)
            </h3>
            <Form.Item
              name="insitu_test_id"
              label={<span className="font-semibold text-gray-700">Seleccionar Medición In-Situ</span>}
              rules={[{ required: true, message: 'Selecciona una prueba in-situ' }]}
              style={{ marginBottom: 0 }}
            >
              <Select
                placeholder={insituTests.length === 0 ? "No hay pruebas in-situ disponibles" : "Selecciona una prueba in-situ para asociar"}
                disabled={insituTests.length === 0}
                allowClear
                className="w-full rounded-lg"
              >
                {insituTests.map((t) => (
                  <Select.Option key={t.insitu_test_id || t.id} value={t.insitu_test_id || t.id}>
                    #{t.insitu_test_id || t.id} — Temp: {t.temperature}°C | Cond: {t.conductivity ?? 'N/A'} μS/cm | pH: {t.ph ?? 'N/A'} ({renderDateWithProse(t.created_at, { showIcon: false })})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {/* 2. SECCIÓN: PRUEBA DE LABORATORIO */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
              <BarChartOutlined className="text-geoterra-blue" /> 2. Prueba de Laboratorio (Geoquímica)
            </h3>
            <Form.Item
              name="inlab_test_id"
              label={<span className="font-semibold text-gray-700">Seleccionar Análisis de Laboratorio</span>}
              rules={[{ required: true, message: 'Selecciona una prueba de laboratorio' }]}
              style={{ marginBottom: 0 }}
            >
              <Select
                placeholder={inlabTests.length === 0 ? "No hay análisis de laboratorio disponibles" : "Selecciona una prueba de laboratorio para asociar"}
                disabled={inlabTests.length === 0}
                allowClear
                className="w-full rounded-lg"
              >
                {inlabTests.map((t) => (
                  <Select.Option key={t.inlab_test_id || t.id} value={t.inlab_test_id || t.id}>
                    #{t.inlab_test_id || t.id} — pH: {t.ph ?? 'N/A'} | Cond: {t.conductivity ?? 'N/A'} μS/cm | Cl: {t.cl ?? '-'} | Ca: {t.ca ?? '-'} | SO4: {t.so4 ?? '-'} ({renderDateWithProse(t.created_at, { showIcon: false })})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {/* 3. SECCIÓN: DETALLES DEL GEOREPORTE */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
              <FileSearchOutlined className="text-geoterra-blue" /> 3. Diagnóstico y Publicación del Georeporte
            </h3>
            <Form.Item
              name="details"
              label={<span className="font-semibold text-gray-700">Conclusiones de la Evaluación Geotérmica</span>}
              rules={[{ max: 500, message: 'Máximo 500 caracteres' }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Diagnóstico geotérmico del recurso, estimación de temperatura profunda, clasificación hidrogeoquímica..."
                maxLength={500}
                showCount
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item name="set_as_current" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Checkbox>
                <span className="poppins-bold text-geoterra-blue">⭐ Establecer como Georeporte Vigente oficial</span> <span className="text-xs text-gray-500">(publicado en el mapa de GeoterRA)</span>
              </Checkbox>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: EDIT POINT COORDINATES & SNIT METADATA                             */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-xl text-geoterra-blue flex items-center gap-2">
              <EnvironmentOutlined className="text-geoterra-blue" />
              {editingItem ? 'Editar Geomanifestación' : 'Agregar Punto Manualmente'}
            </span>
          </div>
        }
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={handleModalClose}
        okText={editingItem ? 'Guardar Cambios' : 'Guardar Geomanifestación'}
        cancelText="Cancelar"
        confirmLoading={submitting}
        okButtonProps={{
          style: { backgroundColor: '#12467E', borderColor: '#12467E' },
          className: 'poppins-bold',
        }}
        cancelButtonProps={{
          className: 'poppins',
        }}
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
          className="poppins space-y-4 py-2"
        >
          {/* Seccion 1: Coordenadas GPS */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
              <EnvironmentOutlined className="text-geoterra-blue" /> Ubicación y Coordenadas GPS
            </h3>
            <Form.Item style={{ marginBottom: 0 }}>
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
          </div>

          {/* Seccion 2: Informacion del Punto */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
              <InfoCircleOutlined className="text-geoterra-blue" /> Información del Punto y División Territorial
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label={<span className="font-semibold text-gray-700">Nombre del Punto</span>}
                rules={[{ required: true, message: 'El nombre es requerido' }]}
              >
                <Input placeholder="Ej: Termal Sitio U1" className="rounded-lg py-1.5" />
              </Form.Item>

              <Form.Item
                name="province_snit_code"
                label={<span className="font-semibold text-gray-700">Provincia</span>}
              >
                <Select placeholder="Selecciona una provincia" onChange={handleProvinceChange} allowClear className="rounded-lg">
                  {provinces.map((prov) => (
                    <Select.Option key={prov.province_snit_code || prov.province_id} value={prov.province_snit_code}>
                      {prov.province_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="canton_snit_code"
                label={<span className="font-semibold text-gray-700">Cantón</span>}
              >
                <Select placeholder="Selecciona un cantón" onChange={handleCantonChange} allowClear disabled={cantons.length === 0} className="rounded-lg">
                  {cantons.map((c) => (
                    <Select.Option key={c.canton_snit_code || c.canton_id} value={c.canton_snit_code}>
                      {c.canton_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="district_snit_code"
                label={<span className="font-semibold text-gray-700">Distrito</span>}
              >
                <Select placeholder="Selecciona un distrito" allowClear disabled={districts.length === 0} className="rounded-lg">
                  {districts.map((d) => (
                    <Select.Option key={d.district_snit_code || d.district_id} value={d.district_snit_code}>
                      {d.district_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              name="field_trip_id"
              label={<span className="font-semibold text-gray-700">Gira de Campo Vinculada (Opcional)</span>}
            >
              <Select placeholder="Selecciona una gira de campo" allowClear showSearch optionFilterProp="label" className="rounded-lg">
                {fieldTripsList.map((trip) => (
                  <Select.Option key={trip.field_trip_id || trip.id} value={trip.field_trip_id || trip.id}>
                    {trip.field_trip_name} {trip.field_trip_scheduled_date ? `(${trip.field_trip_scheduled_date})` : ''}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label={<span className="font-semibold text-gray-700">Descripción</span>}
            >
              <Input.TextArea rows={2} placeholder="Descripción de la manifestación geotermal" className="rounded-lg" />
            </Form.Item>

            <Form.Item
              name="visibility"
              valuePropName="checked"
              label={<span className="font-semibold text-gray-700">Visibilidad pública</span>}
              style={{ marginBottom: 0 }}
            >
              <Switch checkedChildren="Pública" unCheckedChildren="Oculta / Borrador" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: EDIT SPECIFIC IN-SITU TEST                                         */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-xl text-geoterra-blue flex items-center gap-2">
              <BulbOutlined className="text-geoterra-blue" />
              {editingInsituTest ? 'Editar Prueba In-Situ' : 'Registrar Medición In-Situ'}
            </span>
          </div>
        }
        open={quickInsituModalVisible}
        onOk={() => quickInsituForm.submit()}
        onCancel={() => {
          setQuickInsituModalVisible(false);
          setEditingInsituTest(null);
        }}
        confirmLoading={submittingInsitu}
        okText={editingInsituTest ? 'Guardar Cambios' : 'Registrar Medición'}
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: '#12467E', borderColor: '#12467E' },
          className: 'poppins-bold',
        }}
        cancelButtonProps={{
          className: 'poppins',
        }}
      >
        <div className="py-2 space-y-4 poppins">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
              <BulbOutlined className="text-geoterra-blue" /> Parámetros In-Situ de Campo
            </h3>
            <Form form={quickInsituForm} layout="vertical" onFinish={handleSaveQuickInsitu} className="poppins">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Form.Item
                  name="temperature"
                  label={<span className="font-semibold text-gray-700">Temperatura (°C)</span>}
                  rules={[{ required: true, message: 'La temperatura es requerida' }]}
                >
                  <InputNumber style={{ width: '100%' }} placeholder="Ej: 55.4" step={0.1} min={0} max={200} className="rounded-lg py-1" />
                </Form.Item>

                <Form.Item
                  name="conductivity"
                  label={<span className="font-semibold text-gray-700">Conductividad (μS/cm)</span>}
                >
                  <InputNumber style={{ width: '100%' }} placeholder="Ej: 1200" min={0} step={1} className="rounded-lg py-1" />
                </Form.Item>

                <Form.Item
                  name="ph"
                  label={<span className="font-semibold text-gray-700">pH Campo</span>}
                >
                  <InputNumber style={{ width: '100%' }} placeholder="Ej: 6.5" min={0} max={14} step={0.01} className="rounded-lg py-1" />
                </Form.Item>
              </div>

              <Form.Item
                name="description"
                label={<span className="font-semibold text-gray-700">Notas / Descripción de Campo</span>}
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea rows={3} placeholder="Condiciones de medición, clima, color del agua..." className="rounded-lg" />
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: EDIT SPECIFIC IN-LAB TEST                                          */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-xl text-geoterra-blue flex items-center gap-2">
              <BarChartOutlined className="text-geoterra-blue" />
              {editingInlabTest ? 'Editar Análisis de Laboratorio' : 'Registrar Análisis de Laboratorio'}
            </span>
          </div>
        }
        open={quickInlabModalVisible}
        onOk={() => quickInlabForm.submit()}
        onCancel={() => {
          setQuickInlabModalVisible(false);
          setEditingInlabTest(null);
        }}
        confirmLoading={submittingInlab}
        okText={editingInlabTest ? 'Guardar Cambios' : 'Registrar Prueba de Lab'}
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: '#12467E', borderColor: '#12467E' },
          className: 'poppins-bold',
        }}
        cancelButtonProps={{
          className: 'poppins',
        }}
        width={750}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 160px)',
            overflowY: 'auto',
            paddingRight: 8
          }
        }}
      >
        <Form form={quickInlabForm} layout="vertical" onFinish={handleSaveQuickInlab} className="poppins space-y-4 py-2">
          {/* Seccion 1: Parametros Fisico-Quimicos */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
              <BarChartOutlined className="text-geoterra-blue" /> Parámetros Físico-Químicos de Laboratorio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item name="ph" label={<span className="font-semibold text-gray-700">pH Laboratorio</span>} style={{ marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} min={0} max={14} step={0.01} placeholder="7.2" className="rounded-lg py-1" />
              </Form.Item>
              <Form.Item name="conductivity" label={<span className="font-semibold text-gray-700">Conductividad (μS/cm)</span>} style={{ marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} min={0} step={1} placeholder="1250" className="rounded-lg py-1" />
              </Form.Item>
            </div>
          </div>

          {/* Seccion 2: Iones Mayores */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
              <ExperimentOutlined className="text-geoterra-blue" /> Iones Mayores (mg/L)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Form.Item name="cl" label={<span className="font-semibold text-gray-700">Cl</span>} style={{ marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" />
              </Form.Item>
              <Form.Item name="ca" label={<span className="font-semibold text-gray-700">Ca</span>} style={{ marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" />
              </Form.Item>
              <Form.Item name="hco3" label={<span className="font-semibold text-gray-700">HCO3</span>} style={{ marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" />
              </Form.Item>
              <Form.Item name="so4" label={<span className="font-semibold text-gray-700">SO4</span>} style={{ marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" />
              </Form.Item>
              <Form.Item name="na" label={<span className="font-semibold text-gray-700">Na</span>} style={{ marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" />
              </Form.Item>
              <Form.Item name="k" label={<span className="font-semibold text-gray-700">K</span>} style={{ marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" />
              </Form.Item>
              <Form.Item name="mg" label={<span className="font-semibold text-gray-700">Mg</span>} style={{ marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" />
              </Form.Item>
              <Form.Item name="si" label={<span className="font-semibold text-gray-700">Si</span>} style={{ marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.01} className="rounded-lg" />
              </Form.Item>
            </div>
          </div>

          {/* Seccion 3: Elementos Traza */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
              <ExperimentOutlined className="text-geoterra-blue" /> Elementos Traza (mg/L)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Form.Item name="fe" label={<span className="font-semibold text-gray-700">Fe</span>} style={{ marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.001} className="rounded-lg" />
              </Form.Item>
              <Form.Item name="b" label={<span className="font-semibold text-gray-700">B</span>} style={{ marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.001} className="rounded-lg" />
              </Form.Item>
              <Form.Item name="li" label={<span className="font-semibold text-gray-700">Li</span>} style={{ marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.001} className="rounded-lg" />
              </Form.Item>
              <Form.Item name="f" label={<span className="font-semibold text-gray-700">F</span>} style={{ marginBottom: 0 }}>
                <InputNumber style={{ width: '100%' }} min={0} step={0.001} className="rounded-lg" />
              </Form.Item>
            </div>
          </div>

          {/* Seccion 4: Notas de Laboratorio */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
              <InfoCircleOutlined className="text-geoterra-blue" /> Notas de Laboratorio
            </h3>
            <Form.Item name="description" style={{ marginBottom: 0 }}>
              <Input.TextArea rows={3} placeholder="Notas del análisis geoquímico, método utilizado..." className="rounded-lg" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default GeomanifeStationsManager;