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
} from '../../../../config/apiConf';
import { useSession } from '../../../../hooks/useSession';
import { usePermissions } from '../../../../hooks/usePermissions';
import CommentsPanel from '../../../common/CommentsPanel';

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
  const currentUserId = user?.user_id || user?.id;

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

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingTrip(null);
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
    setEditingTrip(record);
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

    // Load cantons and districts for location
    if (detail.province_snit_code) {
      try {
        const resCantons = await cantonsIndex(detail.province_snit_code);
        if (resCantons.ok) setCantons(resCantons.data || []);
      } catch (e) {
        console.error(e);
      }
    }
    if (detail.canton_snit_code) {
      try {
        const resDistricts = await districtsIndex(detail.canton_snit_code);
        if (resDistricts.ok) setDistricts(resDistricts.data || []);
      } catch (e) {
        console.error(e);
      }
    }

    const participantIds = Array.isArray(detail.participants)
      ? detail.participants.map((p) => p.user_id || p.id || p)
      : [];

    const manifestationIds = Array.isArray(detail.geomanifestations)
      ? detail.geomanifestations.map((m) => m.geomanifestation_id || m.id || m)
      : [];

    form.setFieldsValue({
      field_trip_name: detail.field_trip_name,
      field_trip_scheduled_date: detail.field_trip_scheduled_date ? dayjs(detail.field_trip_scheduled_date) : null,
      field_trip_start_date: detail.field_trip_start_date ? dayjs(detail.field_trip_start_date) : null,
      field_trip_finish_date: detail.field_trip_finish_date ? dayjs(detail.field_trip_finish_date) : null,
      field_trip_is_active: Boolean(detail.field_trip_is_active),
      province_snit_code: detail.province_snit_code || undefined,
      canton_snit_code: detail.canton_snit_code || undefined,
      district_snit_code: detail.district_snit_code || undefined,
      participants: participantIds,
      geomanifestations: manifestationIds,
    });

    setModalVisible(true);
  };

  // Submit Create / Edit
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
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

      let res;
      if (editingTrip) {
        const id = editingTrip.field_trip_id || editingTrip.id;
        res = await fieldTripsUpdate(id, payload);
      } else {
        res = await fieldTripsStore(payload);
      }

      if (res.ok) {
        message.success(`Gira de campo ${editingTrip ? 'actualizada' : 'creada'} exitosamente`);
        setModalVisible(false);
        form.resetFields();
        loadTrips();
        if (selectedTrip && (selectedTrip.field_trip_id || selectedTrip.id) === (editingTrip?.field_trip_id || editingTrip?.id)) {
          loadTripDetail(selectedTrip.field_trip_id || selectedTrip.id);
        }
      } else {
        message.error(res.error || 'Error al guardar la gira de campo');
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
          <Tooltip title={`Clic para ${val ? 'desactivar' : 'activar'}`}>
            <Switch
              size="small"
              checked={Boolean(val)}
              onChange={(checked) => handleToggleActive(record, checked)}
              style={{ backgroundColor: val ? '#52c41a' : '#bfbfbf' }}
            />
          </Tooltip>
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
          <Text strong style={{ fontSize: 14, color: '#262626' }}>
            {val}
          </Text>
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
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver Detalle y Bitácora">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleOpenDetail(record)}
            />
          </Tooltip>

          {canManage && (
            <>
              <Tooltip title="Editar Gira">
                <Button
                  type="primary"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleOpenEdit(record)}
                />
              </Tooltip>

              <Popconfirm
                title="¿Eliminar esta gira de campo?"
                description="Se desvincularán los participantes y manifestaciones asociadas."
                onConfirm={() => handleDeleteTrip(record)}
                okText="Sí, eliminar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Eliminar Gira">
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CompassOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Giras de Campo
              </Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Planificación, coordinación de investigadores, sitios geotermales y bitácora de campo.
              </Paragraph>
            </div>
          </div>

          <Space wrap>
            {canManage && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
                style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
              >
                Nueva Gira de Campo
              </Button>
            )}
            <Button icon={<ReloadOutlined />} onClick={loadTrips} loading={loading}>
              Actualizar
            </Button>
          </Space>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#fafafa', border: '1px solid #f0f0f0' }}>
              <Statistic
                title="Total Giras"
                value={stats.total}
                prefix={<CompassOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
              <Statistic
                title="Giras Activas"
                value={stats.active}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#fff7e6', border: '1px solid #ffd591' }}>
              <Statistic
                title="Mis Asignadas"
                value={stats.myCount}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 8, background: '#fafafa', border: '1px solid #f0f0f0' }}>
              <Statistic
                title="Inactivas / Concluidas"
                value={stats.inactive}
                valueStyle={{ color: '#8c8c8c' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginBottom: 0 }}
            items={[
              {
                key: 'all',
                label: (
                  <span>
                    <CompassOutlined /> Todas las Giras ({trips.length})
                  </span>
                ),
              },
              {
                key: 'my',
                label: (
                  <span>
                    <TeamOutlined /> Mis Giras Asignadas ({myTrips.length})
                  </span>
                ),
              },
            ]}
          />

          <Space wrap>
            <Input
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Buscar por nombre o ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 220 }}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
              options={[
                { value: 'all', label: 'Todos los estados' },
                { value: 'active', label: 'Solo Activas' },
                { value: 'inactive', label: 'Solo Inactivas' },
              ]}
            />
          </Space>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" tip="Cargando giras de campo..." />
          </div>
        ) : (
          <Table
            dataSource={filteredTrips}
            columns={columns}
            rowKey={(item) => item.field_trip_id || item.id}
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
            locale={{ emptyText: 'No se encontraron giras de campo' }}
          />
        )}
      </Card>

      {/* Modal: Create / Edit Field Trip */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CompassOutlined style={{ color: '#fa8c16' }} />
            <span>{editingTrip ? 'Editar Gira de Campo' : 'Crear Nueva Gira de Campo'}</span>
          </div>
        }
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        okText={editingTrip ? 'Guardar Cambios' : 'Crear Gira'}
        cancelText="Cancelar"
        width={720}
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="field_trip_name"
            label="Nombre de la Gira"
            rules={[
              { required: true, message: 'El nombre es requerido' },
              { max: 110, message: 'Máximo 110 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Gira de Monitoreo Volcán Miravalles 2026" maxLength={110} showCount />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="field_trip_scheduled_date"
                label="Fecha Programada"
                rules={[{ required: true, message: 'Fecha programada requerida' }]}
              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Seleccionar" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="field_trip_start_date" label="Fecha Inicio Real">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Opcional" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="field_trip_finish_date" label="Fecha Fin Real">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder="Opcional" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '12px 0' }}>
            <span style={{ fontSize: 13, color: '#8c8c8c' }}>Ubicación Geográfica</span>
          </Divider>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="province_snit_code" label="Provincia">
                <Select placeholder="Selecciona provincia" onChange={handleProvinceChange} allowClear>
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
                <Select placeholder="Selecciona cantón" onChange={handleCantonChange} allowClear disabled={cantons.length === 0}>
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
                <Select placeholder="Selecciona distrito" allowClear disabled={districts.length === 0}>
                  {districts.map((d) => (
                    <Select.Option key={d.district_snit_code || d.district_id} value={d.district_snit_code}>
                      {d.district_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '12px 0' }}>
            <span style={{ fontSize: 13, color: '#8c8c8c' }}>Participantes y Manifestaciones</span>
          </Divider>

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
              options={allManifestations.map((m) => ({
                value: m.geomanifestation_id || m.id,
                label: `${m.geomanifestation_name || m.name} ${m.location?.canton ? `— ${m.location.canton}` : ''}`,
              }))}
            />
          </Form.Item>

          <Form.Item name="field_trip_is_active" valuePropName="checked" label="Estado de la Gira">
            <Switch checkedChildren="Activa" unCheckedChildren="Inactiva / Cerrada" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer: Detailed Trip View + Participants + Manifestations + Comments */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CompassOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
              <div>
                <Text strong style={{ fontSize: 16 }}>
                  {selectedTrip?.field_trip_name || 'Detalle de la Gira'}
                </Text>
                <div style={{ fontSize: 12, color: '#8c8c8c' }} className="font-mono">
                  {selectedTrip?.field_trip_id || selectedTrip?.id}
                </div>
              </div>
            </div>
            {selectedTrip && (
              <Tag color={selectedTrip.field_trip_is_active ? 'green' : 'default'} style={{ fontSize: 13, padding: '2px 8px' }}>
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
                            actions={
                              canManage
                                ? [
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
                                    </Popconfirm>,
                                  ]
                                : []
                            }
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
    </div>
  );
};

export default FieldTripsManager;
