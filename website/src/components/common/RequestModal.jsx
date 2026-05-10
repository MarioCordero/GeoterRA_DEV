import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  Radio,
  Checkbox,
  Upload,
  Spin,
  Tag,
  message,
  DatePicker,
  Table,
} from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  FullscreenOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import dayjs from 'dayjs';
import PhoneInput from './PhoneInput';
import {
  analysisRequestIndex,
  analysisRequestStore,
  analysisRequestDelete,
} from '../../config/apiConf';

/**
 * Unified Request Modal Component
 * 
 * Consolidates request listing, viewing, creation, and deletion with integrated map interface.
 * Features: list view, detail modal, create modal with location picker, geolocation, file upload.
 * 
 * @component
 * @param {Object} props
 * @param {string} [props.mode='list-and-create'] - Component mode: 'list-and-create' or 'create-only'
 * @param {Function} [props.onRequestAdded] - Callback after successful request creation
 * @param {boolean} [props.isAdmin=false] - Show admin mode features
 * @param {boolean} [props.useTokenAuth=false] - Use token-based auth (for standalone use)
 * @example
 * <RequestModal mode="list-and-create" />
 * <RequestModal mode="create-only" isAdmin={true} />
 */

// ============================================
// MAP COMPONENTS
// ============================================

/** Marker component for map interaction */
function LocationMarker({ setLatLng, latLng }) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (latLng && latLng.lat && latLng.lng) {
      setPosition([latLng.lat, latLng.lng]);
    }
  }, [latLng]);

  useMapEvents({
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      setLatLng(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

/** Ensures map displays correctly when modal shows */
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

// ============================================
// MAIN COMPONENT
// ============================================

const RequestModal = ({
  mode = 'list-and-create',
  onRequestAdded,
  isAdmin = false,
  useTokenAuth = false,
}) => {
  // ─── Form state ───
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();

  // ─── View state ───
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'create'
  const [isMobile, setIsMobile] = useState(false);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // ─── Data state ───
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);

  // ─── Modal state ───
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // ─── Location state ───
  const [latLng, setLatLng] = useState({});
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  // ─── Refs ───
  const locationRequestRef = useRef(null);
  const componentMountedRef = useRef(true);
  const FORM_CACHE_KEY = 'analysisRequestFormCache';
  const defaultPosition = [9.93333, -84.08333];

  // ─── Effects ───

  useEffect(() => {
    componentMountedRef.current = true;
    return () => {
      componentMountedRef.current = false;
      locationRequestRef.current = null;
    };
  }, []);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth <= 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (latLng.lat && latLng.lng) {
      setManualLat(latLng.lat.toFixed(6));
      setManualLng(latLng.lng.toFixed(6));
      createForm.setFieldsValue({
        latitude: latLng.lat,
        longitude: latLng.lng,
      });
    }
  }, [latLng, createForm]);

  // ─── Form caching ───

  useEffect(() => {
    if (activeTab === 'create' && mode === 'list-and-create') {
      const cached = localStorage.getItem(FORM_CACHE_KEY);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          createForm.setFieldsValue(data);
          if (data.latitude && data.longitude) {
            setLatLng({ lat: data.latitude, lng: data.longitude });
          }
        } catch (e) {
          console.warn('Failed to restore form cache:', e);
        }
      }
    }
  }, [activeTab, createForm]);

  // ─── Location cleanup ───

  useEffect(() => {
    if (activeTab !== 'create' && !mapFullscreen) {
      if (locationRequestRef.current !== null) {
        locationRequestRef.current = null;
        setGettingLocation(false);
      }
    }
  }, [activeTab, mapFullscreen]);

  // ═══════════════════════════════════════════
  // API CALLS
  // ═══════════════════════════════════════════

  const loadRequests = async () => {
    if (mode === 'create-only') return;

    setLoading(true);
    setError(null);
    try {
      const result = await analysisRequestIndex();

      if (result.status === 401 || result.status === 403) {
        setRequests([]);
        return;
      }

      if (!result.ok) {
        throw new Error(result.error || 'Failed to fetch requests');
      }

      if (result.data && Array.isArray(result.data)) {
        setRequests(
          result.data.map((item) => ({
            id_soli: item.id || item.name,
            name: item.name || `SOLI-${(item.id || '').slice(-5)}`,
            created_at: item.created_at,
            email: item.email || 'Sin email',
            region_id: item.region || '',
            owner_name: item.owner_name || '',
            owner_contact_number: item.owner_contact_number || '',
            current_usage: item.current_usage || '',
            temperature_sensation: item.temperature_sensation || '',
            bubbles: item.bubbles || 0,
            details: item.details || '',
            latitude: item.latitude || '',
            longitude: item.longitude || '',
            state: item.state || 'Pendiente',
          }))
        );
      }
    } catch (err) {
      console.error('❌ [RequestModal] Error fetching requests:', err);
      setError(err.message || 'Error cargando solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (formValues) => {
    try {
      setCreatingRequest(true);

      // Validate coordinates
      if (!latLng.lat || !latLng.lng) {
        message.error('❌ Debes seleccionar una ubicación en el mapa');
        return;
      }

      const payload = {
        email: formValues.email,
        owner_name: formValues.owner_name,
        owner_contact_number: formValues.owner_contact_number || null,
        temperature_sensation: formValues.temperature_sensation || null,
        bubbles: formValues.bubbles ? 1 : 0,
        details: formValues.details || null,
        current_usage: formValues.current_usage || null,
        latitude: latLng.lat,
        longitude: latLng.lng,
        region: formValues.region_id || null,
      };

      console.log('📤 [RequestModal] Sending payload:', payload);

      const result = await analysisRequestStore(payload);

      if (result.status === 401 || result.status === 403) {
        throw new Error('No autorizado para crear solicitudes');
      }

      if (!result.ok) {
        throw new Error(result.error || 'Error al crear solicitud');
      }

      message.success('✅ Solicitud creada correctamente');
      localStorage.removeItem(FORM_CACHE_KEY);
      createForm.resetFields();
      setLatLng({});
      setManualLat('');
      setManualLng('');

      if (mode === 'list-and-create') {
        setActiveTab('list');
        await loadRequests();
      }

      if (onRequestAdded) {
        onRequestAdded();
      }
    } catch (error) {
      console.error('❌ [RequestModal] Error creating request:', error);
      message.error('Error: ' + error.message);
    } finally {
      setCreatingRequest(false);
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      const result = await analysisRequestDelete(requestId);

      if (result.status === 401 || result.status === 403) {
        throw new Error('No autorizado para eliminar esta solicitud');
      }

      if (!result.ok) {
        throw new Error(result.error || 'Error al eliminar la solicitud');
      }

      message.success('✅ Solicitud eliminada correctamente');
      await loadRequests();
      return true;
    } catch (error) {
      console.error('❌ [RequestModal] Error deleting request:', error);
      message.error('Error al eliminar la solicitud: ' + error.message);
      throw error;
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: '¿Eliminar solicitud?',
      content: `¿Estás seguro de que deseas eliminar la solicitud ${record.name}?`,
      okText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: () => deleteRequest(record.id_soli),
    });
  };

  // ─── Location functions ───

  const getCurrentLocation = () => {
    if (locationRequestRef.current !== null || gettingLocation) {
      return Promise.reject(
        new Error('Location request already in progress')
      );
    }

    if (!navigator.geolocation) {
      message.error(
        '❌ La geolocalización no está soportada en este navegador'
      );
      return Promise.reject(
        new Error('Geolocation not supported')
      );
    }

    return new Promise((resolve, reject) => {
      const requestId = Date.now();
      locationRequestRef.current = requestId;
      setGettingLocation(true);

      const timeoutId = setTimeout(() => {
        if (locationRequestRef.current === requestId) {
          locationRequestRef.current = null;
          setGettingLocation(false);
          reject(new Error('Timeout getting location'));
        }
      }, 15000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!componentMountedRef.current) return;

          if (locationRequestRef.current !== requestId) return;

          const { latitude, longitude } = position.coords;
          const newLatLng = { lat: latitude, lng: longitude };
          setLatLng(newLatLng);
          setManualLat(latitude.toFixed(6));
          setManualLng(longitude.toFixed(6));
          createForm.setFieldsValue({
            latitude,
            longitude,
          });

          locationRequestRef.current = null;
          setGettingLocation(false);
          clearTimeout(timeoutId);
          message.success('✅ Ubicación obtenida correctamente');
          resolve(newLatLng);
        },
        (error) => {
          if (!componentMountedRef.current) return;
          if (locationRequestRef.current !== requestId) return;

          locationRequestRef.current = null;
          setGettingLocation(false);
          clearTimeout(timeoutId);

          console.error('Geolocation error:', error);
          let errorMessage = 'Error al obtener ubicación';

          if (error.code === 1) {
            errorMessage =
              'Permiso denegado. Habilita la ubicación en tu navegador';
          } else if (error.code === 2) {
            errorMessage =
              'Ubicación no disponible. Verifica tu conexión a internet';
          } else if (error.code === 3) {
            errorMessage = 'Timeout obteniendo ubicación. Intenta de nuevo';
          }

          message.error('❌ ' + errorMessage);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  const handleManualCoordinateChange = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (!isNaN(lat) && !isNaN(lng)) {
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setLatLng({ lat, lng });
        createForm.setFieldsValue({ latitude: lat, longitude: lng });
        message.success('✅ Coordenadas aplicadas correctamente');
      } else {
        message.error(
          '❌ Coordenadas inválidas. Latitud [-90, 90], Longitud [-180, 180]'
        );
      }
    } else {
      message.error('❌ Ingresa valores numéricos válidos');
    }
  };

  const handleFormValuesChange = (_, allValues) => {
    const cache = { ...allValues };
    if (cache.fecha && typeof cache.fecha !== 'string') {
      cache.fecha = cache.fecha.format('YYYY-MM-DD');
    }
    localStorage.setItem(FORM_CACHE_KEY, JSON.stringify(cache));
  };

  // ─── Render helpers ───

  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    setViewModalVisible(true);
  };

  const toggleMapFullscreen = () => {
    setMapFullscreen(!mapFullscreen);
  };

  const dataSource = (requests || []).map((request, index) => ({
    key: request.id_soli || index,
    ...request,
  }));

  // ─── Mobile card component ───

  const MobileRequestCard = ({ request }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-sm">{request.name}</p>
          <p className="text-xs text-gray-500">{request.owner_name}</p>
        </div>
        <Tag color={request.state === 'Pendiente' ? 'orange' : 'green'}>
          {request.state}
        </Tag>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        📅 {new Date(request.created_at).toLocaleDateString('es-ES')}
      </p>

      <div className="space-y-2 mb-4 text-sm">
        {request.email && <p>📧 Email: {request.email}</p>}
        {request.owner_contact_number && (
          <p>📞 Teléfono: {request.owner_contact_number}</p>
        )}
        {request.current_usage && <p>🏗️ Uso Actual: {request.current_usage}</p>}
        {request.temperature_sensation && (
          <p>
            🌡️ Sensación Térmica:{' '}
            {request.temperature_sensation === 'hot'
              ? '🔥 Caliente'
              : request.temperature_sensation === 'warm'
                ? '🌡️ Tibio'
                : '❄️ Frío'}
          </p>
        )}
        {request.bubbles && <p>💧 Burbujeo: ✅</p>}
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          size="small"
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(request)}
          title="Eliminar solicitud"
        />
        <Button
          size="small"
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(request)}
          title="Ver detalles"
        />
      </div>
    </div>
  );

  // ─── Table columns ───

  const columns = [
    {
      title: 'Solicitud',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Solicitante',
      dataIndex: 'owner_name',
      key: 'owner_name',
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: 'Fecha',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <span className="text-sm">
          {new Date(date).toLocaleDateString('es-ES')}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'state',
      key: 'state',
      render: (state) => (
        <Tag color={state === 'Pendiente' ? 'orange' : 'green'}>{state}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="small"
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            title="Eliminar solicitud"
          />
          <Button
            size="small"
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            title="Ver detalles"
          />
        </div>
      ),
    },
  ];

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  if (mode === 'create-only') {
    // Simplified create-only mode (for admin panel)
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6">
          ➕ Crear Nueva Solicitud de Análisis
          {isAdmin && <span className="text-sm text-gray-500 ml-2">(Admin)</span>}
        </h2>

        {/* Map Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-3">📍 Selecciona la Ubicación</h3>

          {/* Manual Coordinate Input */}
          <div style={{
            marginBottom: 12,
            padding: 12,
            backgroundColor: '#fafafa',
            border: '1px solid #d9d9d9',
            borderRadius: 6,
          }}>
            <div style={{ marginBottom: 8, fontWeight: 500, fontSize: '14px' }}>
              📍 Coordenadas GPS
            </div>
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ minWidth: 60, fontSize: '12px', color: '#666' }}>
                  Latitud:
                </label>
                <Input
                  placeholder="9.933333"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  style={{ width: 120 }}
                  size="small"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label
                  style={{ minWidth: 65, fontSize: '12px', color: '#666' }}
                >
                  Longitud:
                </label>
                <Input
                  placeholder="-84.083333"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  style={{ width: 120 }}
                  size="small"
                />
              </div>
              <Button
                type="primary"
                size="small"
                onClick={handleManualCoordinateChange}
                disabled={!manualLat || !manualLng}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Aplicar
              </Button>
              <Button
                type="default"
                size="small"
                onClick={() => {
                  setLatLng({});
                  setManualLat('');
                  setManualLng('');
                  message.info('Marcador eliminado');
                }}
                disabled={!latLng.lat && !latLng.lng}
                danger
              >
                Limpiar
              </Button>
            </div>
            {latLng.lat && latLng.lng && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: '11px',
                  color: '#52c41a',
                  fontWeight: 500,
                }}
              >
                ✅ Coordenadas actuales: {latLng.lat.toFixed(6)},{' '}
                {latLng.lng.toFixed(6)}
              </div>
            )}
          </div>

          {/* Map Container */}
          <div
            style={{
              height: 300,
              marginBottom: 8,
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              overflow: 'hidden',
            }}
          >
            <MapContainer
              center={
                latLng.lat ? [latLng.lat, latLng.lng] : defaultPosition
              }
              zoom={latLng.lat ? 15 : 8}
              style={{ height: '100%', width: '100%' }}
              key={`map-create-only`}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker setLatLng={setLatLng} latLng={latLng} />
              <MapResizeHandler />
            </MapContainer>
          </div>

          {/* Get Location Button */}
          <Button
            type="primary"
            icon={gettingLocation ? <LoadingOutlined /> : <EnvironmentOutlined />}
            onClick={() => {
              getCurrentLocation().catch((err) => {
                console.error('Error getting location:', err);
              });
            }}
            loading={gettingLocation}
            disabled={gettingLocation}
            style={{
              backgroundColor: gettingLocation ? '#ffc107' : '#34d399',
              borderColor: gettingLocation ? '#ffc107' : '#34d399',
            }}
            className="w-full"
          >
            {gettingLocation ? 'Obteniendo ubicación...' : 'Obtener Mi Ubicación'}
          </Button>
        </div>

        {/* Form */}
        <Form
          form={createForm}
          layout="vertical"
          onValuesChange={handleFormValuesChange}
          onFinish={handleCreateRequest}
        >
          <Form.Item
            name="email"
            label="📧 Email"
            rules={[
              { required: true, message: 'El email es requerido' },
              {
                type: 'email',
                message: 'Ingresa un email válido',
              },
            ]}
          >
            <Input placeholder="correo@ejemplo.com" />
          </Form.Item>

          <Form.Item
            name="owner_name"
            label="👤 Nombre del Solicitante"
            rules={[{ required: true, message: 'El nombre es requerido' }]}
          >
            <Input placeholder="Ej: Juan Pérez" />
          </Form.Item>

          <PhoneInput form={createForm} name="owner_contact_number" required={false} />

          <Form.Item
            name="region_id"
            label="🗺️ Región"
          >
            <Select
              placeholder="Selecciona una región"
              options={[
                { value: 'central_valley', label: 'Valle Central' },
                { value: 'pacific', label: 'Zona Pacífica' },
                { value: 'caribbean', label: 'Zona Caribeña' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="temperature_sensation"
            label="🌡️ Sensación Térmica"
          >
            <Select
              placeholder="Selecciona la sensación térmica"
              options={[
                { value: 'hot', label: '🔥 Caliente' },
                { value: 'warm', label: '🌡️ Tibio' },
                { value: 'cold', label: '❄️ Frío' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="bubbles"
            valuePropName="checked"
            label="💧 Burbujeo"
          >
            <Checkbox>Hay burbujeo visible</Checkbox>
          </Form.Item>

          <Form.Item
            name="current_usage"
            label="🏗️ Uso Actual del Terreno"
          >
            <Select
              placeholder="Selecciona el tipo de uso"
              options={[
                { value: 'agricultural', label: 'Agrícola' },
                { value: 'industrial', label: 'Industrial' },
                { value: 'residential', label: 'Residencial' },
                { value: 'recreational', label: 'Recreativo' },
                { value: 'other', label: 'Otro' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="details"
            label="📝 Detalles Adicionales"
          >
            <Input.TextArea
              rows={4}
              placeholder="Describe cualquier información adicional sobre la manifestación geotérmica..."
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={creatingRequest}
              disabled={!latLng.lat || !latLng.lng || creatingRequest}
              className="w-full"
            >
              {creatingRequest
                ? 'Enviando...'
                : '✅ Crear Solicitud'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }

  // List + Create mode (main dashboard view)
  return (
    <>
      <div className="w-full p-4 md:p-6">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === 'list'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('list')}
          >
            📋 Mis Solicitudes ({requests.length})
          </button>
          <button
            className={`pb-2 px-4 font-semibold transition-colors ${
              activeTab === 'create'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('create')}
          >
            ➕ Nueva Solicitud
          </button>
        </div>

        {/* List Tab */}
        {activeTab === 'list' && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-96 p-6">
                <Spin size="large" />
                <p className="mt-4 text-sm md:text-base">
                  Cargando tus solicitudes...
                </p>
              </div>
            ) : error ? (
              <div className="p-4 md:p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-semibold text-red-800">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                  <Button
                    type="primary"
                    size="small"
                    onClick={loadRequests}
                    className="mt-3"
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center p-8 md:p-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600 mb-2">
                  No tienes solicitudes registradas
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Haz clic en "Nueva Solicitud" para crear tu primera solicitud
                </p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setActiveTab('create')}
                >
                  Crear Nueva Solicitud
                </Button>
              </div>
            ) : (
              <>
                {isMobile ? (
                  <div>
                    {dataSource.map((request) => (
                      <MobileRequestCard
                        key={request.key}
                        request={request}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table
                      columns={columns}
                      dataSource={dataSource}
                      pagination={{ pageSize: 10 }}
                      loading={loading}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">
              ➕ Crear Nueva Solicitud de Análisis
            </h2>

            {/* Map Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-3">📍 Selecciona la Ubicación*</h3>

              {/* Manual Coordinate Input */}
              <div
                style={{
                  marginBottom: 12,
                  padding: 12,
                  backgroundColor: '#fafafa',
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    marginBottom: 8,
                    fontWeight: 500,
                    fontSize: '14px',
                  }}
                >
                  📍 Coordenadas GPS
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label
                      style={{
                        minWidth: 60,
                        fontSize: '12px',
                        color: '#666',
                      }}
                    >
                      Latitud:
                    </label>
                    <Input
                      placeholder="9.933333"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      style={{ width: 120 }}
                      size="small"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label
                      style={{
                        minWidth: 65,
                        fontSize: '12px',
                        color: '#666',
                      }}
                    >
                      Longitud:
                    </label>
                    <Input
                      placeholder="-84.083333"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      style={{ width: 120 }}
                      size="small"
                    />
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleManualCoordinateChange}
                    disabled={!manualLat || !manualLng}
                    style={{
                      backgroundColor: '#52c41a',
                      borderColor: '#52c41a',
                    }}
                  >
                    Aplicar
                  </Button>
                  <Button
                    type="default"
                    size="small"
                    onClick={() => {
                      setLatLng({});
                      setManualLat('');
                      setManualLng('');
                      message.info('Marcador eliminado');
                    }}
                    disabled={!latLng.lat && !latLng.lng}
                    danger
                  >
                    Limpiar
                  </Button>
                </div>
                {latLng.lat && latLng.lng && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: '11px',
                      color: '#52c41a',
                      fontWeight: 500,
                    }}
                  >
                    ✅ Coordenadas actuales: {latLng.lat.toFixed(6)},{' '}
                    {latLng.lng.toFixed(6)}
                  </div>
                )}
              </div>

              {/* Map Container */}
              <div
                style={{
                  position: 'relative',
                  height: 300,
                  marginBottom: 8,
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                <MapContainer
                  center={
                    latLng.lat ? [latLng.lat, latLng.lng] : defaultPosition
                  }
                  zoom={latLng.lat ? 15 : 8}
                  style={{ height: '100%', width: '100%' }}
                  key={`map-create-tab`}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker setLatLng={setLatLng} latLng={latLng} />
                  <MapResizeHandler />
                </MapContainer>

                {/* Map Control Buttons */}
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <Button
                    type="primary"
                    icon={
                      gettingLocation ? <LoadingOutlined /> : <EnvironmentOutlined />
                    }
                    onClick={() => {
                      getCurrentLocation().catch((err) => {
                        console.error('Error getting location:', err);
                      });
                    }}
                    loading={gettingLocation}
                    disabled={gettingLocation}
                    style={{
                      backgroundColor: gettingLocation
                        ? '#ffc107'
                        : '#34d399',
                      borderColor: gettingLocation ? '#ffc107' : '#34d399',
                    }}
                    size="small"
                    title={
                      gettingLocation
                        ? 'Obteniendo ubicación...'
                        : 'Obtener ubicación actual'
                    }
                  />

                  <Button
                    type="primary"
                    icon={<FullscreenOutlined />}
                    onClick={toggleMapFullscreen}
                    style={{
                      backgroundColor: '#1890ff',
                      borderColor: '#1890ff',
                    }}
                    size="small"
                    title="Pantalla completa"
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: '12px',
                  color: '#666',
                  fontStyle: 'italic',
                }}
              >
                💡 Haz clic en el mapa para seleccionar una ubicación, usa tu
                ubicación actual, o ingresa las coordenadas manualmente.
              </div>
            </div>

            {/* Form */}
            <Form
              form={createForm}
              layout="vertical"
              onValuesChange={handleFormValuesChange}
              onFinish={handleCreateRequest}
            >
              <Form.Item
                name="email"
                label="📧 Email"
                rules={[
                  { required: true, message: 'El email es requerido' },
                  {
                    type: 'email',
                    message: 'Ingresa un email válido',
                  },
                ]}
              >
                <Input placeholder="correo@ejemplo.com" />
              </Form.Item>

              <Form.Item
                name="owner_name"
                label="👤 Nombre del Solicitante"
                rules={[
                  { required: true, message: 'El nombre es requerido' },
                ]}
              >
                <Input placeholder="Ej: Juan Pérez" />
              </Form.Item>

              <PhoneInput form={createForm} name="owner_contact_number" required={false} />

              <Form.Item
                name="region_id"
                label="🗺️ Región"
              >
                <Select
                  placeholder="Selecciona una región"
                  options={[
                    { value: 'central_valley', label: 'Valle Central' },
                    { value: 'pacific', label: 'Zona Pacífica' },
                    { value: 'caribbean', label: 'Zona Caribeña' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="temperature_sensation"
                label="🌡️ Sensación Térmica"
              >
                <Select
                  placeholder="Selecciona la sensación térmica"
                  options={[
                    { value: 'hot', label: '🔥 Caliente' },
                    { value: 'warm', label: '🌡️ Tibio' },
                    { value: 'cold', label: '❄️ Frío' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="bubbles"
                valuePropName="checked"
                label="💧 Burbujeo"
              >
                <Checkbox>Hay burbujeo visible</Checkbox>
              </Form.Item>

              <Form.Item
                name="current_usage"
                label="🏗️ Uso Actual del Terreno"
              >
                <Select
                  placeholder="Selecciona el tipo de uso"
                  options={[
                    { value: 'agricultural', label: 'Agrícola' },
                    { value: 'industrial', label: 'Industrial' },
                    { value: 'residential', label: 'Residencial' },
                    { value: 'recreational', label: 'Recreativo' },
                    { value: 'other', label: 'Otro' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="details"
                label="📝 Detalles Adicionales"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Describe cualquier información adicional sobre la manifestación geotérmica..."
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={creatingRequest}
                  disabled={
                    !latLng.lat ||
                    !latLng.lng ||
                    creatingRequest
                  }
                  className="w-full"
                >
                  {creatingRequest
                    ? 'Enviando...'
                    : '✅ Crear Solicitud'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <Modal
        title={`Detalles de la Solicitud ${selectedRequest?.name}`}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setViewModalVisible(false)}
          >
            Cerrar
          </Button>,
        ]}
        width={isMobile ? '95%' : 700}
        centered
        styles={{
          body: {
            maxHeight: isMobile
              ? 'calc(100vh - 200px)'
              : 'calc(100vh - 100px)',
            overflowY: 'auto',
          },
        }}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase">Solicitud ID</p>
                <p className="text-lg font-bold text-gray-800">
                  {selectedRequest.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Estado</p>
                <Tag
                  color={
                    selectedRequest.state === 'Pendiente'
                      ? 'orange'
                      : 'green'
                  }
                >
                  {selectedRequest.state}
                </Tag>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">
                  Fecha de Creación
                </p>
                <p className="text-sm text-gray-700">
                  {new Date(selectedRequest.created_at).toLocaleDateString(
                    'es-ES',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Región</p>
                <p className="text-sm text-gray-700">
                  {selectedRequest.region_id || 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                👤 Información del Solicitante
              </h3>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Nombre</p>
                  <p className="font-semibold text-gray-800">
                    {selectedRequest.owner_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-700 break-all">
                    {selectedRequest.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-sm text-gray-700">
                    {selectedRequest.owner_contact_number ||
                      'No disponible'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">📍 Ubicación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="text-xs text-gray-500">Latitud</p>
                  <p className="font-semibold text-gray-800">
                    {selectedRequest.latitude}°
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Longitud</p>
                  <p className="font-semibold text-gray-800">
                    {selectedRequest.longitude}°
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                🌡️ Características de la Manifestación
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-xs text-gray-500">Uso Actual</p>
                  <p className="font-semibold text-orange-700">
                    {selectedRequest.current_usage || 'No especificado'}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-gray-500">Sensación Térmica</p>
                  <p className="font-semibold text-red-700">
                    {selectedRequest.temperature_sensation === 'hot'
                      ? '🔥 Caliente'
                      : selectedRequest.temperature_sensation ===
                          'warm'
                        ? '🌡️ Tibio'
                        : '❄️ Frío'}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-500">Burbujeo Visible</p>
                  <p className="font-semibold text-purple-700">
                    {selectedRequest.bubbles ? '✅ Sí' : '❌ No'}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">
                    Detalles Adicionales
                  </p>
                  <p className="text-sm text-gray-700">
                    {selectedRequest.details ||
                      'Sin detalles adicionales'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Fullscreen Map Modal */}
      <Modal
        title={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Seleccionar ubicación en el mapa</span>
            <div>
              {latLng.lat && latLng.lng && (
                <span style={{ fontSize: '12px', color: '#666', marginRight: '16px' }}>
                  Lat: {latLng.lat.toFixed(6)}, Lng: {latLng.lng.toFixed(6)}
                </span>
              )}
            </div>
          </div>
        }
        open={mapFullscreen}
        onCancel={() => setMapFullscreen(false)}
        width="95vw"
        centered
        footer={null}
        styles={{
          body: {
            height: '80vh',
            padding: 0,
            overflow: 'hidden',
            position: 'relative',
          },
        }}
      >
        <div
          style={{
            height: '100%',
            width: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Map Container */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <MapContainer
              center={
                latLng.lat ? [latLng.lat, latLng.lng] : defaultPosition
              }
              zoom={latLng.lat ? 15 : 8}
              style={{ height: '100%', width: '100%' }}
              key={`fullscreen-map`}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker setLatLng={setLatLng} latLng={latLng} />
              <MapResizeHandler />
            </MapContainer>

            {/* Current Location Button */}
            <Button
              type="primary"
              icon={
                gettingLocation ? <LoadingOutlined /> : <EnvironmentOutlined />
              }
              onClick={() => {
                getCurrentLocation().catch((err) => {
                  console.error('Error getting location:', err);
                });
              }}
              loading={gettingLocation}
              disabled={gettingLocation}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1000,
                backgroundColor: gettingLocation ? '#ffc107' : '#34d399',
                borderColor: gettingLocation ? '#ffc107' : '#34d399',
              }}
              size="small"
            >
              {gettingLocation ? 'Obteniendo...' : 'Mi ubicación'}
            </Button>
          </div>

          {/* Bottom Control Panel */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'white',
              borderTop: '1px solid #d9d9d9',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
              zIndex: 999,
            }}
          >
            {/* Coordinate Input Section */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    minWidth: 50,
                  }}
                >
                  Latitud:
                </label>
                <Input
                  placeholder="Lat"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  style={{ width: 100 }}
                  size="small"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label
                  style={{
                    fontSize: '12px',
                    color: '#666',
                    minWidth: 60,
                  }}
                >
                  Longitud:
                </label>
                <Input
                  placeholder="Lng"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  style={{ width: 100 }}
                  size="small"
                />
              </div>
              <Button
                type="primary"
                size="small"
                onClick={handleManualCoordinateChange}
                disabled={!manualLat || !manualLng}
                style={{
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                }}
              >
                Aplicar Coordenadas
              </Button>
            </div>

            {/* Current display */}
            {latLng.lat && latLng.lng && (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#52c41a',
                  fontWeight: 500,
                  padding: '8px',
                  backgroundColor: '#f6ffed',
                  borderRadius: 4,
                  border: '1px solid #b7eb8f',
                }}
              >
                📍 Ubicación seleccionada: {latLng.lat.toFixed(6)},{' '}
                {latLng.lng.toFixed(6)}
              </div>
            )}

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
              }}
            >
              <Button
                onClick={() => setMapFullscreen(false)}
                size="large"
                style={{ minWidth: 120 }}
              >
                Cerrar
              </Button>
              <Button
                type="primary"
                onClick={() => setMapFullscreen(false)}
                disabled={!latLng.lat || !latLng.lng}
                size="large"
                style={{ minWidth: 150 }}
              >
                Confirmar ubicación
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RequestModal;