import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  DatePicker,
  Select,
  Switch,
  Table,
  Space,
  Spin,
  Popconfirm,
  Tooltip,
  Tabs,
  Row,
  Col,
  Statistic,
  Avatar,
  Badge,
  Divider,
  message,
  List,
  Empty,
  Alert,
} from 'antd';
import {
  CompassOutlined,
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  LinkOutlined,
  DisconnectOutlined,
  FireOutlined,
  SearchOutlined,
  UserOutlined,
  ThunderboltOutlined,
  AimOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  fieldTripsIndex,
  fieldTripsMy,
  fieldTripsShow,
  fieldTripsStore,
  fieldTripsUpdate,
  fieldTripsToggleActive,
  fieldTripsAddParticipant,
  fieldTripsRemoveParticipant,
  fieldTripsLinkManifestation,
  fieldTripsUnlinkManifestation,
  fieldTripsDelete,
  provincesIndex,
  cantonsIndex,
  districtsIndex,
  maintenanceAllUsers,
  geomanifestationsAdminIndex,
  geomanifestationsIndex,
  geomanifestationsAdminStore,
  geomanifestationsAdminUpdate,
  insituTestsStore,
} from '../../../../config/apiConf';
import { useSession } from '../../../../hooks/useSession';
import { usePermissions } from '../../../../hooks/usePermissions';
import CommentsPanel from '../../../common/CommentsPanel';
import MapCoordinatePicker from '../../../common/MapCoordinatePicker';

const { Title, Paragraph, Text } = Typography;

const extractList = (resData) => {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData.data)) return resData.data;
  if (Array.isArray(resData.data?.data)) return resData.data.data;
  if (Array.isArray(resData.items)) return resData.items;
  return [];
};

