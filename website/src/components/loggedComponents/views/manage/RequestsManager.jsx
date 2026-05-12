import 'leaflet/dist/leaflet.css';
import { useSession } from '../../../../hooks/useSession';
import React, { useState, useEffect, useRef } from 'react';
import MapCoordinatePicker from '../../../common/MapCoordinatePicker';
import NotImplementedModal from '../../../common/NotImplementedModal';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { EyeOutlined, DeleteOutlined, CheckOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Spin, Tag, Button, Modal, Form, Input, InputNumber, message, Select, Collapse } from 'antd';
import { analysisRequestAdminIndex, analysisRequestAdminUpdate, analysisRequestAdminDelete, analysisRequestAdminShow, registeredManifestationsStore, regionsIndex } from '../../../../config/apiConf';

const defaultPosition = [9.93333, -84.08333];

// Inline marker component for map interaction
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

// Map resize handler for inline map
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

const RequestsManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNotImplementedOpen, setIsNotImplementedOpen] = useState(false);
  const [confirmedCoordinates, setConfirmedCoordinates] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [addManualPointModalVisible, setAddManualPointModalVisible] = useState(false);
  const [addPointForm] = Form.useForm();
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [regions, setRegions] = useState([]);
  const [submittingManualPoint, setSubmittingManualPoint] = useState(false);
  const { user } = useSession();

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchAllRequests = async () => {
    try {
      const result = await analysisRequestAdminIndex();

      if (!result.ok) {
        throw new Error(result.error || 'No autorizado desde el backend para ver todas las solicitudes, por favor consulte a su administrador');
      }

      if (result.data && Array.isArray(result.data)) {
        return result.data.map(item => ({
          id_soli: item.id,
          name: item.name || `SOLI-${item.id.slice(-5)}`,
          created_at: item.created_at,
          email: item.email || 'Sin email',
          region_id: item.region_id || '',
          owner_name: item.owner_name || '',
          owner_contact_number: item.owner_contact_number || '',
          current_usage: item.current_usage || '',
          temperature_sensation: item.temperature_sensation || '',
          bubbles: item.bubbles || 0,
          details: item.details || '',
          latitude: item.latitude || '',
          longitude: item.longitude || '',
          state: item.state || 'Pendiente',
          created_by: item.created_by || '',
        }));
      }
      
      return [];
    } catch (error) {
      console.error('[AdminRequests] ❌ Error fetching all requests:', error);
      throw error;
    }
  };

  const submitApprovedPoint = async (pointData) => {
    try {
      // Step 1: Create registered manifestation with registeredManifestationsStore
      const registeredManifestationPayload = {
        name: selectedRequest.name,
        region_id: selectedRequest.region_id || 1,
        latitude: pointData.latitude,
        longitude: pointData.longitude,
        description: pointData.description || null,
        temperature: pointData.temperature ? parseFloat(pointData.temperature) : null,
        field_pH: pointData.field_pH ? parseFloat(pointData.field_pH) : null,
        field_conductivity: pointData.field_conductivity ? parseFloat(pointData.field_conductivity) : null,
        lab_pH: pointData.lab_pH ? parseFloat(pointData.lab_pH) : null,
        lab_conductivity: pointData.lab_conductivity ? parseFloat(pointData.lab_conductivity) : null,
        cl: pointData.cl ? parseFloat(pointData.cl) : null,
        ca: pointData.ca ? parseFloat(pointData.ca) : null,
        hco3: pointData.hco3 ? parseFloat(pointData.hco3) : null,
        so4: pointData.so4 ? parseFloat(pointData.so4) : null,
        fe: pointData.fe ? parseFloat(pointData.fe) : null,
        si: pointData.si ? parseFloat(pointData.si) : null,
        b: pointData.b ? parseFloat(pointData.b) : null,
        li: pointData.li ? parseFloat(pointData.li) : null,
        f: pointData.f ? parseFloat(pointData.f) : null,
        na: pointData.na ? parseFloat(pointData.na) : null,
        k: pointData.k ? parseFloat(pointData.k) : null,
        mg: pointData.mg ? parseFloat(pointData.mg) : null,
      };

      const result = await registeredManifestationsStore(registeredManifestationPayload);

      if (!result.ok) {
        throw new Error(result.error || 'Error creando manifestación registrada');
      }

      // Step 2: Update analysis request state to "Analizada"
      const updatePayload = {
        state: 'Analizada',
      };

      const updateResult = await analysisRequestAdminUpdate(selectedRequest.id_soli, updatePayload);

      if (!updateResult.ok) {
        throw new Error(updateResult.error || 'Error actualizando solicitud');
      }

      return true;
    } catch (error) {
      console.error('❌ [AdminRequests] Error submitting approved point:', error);
      throw error;
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      const result = await analysisRequestAdminDelete(requestId);

      if (!result.ok) {
        throw new Error(result.error || 'Error al eliminar solicitud');
      }

      return true;
    } catch (error) {
      console.error('❌ [AdminRequests] Error deleting request:', error);
      throw error;
    }
  };

  // Load all requests on component mount
  useEffect(() => {
    const loadAllRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verify user is admin or maintenance
        const isAdmin = user?.role === 'admin' || user?.role === 'maintenance' || user?.is_admin;
        if (!isAdmin) {
          setError('Usuario no autorizado como administrador');
          return;
        }
        
        const allRequests = await fetchAllRequests();
        setRequests(allRequests);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllRequests();
  }, [user]);

  // Load regions for manual point form
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const result = await regionsIndex();
        if (result.ok && Array.isArray(result.data)) {
          setRegions(result.data);
        }
      } catch (error) {
        console.error('❌ Error loading regions:', error);
      }
    };
    
    loadRegions();
  }, []);

  // Refresh requests
  const refreshRequests = async () => {
    try {
      setLoading(true);
      const allRequests = await fetchAllRequests();
      setRequests(allRequests);
      message.success('Solicitudes actualizadas');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual point modal close
  const handleAddManualPointModalClose = () => {
    setAddManualPointModalVisible(false);
    setSelectedCoordinates(null);
    addPointForm.resetFields();
  };

  // Handle manual point form submission
  const handleSubmitManualPoint = async (values) => {
    try {
      if (!selectedCoordinates) {
        message.error('Por favor selecciona las coordenadas primero');
        return;
      }

      setSubmittingManualPoint(true);

      // Build the payload
      const payload = {
        name: values.name,
        region_id: values.region_id || regions[0]?.id,
        latitude: selectedCoordinates.lat,
        longitude: selectedCoordinates.lng,
        description: values.description || null,
        temperature: values.temperature ? parseFloat(values.temperature) : null,
        field_pH: values.field_pH ? parseFloat(values.field_pH) : null,
        field_conductivity: values.field_conductivity ? parseFloat(values.field_conductivity) : null,
        lab_pH: values.lab_pH ? parseFloat(values.lab_pH) : null,
        lab_conductivity: values.lab_conductivity ? parseFloat(values.lab_conductivity) : null,
        cl: values.cl ? parseFloat(values.cl) : null,
        ca: values.ca ? parseFloat(values.ca) : null,
        hco3: values.hco3 ? parseFloat(values.hco3) : null,
        so4: values.so4 ? parseFloat(values.so4) : null,
        fe: values.fe ? parseFloat(values.fe) : null,
        si: values.si ? parseFloat(values.si) : null,
        b: values.b ? parseFloat(values.b) : null,
        li: values.li ? parseFloat(values.li) : null,
        f: values.f ? parseFloat(values.f) : null,
        na: values.na ? parseFloat(values.na) : null,
        k: values.k ? parseFloat(values.k) : null,
        mg: values.mg ? parseFloat(values.mg) : null,
      };

      const result = await registeredManifestationsStore(payload);

      if (!result.ok) {
        throw new Error(result.error || 'Error creando punto manual');
      }

      message.success('Punto agregado exitosamente');
      handleAddManualPointModalClose();
      
      // Refresh requests to show new point
      await refreshRequests();
    } catch (error) {
      console.error('❌ Error submitting manual point:', error);
      message.error(error.message || 'Error al agregar punto');
    } finally {
      setSubmittingManualPoint(false);
    }
  };

  // Handle view details
  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    setViewModalVisible(true);
  };

  // Helper function to fetch and populate request details
  const fetchAndPopulateRequestDetails = async (requestId) => {
    try {
      setFetchingDetails(true);
      const response = await analysisRequestAdminShow(requestId);

      if (!response.ok) {
        throw new Error(response.error || 'Error fetching request details');
      }

      const requestData = response.data;

      // Map temperature_sensation to numeric temperature value
      const temperatureValueMap = {
        'hot': 40,
        'Cálido': 40,
        'warm': 25,
        'Templado': 25,
        'cold': 15,
        'Frío': 15,
      };

      const mappedTemperature = temperatureValueMap[requestData.temperature_sensation] || 25;

      // Populate form with fetched data
      reviewForm.setFieldsValue({
        id_soli: requestData.id,
        description: requestData.details || '',
        temperature: mappedTemperature,
        field_pH: 7.0,
        field_conductivity: 500,
        lab_pH: 7.0,
        lab_conductivity: 500,
        cl: 10,
        ca: 20,
        hco3: 30,
        so4: 40,
        fe: 0.07,
        si: 50,
        b: 1.0,
        li: 1,
        f: 0.5,
        na: 60,
        k: 70,
        mg: 80,
      });

      // Set coordinates from fetched data
      if (requestData.latitude && requestData.longitude) {
        setConfirmedCoordinates({
          lat: parseFloat(requestData.latitude),
          lng: parseFloat(requestData.longitude),
        });
      }
    } catch (err) {
      console.error('Error fetching request details:', err);
      message.error('Error al cargar detalles de la solicitud: ' + err.message);
    } finally {
      setFetchingDetails(false);
    }
  };

  // Handle review and accept
  const handleReviewAccept = (record) => {
    setSelectedRequest(record);
    setConfirmedCoordinates(null);
    setReviewModalVisible(true);
    // Fetch and populate details after opening modal
    fetchAndPopulateRequestDetails(record.id_soli);
  };

  // Handle form submission for approved point
  const handleSubmitApproval = async () => {
    try {
      // Check if location was confirmed
      if (!confirmedCoordinates) {
        message.error('Por favor confirma la ubicación en el mapa');
        return;
      }

      const values = await reviewForm.validateFields();
      
      // Merge form values with confirmed coordinates
      const approvalData = {
        ...values,
        latitude: confirmedCoordinates.lat,
        longitude: confirmedCoordinates.lng,
      };
      
      // Submit approval
      await submitApprovedPoint(approvalData);
      
      message.success('✅ Análisis completado y solicitud actualizada');
      setReviewModalVisible(false);
      reviewForm.resetFields();
      setSelectedRequest(null);
      setConfirmedCoordinates(null);
      
      await refreshRequests();
      
    } catch (error) {
      message.error('Error: ' + error.message);
    }
  };

  // Handle delete
  const handleDelete = (record) => {
    Modal.confirm({
      title: '¿Eliminar solicitud?',
      content: `¿Estás seguro de que deseas eliminar la solicitud ${record.name}?`,
      okText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteRequest(record.id_soli);
          message.success('✅ Solicitud eliminada');
          await refreshRequests();
        } catch (error) {
          message.error('Error: ' + error.message);
        }
      },
    });
  };

  // Format data for the table
  const dataSource = (requests || []).map((request, index) => ({
    key: request.id_soli || index,
    ...request,
  }));

  // Mobile card component
  const MobileRequestCard = ({ request }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-sm">{request.name}</p>
          <p className="text-xs text-gray-500">{request.owner_name}</p>
        </div>
        <Tag color={request.state === 'Pendiente' ? 'orange' : request.state === 'Analizada' ? 'green' : 'red'}>
          {request.state}
        </Tag>
      </div>
      
      <p className="text-xs text-gray-500 mb-3">
        📅 {new Date(request.created_at).toLocaleDateString('es-ES')}
      </p>
      
      <div className="space-y-2 mb-4 text-sm">
        {request.email && <p>📧 {request.email}</p>}
        {request.owner_contact_number && <p>📞 {request.owner_contact_number}</p>}
        {request.latitude && <p>📍 Lat: {request.latitude}° Lon: {request.longitude}°</p>}
      </div>
      
      <div className="flex gap-2 justify-end flex-wrap">
        <Button
          size="small"
          type="primary"
          icon={<CheckOutlined />}
          onClick={() => handleReviewAccept(request)}
          disabled={request.state !== 'Pendiente'}
          title="Revisar y aprobar"
        >
          Revisar
        </Button>
        <Button
          size="small"
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(request)}
          title="Eliminar solicitud"
        >
          Eliminar
        </Button>
        <Button
          size="small"
          type="default"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(request)}
          title="Ver detalles"
        >
          Ver
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 p-6">
        <Spin size="large" />
        <p className="mt-4 text-sm md:text-base">Cargando todas las solicitudes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="font-semibold text-red-800">Error</p>
          <p className="text-red-700 text-sm">{error}</p>
          <Button 
            type="primary"
            size="small"
            onClick={refreshRequests}
            className="mt-3"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Gestión de Solicitudes ({requests.length})
          </h1>
          
          <Button 
            type="primary"
            onClick={refreshRequests}
            className="w-full md:w-auto"
          >
            Actualizar
          </Button>
          <Button 
            type="primary"
            onClick={() => setAddManualPointModalVisible(true)}
            className="w-full md:w-auto"
          >
            Agregar Punto Manualmente
          </Button>
        </div>

        {/* Collapsible Help Section */}
        <Collapse
          className="mb-8"
          style={{ backgroundColor: '#fefce8', borderColor: '#fcd34d' }}
          items={[
            {
              key: '1',
              label: <span style={{ fontSize: '16px', fontWeight: 'bold' }}>💡 ¿Cómo revisar una solicitud y agregar puntos?</span>,
              children: (
                <div>
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">📝 Pasos para revisar y aceptar una solicitud:</h4>
                    <ol style={{ margin: '0', paddingLeft: '20px', color: '#333', lineHeight: '1.8' }}>
                      <li><strong>Selecciona una solicitud</strong> en estado "Pendiente" haciendo clic en el botón <strong>"Revisar"</strong></li>
                      <li><strong>Se abrirá la ventana de procesamiento</strong> con los datos del usuario y la ubicación inicial</li>
                      <li><strong>Haz clic en el mapa</strong> para confirmar o ajustar la ubicación GPS del punto geotérmico</li>
                      <li><strong>Completa los datos de mediciones</strong>: temperatura, pH, conductividad y elementos químicos (si los tienes)</li>
                      <li><strong>Revisión de campo y laboratorio</strong>: ingresa todas las mediciones disponibles</li>
                      <li><strong>Agrega observaciones</strong> en la sección de descripción si es necesario</li>
                      <li><strong>Haz clic en "Procesar Análisis"</strong> para completar la revisión y crear el registro de manifestación</li>
                    </ol>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">➕ Pasos para agregar un punto manualmente desde cero:</h4>
                    <ol style={{ margin: '0', paddingLeft: '20px', color: '#333', lineHeight: '1.8' }}>
                      <li><strong>Haz clic en el botón "Agregar Punto Manualmente"</strong> en la esquina superior</li>
                      <li><strong>Se abrirá un formulario</strong> con un mapa interactivo para seleccionar la ubicación</li>
                      <li><strong>Haz clic en el mapa</strong> para marcar la ubicación precisa del punto geotérmico</li>
                      <li><strong>Completa la información del punto</strong>: nombre único, región geotérmica y descripción</li>
                      <li><strong>Ingresa las mediciones de campo</strong> (temperatura, pH, conductividad): estos son los datos registrados en sitio</li>
                      <li><strong>Ingresa las mediciones de laboratorio</strong> (pH laboratorio, conductividad laboratorio): datos del análisis en laboratorio</li>
                      <li><strong>Completa los elementos químicos</strong> (Cl, Ca, HCO3, SO4, Fe, Si, B, Li, F, Na, K, Mg) en mg/L si están disponibles</li>
                      <li><strong>Haz clic en "Guardar"</strong> para crear el nuevo punto de manifestación registrada</li>
                    </ol>
                  </div>

                  <h4 className="font-semibold text-gray-800 mb-3">📊 Estados y Flujo de Procesamiento:</h4>
                  <div className="space-y-2">
                    <div style={{ padding: '8px 12px', backgroundColor: '#fff7e6', borderLeftWidth: '3px', borderLeftColor: '#faad14', borderRadius: '4px' }}>
                      <strong style={{ color: '#ad6800' }}>🟡 Pendiente:</strong>
                      <span style={{ color: '#ad6800', marginLeft: '8px' }}>La solicitud acaba de ser creada por un usuario de campo. Está esperando revisión y aprobación por tu equipo.</span>
                    </div>
                    <div style={{ padding: '8px 12px', backgroundColor: '#f6f0ff', borderLeftWidth: '3px', borderLeftColor: '#52c41a', borderRadius: '4px' }}>
                      <strong style={{ color: '#274a1c' }}>✅ Analizada:</strong>
                      <span style={{ color: '#274a1c', marginLeft: '8px' }}>La solicitud ha sido revisada, procesada y convertida en una manifestación registrada. Ahora aparece en el mapa interactivo.</span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-800 mb-3 mt-4">⚙️ Consejos para el Procesamiento:</h4>
                  <ul style={{ margin: '0', paddingLeft: '20px', color: '#333', lineHeight: '1.8' }}>
                    <li>✓ Verifica siempre las coordenadas GPS haciendo zoom en el mapa antes de confirmar</li>
                    <li>✓ Si faltan mediciones, usa valores aproximados basados en la sensación térmica reportada</li>
                    <li>✓ Los elementos químicos son opcionales pero ayudan para análisis geoquímicos más precisos</li>
                    <li>✓ Revisa los comentarios del usuario para contexto adicional sobre el sitio</li>
                    <li>✓ Puedes eliminar solicitudes erróneas directamente sin procesarlas</li>
                    <li>✓ Todos los puntos agregados (manuales o procesados) aparecerán en el mapa de GeoterRA</li>
                  </ul>
                </div>
              ),
            },
          ]}
        />
        
        <hr className="my-4" />
        
        {requests.length === 0 ? (
          <div className="text-center p-8 md:p-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-2">No hay solicitudes en el sistema</p>
            <p className="text-gray-400 text-sm">
              Cuando los usuarios creen nuevas solicitudes, aparecerán aquí
            </p>
          </div>
        ) : (
          <>
            {isMobile ? (
              <div>
                {dataSource.map((request) => (
                  <MobileRequestCard key={request.key} request={request} />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="p-3 text-left font-semibold">Solicitud</th>
                      <th className="p-3 text-left font-semibold">Solicitante</th>
                      <th className="p-3 text-left font-semibold">Email</th>
                      <th className="p-3 text-left font-semibold">Fecha</th>
                      <th className="p-3 text-left font-semibold">Estado</th>
                      <th className="p-3 text-left font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataSource.map((request) => (
                      <tr key={request.key} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 font-semibold">{request.name}</td>
                        <td className="p-3 text-sm">{request.owner_name}</td>
                        <td className="p-3 text-sm">{request.email}</td>
                        <td className="p-3 text-sm">
                          {new Date(request.created_at).toLocaleDateString('es-ES')}
                        </td>
                        <td className="p-3">
                          <Tag color={
                            request.state === 'Pendiente' ? 'orange' :
                            request.state === 'Analizada' ? 'green' :
                            'red'
                          }>
                            {request.state}
                          </Tag>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="small"
                              type="primary"
                              icon={<CheckOutlined />}
                              onClick={() => handleReviewAccept(request)}
                              disabled={request.state !== 'Pendiente'}
                              title="Revisar y aprobar"
                            >
                              Revisar
                            </Button>
                            <Button
                              size="small"
                              type="primary"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete(request)}
                              title="Eliminar solicitud"
                            >
                              Eliminar
                            </Button>
                            <Button
                              size="small"
                              type="default"
                              icon={<EyeOutlined />}
                              onClick={() => handleViewDetails(request)}
                              title="Ver detalles"
                            >
                              Ver
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        
        <hr className="my-4" />
      </div>

      {/* View Details Modal */}
      <Modal
        title={`Detalles: ${selectedRequest?.name}`}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={isMobile ? '95%' : 700}
        centered
        styles={{
          body: {
            maxHeight: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 100px)',
            overflowY: 'auto'
          }
        }}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase">ID</p>
                <p className="text-lg font-bold">{selectedRequest.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Estado</p>
                <Tag color={selectedRequest.state === 'Pendiente' ? 'orange' : 'green'}>
                  {selectedRequest.state}
                </Tag>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Fecha</p>
                <p className="text-sm">
                  {new Date(selectedRequest.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Región</p>
                <p className="text-sm">{selectedRequest.region_id || 'N/A'}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">👤 Solicitante</h3>
              <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                <p><strong>Nombre:</strong> {selectedRequest.owner_name}</p>
                <p><strong>Email:</strong> {selectedRequest.email}</p>
                <p><strong>Teléfono:</strong> {selectedRequest.owner_contact_number || 'N/A'}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">📍 Ubicación</h3>
              <div className="p-3 bg-green-50 rounded-lg grid grid-cols-2 gap-3">
                <p><strong>Lat:</strong> {selectedRequest.latitude}°</p>
                <p><strong>Lon:</strong> {selectedRequest.longitude}°</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">🌡️ Características</h3>
              <div className="space-y-2">
                <p><strong>Uso actual:</strong> {selectedRequest.current_usage || 'N/A'}</p>
                <p><strong>Sensación térmica:</strong> {selectedRequest.temperature_sensation || 'N/A'}</p>
                <p><strong>Burbujeo:</strong> {selectedRequest.bubbles ? '✅ Sí' : '❌ No'}</p>
                <p><strong>Detalles:</strong> {selectedRequest.details || 'Sin detalles'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Review and Approve Modal */}
      <Modal
        title={`Revisar y Procesar: ${selectedRequest?.name}`}
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          reviewForm.resetFields();
        }}
        footer={[
          <Button 
            key="cancel"
            onClick={() => {
              setReviewModalVisible(false);
              reviewForm.resetFields();
            }}
            disabled={fetchingDetails}
          >
            Cancelar
          </Button>,
          <Button 
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleSubmitApproval}
            disabled={fetchingDetails}
          >
            Procesar Análisis
          </Button>
        ]}
        width={isMobile ? '95%' : 900}
        centered
        styles={{
          body: {
            maxHeight: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 100px)',
            overflowY: 'auto'
          }
        }}
      >
        {fetchingDetails ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spin size="large" />
            <p className="mt-4 text-sm text-gray-600">Cargando detalles de la solicitud...</p>
          </div>
        ) : (
          <Form
            form={reviewForm}
            layout="vertical"
            scrollToFirstError
            disabled={fetchingDetails}
          >
          <Form.Item name="id_soli" hidden>
            <Input />
          </Form.Item>

          {/* Descripción */}
          <Form.Item
            name="description"
            label="📝 Descripción / Observaciones"
          >
            <Input.TextArea rows={3} placeholder="Notas adicionales sobre el análisis..." />
          </Form.Item>

          <hr className="my-4" />
          <h3 className="font-semibold text-base mb-4">📍 Confirmar Ubicación (Haz clic en el mapa)</h3>
          <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-white">
            {confirmedCoordinates ? (
              <div className="bg-green-50 p-3 rounded-lg mb-3 border border-green-200">
                <p className="text-green-700 font-semibold">✅ Ubicación confirmada:</p>
                <p className="text-sm text-green-600">
                  Lat: {confirmedCoordinates.lat.toFixed(6)}° | Lon: {confirmedCoordinates.lng.toFixed(6)}°
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 p-3 rounded-lg mb-3 border border-orange-200">
                <p className="text-orange-700 font-semibold">⚠️ Haz clic en el mapa para confirmar la ubicación</p>
              </div>
            )}
            
            {/* Inline Leaflet Map */}
            <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
              <MapContainer
                center={confirmedCoordinates ? [confirmedCoordinates.lat, confirmedCoordinates.lng] : [parseFloat(selectedRequest?.latitude) || defaultPosition[0], parseFloat(selectedRequest?.longitude) || defaultPosition[1]]}
                zoom={confirmedCoordinates ? 15 : (selectedRequest?.latitude ? 15 : 8)}
                style={{ height: '100%', width: '100%' }}
                key={`inline-map-${selectedRequest?.id_soli}`}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker setLatLng={setConfirmedCoordinates} latLng={confirmedCoordinates || { lat: parseFloat(selectedRequest?.latitude) || 0, lng: parseFloat(selectedRequest?.longitude) || 0 }} />
                <MapResizeHandler />
              </MapContainer>
            </div>

            {/* Coordinate inputs below map */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '12px', color: '#666', minWidth: 50 }}>Latitud:</label>
                <Input
                  placeholder="Lat"
                  value={confirmedCoordinates?.lat?.toFixed(6) || ''}
                  readOnly
                  size="small"
                  style={{ width: 120 }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '12px', color: '#666', minWidth: 60 }}>Longitud:</label>
                <Input
                  placeholder="Lng"
                  value={confirmedCoordinates?.lng?.toFixed(6) || ''}
                  readOnly
                  size="small"
                  style={{ width: 120 }}
                />
              </div>
            </div>
          </div>

          <hr className="my-4" />
          <h3 className="font-semibold text-base mb-4">🌡️ Mediciones de Campo</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="temperature"
              label="Temperatura (°C)"
              rules={[
                { 
                  pattern: /^-?\d+(\.\d{1,2})?$/, 
                  message: 'Ingresa una temperatura válida'
                }
              ]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="25.5" step={0.1} />
            </Form.Item>

            <Form.Item
              name="field_pH"
              label="pH Campo"
              rules={[
                {
                  pattern: /^\d+(\.\d{1,2})?$/,
                  message: 'pH debe estar entre 0 y 14'
                }
              ]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="7.0" step={0.01} min={0} max={14} />
            </Form.Item>

            <Form.Item
              name="field_conductivity"
              label="Conductividad Campo (μS/cm)"
            >
              <InputNumber style={{ width: '100%' }} placeholder="500" step={0.01} />
            </Form.Item>
          </div>

          <hr className="my-4" />
          <h3 className="font-semibold text-base mb-4">🧪 Mediciones de Laboratorio</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="lab_pH"
              label="pH Laboratorio"
              rules={[
                {
                  pattern: /^\d+(\.\d{1,2})?$/,
                  message: 'pH debe estar entre 0 y 14'
                }
              ]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="7.0" step={0.01} min={0} max={14} />
            </Form.Item>

            <Form.Item
              name="lab_conductivity"
              label="Conductividad Lab (μS/cm)"
            >
              <InputNumber style={{ width: '100%' }} placeholder="500" step={0.01} />
            </Form.Item>
          </div>

          <hr className="my-4" />
          <h3 className="font-semibold text-base mb-4">⚗️ Iones y Elementos (mg/L)</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Form.Item name="cl" label="Cl">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="10" />
            </Form.Item>
            <Form.Item name="ca" label="Ca">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="20" />
            </Form.Item>
            <Form.Item name="hco3" label="HCO3">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="30" />
            </Form.Item>
            <Form.Item name="so4" label="SO4">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="40" />
            </Form.Item>
            <Form.Item name="fe" label="Fe">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="0.07" />
            </Form.Item>
            <Form.Item name="si" label="Si">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="50" />
            </Form.Item>
            <Form.Item name="b" label="B">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="1.0" />
            </Form.Item>
            <Form.Item name="li" label="Li">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="1" />
            </Form.Item>
            <Form.Item name="f" label="F">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="0.5" />
            </Form.Item>
            <Form.Item name="na" label="Na">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="60" />
            </Form.Item>
            <Form.Item name="k" label="K">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="70" />
            </Form.Item>
            <Form.Item name="mg" label="Mg">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="80" />
            </Form.Item>
          </div>
        </Form>
        )}
      </Modal>

      {/* Manual Point Form Modal with Embedded Map */}
      <Modal
        title="Agregar Punto Manualmente"
        open={addManualPointModalVisible}
        onOk={() => addPointForm.submit()}
        onCancel={handleAddManualPointModalClose}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={submittingManualPoint}
        width={800}
        style={{ maxHeight: '90vh' }}
        centered
        styles={{
          body: {
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto'
          }
        }}
      >
        <Form
          form={addPointForm}
          layout="vertical"
          onFinish={handleSubmitManualPoint}
        >
          {/* Map Coordinate Picker - Embedded */}
          <Form.Item label="">
            <MapCoordinatePicker
              latLng={selectedCoordinates}
              onCoordinatesChange={(coords) => {
                setSelectedCoordinates(coords);
                addPointForm.setFieldsValue({
                  latitude: coords.lat,
                  longitude: coords.lng,
                });
              }}
              title="Coordenadas GPS"
              mapHeight="350px"
              showApplyButton={false}
              showClearButton={true}
            />
          </Form.Item>

          <Form.Item
            name="latitude"
            hidden
          >
            <InputNumber />
          </Form.Item>

          <Form.Item
            name="longitude"
            hidden
          >
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
              <Input placeholder="Ej: SOLI-1EVB8" />
            </Form.Item>

            <Form.Item
              name="region_id"
              label="Región"
              rules={[{ required: true, message: 'Selecciona una región' }]}
            >
              <Select placeholder="Selecciona una región">
                {regions.map(region => (
                  <Select.Option key={region.id} value={region.id}>
                    {region.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Descripción"
          >
            <Input.TextArea rows={2} placeholder="Descripción del punto" />
          </Form.Item>

          <hr className="my-4" />
          <h3 className="font-semibold text-base mb-4">🌡️ Mediciones de Campo (Opcional)</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="temperature"
              label="Temperatura (°C)"
              rules={[
                { 
                  pattern: /^-?\d+(\.\d{1,2})?$/, 
                  message: 'Ingresa una temperatura válida'
                }
              ]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="25.5" step={0.1} />
            </Form.Item>

            <Form.Item
              name="field_pH"
              label="pH Campo"
              rules={[
                {
                  pattern: /^\d+(\.\d{1,2})?$/,
                  message: 'pH debe estar entre 0 y 14'
                }
              ]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="7.0" step={0.01} min={0} max={14} />
            </Form.Item>

            <Form.Item
              name="field_conductivity"
              label="Conductividad Campo (μS/cm)"
            >
              <InputNumber style={{ width: '100%' }} placeholder="500" step={0.01} />
            </Form.Item>
          </div>

          <hr className="my-4" />
          <h3 className="font-semibold text-base mb-4">🧪 Mediciones de Laboratorio (Opcional)</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="lab_pH"
              label="pH Laboratorio"
              rules={[
                {
                  pattern: /^\d+(\.\d{1,2})?$/,
                  message: 'pH debe estar entre 0 y 14'
                }
              ]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="7.0" step={0.01} min={0} max={14} />
            </Form.Item>

            <Form.Item
              name="lab_conductivity"
              label="Conductividad Lab (μS/cm)"
            >
              <InputNumber style={{ width: '100%' }} placeholder="500" step={0.01} />
            </Form.Item>
          </div>

          <hr className="my-4" />
          <h3 className="font-semibold text-base mb-4">⚗️ Elementos Químicos (Opcional)</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Form.Item name="cl" label="Cl">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="10" />
            </Form.Item>
            <Form.Item name="ca" label="Ca">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="20" />
            </Form.Item>
            <Form.Item name="hco3" label="HCO3">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="30" />
            </Form.Item>
            <Form.Item name="so4" label="SO4">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="40" />
            </Form.Item>
            <Form.Item name="fe" label="Fe">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="0.5" />
            </Form.Item>
            <Form.Item name="si" label="Si">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="50" />
            </Form.Item>
            <Form.Item name="b" label="B">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="1.0" />
            </Form.Item>
            <Form.Item name="li" label="Li">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="1" />
            </Form.Item>
            <Form.Item name="f" label="F">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="0.5" />
            </Form.Item>
            <Form.Item name="na" label="Na">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="60" />
            </Form.Item>
            <Form.Item name="k" label="K">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="70" />
            </Form.Item>
            <Form.Item name="mg" label="Mg">
              <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="80" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <NotImplementedModal 
        isOpen={isNotImplementedOpen} 
        onClose={() => setIsNotImplementedOpen(false)} 
      />
    </>
  );
};

export default RequestsManager;