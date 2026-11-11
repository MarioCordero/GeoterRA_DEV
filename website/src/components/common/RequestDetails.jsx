import React, { useState, useEffect } from 'react';
import {
  Modal, Button, Form, Input, Select, Radio,
  Tag, Spin, Space, message, Popconfirm, Card
} from 'antd';
import {
  EditOutlined, DeleteOutlined,
  EnvironmentOutlined, SaveOutlined, UserOutlined,
  ExperimentOutlined, EnvironmentFilled, CalendarOutlined
} from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Timeline } from 'antd';
import {
  analysisRequestShow,
  analysisRequestUpdate,
  analysisRequestDelete,
  analysisRequestStates
} from '../../config/apiConf';
import MapCoordinatePicker from './MapCoordinatePicker';
import PhoneInput from './PhoneInput';

// Fix Leaflet marker icon asset paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to center map dynamically when coordinates change
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center[0] === 'number' && typeof center[1] === 'number' && !isNaN(center[0]) && !isNaN(center[1])) {
      const timer = setTimeout(() => {
        map.invalidateSize();
        map.setView(center, 15);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [center, map]);
  return null;
}

/**
 * RequestDetails Modal Component
 * 
 * Full-width/spacious modal displaying complete request information.
 * - View Mode: Displays summary cards, single interactive Leaflet map, state history timeline, and action buttons.
 * - Edit Mode: Displays form with embedded MapCoordinatePicker under GPS section.
 */
const RequestDetails = ({
  requestId,
  visible,
  onClose,
  onUpdated,
  onDeleted
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [requestData, setRequestData] = useState(null);
  const [statesHistory, setStatesHistory] = useState([]);
  const [editMode, setEditMode] = useState(false);

  // Coordinates state
  const [latLng, setLatLng] = useState({ lat: null, lng: null });

  // Fetch request data when visible or ID changes
  useEffect(() => {
    if (visible && requestId) {
      loadRequestDetails();
    } else {
      setRequestData(null);
      setStatesHistory([]);
      setEditMode(false);
      setLatLng({ lat: null, lng: null });
    }
  }, [visible, requestId]);

  const loadRequestDetails = async () => {
    try {
      setLoading(true);
      const res = await analysisRequestShow(requestId);
      if (res.ok && res.data) {
        setRequestData(res.data);
        if (res.data.location?.latitude && res.data.location?.longitude) {
          setLatLng({
            lat: Number(res.data.location.latitude),
            lng: Number(res.data.location.longitude)
          });
        }
      } else {
        message.error(res.error || 'Error al cargar detalles de la solicitud');
        onClose();
      }

      // Load state history timeline (endpoint 3.6)
      const resStates = await analysisRequestStates(requestId);
      if (resStates.ok && Array.isArray(resStates.data)) {
        setStatesHistory(resStates.data);
      } else {
        setStatesHistory([]);
      }
    } catch (err) {
      console.error(err);
      message.error('Error al conectar con el servidor');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (!requestData) return;

    form.setFieldsValue({
      ownerName: requestData.owner_name,
      contactNumber: requestData.owner_phone_number,
      email: requestData.owner_email,
      relationWithOwner: requestData.relation_with_owner || 'Titular',
      usoActual: requestData.current_usage,
      sensTermica: requestData.temperature_sensation || 'Natural',
      burbujeo: requestData.bubbles ? '1' : '0',
      direccionExacta: requestData.exact_address,
      detalles: requestData.details
    });

    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (requestData?.location?.latitude && requestData?.location?.longitude) {
      setLatLng({
        lat: Number(requestData.location.latitude),
        lng: Number(requestData.location.longitude)
      });
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        owner_name: values.ownerName,
        owner_phone_number: values.contactNumber ? values.contactNumber.replace(/\D/g, '') : null,
        owner_email: values.email,
        relation_with_owner: values.relationWithOwner,
        current_usage: values.usoActual,
        temperature_sensation: values.sensTermica,
        bubbles: values.burbujeo === '1',
        exact_address: values.direccionExacta,
        details: values.detalles,
        latitude: latLng.lat,
        longitude: latLng.lng
      };

      const res = await analysisRequestUpdate(requestId, payload);
      if (res.ok) {
        message.success('Solicitud actualizada correctamente');
        setEditMode(false);
        loadRequestDetails();
        if (onUpdated) {
          onUpdated();
        }
      } else {
        message.error(res.error || 'Error al actualizar la solicitud');
      }
    } catch (err) {
      console.error(err);
      if (err.errorFields) {
        message.warning('Por favor complete los campos obligatorios');
      } else {
        message.error('Error al guardar cambios');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await analysisRequestDelete(requestId);
      if (res.ok) {
        message.success('Solicitud eliminada correctamente');
        onClose();
        if (onDeleted) {
          onDeleted(requestId);
        }
      } else {
        message.error(res.error || 'Error al eliminar la solicitud');
      }
    } catch (err) {
      console.error(err);
      message.error('Error de servidor al eliminar solicitud');
    } finally {
      setDeleting(false);
    }
  };

  const isEditable = () => {
    if (!requestData) return false;
    const stateValue = requestData.current_state?.value;
    return stateValue === 'Pendiente' || stateValue === 'Registrada';
  };

  return (
    <Modal
      title={
        <div className="py-1 pr-6 border-b border-gray-100">
          <span className="poppins-bold text-lg sm:text-xl text-geoterra-blue">
            {editMode ? 'Editar Solicitud de Análisis' : `Solicitud: ${requestData?.request_name || ''}`}
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="96vw"
      style={{ top: 16, maxWidth: '1150px', margin: '0 auto' }}
      styles={{ body: { padding: '16px 16px 24px' } }}
      destroyOnClose
    >
      {loading ? (
        <div className="py-20 text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-500 poppins text-base">Cargando información completa del punto...</p>
        </div>
      ) : requestData ? (
        <div className="poppins text-gray-700 space-y-8">

          {/* VIEW MODE */}
          {!editMode && (
            <div className="space-y-6">

              {/* Top Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                {/* Solicitante Card */}
                <Card
                  title={<div className="flex items-center gap-2 text-geoterra-blue font-bold text-sm sm:text-base"><UserOutlined /> Solicitante y Propietario</div>}
                  className="shadow-sm border border-gray-200 rounded-xl"
                  styles={{ header: { padding: '12px 16px' }, body: { padding: '16px' } }}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Nombre del Titular</p>
                      <p className="font-medium text-base text-gray-800 break-words">{requestData.owner_name || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Relación con Propietario</p>
                      <p className="font-medium text-gray-800">{requestData.relation_with_owner || 'Titular'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Correo Electrónico</p>
                      <p className="font-medium text-gray-800 break-all">{requestData.owner_email || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Número Telefónico</p>
                      <p className="font-medium text-gray-800">{requestData.owner_phone_number || 'No especificado'}</p>
                    </div>
                  </div>
                </Card>

                {/* Características Card */}
                <Card
                  title={<div className="flex items-center gap-2 text-geoterra-blue font-bold text-sm sm:text-base"><ExperimentOutlined /> Características del Sitio</div>}
                  className="shadow-sm border border-gray-200 rounded-xl"
                  styles={{ header: { padding: '12px 16px' }, body: { padding: '16px' } }}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Uso Actual del Terreno</p>
                      <p className="font-medium text-gray-800">{requestData.current_usage || 'Sin especificar'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Sensación Térmica</p>
                      <p className="font-medium text-gray-800">{requestData.temperature_sensation || 'Sin especificar'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Burbujeo Activo</p>
                      <div>
                        {requestData.bubbles ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-geoterra-blue border border-blue-200">
                            Sí (Activo)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            No
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Fecha de Registro</p>
                      <p className="font-medium text-gray-800">
                        {new Date(requestData.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Ubicación Card */}
                <Card
                  title={<div className="flex items-center gap-2 text-geoterra-blue font-bold text-sm sm:text-base"><EnvironmentFilled /> Ubicación Geográfica</div>}
                  className="shadow-sm border border-gray-200 rounded-xl"
                  styles={{ header: { padding: '12px 16px' }, body: { padding: '16px' } }}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Provincia / Cantón / Distrito</p>
                      <p className="font-medium text-base text-gray-800">
                        {requestData.location
                          ? `${requestData.location.province}, ${requestData.location.canton}, ${requestData.location.district}`
                          : 'No especificada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Dirección Exacta</p>
                      <p className="font-medium text-gray-800 break-words">{requestData.exact_address || 'Sin dirección exacta'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Coordenadas GPS</p>
                      <p className="font-mono text-sm text-geoterra-blue font-bold">
                        {latLng.lat && latLng.lng
                          ? `${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)}`
                          : 'No registradas'}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Details Remarks Section */}
              {requestData.details && (
                <Card
                  className="shadow-sm border border-gray-200 rounded-xl"
                  styles={{ header: { padding: '12px 16px' }, body: { padding: '16px' } }}
                >
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Detalles y Observaciones Adicionales</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {requestData.details}
                  </p>
                </Card>
              )}

              {/* State History Timeline Section */}
              {statesHistory && statesHistory.length > 0 && (
                <Card
                  className="shadow-sm border border-gray-200 rounded-xl"
                  styles={{ header: { padding: '12px 16px' }, body: { padding: '16px' } }}
                >
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-4">Historial de Estados y Seguimiento</p>
                  <Timeline
                    items={statesHistory.map((st) => ({
                      color: st.value === 'Aprobada' ? '#12467E' : st.value === 'Rechazada' ? '#dc2626' : st.value === 'Revisión' ? '#F39C29' : '#12467E',
                      children: (
                        <div>
                          <p className="font-semibold text-sm m-0 text-gray-800">{st.value}</p>
                          {st.description && <p className="text-xs text-gray-600 m-0 mt-0.5">{st.description}</p>}
                          <p className="text-xs text-gray-400 m-0 mt-1 flex items-center gap-1">
                            <CalendarOutlined /> {st.created_at ? new Date(st.created_at).toLocaleString('es-ES') : ''}
                          </p>
                        </div>
                      ),
                    }))}
                  />
                </Card>
              )}

              {/* Full Width View Map Preview */}
              <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <EnvironmentOutlined /> Mapa de la Manifestación
                </p>
                {latLng.lat && latLng.lng ? (
                  <div className="h-64 sm:h-96 w-full rounded-lg overflow-hidden border border-gray-200 z-0 relative">
                    <MapContainer
                      center={[latLng.lat, latLng.lng]}
                      zoom={15}
                      scrollWheelZoom={true}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[latLng.lat, latLng.lng]}>
                        <Popup>
                          <strong>{requestData.request_name}</strong><br />
                          {requestData.exact_address || 'Punto registrado'}
                        </Popup>
                      </Marker>
                      <RecenterMap center={[latLng.lat, latLng.lng]} />
                    </MapContainer>
                  </div>
                ) : (
                  <div className="h-40 sm:h-48 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400 text-sm">
                    Sin coordenadas registradas para mostrar mapa
                  </div>
                )}
              </div>

              {/* View Action Footer */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 border-t border-gray-200">
                <Popconfirm
                  title="¿Está seguro de eliminar esta solicitud?"
                  description="Esta acción no se puede deshacer."
                  onConfirm={handleDelete}
                  okText="Eliminar"
                  cancelText="Cancelar"
                  okButtonProps={{ danger: true, loading: deleting }}
                >
                  <Button danger type="primary" size="large" icon={<DeleteOutlined />} loading={deleting} className="w-full sm:w-auto">
                    Eliminar
                  </Button>
                </Popconfirm>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <Button size="large" onClick={onClose} className="flex-1 sm:flex-initial">
                    Cerrar
                  </Button>
                  {isEditable() && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<EditOutlined />}
                      onClick={handleEditClick}
                      style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
                      className="poppins-bold shadow-sm flex-1 sm:flex-initial"
                    >
                      Editar Solicitud
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* EDIT MODE */}
          {editMode && (
            <Form
              form={form}
              layout="vertical"
              className="space-y-6"
              requiredMark="optional"
            >
              {/* Section 1: Solicitante */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-geoterra-blue border-b border-gray-100 pb-3 flex items-center gap-2">
                  <UserOutlined /> Datos del Solicitante
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Form.Item
                    name="ownerName"
                    label="Nombre del Titular"
                    rules={[{ required: true, message: 'Ingrese el nombre del titular' }]}
                  >
                    <Input size="large" placeholder="Ej. Mario Cordero" />
                  </Form.Item>
                  <Form.Item
                    name="relationWithOwner"
                    label="Relación con el Propietario"
                  >
                    <Select size="large" options={[
                      { value: 'Titular', label: 'Propietario / Titular' },
                      { value: 'Familiar', label: 'Familiar' },
                      { value: 'Empleado', label: 'Empleado' },
                      { value: 'Socio', label: 'Socio' },
                      { value: 'Conocido', label: 'Conocido' }
                    ]} />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Correo Electrónico"
                    rules={[
                      { required: true, message: 'Ingrese el correo electrónico' },
                      { type: 'email', message: 'Ingrese un correo válido' }
                    ]}
                  >
                    <Input size="large" placeholder="usuario@correo.com" />
                  </Form.Item>
                  <Form.Item
                    name="contactNumber"
                    label="Número Telefónico"
                  >
                    <PhoneInput size="large" />
                  </Form.Item>
                </div>
              </div>

              {/* Section 2: Manifestación */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-geoterra-blue border-b border-gray-100 pb-3 flex items-center gap-2">
                  <ExperimentOutlined /> Características de la Manifestación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <Form.Item name="usoActual" label="Uso Actual del Terreno">
                    <Select size="large" options={[
                      { value: 'Residencial', label: 'Residencial' },
                      { value: 'Comercial', label: 'Comercial' },
                      { value: 'Turístico', label: 'Turístico' },
                      { value: 'Conservación', label: 'Conservación' },
                      { value: 'Ganadería', label: 'Ganadería' },
                      { value: 'Otro', label: 'Otro' }
                    ]} />
                  </Form.Item>
                  <Form.Item name="sensTermica" label="Sensación Térmica">
                    <Select size="large" options={[
                      { value: 'Hirviendo', label: 'Hirviendo' },
                      { value: 'Muy Caliente', label: 'Muy Caliente' },
                      { value: 'Caliente', label: 'Caliente' },
                      { value: 'Templado', label: 'Templado' },
                      { value: 'Natural', label: 'Natural' },
                      { value: 'Sin Especificar', label: 'Sin Especificar' }
                    ]} />
                  </Form.Item>
                  <Form.Item name="burbujeo" label="Burbujeo Activo">
                    <Radio.Group size="large" className="pt-1 flex flex-wrap gap-4">
                      <Radio value="1">Sí (Activo)</Radio>
                      <Radio value="0">No</Radio>
                    </Radio.Group>
                  </Form.Item>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
                  <Form.Item name="direccionExacta" label="Dirección Exacta">
                    <Input.TextArea rows={3} placeholder="Ej. De la iglesia católica 200m oeste..." />
                  </Form.Item>

                  <Form.Item name="detalles" label="Observaciones o Detalles">
                    <Input.TextArea rows={3} placeholder="Ingrese comentarios adicionales sobre la actividad térmica observada." />
                  </Form.Item>
                </div>
              </div>

              {/* Section 3: GPS Coordinates & Map Picker (Embedded in Edit Mode) */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-geoterra-blue border-b border-gray-100 pb-3 flex items-center gap-2">
                  <EnvironmentFilled /> Geolocalización GPS
                </h3>

                <MapCoordinatePicker
                  latLng={latLng}
                  onCoordinatesChange={(coords) => setLatLng(coords)}
                  title="Coordenadas GPS"
                  mapHeight="300px"
                  showApplyButton={false}
                  showClearButton={true}
                />
              </div>

              {/* Edit Mode Actions Footer */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-200">
                <Button size="large" onClick={handleCancelEdit} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={saving}
                  style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
                  className="poppins-bold shadow-sm w-full sm:w-auto"
                >
                  Guardar Cambios
                </Button>
              </div>
            </Form>
          )}

        </div>
      ) : null}
    </Modal>
  );
};

export default RequestDetails;