const FieldTripsManager = () => {
  const { user } = useSession();
  const { hasPermission, PERMISSIONS } = usePermissions();

  // Tab: 'all' vs 'my'
  const [activeTab, setActiveTab] = useState('all');

  // Lists state
  const [trips, setTrips] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

  // Territories & Options state
  const [provinces, setProvinces] = useState([]);
  const [cantons, setCantons] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allManifestations, setAllManifestations] = useState([]);

  // Create / Edit Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [loadingEditModal, setLoadingEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Detail Drawer state
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Quick Action in Detail: Add Participant / Link Manifestation
  const [selectedNewUser, setSelectedNewUser] = useState(null);
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [selectedNewManifestation, setSelectedNewManifestation] = useState(null);
  const [linkingManifestation, setLinkingManifestation] = useState(false);

  const canManage = hasPermission(PERMISSIONS.MANAGE_FIELD_TRIPS);
  const canFastPoint =
    hasPermission(PERMISSIONS.MANAGE_GEOMANIFESTATIONS) ||
    hasPermission(PERMISSIONS.MANAGE_INSITU_TESTS);
  const currentUserId = user?.user_id || user?.id;

  // Fast Point (Punto Rápido en Campo) state
  const [fastPointModalVisible, setFastPointModalVisible] = useState(false);
  const [fastPointSubmitting, setFastPointSubmitting] = useState(false);
  const [fastPointForm] = Form.useForm();
  const [gettingGps, setGettingGps] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [fastPointCoords, setFastPointCoords] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [fastPointSelectedTrip, setFastPointSelectedTrip] = useState(null);

  // Lab Revision: Rename Manifestation state
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renamingManifestation, setRenamingManifestation] = useState(null);
  const [renameSubmitting, setRenameSubmitting] = useState(false);
  const [renameForm] = Form.useForm();

  // Load Provinces
  const loadProvinces = async () => {
    try {
      const res = await provincesIndex();
      if (res.ok && Array.isArray(res.data)) {
        setProvinces(res.data);
      }
    } catch (err) {
      console.error('❌ Error loading provinces:', err);
    }
  };

  // Load Users for participant selection
  const loadUsers = async () => {
    try {
      const res = await maintenanceAllUsers();
      if (res.ok && res.data) {
        setAllUsers(extractList(res.data));
      }
    } catch {
      // Ignored if current user lacks maintenance role
    }
  };

  // Load Geomanifestations for linking
  const loadManifestations = async () => {
    try {
      let res = await geomanifestationsAdminIndex({ show_all: 'true', limit: 1000 });
      if (!res.ok) {
        res = await geomanifestationsIndex({ show_all: 'true', limit: 1000 });
      }
      if (res.ok && res.data) {
        setAllManifestations(extractList(res.data));
      }
    } catch (err) {
      console.error('❌ Error loading manifestations:', err);
    }
  };

  // Load Field Trips
  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      const [resAll, resMy] = await Promise.allSettled([
        fieldTripsIndex({ limit: 1000 }),
        fieldTripsMy(),
      ]);

      if (resAll.status === 'fulfilled' && resAll.value.ok) {
        setTrips(extractList(resAll.value.data));
      } else {
        setTrips([]);
      }

      if (resMy.status === 'fulfilled' && resMy.value.ok) {
        setMyTrips(extractList(resMy.value.data));
      } else {
        setMyTrips([]);
      }
    } catch (err) {
      console.error('❌ Error loading field trips:', err);
      message.error('Error al cargar giras de campo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
    loadProvinces();
    loadUsers();
    loadManifestations();
  }, [loadTrips]);

  // Handle province change in form
  const handleProvinceChange = async (provinceSnitCode) => {
    form.setFieldsValue({ canton_snit_code: undefined, district_snit_code: undefined });
    setCantons([]);
    setDistricts([]);
    if (!provinceSnitCode) return;

    try {
      const res = await cantonsIndex(provinceSnitCode);
      if (res.ok && Array.isArray(res.data)) {
        setCantons(res.data);
      }
    } catch (err) {
      console.error('❌ Error loading cantons:', err);
    }
  };

  // Handle canton change in form
  const handleCantonChange = async (cantonSnitCode) => {
    form.setFieldsValue({ district_snit_code: undefined });
    setDistricts([]);
    if (!cantonSnitCode) return;

    try {
      const res = await districtsIndex(cantonSnitCode);
      if (res.ok && Array.isArray(res.data)) {
        setDistricts(res.data);
      }
    } catch (err) {
      console.error('❌ Error loading districts:', err);
    }
  };

  // ============================================
  // FAST POINT (PUNTO RÁPIDO EN CAMPO) LOGIC
  // ============================================

  // Helper to generate a generic point name based on the trip
  const generateGenericPointName = (trip) => {
    const tripObj = trip || fastPointSelectedTrip;
    const existingCount = Array.isArray(tripObj?.geomanifestations)
      ? tripObj.geomanifestations.length
      : 0;
    const pointNum = existingCount + 1;
    const tripName = tripObj?.field_trip_name
      ? tripObj.field_trip_name.trim().slice(0, 25)
      : 'Gira';
    const timeStr = dayjs().format('HH:mm');
    return `Punto #${pointNum} - ${tripName} (${timeStr})`;
  };

  // Fast Point: Capture GPS location
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      message.error('La geolocalización no está soportada por tu dispositivo');
      return;
    }
    setGettingGps(true);
    setGpsAccuracy(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy);
        fastPointForm.setFieldsValue({ latitude: lat, longitude: lng });
        setFastPointCoords({ lat, lng });
        setGpsAccuracy(`±${acc}m`);
        setGettingGps(false);
        message.success(`Ubicación GPS capturada: ${lat}, ${lng} (precisión: ±${acc}m)`);
      },
      (err) => {
        setGettingGps(false);
        let msg = 'No se pudo obtener señal GPS automática';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Permiso denegado para acceder al GPS';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Señal GPS no disponible temporalmente';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Tiempo agotado al consultar GPS';
        }
        message.warning(`${msg}. Puedes usar el mapa interactivo si lo requieres.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Open Fast Point Modal
  const handleOpenFastPoint = async (tripRecord = null) => {
    fastPointForm.resetFields();
    setFastPointCoords(null);
    setGpsAccuracy(null);
    setShowMapPicker(false);

    // If tripRecord provided, use it; otherwise pick selectedTrip if open, active trip, or first
    const activeTrips = trips.filter((t) => t.field_trip_is_active);
    const tripToSelect =
      tripRecord ||
      (selectedTrip ? selectedTrip : null) ||
      (activeTrips.length > 0 ? activeTrips[0] : (trips[0] || null));
    const tripId = tripToSelect ? (tripToSelect.field_trip_id || tripToSelect.id) : undefined;

    setFastPointSelectedTrip(tripToSelect);

    const autoName = generateGenericPointName(tripToSelect);

    const initialValues = {
      field_trip_id: tripId,
      geomanifestation_name: autoName,
      temperature: null,
      ph: null,
      conductivity: null,
      latitude: undefined,
      longitude: undefined,
    };

    fastPointForm.setFieldsValue(initialValues);
    setFastPointModalVisible(true);

    // Automatically trigger GPS satellite capture immediately upon opening
    handleGetGpsLocation();
  };

  // Fast Point: Trip selection changed
  const handleFastPointTripChange = (tripId) => {
    const trip =
      trips.find((t) => (t.field_trip_id || t.id) === tripId) ||
      myTrips.find((t) => (t.field_trip_id || t.id) === tripId);
    setFastPointSelectedTrip(trip || null);

    if (trip) {
      const currentName = fastPointForm.getFieldValue('geomanifestation_name');
      // If name is empty or starts with "Punto #", update to reflect new trip
      if (!currentName || currentName.startsWith('Punto #')) {
        fastPointForm.setFieldsValue({
          geomanifestation_name: generateGenericPointName(trip),
        });
      }
    }
  };

  // Fast Point: Submit Geomanifestation + Insitu Test
  const handleFastPointSubmit = async (values) => {
    try {
      setFastPointSubmitting(true);

      const tripId = values.field_trip_id;
      const gmName = values.geomanifestation_name?.trim();
      const lat = Number(values.latitude ?? fastPointCoords?.lat);
      const lng = Number(values.longitude ?? fastPointCoords?.lng);

      if (!gmName) {
        message.error('Por favor ingresa un nombre para la geomanifestación');
        return;
      }
      if (isNaN(lat) || isNaN(lng)) {
        message.error('Por favor captura la ubicación GPS o indícala en el mapa');
        return;
      }

      // Inherit territory silently from selected field trip
      const trip =
        trips.find((t) => (t.field_trip_id || t.id) === tripId) ||
        myTrips.find((t) => (t.field_trip_id || t.id) === tripId) ||
        fastPointSelectedTrip;

      const pCode = trip?.province_snit_code ?? trip?.location?.province_snit_code ?? null;
      const cCode = trip?.canton_snit_code ?? trip?.location?.canton_snit_code ?? null;
      const dCode = trip?.district_snit_code ?? trip?.location?.district_snit_code ?? null;

      // 1. Create Geomanifestation linked to the field trip
      const gmPayload = {
        geomanifestation_name: gmName,
        latitude: lat,
        longitude: lng,
        province_snit_code: pCode ? Number(pCode) : null,
        canton_snit_code: cCode ? Number(cCode) : null,
        district_snit_code: dCode ? Number(dCode) : null,
        field_trip_id: tripId || null,
        description: values.description ? values.description.trim() : null,
        visibility: false,
      };

      const resGm = await geomanifestationsAdminStore(gmPayload);
      if (!resGm.ok) {
        message.error(resGm.error || 'Error al registrar la geomanifestación');
        return;
      }

      const createdGm = resGm.data;
      const gmId = createdGm.geomanifestation_id || createdGm.id;

      // 2. Register Insitu Test if measurements were provided
      const hasTemp = values.temperature !== undefined && values.temperature !== null && values.temperature !== '';
      const hasPh = values.ph !== undefined && values.ph !== null && values.ph !== '';
      const hasCond = values.conductivity !== undefined && values.conductivity !== null && values.conductivity !== '';
      const hasNotes = Boolean(values.test_description && values.test_description.trim());

      let insituCreated = false;
      if (hasTemp || hasPh || hasCond || hasNotes) {
        const testPayload = {
          geomanifestation_id: gmId,
          temperature: hasTemp ? Number(values.temperature) : 0,
          ph: hasPh ? Number(values.ph) : 0,
          conductivity: hasCond ? Number(values.conductivity) : 0,
          description: hasNotes ? values.test_description.trim() : 'Medición inicial de campo (Fast Point)',
        };

        const resTest = await insituTestsStore(testPayload);
        if (resTest.ok) {
          insituCreated = true;
        } else {
          message.warning('Geomanifestación creada, pero ocurrió un error al guardar la prueba in-situ: ' + (resTest.error || ''));
        }
      }

      message.success(
        insituCreated
          ? '¡Punto rápido y prueba in-situ registrados exitosamente en la gira!'
          : '¡Geomanifestación registrada exitosamente en la gira!'
      );

      setFastPointModalVisible(false);
      fastPointForm.resetFields();
      setFastPointCoords(null);

      // Refresh trips and details
      loadTrips();
      loadManifestations();
      if (selectedTrip && (selectedTrip.field_trip_id || selectedTrip.id) === tripId) {
        loadTripDetail(tripId);
      }
    } catch (err) {
      console.error('Error in Fast Point submit:', err);
      message.error(err.message || 'Error de conexión al guardar el punto rápido');
    } finally {
      setFastPointSubmitting(false);
    }
  };

  // Lab Revision: Open Rename Geomanifestation Modal
  const handleOpenRename = (manifestation) => {
    setRenamingManifestation(manifestation);
    renameForm.setFieldsValue({
      geomanifestation_name: manifestation.geomanifestation_name || manifestation.name || '',
      description: manifestation.description || '',
    });
    setRenameModalVisible(true);
  };

  // Lab Revision: Submit Renamed Geomanifestation
  const handleRenameSubmit = async (values) => {
    if (!renamingManifestation) return;
    try {
      setRenameSubmitting(true);
      const mId = renamingManifestation.geomanifestation_id || renamingManifestation.id;
      const res = await geomanifestationsAdminUpdate(mId, {
        geomanifestation_name: values.geomanifestation_name?.trim(),
        description: values.description ? values.description.trim() : null,
      });

      if (res.ok) {
        message.success('Geomanifestación actualizada y renombrada exitosamente');
        setRenameModalVisible(false);
        renameForm.resetFields();
        setRenamingManifestation(null);
        if (selectedTrip) {
          loadTripDetail(selectedTrip.field_trip_id || selectedTrip.id);
        }
        loadManifestations();
      } else {
        message.error(res.error || 'Error al renombrar la geomanifestación');
      }
    } catch (err) {
      console.error('Error in renaming manifestation:', err);
      message.error(err.message || 'Error al renombrar');
    } finally {
      setRenameSubmitting(false);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    if (allUsers.length === 0) {
      loadUsers();
    }
    setEditingTrip(null);
    setLoadingEditModal(false);
    form.resetFields();
    setCantons([]);
    setDistricts([]);
    form.setFieldsValue({
      field_trip_is_active: true,
      field_trip_scheduled_date: dayjs(),
      participants: currentUserId ? [currentUserId] : [],
    });
    setModalVisible(true);
  };

  // Open Edit Modal
  const handleOpenEdit = async (record) => {
    if (allUsers.length === 0) {
      loadUsers();
    }
    setEditingTrip(record);
    setModalVisible(true);
    setLoadingEditModal(true);
    form.resetFields();

    // Load full details first to populate participants and manifestations
    const tripId = record.field_trip_id || record.id;
    let detail = record;
    try {
      const res = await fieldTripsShow(tripId);
      if (res.ok && res.data) {
        detail = res.data;
      }
    } catch (err) {
      console.error('Error fetching detail for edit:', err);
    }

    // Merge detail participants into allUsers so labels resolve immediately
    if (Array.isArray(detail.participants) && detail.participants.length > 0) {
      setAllUsers((prevUsers) => {
        const existingIds = new Set(prevUsers.map((u) => u.user_id || u.id));
        const toAdd = detail.participants.filter(
          (p) => typeof p === 'object' && p !== null && !existingIds.has(p.user_id || p.id)
        );
        return toAdd.length > 0 ? [...prevUsers, ...toAdd] : prevUsers;
      });
    }

    if (Array.isArray(detail.geomanifestations) && detail.geomanifestations.length > 0) {
      setAllManifestations((prev) => {
        const existingIds = new Set(prev.map((m) => m.geomanifestation_id || m.id));
        const toAdd = detail.geomanifestations.filter(
          (m) => typeof m === 'object' && m !== null && !existingIds.has(m.geomanifestation_id || m.id)
        );
        return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
      });
    }

    const provCode = detail.province_snit_code ?? detail.location?.province_snit_code ?? record.province_snit_code;
    const cantCode = detail.canton_snit_code ?? detail.location?.canton_snit_code ?? record.canton_snit_code;
    const distCode = detail.district_snit_code ?? detail.location?.district_snit_code ?? record.district_snit_code;

    // Load cantons and districts for location
    if (provCode) {
      try {
        const resCantons = await cantonsIndex(provCode);
        if (resCantons.ok && Array.isArray(resCantons.data)) {
          setCantons(resCantons.data);
        }
      } catch (e) {
        console.error('Error loading cantons for edit:', e);
      }
    } else {
      setCantons([]);
    }

    if (cantCode) {
      try {
        const resDistricts = await districtsIndex(cantCode);
        if (resDistricts.ok && Array.isArray(resDistricts.data)) {
          setDistricts(resDistricts.data);
        }
      } catch (e) {
        console.error('Error loading districts for edit:', e);
      }
    } else {
      setDistricts([]);
    }

    const participantIds = Array.isArray(detail.participants)
      ? detail.participants.map((p) => p.user_id || p.id || p)
      : [];

    const manifestationIds = Array.isArray(detail.geomanifestations)
      ? detail.geomanifestations.map((m) => m.geomanifestation_id || m.id || m)
      : [];

    const parseDate = (d) => {
      if (!d) return null;
      const str = typeof d === 'string' ? d.split(' ')[0] : d;
      const parsed = dayjs(str);
      return parsed.isValid() ? parsed : null;
    };

    const scheduledDate = parseDate(detail.field_trip_scheduled_date);
    const startDate = parseDate(detail.field_trip_start_date);
    const finishDate = parseDate(detail.field_trip_finish_date);
    const isActive = detail.field_trip_is_active !== undefined ? Boolean(detail.field_trip_is_active) : true;

    // Snapshot of original values for partial update comparison
    const initialValues = {
      field_trip_name: detail.field_trip_name ? detail.field_trip_name.trim() : '',
      field_trip_scheduled_date: scheduledDate ? scheduledDate.format('YYYY-MM-DD') : null,
      field_trip_start_date: startDate ? startDate.format('YYYY-MM-DD') : null,
      field_trip_finish_date: finishDate ? finishDate.format('YYYY-MM-DD') : null,
      field_trip_is_active: isActive,
      province_snit_code: provCode ? Number(provCode) : null,
      canton_snit_code: cantCode ? Number(cantCode) : null,
      district_snit_code: distCode ? Number(distCode) : null,
      participants: participantIds,
      geomanifestations: manifestationIds,
    };

    setEditingTrip({
      ...detail,
      field_trip_id: tripId,
      _initialValues: initialValues,
    });

    form.setFieldsValue({
      field_trip_name: detail.field_trip_name || '',
      field_trip_scheduled_date: scheduledDate,
      field_trip_start_date: startDate,
      field_trip_finish_date: finishDate,
      field_trip_is_active: isActive,
      province_snit_code: provCode || undefined,
      canton_snit_code: cantCode || undefined,
      district_snit_code: distCode || undefined,
      participants: participantIds,
      geomanifestations: manifestationIds,
    });

    setLoadingEditModal(false);
  };

  // Submit Create / Edit
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      if (editingTrip) {
        const id = editingTrip.field_trip_id || editingTrip.id;
        const initial = editingTrip._initialValues || {};
        const payload = {};

        // Only send fields that actually changed
        const newName = values.field_trip_name ? values.field_trip_name.trim() : '';
        if (newName !== (initial.field_trip_name || '')) {
          payload.field_trip_name = newName;
        }

        const newSched = values.field_trip_scheduled_date ? values.field_trip_scheduled_date.format('YYYY-MM-DD') : null;
        if (newSched !== (initial.field_trip_scheduled_date || null)) {
          payload.field_trip_scheduled_date = newSched;
        }

        const newStart = values.field_trip_start_date ? values.field_trip_start_date.format('YYYY-MM-DD') : null;
        if (newStart !== (initial.field_trip_start_date || null)) {
          payload.field_trip_start_date = newStart;
        }

        const newFinish = values.field_trip_finish_date ? values.field_trip_finish_date.format('YYYY-MM-DD') : null;
        if (newFinish !== (initial.field_trip_finish_date || null)) {
          payload.field_trip_finish_date = newFinish;
        }

        const newActive = Boolean(values.field_trip_is_active);
        if (newActive !== Boolean(initial.field_trip_is_active)) {
          payload.field_trip_is_active = newActive;
        }

        const newProv = values.province_snit_code ? Number(values.province_snit_code) : null;
        const newCant = values.canton_snit_code ? Number(values.canton_snit_code) : null;
        const newDist = values.district_snit_code ? Number(values.district_snit_code) : null;

        if (newProv !== (initial.province_snit_code ?? null)) {
          payload.province_snit_code = newProv;
        }
        if (newCant !== (initial.canton_snit_code ?? null)) {
          payload.canton_snit_code = newCant;
        }
        if (newDist !== (initial.district_snit_code ?? null)) {
          payload.district_snit_code = newDist;
        }

        const newParticipants = Array.isArray(values.participants) ? values.participants : [];
        const oldParticipants = Array.isArray(initial.participants) ? initial.participants : [];
        const sortedNewP = [...newParticipants].sort();
        const sortedOldP = [...oldParticipants].sort();
        if (JSON.stringify(sortedNewP) !== JSON.stringify(sortedOldP)) {
          payload.participants = newParticipants;
        }

        const newGms = Array.isArray(values.geomanifestations) ? values.geomanifestations : [];
        const oldGms = Array.isArray(initial.geomanifestations) ? initial.geomanifestations : [];
        const sortedNewGms = [...newGms].sort();
        const sortedOldGms = [...oldGms].sort();
        if (JSON.stringify(sortedNewGms) !== JSON.stringify(sortedOldGms)) {
          payload.geomanifestations = newGms;
        }

        if (Object.keys(payload).length === 0) {
          message.info('No se detectaron cambios en la gira de campo');
          setModalVisible(false);
          return;
        }

        const res = await fieldTripsUpdate(id, payload);
        if (res.ok) {
          message.success('Gira de campo actualizada exitosamente');
          setModalVisible(false);
          form.resetFields();
          loadTrips();
          if (selectedTrip && (selectedTrip.field_trip_id || selectedTrip.id) === id) {
            loadTripDetail(id);
          }
        } else {
          message.error(res.error || 'Error al actualizar la gira de campo');
        }
      } else {
        // Create mode
        const payload = {
          field_trip_name: values.field_trip_name?.trim(),
          field_trip_scheduled_date: values.field_trip_scheduled_date ? values.field_trip_scheduled_date.format('YYYY-MM-DD') : null,
          field_trip_start_date: values.field_trip_start_date ? values.field_trip_start_date.format('YYYY-MM-DD') : null,
          field_trip_finish_date: values.field_trip_finish_date ? values.field_trip_finish_date.format('YYYY-MM-DD') : null,
          field_trip_is_active: Boolean(values.field_trip_is_active),
          province_snit_code: values.province_snit_code || null,
          canton_snit_code: values.canton_snit_code || null,
          district_snit_code: values.district_snit_code || null,
          participants: values.participants || [],
          geomanifestations: values.geomanifestations || [],
        };

        const res = await fieldTripsStore(payload);
        if (res.ok) {
          message.success('Gira de campo creada exitosamente');
          setModalVisible(false);
          form.resetFields();
          loadTrips();
        } else {
          message.error(res.error || 'Error al crear la gira de campo');
        }
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active status
  const handleToggleActive = async (record, checked) => {
    const id = record.field_trip_id || record.id;
    try {
      const res = await fieldTripsToggleActive(id, checked);
      if (res.ok) {
        message.success(`Gira marcada como ${checked ? 'activa' : 'inactiva'}`);
        loadTrips();
        if (selectedTrip && (selectedTrip.field_trip_id || selectedTrip.id) === id) {
          setSelectedTrip((prev) => ({ ...prev, field_trip_is_active: checked ? 1 : 0 }));
        }
      } else {
        message.error(res.error || 'Error al cambiar estado');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  // Delete Trip
  const handleDeleteTrip = async (record) => {
    const id = record.field_trip_id || record.id;
    try {
      const res = await fieldTripsDelete(id);
      if (res.ok) {
        message.success('Gira de campo eliminada correctamente');
        loadTrips();
        if (selectedTrip && (selectedTrip.field_trip_id || selectedTrip.id) === id) {
          setDetailDrawerVisible(false);
          setSelectedTrip(null);
        }
      } else {
        message.error(res.error || 'Error al eliminar gira');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  // Load Detailed Trip
  const loadTripDetail = async (id) => {
    try {
      setLoadingDetail(true);
      const res = await fieldTripsShow(id);
      if (res.ok && res.data) {
        setSelectedTrip(res.data);
      } else {
        message.error(res.error || 'No se pudo cargar el detalle');
      }
    } catch (err) {
      message.error(err.message || 'Error al obtener detalle');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenDetail = (record) => {
    const id = record.field_trip_id || record.id;
    setSelectedTrip(record);
    setDetailDrawerVisible(true);
    loadTripDetail(id);
  };

  // Detail Quick Action: Add Participant
  const handleAddParticipant = async () => {
    if (!selectedNewUser || !selectedTrip) return;
    const tripId = selectedTrip.field_trip_id || selectedTrip.id;
    try {
      setAddingParticipant(true);
      const res = await fieldTripsAddParticipant(tripId, selectedNewUser);
      if (res.ok) {
        message.success('Participante agregado a la gira');
        setSelectedNewUser(null);
        loadTripDetail(tripId);
        loadTrips();
      } else {
        message.error(res.error || 'Error al agregar participante');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setAddingParticipant(false);
    }
  };

  // Detail Quick Action: Remove Participant
  const handleRemoveParticipant = async (userId) => {
    if (!selectedTrip) return;
    const tripId = selectedTrip.field_trip_id || selectedTrip.id;
    try {
      const res = await fieldTripsRemoveParticipant(tripId, userId);
      if (res.ok) {
        message.success('Participante removido de la gira');
        loadTripDetail(tripId);
        loadTrips();
      } else {
        message.error(res.error || 'Error al remover participante');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  // Detail Quick Action: Link Manifestation
  const handleLinkManifestation = async () => {
    if (!selectedNewManifestation || !selectedTrip) return;
    const tripId = selectedTrip.field_trip_id || selectedTrip.id;
    try {
      setLinkingManifestation(true);
      const res = await fieldTripsLinkManifestation(tripId, selectedNewManifestation);
      if (res.ok) {
        message.success('Geomanifestación vinculada a la gira');
        setSelectedNewManifestation(null);
        loadTripDetail(tripId);
        loadTrips();
      } else {
        message.error(res.error || 'Error al vincular manifestación');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setLinkingManifestation(false);
    }
  };

  // Detail Quick Action: Unlink Manifestation
  const handleUnlinkManifestation = async (gmId) => {
    if (!selectedTrip) return;
    const tripId = selectedTrip.field_trip_id || selectedTrip.id;
    try {
      const res = await fieldTripsUnlinkManifestation(tripId, gmId);
      if (res.ok) {
        message.success('Geomanifestación desvinculada');
        loadTripDetail(tripId);
        loadTrips();
      } else {
        message.error(res.error || 'Error al desvincular manifestación');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  // Filtered List
  const currentList = activeTab === 'my' ? myTrips : trips;
  const filteredTrips = useMemo(() => {
    return currentList.filter((t) => {
      const nameMatch =
        !searchText ||
        (t.field_trip_name && t.field_trip_name.toLowerCase().includes(searchText.toLowerCase())) ||
        (t.field_trip_id && t.field_trip_id.toLowerCase().includes(searchText.toLowerCase()));

      const statusMatch =
        statusFilter === 'all' ||
        (statusFilter === 'active' && Boolean(t.field_trip_is_active)) ||
        (statusFilter === 'inactive' && !t.field_trip_is_active);

      return nameMatch && statusMatch;
    });
  }, [currentList, searchText, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = trips.length;
    const active = trips.filter((t) => Boolean(t.field_trip_is_active)).length;
    const inactive = total - active;
    const myCount = myTrips.length;
    return { total, active, inactive, myCount };
  }, [trips, myTrips]);

  // Table Columns
  const columns = [
    {
      title: 'Estado',
      dataIndex: 'field_trip_is_active',
      key: 'status',
      width: 100,
      align: 'center',
      render: (val, record) => (
        canManage ? (
          <div onClick={(e) => e.stopPropagation()}>
            <Tooltip title={`Clic para ${val ? 'desactivar' : 'activar'}`}>
              <Switch
                size="small"
                checked={Boolean(val)}
                onChange={(checked) => handleToggleActive(record, checked)}
                style={{ backgroundColor: val ? '#52c41a' : '#bfbfbf' }}
              />
            </Tooltip>
          </div>
        ) : (
          <Tag color={val ? 'green' : 'default'}>
            {val ? 'Activa' : 'Inactiva'}
          </Tag>
        )
      ),
    },
    {
      title: 'Nombre de la Gira',
      dataIndex: 'field_trip_name',
      key: 'field_trip_name',
      render: (val, record) => (
        <div>
          <span className="font-semibold text-blue-600 hover:text-blue-800 block cursor-pointer">
            {val}
          </span>
          <div style={{ fontSize: 11, color: '#8c8c8c' }} className="font-mono">
            {record.field_trip_id || record.id}
          </div>
        </div>
      ),
    },
    {
      title: 'Fecha Programada',
      dataIndex: 'field_trip_scheduled_date',
      key: 'field_trip_scheduled_date',
      render: (val) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CalendarOutlined style={{ color: '#fa8c16' }} />
          {val ? dayjs(val).format('YYYY-MM-DD') : 'N/A'}
        </span>
      ),
    },
    {
      title: 'Ubicación',
      key: 'location',
      render: (_, record) => {
        const parts = [
          record.province_name || record.province,
          record.canton_name || record.canton,
          record.district_name || record.district,
        ].filter(Boolean);
        return parts.length > 0 ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <EnvironmentOutlined style={{ color: '#1890ff' }} />
            {parts.join(', ')}
          </span>
        ) : (
          <Text type="secondary">Costa Rica</Text>
        );
      },
    },
    {
      title: 'Participantes',
      key: 'participants',
      align: 'center',
      render: (_, record) => {
        const count = Array.isArray(record.participants) ? record.participants.length : (record.participant_count || 0);
        return (
          <Tag color="blue" icon={<TeamOutlined />}>
            {count} {count === 1 ? 'persona' : 'personas'}
          </Tag>
        );
      },
    },
    {
      title: 'Manifestaciones',
      key: 'manifestations',
      align: 'center',
      render: (_, record) => {
        const count = Array.isArray(record.geomanifestations) ? record.geomanifestations.length : (record.manifestation_count || 0);
        return (
          <Tag color="orange" icon={<FireOutlined />}>
            {count} {count === 1 ? 'sitio' : 'sitios'}
          </Tag>
        );
      },
    },
    ...(canManage ? [{
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Editar Gira">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(record);
              }}
            />
          </Tooltip>

          <Popconfirm
            title="¿Eliminar esta gira de campo?"
            description="Se desvincularán los participantes y manifestaciones asociadas."
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDeleteTrip(record);
            }}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Eliminar Gira">
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    }] : []),
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
              Operaciones de Campo • GeoterRA
            </span>
            <Tag className="rounded-full font-semibold text-[11px] bg-blue-50 text-geoterra-blue border-blue-200">
              {trips.length} Giras Registradas
            </Tag>
          </div>
          <h1 className="text-2xl md:text-3xl poppins-bold text-geoterra-blue m-0 flex items-center gap-2.5">
            <CompassOutlined className="text-geoterra-blue" /> Gestión de Giras de Campo
          </h1>
          <p className="text-xs md:text-sm text-gray-500 m-0 mt-1 poppins">
            Planificación operativa, asignación de investigadores, bitácora científica y registro rápido de manifestaciones geotermales.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {canFastPoint && (
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={() => handleOpenFastPoint()}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold border-0 shadow-sm poppins"
            >
              Punto Rápido
            </Button>
          )}
          {canManage && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
              className="poppins-bold"
            >
              Nueva Gira de Campo
            </Button>
          )}
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={loadTrips}
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
        <div
          onClick={() => {
            setActiveTab('all');
            setStatusFilter('all');
          }}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            activeTab === 'all' && statusFilter === 'all'
              ? 'border-geoterra-blue shadow-md ring-2 ring-blue-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Giras</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-geoterra-blue flex items-center justify-center text-base">
              <CompassOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-gray-900">{stats.total}</span>
            <span className="text-xs text-gray-400">expediciones</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">Planificadas en el sistema</div>
        </div>

        <div
          onClick={() => {
            setActiveTab('all');
            setStatusFilter('active');
          }}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            statusFilter === 'active'
              ? 'border-emerald-400 shadow-md ring-2 ring-emerald-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Giras Activas</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-base">
              <CheckCircleOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-emerald-900">{stats.active}</span>
            <span className="text-xs text-emerald-600">en curso</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium">Listas para captura en campo</div>
        </div>

        <div
          onClick={() => {
            setActiveTab('my');
            setStatusFilter('all');
          }}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            activeTab === 'my'
              ? 'border-geoterra-blue shadow-md ring-2 ring-blue-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Mis Asignadas</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-base">
              <TeamOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-blue-900">{stats.myCount}</span>
            <span className="text-xs text-blue-600">con mi usuario</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium">Asignado como investigador</div>
        </div>

        <div
          onClick={() => {
            setActiveTab('all');
            setStatusFilter('inactive');
          }}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            statusFilter === 'inactive'
              ? 'border-gray-400 shadow-md ring-2 ring-gray-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Concluidas / Inactivas</span>
            <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-base">
              <ClockCircleOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-gray-700">{stats.inactive}</span>
            <span className="text-xs text-gray-400">finalizadas</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">Histórico de campo</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER & DATA TABLE CARD                                                  */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="poppins mb-0"
            items={[
              {
                key: 'all',
                label: (
                  <span className="font-semibold flex items-center gap-1.5">
                    <CompassOutlined /> Todas las Giras ({trips.length})
                  </span>
                ),
              },
              {
                key: 'my',
                label: (
                  <span className="font-semibold flex items-center gap-1.5">
                    <TeamOutlined /> Mis Giras Asignadas ({myTrips.length})
                  </span>
                ),
              },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Buscar por nombre o ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full sm:w-64 rounded-lg py-1.5"
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full sm:w-44"
              options={[
                { value: 'all', label: 'Todos los estados' },
                { value: 'active', label: '🟢 Solo Activas' },
                { value: 'inactive', label: '⚪ Solo Inactivas' },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16">
            <Spin size="large" tip="Cargando giras de campo..." />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <Table
              dataSource={filteredTrips}
              columns={columns}
              rowKey={(item) => item.field_trip_id || item.id}
              onRow={(record) => ({
                onClick: () => handleOpenDetail(record),
                style: { cursor: 'pointer' },
              })}
              pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
              locale={{ emptyText: 'No se encontraron giras de campo con los filtros seleccionados' }}
              className="poppins"
            />
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Field Trip */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-xl text-geoterra-blue flex items-center gap-2">
              <CompassOutlined /> {editingTrip ? 'Editar Gira de Campo' : 'Crear Nueva Gira de Campo'}
            </span>
          </div>
        }
        open={modalVisible}
        onOk={() => !loadingEditModal && form.submit()}
        onCancel={() => {
          setModalVisible(false);
          setLoadingEditModal(false);
        }}
        confirmLoading={submitting}
        okButtonProps={{
          disabled: loadingEditModal,
          style: { backgroundColor: '#12467E', borderColor: '#12467E' },
          className: 'poppins-bold',
        }}
        cancelButtonProps={{ className: 'poppins' }}
        okText={editingTrip ? 'Guardar Cambios' : 'Crear Gira'}
        cancelText="Cancelar"
        width={760}
        centered
      >
        <Spin spinning={loadingEditModal} tip="Cargando datos de la gira...">
          <Form form={form} layout="vertical" className="poppins space-y-4 pt-3" onFinish={handleSubmit}>
            {/* Sección 1: Información General */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
                <CompassOutlined /> Información General de la Gira
              </h3>

              <Form.Item
                name="field_trip_name"
                label="Nombre de la Gira"
                rules={[
                  { required: true, message: 'El nombre es requerido' },
                  { max: 110, message: 'Máximo 110 caracteres' },
                ]}
              >
                <Input placeholder="Ej: Gira de Monitoreo Volcán Miravalles 2026" maxLength={110} showCount size="middle" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="field_trip_scheduled_date"
                    label="Fecha Programada"
                    rules={[{ required: true, message: 'Fecha programada requerida' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Seleccionar" size="middle" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="field_trip_start_date" label="Fecha Inicio Real">
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Opcional" size="middle" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="field_trip_finish_date" label="Fecha Fin Real">
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Opcional" size="middle" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Sección 2: Ubicación Geográfica */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
                <EnvironmentOutlined /> Ubicación Geográfica
              </h3>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item name="province_snit_code" label="Provincia">
                    <Select placeholder="Selecciona provincia" onChange={handleProvinceChange} allowClear size="middle">
                      {provinces.map((prov) => (
                        <Select.Option key={prov.province_snit_code || prov.province_id} value={prov.province_snit_code}>
                          {prov.province_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="canton_snit_code" label="Cantón">
                    <Select placeholder="Selecciona cantón" onChange={handleCantonChange} allowClear disabled={cantons.length === 0} size="middle">
                      {cantons.map((c) => (
                        <Select.Option key={c.canton_snit_code || c.canton_id} value={c.canton_snit_code}>
                          {c.canton_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item name="district_snit_code" label="Distrito">
                    <Select placeholder="Selecciona distrito" allowClear disabled={districts.length === 0} size="middle">
                      {districts.map((d) => (
                        <Select.Option key={d.district_snit_code || d.district_id} value={d.district_snit_code}>
                          {d.district_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Sección 3: Participantes y Manifestaciones */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
                <TeamOutlined /> Participantes y Manifestaciones
              </h3>

              <Form.Item
                name="participants"
                label="Participantes (Investigadores / Personal Asignado)"
                help="Selecciona los miembros del equipo que participarán en esta gira"
              >
                <Select
                  mode="multiple"
                  placeholder="Buscar y seleccionar participantes..."
                  allowClear
                  optionFilterProp="label"
                  size="middle"
                  options={allUsers.map((u) => ({
                    value: u.user_id || u.id,
                    label: `${[u.first_name, u.last_name].filter(Boolean).join(' ') || u.email} (${u.role || 'Usuario'})`,
                  }))}
                />
              </Form.Item>

              <Form.Item
                name="geomanifestations"
                label="Geomanifestaciones Vinculadas"
                help="Sitios termales o manifestaciones que se estudiarán en esta gira"
              >
                <Select
                  mode="multiple"
                  placeholder="Buscar y seleccionar geomanifestaciones..."
                  allowClear
                  optionFilterProp="label"
                  size="middle"
                  options={allManifestations.map((m) => ({
                    value: m.geomanifestation_id || m.id,
                    label: `${m.geomanifestation_name || m.name} ${m.location?.canton ? `— ${m.location.canton}` : ''}`,
                  }))}
                />
              </Form.Item>

              <Form.Item name="field_trip_is_active" valuePropName="checked" label="Estado de la Gira" style={{ marginBottom: 0 }}>
                <Switch checkedChildren="Activa" unCheckedChildren="Inactiva / Cerrada" />
              </Form.Item>
            </div>
          </Form>
        </Spin>
      </Modal>

      {/* Modal: Fast Point (Punto Rápido en Campo) */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-xl text-geoterra-blue flex items-center gap-2">
              <ThunderboltOutlined style={{ color: '#F39C29' }} /> Punto Rápido en Campo (Fast Point)
            </span>
          </div>
        }
        open={fastPointModalVisible}
        onCancel={() => {
          setFastPointModalVisible(false);
          fastPointForm.resetFields();
          setFastPointCoords(null);
          setShowMapPicker(false);
        }}
        footer={null}
        width={720}
        destroyOnClose
      >
        <Form
          form={fastPointForm}
          layout="vertical"
          className="poppins space-y-4 pt-2"
          onFinish={handleFastPointSubmit}
        >
          {/* Coordinates stored in form (hidden by default) */}
          <Form.Item name="latitude" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="longitude" hidden>
            <Input />
          </Form.Item>

          {/* 1. Gira de Campo Asociada */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2 flex items-center gap-2 m-0">
              <CompassOutlined /> Gira de Campo Asociada
            </h3>
            <Form.Item
              name="field_trip_id"
              label="Seleccionar Gira de Campo"
              rules={[{ required: true, message: 'Selecciona la gira a la que pertenece este punto' }]}
              style={{ marginBottom: 0 }}
            >
              <Select
                placeholder="Selecciona la gira de campo..."
                onChange={handleFastPointTripChange}
                showSearch
                size="large"
                optionFilterProp="label"
                options={trips.map((t) => {
                  const tId = t.field_trip_id || t.id;
                  const isActive = Boolean(t.field_trip_is_active);
                  const loc = [t.province_name || t.province, t.canton_name || t.canton]
                    .filter(Boolean)
                    .join(', ');
                  return {
                    value: tId,
                    label: `${t.field_trip_name} ${loc ? `(${loc})` : ''} - [${isActive ? 'Activa' : 'Inactiva'}]`,
                  };
                })}
              />
            </Form.Item>
          </div>

          {/* 2. Ubicación GPS */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-base font-bold text-geoterra-blue flex items-center gap-2 m-0">
                <AimOutlined /> Ubicación Satelital (GPS)
              </h3>
              {gpsAccuracy && (
                <Tag color="cyan" style={{ margin: 0 }}>
                  Precisión: {gpsAccuracy}
                </Tag>
              )}
            </div>

            {fastPointCoords ? (
              <div
                style={{
                  background: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: 8,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      color: '#389e0d',
                      fontWeight: 600,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <CheckCircleOutlined /> Coordenadas GPS fijadas
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 13,
                      color: '#262626',
                      marginTop: 2,
                    }}
                  >
                    Lat: <strong>{fastPointCoords.lat}</strong> | Lng: <strong>{fastPointCoords.lng}</strong>
                  </div>
                </div>
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={handleGetGpsLocation}
                  loading={gettingGps}
                  style={{ borderColor: '#b7eb8f' }}
                >
                  Recapturar
                </Button>
              </div>
            ) : (
              <Button
                type="primary"
                size="large"
                block
                icon={<AimOutlined style={{ fontSize: 18 }} />}
                onClick={handleGetGpsLocation}
                loading={gettingGps}
                style={{
                  height: 48,
                  fontSize: 15,
                  fontWeight: 700,
                  backgroundColor: '#12467E',
                  borderColor: '#12467E',
                  borderRadius: 8,
                }}
                className="poppins-bold"
              >
                {gettingGps ? 'Obteniendo señal satelital GPS...' : '📍 Capturar Ubicación GPS Actual'}
              </Button>
            )}

            {/* Toggle for Map and Manual Coordinates ONLY if user needs fallback */}
            <div style={{ textAlign: 'right', marginTop: 4 }}>
              <Button
                type="link"
                size="small"
                onClick={() => setShowMapPicker((prev) => !prev)}
                style={{ color: '#12467E', padding: 0, fontSize: 12 }}
              >
                {showMapPicker
                  ? '▲ Ocultar mapa interactivo'
                  : '▼ ¿Sin señal GPS? Ajustar en mapa o ingresar lat/long manual'}
              </Button>
            </div>

            {/* Interactive Map and Manual Lat/Lng inputs (shown ONLY on demand) */}
            {showMapPicker && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div style={{ marginBottom: 12 }}>
                  <MapCoordinatePicker
                    latLng={{
                      lat: fastPointCoords?.lat || fastPointForm.getFieldValue('latitude') || 9.93333,
                      lng: fastPointCoords?.lng || fastPointForm.getFieldValue('longitude') || -84.08333,
                    }}
                    onCoordinatesChange={(coords) => {
                      if (coords && coords.lat && coords.lng) {
                        const newLat = parseFloat(coords.lat.toFixed(6));
                        const newLng = parseFloat(coords.lng.toFixed(6));
                        fastPointForm.setFieldsValue({ latitude: newLat, longitude: newLng });
                        setFastPointCoords({ lat: newLat, lng: newLng });
                      }
                    }}
                    mapHeight="220px"
                  />
                </div>
                <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span style={{ fontSize: 12, fontWeight: 600 }}>Latitud Manual</span>}
                      style={{ marginBottom: 4 }}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        step={0.000001}
                        value={fastPointCoords?.lat}
                        onChange={(val) => {
                          fastPointForm.setFieldsValue({ latitude: val });
                          setFastPointCoords((prev) => ({ ...(prev || {}), lat: val }));
                        }}
                        placeholder="Ej: 10.724812"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span style={{ fontSize: 12, fontWeight: 600 }}>Longitud Manual</span>}
                      style={{ marginBottom: 4 }}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        step={0.000001}
                        value={fastPointCoords?.lng}
                        onChange={(val) => {
                          fastPointForm.setFieldsValue({ longitude: val });
                          setFastPointCoords((prev) => ({ ...(prev || {}), lng: val }));
                        }}
                        placeholder="Ej: -85.023411"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            )}
          </div>

          {/* 3. Nombre del Punto */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2 flex items-center gap-2 m-0">
              <EnvironmentOutlined /> Identificación del Punto
            </h3>
            <Form.Item
              name="geomanifestation_name"
              label={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Nombre del Punto</span>
                  <Tag color="blue" style={{ fontSize: 11, fontWeight: 'normal', margin: 0 }}>
                    Generado automáticamente
                  </Tag>
                </div>
              }
              extra={
                <span style={{ fontSize: 11, color: '#8c8c8c' }}>
                  ⚡ No necesitas escribirlo ahora bajo el sol. Se cambia luego con calma en el laboratorio.
                </span>
              }
              rules={[
                { required: true, message: 'Ingresa un nombre para la geomanifestación' },
                { max: 255, message: 'Máximo 255 caracteres' },
              ]}
              style={{ marginBottom: 0 }}
            >
              <Input size="large" placeholder="Ej: Punto #1 - Gira (10:15)" />
            </Form.Item>
          </div>

          {/* 4. Mediciones In-Situ */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2 flex items-center gap-2 m-0">
              <ExperimentOutlined /> Parámetros Físico-Químicos In-Situ
            </h3>
            <Row gutter={12}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="temperature"
                  label="Temperatura"
                  style={{ marginBottom: 8 }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    step={0.1}
                    min={0}
                    max={200}
                    addonAfter="°C"
                    placeholder="Ej: 91.5"
                    size="middle"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="ph"
                  label="pH"
                  style={{ marginBottom: 8 }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    step={0.1}
                    min={0}
                    max={14}
                    addonAfter="pH"
                    placeholder="Ej: 3.2"
                    size="middle"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="conductivity"
                  label="Conductividad"
                  style={{ marginBottom: 8 }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={1}
                    addonAfter="µS/cm"
                    placeholder="Ej: 2150"
                    size="middle"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="test_description"
              label={<span style={{ fontSize: 12 }}>Notas breves (opcional)</span>}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="Ej: Fumarola activa, olor a azufre, agua turbia" size="middle" />
            </Form.Item>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <Button
              size="large"
              className="poppins"
              onClick={() => {
                setFastPointModalVisible(false);
                fastPointForm.resetFields();
                setFastPointCoords(null);
                setShowMapPicker(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={fastPointSubmitting}
              icon={<ThunderboltOutlined />}
              style={{
                minWidth: 200,
                backgroundColor: '#12467E',
                borderColor: '#12467E',
              }}
              className="poppins-bold"
            >
              Guardar Punto Rápido
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Drawer: Detailed Trip View + Participants + Manifestations + Comments */}
      <Drawer
        title={
          <div className="flex items-center justify-between w-full pr-6 py-1 border-b border-gray-100 poppins">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-geoterra-blue flex items-center justify-center text-lg flex-shrink-0">
                <CompassOutlined />
              </div>
              <div>
                <span className="poppins-bold text-base text-geoterra-blue block">
                  {selectedTrip?.field_trip_name || 'Detalle de la Gira'}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  #{selectedTrip?.field_trip_id || selectedTrip?.id}
                </span>
              </div>
            </div>
            {selectedTrip && (
              <Tag color={selectedTrip.field_trip_is_active ? 'green' : 'default'} className="rounded-full text-xs font-semibold px-2.5 py-0.5">
                {selectedTrip.field_trip_is_active ? 'Activa' : 'Inactiva / Concluida'}
              </Tag>
            )}
          </div>
        }
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        width={760}
      >
        {loadingDetail && !selectedTrip ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" tip="Cargando detalles de la gira..." />
          </div>
        ) : selectedTrip ? (
          <Tabs
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: 'Resumen y Ubicación',
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Card size="small" style={{ borderRadius: 8, backgroundColor: '#fafbfc' }}>
                      <Row gutter={[16, 12]}>
                        <Col span={12}>
                          <Text type="secondary">Fecha Programada:</Text>
                          <div>
                            <CalendarOutlined style={{ color: '#fa8c16', marginRight: 6 }} />
                            <Text strong>
                              {selectedTrip.field_trip_scheduled_date
                                ? dayjs(selectedTrip.field_trip_scheduled_date).format('YYYY-MM-DD')
                                : 'N/A'}
                            </Text>
                          </div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">Estado Operativo:</Text>
                          <div>
                            <Badge
                              status={selectedTrip.field_trip_is_active ? 'success' : 'default'}
                              text={selectedTrip.field_trip_is_active ? 'En Curso / Programada' : 'Finalizada / Inactiva'}
                            />
                          </div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">Fecha de Inicio Real:</Text>
                          <div>{selectedTrip.field_trip_start_date || 'No registrada'}</div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">Fecha de Finalización:</Text>
                          <div>{selectedTrip.field_trip_finish_date || 'No registrada'}</div>
                        </Col>
                        <Col span={24}>
                          <Text type="secondary">Ubicación Territorial:</Text>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <EnvironmentOutlined style={{ color: '#1890ff' }} />
                            <Text strong>
                              {[
                                selectedTrip.province_name || selectedTrip.province,
                                selectedTrip.canton_name || selectedTrip.canton,
                                selectedTrip.district_name || selectedTrip.district,
                              ]
                                .filter(Boolean)
                                .join(' ➔ ') || 'Costa Rica'}
                            </Text>
                          </div>
                        </Col>
                      </Row>
                    </Card>

                    {/* Quick Stats in Detail */}
                    <Row gutter={12}>
                      <Col span={12}>
                        <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
                          <Statistic
                            title="Participantes Asignados"
                            value={Array.isArray(selectedTrip.participants) ? selectedTrip.participants.length : 0}
                            prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                          />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
                          <Statistic
                            title="Sitios / Geomanifestaciones"
                            value={Array.isArray(selectedTrip.geomanifestations) ? selectedTrip.geomanifestations.length : 0}
                            prefix={<FireOutlined style={{ color: '#fa8c16' }} />}
                          />
                        </Card>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: 'participants',
                label: `Participantes (${Array.isArray(selectedTrip.participants) ? selectedTrip.participants.length : 0})`,
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {canManage && (
                      <Card size="small" style={{ borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <UserAddOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                          <Select
                            placeholder="Selecciona un usuario para agregar..."
                            style={{ flex: 1, minWidth: 200 }}
                            value={selectedNewUser}
                            onChange={setSelectedNewUser}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={allUsers
                              .filter((u) => {
                                const currentP = Array.isArray(selectedTrip.participants) ? selectedTrip.participants : [];
                                return !currentP.some((p) => (p.user_id || p.id || p) === (u.user_id || u.id));
                              })
                              .map((u) => ({
                                value: u.user_id || u.id,
                                label: `${[u.first_name, u.last_name].filter(Boolean).join(' ') || u.email} (${u.role})`,
                              }))}
                          />
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddParticipant}
                            loading={addingParticipant}
                            disabled={!selectedNewUser}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                          >
                            Agregar
                          </Button>
                        </div>
                      </Card>
                    )}

                    <List
                      dataSource={Array.isArray(selectedTrip.participants) ? selectedTrip.participants : []}
                      locale={{ emptyText: 'No hay participantes asignados a esta gira' }}
                      renderItem={(p) => {
                        const pId = p.user_id || p.id || p;
                        const pName = [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email || pId;
                        return (
                          <List.Item
                            actions={
                              canManage
                                ? [
                                  <Popconfirm
                                    title="¿Remover participante de la gira?"
                                    key="del"
                                    onConfirm={() => handleRemoveParticipant(pId)}
                                    okText="Sí"
                                    cancelText="No"
                                    okButtonProps={{ danger: true }}
                                  >
                                    <Button type="text" danger size="small" icon={<UserDeleteOutlined />}>
                                      Remover
                                    </Button>
                                  </Popconfirm>,
                                ]
                                : []
                            }
                          >
                            <List.Item.Meta
                              avatar={
                                <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />}>
                                  {pName.charAt(0).toUpperCase()}
                                </Avatar>
                              }
                              title={<Text strong>{pName}</Text>}
                              description={
                                <Space size="small">
                                  {p.email && <Text type="secondary">{p.email}</Text>}
                                  {p.role && <Tag color="blue">{p.role}</Tag>}
                                </Space>
                              }
                            />
                          </List.Item>
                        );
                      }}
                    />
                  </div>
                ),
              },
              {
                key: 'manifestations',
                label: `Geomanifestaciones (${Array.isArray(selectedTrip.geomanifestations) ? selectedTrip.geomanifestations.length : 0})`,
                children: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {canFastPoint && (
                      <Button
                        type="primary"
                        icon={<ThunderboltOutlined />}
                        onClick={() => handleOpenFastPoint(selectedTrip)}
                        style={{
                          background: 'linear-gradient(135deg, #13c2c2 0%, #08979c 100%)',
                          borderColor: '#13c2c2',
                          alignSelf: 'flex-start',
                          boxShadow: '0 2px 6px rgba(19, 194, 194, 0.35)',
                        }}
                      >
                        + Punto Rápido en esta Gira
                      </Button>
                    )}

                    {canManage && (
                      <Card size="small" style={{ borderRadius: 8, background: '#fff7e6', border: '1px solid #ffd591' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <LinkOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
                          <Select
                            placeholder="Selecciona una geomanifestación para vincular..."
                            style={{ flex: 1, minWidth: 200 }}
                            value={selectedNewManifestation}
                            onChange={setSelectedNewManifestation}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={allManifestations
                              .filter((m) => {
                                const currentM = Array.isArray(selectedTrip.geomanifestations) ? selectedTrip.geomanifestations : [];
                                return !currentM.some((item) => (item.geomanifestation_id || item.id || item) === (m.geomanifestation_id || m.id));
                              })
                              .map((m) => ({
                                value: m.geomanifestation_id || m.id,
                                label: `${m.geomanifestation_name || m.name} ${m.location?.canton ? `(${m.location.canton})` : ''}`,
                              }))}
                          />
                          <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleLinkManifestation}
                            loading={linkingManifestation}
                            disabled={!selectedNewManifestation}
                            style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
                          >
                            Vincular
                          </Button>
                        </div>
                      </Card>
                    )}

                    <List
                      dataSource={Array.isArray(selectedTrip.geomanifestations) ? selectedTrip.geomanifestations : []}
                      locale={{ emptyText: 'No hay geomanifestaciones vinculadas a esta gira' }}
                      renderItem={(m) => {
                        const mId = m.geomanifestation_id || m.id || m;
                        const mName = m.geomanifestation_name || m.name || mId;
                        return (
                          <List.Item
                            actions={[
                              canFastPoint ? (
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleOpenRename(m)}
                                  key="rename"
                                  style={{ color: '#1890ff' }}
                                >
                                  Renombrar
                                </Button>
                              ) : null,
                              canManage ? (
                                <Popconfirm
                                  title="¿Desvincular manifestación de la gira?"
                                  key="del"
                                  onConfirm={() => handleUnlinkManifestation(mId)}
                                  okText="Sí"
                                  cancelText="No"
                                  okButtonProps={{ danger: true }}
                                >
                                  <Button type="text" danger size="small" icon={<DisconnectOutlined />}>
                                    Desvincular
                                  </Button>
                                </Popconfirm>
                              ) : null,
                            ].filter(Boolean)}
                          >
                            <List.Item.Meta
                              avatar={
                                <Avatar style={{ backgroundColor: '#fa8c16' }} icon={<FireOutlined />} />
                              }
                              title={<Text strong>{mName}</Text>}
                              description={
                                <div>
                                  <span className="font-mono text-xs text-gray-500">{mId}</span>
                                  {m.location && (
                                    <span style={{ marginLeft: 8, color: '#8c8c8c' }}>
                                      {[m.location.province, m.location.canton, m.location.district].filter(Boolean).join(', ')}
                                    </span>
                                  )}
                                </div>
                              }
                            />
                          </List.Item>
                        );
                      }}
                    />
                  </div>
                ),
              },
              {
                key: 'comments',
                label: 'Bitácora y Comentarios',
                children: (
                  <CommentsPanel
                    entityType="field_trip"
                    entityId={selectedTrip.field_trip_id || selectedTrip.id}
                    title="Bitácora de Campo y Observaciones"
                  />
                ),
              },
            ]}
          />
        ) : null}
      </Drawer>

      {/* Modal: Lab Revision - Rename Geomanifestation */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-xl text-geoterra-blue flex items-center gap-2">
              <EditOutlined className="text-geoterra-blue" /> Revisión de Laboratorio: Renombrar Geomanifestación
            </span>
          </div>
        }
        open={renameModalVisible}
        onCancel={() => {
          setRenameModalVisible(false);
          renameForm.resetFields();
          setRenamingManifestation(null);
        }}
        onOk={() => renameForm.submit()}
        confirmLoading={renameSubmitting}
        okText="Guardar Nombre Formal"
        cancelText="Cancelar"
        okButtonProps={{
          style: { backgroundColor: '#12467E', borderColor: '#12467E' },
          className: 'poppins-bold',
        }}
        cancelButtonProps={{
          className: 'poppins',
        }}
        destroyOnClose
      >
        <div className="py-2 space-y-4 poppins">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <p className="text-xs text-gray-500 m-0 poppins">
              Asigna el nombre formal y completa los detalles de laboratorio para el punto registrado en campo.
            </p>
            <Form
              form={renameForm}
              layout="vertical"
              onFinish={handleRenameSubmit}
              className="poppins"
            >
              <Form.Item
                name="geomanifestation_name"
                label={<span className="font-semibold text-gray-700">Nombre Formal de la Geomanifestación</span>}
                rules={[
                  { required: true, message: 'Ingresa el nombre formal' },
                  { max: 255, message: 'Máximo 255 caracteres' },
                ]}
              >
                <Input placeholder="Ej: Fumarola Las Hornillas Sector B" autoFocus className="rounded-lg py-1.5" />
              </Form.Item>
              <Form.Item
                name="description"
                label={<span className="font-semibold text-gray-700">Descripción y Notas de Laboratorio (opcional)</span>}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Detalles geológicos, contexto del muestreo o notas adicionales..."
                  className="rounded-lg"
                />
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FieldTripsManager;