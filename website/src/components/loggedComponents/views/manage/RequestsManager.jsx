import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from '../../../../hooks/useSession';
import MapCoordinatePicker from '../../../common/MapCoordinatePicker';
import NotImplementedModal from '../../../common/NotImplementedModal';
import {
  EyeOutlined,
  DeleteOutlined,
  CheckOutlined,
  EnvironmentOutlined,
  SyncOutlined,
  EditOutlined,
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  InfoCircleOutlined,
  ExperimentOutlined,
  BulbOutlined,
  FilterOutlined,
  CompassOutlined,
  QuestionCircleOutlined,
  ClearOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import {
  Spin,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Tooltip,
  Badge,
  Space,
  Popconfirm,
  Empty,
} from 'antd';
import {
  analysisRequestAdminIndex,
  analysisRequestAdminUpdate,
  analysisRequestAdminDelete,
  analysisRequestAdminShow,
  analysisRequestAdminAddState,
  geomanifestationsAdminStore,
  provincesIndex,
} from '../../../../config/apiConf';
import { renderDateWithProse } from '../../../../utils/dateFormatter';

const defaultPosition = [9.93333, -84.08333];

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
  const [changeStateModalVisible, setChangeStateModalVisible] = useState(false);
  const [selectedRequestForState, setSelectedRequestForState] = useState(null);
  const [stateForm] = Form.useForm();
  const [submittingStateChange, setSubmittingStateChange] = useState(false);
  const [guideModalVisible, setGuideModalVisible] = useState(false);

  // Filters state
  const [searchText, setSearchText] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');

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
        throw new Error(result.error || 'No autorizado desde el backend para ver todas las solicitudes');
      }

      const listData = Array.isArray(result.data)
        ? result.data
        : (result.data?.data && Array.isArray(result.data.data) ? result.data.data : []);

      return listData.map((item) => {
        const id = item.request_id || item.id || item.id_soli || '';
        const idStr = String(id);
        const name = item.request_name || item.name || (idStr ? `SOLI-${idStr.slice(-5)}` : 'SOLI-XXXXX');

        let stateValue = 'Pendiente';
        if (typeof item.current_state === 'object' && item.current_state !== null) {
          stateValue = item.current_state.value || item.current_state.state || 'Pendiente';
        } else if (item.current_state) {
          stateValue = item.current_state;
        } else if (item.state) {
          stateValue = item.state;
        }

        const userEmail = item.owner_email || item.email ||
          (item.user_first_name ? `${item.user_first_name} ${item.user_last_name || ''}`.trim() : 'Sin email');

        const lat = item.location?.latitude ?? item.latitude ?? '';
        const lng = item.location?.longitude ?? item.longitude ?? '';

        return {
          id_soli: id,
          request_id: id,
          id: id,
          name: name,
          request_name: name,
          created_at: item.created_at || '',
          email: userEmail,
          owner_email: userEmail,
          region_id: item.province_snit_code || item.region_id || '',
          province_snit_code: item.province_snit_code || '',
          canton_snit_code: item.canton_snit_code || '',
          district_snit_code: item.district_snit_code || '',
          owner_name: item.owner_name || '',
          owner_contact_number: item.owner_phone_number || item.owner_contact_number || '',
          current_usage: item.current_usage || '',
          temperature_sensation: item.temperature_sensation || '',
          bubbles: item.bubbles ? 1 : 0,
          details: item.details || '',
          exact_address: item.exact_address || '',
          latitude: lat,
          longitude: lng,
          state: stateValue,
          current_state: stateValue,
          created_by: item.created_by || item.user_id || '',
        };
      });
    } catch (error) {
      console.error('[AdminRequests] ❌ Error fetching all requests:', error);
      throw error;
    }
  };

  const submitApprovedPoint = async (pointData) => {
    try {
      const requestId = selectedRequest.id_soli || selectedRequest.request_id || selectedRequest.id;
      const gmName = (selectedRequest.name || selectedRequest.request_name || `GM-${requestId}`).trim();
      const pCode = Number(selectedRequest.province_snit_code || selectedRequest.region_id);
      const cCode = Number(selectedRequest.canton_snit_code);
      const dCode = Number(selectedRequest.district_snit_code);

      const manifestationPayload = {
        geomanifestation_name: gmName,
        name: gmName,
        province_snit_code: (!isNaN(pCode) && pCode > 0) ? pCode : 1,
        canton_snit_code: (!isNaN(cCode) && cCode > 0) ? cCode : null,
        district_snit_code: (!isNaN(dCode) && dCode > 0) ? dCode : null,
        latitude: parseFloat(pointData.latitude) || parseFloat(selectedRequest.latitude) || 9.9333,
        longitude: parseFloat(pointData.longitude) || parseFloat(selectedRequest.longitude) || -84.0833,
        description: pointData.description || selectedRequest.details || `Manifestación generada desde la solicitud ${gmName}`,
        request_id: requestId,
        visibility: false,
      };

      const result = await geomanifestationsAdminStore(manifestationPayload);

      if (!result.ok) {
        throw new Error(result.error || 'Error creando manifestación registrada');
      }

      message.success('📍 Punto geotérmico creado como borrador en Geomanifestaciones', 2);

      // Step 2: Update analysis request state to "Analizada"
      const updatePayload = {
        region: selectedRequest.region_id || 1,
        email: selectedRequest.email,
        temperature_sensation: selectedRequest.temperature_sensation,
        latitude: pointData.latitude,
        longitude: pointData.longitude,
        state: 'Analizada',
        owner_name: selectedRequest.owner_name || '',
        owner_contact_number: selectedRequest.owner_contact_number || '',
        bubbles: selectedRequest.bubbles ? 1 : 0,
        details: selectedRequest.details || '',
        current_usage: selectedRequest.current_usage || '',
      };

      const updateResult = await analysisRequestAdminUpdate(selectedRequest.id_soli, updatePayload);

      if (!updateResult.ok) {
        throw new Error(updateResult.error || 'Error actualizando estado de solicitud');
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

        const allowedRoles = ['admin', 'maintenance', 'investigator', 'field_investigator'];
        const canManage = allowedRoles.includes(user?.role) || user?.is_admin;
        if (!canManage) {
          setError('Usuario no autorizado para gestionar solicitudes');
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

  // Handle open state change modal
  const handleOpenChangeStateModal = (request) => {
    setSelectedRequestForState(request);
    stateForm.setFieldsValue({
      state: request.state || 'Pendiente',
      description: '',
    });
    setChangeStateModalVisible(true);
  };

  // Handle submitting state change (POST /admin/analysis-requests/{id}/states)
  const handleSubmitStateChange = async (values) => {
    try {
      if (!selectedRequestForState) return;
      setSubmittingStateChange(true);

      const requestId = selectedRequestForState.id_soli || selectedRequestForState.request_id || selectedRequestForState.id;
      const payload = {
        state: values.state,
        description: values.description || 'Cambio de estado por administración',
      };

      const result = await analysisRequestAdminAddState(requestId, payload);

      if (!result.ok) {
        throw new Error(result.error || 'Error al actualizar el estado de la solicitud');
      }

      message.success(`Estado actualizado a "${values.state}" correctamente`);
      setChangeStateModalVisible(false);
      setSelectedRequestForState(null);
      stateForm.resetFields();
      await refreshRequests();
    } catch (err) {
      console.error('❌ Error updating request state:', err);
      message.error(err.message || 'Error al cambiar estado');
    } finally {
      setSubmittingStateChange(false);
    }
  };

  // Handle accepting request and converting it to a blank geomanifestation draft
  const handleAcceptRequest = (request) => {
    Modal.confirm({
      title: (
        <span className="poppins-bold text-lg text-geoterra-blue flex items-center gap-2">
          ¿Aceptar Solicitud y Crear Geomanifestación?
        </span>
      ),
      content: (
        <div className="space-y-3 py-2 poppins">
          <p className="text-sm text-gray-700 m-0">
            ¿Deseas aceptar la solicitud <strong className="text-geoterra-blue">"{request.name}"</strong>?
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 space-y-1">
            <p className="font-semibold m-0">✨ Efecto automático en el sistema:</p>
            <p className="m-0">
              Se creará automáticamente una geomanifestación en <strong>borrador (oculta)</strong> con las coordenadas reportadas.
              Estará disponible de inmediato en la sección <strong>"Borradores de Geomanifestaciones"</strong> para que el equipo científico pueda asignar pruebas in-situ o de laboratorio.
            </p>
          </div>
        </div>
      ),
      okText: 'Sí, Aceptar y Crear Borrador',
      cancelText: 'Cancelar',
      okButtonProps: {
        style: { backgroundColor: '#12467E', borderColor: '#12467E' },
        className: 'poppins-bold',
      },
      cancelButtonProps: { className: 'poppins' },
      centered: true,
      onOk: async () => {
        try {
          const requestId = request.id_soli || request.request_id || request.id;
          const gmName = (request.name || request.request_name || `GM-${requestId}`).trim();
          const pCode = Number(request.province_snit_code || request.region_id);
          const cCode = Number(request.canton_snit_code);
          const dCode = Number(request.district_snit_code);

          const manifestationPayload = {
            geomanifestation_name: gmName,
            name: gmName,
            latitude: parseFloat(request.latitude) || 9.9333,
            longitude: parseFloat(request.longitude) || -84.0833,
            province_snit_code: (!isNaN(pCode) && pCode > 0) ? pCode : 1,
            canton_snit_code: (!isNaN(cCode) && cCode > 0) ? cCode : null,
            district_snit_code: (!isNaN(dCode) && dCode > 0) ? dCode : null,
            description: request.details || request.description || `Manifestación generada desde la solicitud ${gmName}`,
            request_id: requestId,
            visibility: false,
          };

          const storeRes = await geomanifestationsAdminStore(manifestationPayload);
          if (!storeRes.ok) {
            throw new Error(storeRes.error || 'Error al crear la geomanifestación');
          }

          await analysisRequestAdminAddState(requestId, {
            state: 'Procesada',
            description: 'Solicitud aceptada y convertida en geomanifestación (borrador)',
          });

          message.success('Solicitud aceptada. Se creó la geomanifestación en Geomanifestaciones.');
          await refreshRequests();
        } catch (err) {
          console.error('❌ Error al aceptar solicitud:', err);
          message.error('Error al aceptar solicitud: ' + (err.message || err));
        }
      },
    });
  };

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

      const temperatureValueMap = {
        hot: 40,
        Cálido: 40,
        warm: 25,
        Templado: 25,
        cold: 15,
        Frío: 15,
      };

      const mappedTemperature = temperatureValueMap[requestData.temperature_sensation] || 25;

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
    fetchAndPopulateRequestDetails(record.id_soli);
  };

  // Handle form submission for approved point
  const handleSubmitApproval = async () => {
    try {
      if (!confirmedCoordinates) {
        message.error('Por favor confirma la ubicación en el mapa');
        return;
      }

      const values = await reviewForm.validateFields();

      const approvalData = {
        ...values,
        latitude: confirmedCoordinates.lat,
        longitude: confirmedCoordinates.lng,
      };

      await submitApprovedPoint(approvalData);

      message.success('Solicitud procesada y estado actualizado a "Analizada"', 2);
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
      content: `¿Estás seguro de que deseas eliminar permanentemente la solicitud "${record.name}"? Esta acción no se puede deshacer.`,
      okText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        try {
          await deleteRequest(record.id_soli);
          message.success('Solicitud eliminada');
          await refreshRequests();
        } catch (error) {
          message.error('Error: ' + error.message);
        }
      },
    });
  };

  // Compute metrics and stats
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => (r.state || '').toLowerCase().includes('pend')).length;
    const inReview = requests.filter((r) => (r.state || '').toLowerCase().includes('revis')).length;
    const processed = requests.filter((r) => {
      const s = (r.state || '').toLowerCase();
      return s.includes('proc') || s.includes('analiz') || s.includes('acept');
    }).length;
    return { total, pending, inReview, processed };
  }, [requests]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const q = searchText.trim().toLowerCase();
      const matchesSearch = !q || (
        (r.name && r.name.toLowerCase().includes(q)) ||
        (String(r.id_soli) && String(r.id_soli).toLowerCase().includes(q)) ||
        (r.owner_name && r.owner_name.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.details && r.details.toLowerCase().includes(q))
      );

      let matchesState = true;
      if (stateFilter !== 'ALL') {
        const itemState = (r.state || '').toLowerCase();
        if (stateFilter === 'Pendiente') matchesState = itemState.includes('pend');
        else if (stateFilter === 'Revisión') matchesState = itemState.includes('revis');
        else if (stateFilter === 'Procesada') matchesState = itemState.includes('proc') || itemState.includes('analiz') || itemState.includes('acept');
        else matchesState = itemState === stateFilter.toLowerCase();
      }

      return matchesSearch && matchesState;
    });
  }, [requests, searchText, stateFilter]);

  // State Badge renderer
  const renderStateBadge = (state) => {
    const s = (state || 'Pendiente').toLowerCase();
    if (s.includes('pend')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <ClockCircleOutlined className="text-amber-500" /> Pendiente
        </span>
      );
    }
    if (s.includes('revis')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <SyncOutlined spin className="text-blue-500" /> En Revisión
        </span>
      );
    }
    if (s.includes('proc') || s.includes('analiz') || s.includes('acept')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircleOutlined className="text-emerald-500" /> Procesada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
        {state || 'Sin Estado'}
      </span>
    );
  };

  // Ant Design Table columns
  const tableColumns = [
    {
      title: 'Solicitud / Código',
      key: 'solicitud',
      sorter: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
      render: (_, record) => (
        <div className="space-y-1 poppins">
          <div
            onClick={() => handleViewDetails(record)}
            className="poppins-bold text-sm text-geoterra-blue hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1.5"
          >
            <FileTextOutlined className="text-xs text-geoterra-blue" />
            {record.name}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Tag className="m-0 font-mono text-[11px] bg-gray-100 border-gray-200">
              #{record.id_soli}
            </Tag>
            <span>{renderDateWithProse(record.created_at, { showIcon: false })}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Solicitante / Contacto',
      key: 'solicitante',
      render: (_, record) => (
        <div className="space-y-0.5 text-xs poppins">
          <div className="font-semibold text-gray-800 flex items-center gap-1.5">
            <UserOutlined className="text-gray-400" />
            {record.owner_name || 'No especificado'}
          </div>
          {record.email && (
            <div className="text-gray-500 flex items-center gap-1.5">
              <MailOutlined className="text-gray-400 text-[11px]" />
              {record.email}
            </div>
          )}
          {record.owner_contact_number && (
            <div className="text-gray-500 flex items-center gap-1.5">
              <PhoneOutlined className="text-gray-400 text-[11px]" />
              {record.owner_contact_number}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Ubicación & Características',
      key: 'ubicacion',
      render: (_, record) => (
        <div className="space-y-1.5 text-xs poppins">
          {record.latitude && record.longitude ? (
            <div className="text-gray-700 flex items-center gap-1 font-mono">
              <EnvironmentOutlined className="text-geoterra-blue text-xs" />
              <span>{parseFloat(record.latitude).toFixed(4)}°, {parseFloat(record.longitude).toFixed(4)}°</span>
            </div>
          ) : (
            <span className="text-gray-400 italic">Sin coordenadas GPS</span>
          )}
          <div className="flex flex-wrap gap-1">
            {record.temperature_sensation && (
              <Tag color="volcano" className="text-[11px] m-0 rounded">
                🌡️ {record.temperature_sensation}
              </Tag>
            )}
            {record.bubbles ? (
              <Tag color="blue" className="text-[11px] m-0 rounded">
                🫧 Burbujeo
              </Tag>
            ) : null}
            {record.current_usage && (
              <Tag className="text-[11px] m-0 rounded bg-gray-50 text-gray-600 border-gray-200">
                {record.current_usage}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Estado',
      key: 'estado',
      align: 'center',
      render: (_, record) => renderStateBadge(record.state),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      align: 'right',
      render: (_, record) => {
        const isProcessed = (record.state || '').toLowerCase().includes('proc') ||
          (record.state || '').toLowerCase().includes('analiz') ||
          (record.state || '').toLowerCase().includes('acept');
        return (
          <div className="flex items-center justify-end gap-1.5 flex-wrap poppins">
            {/* Aceptar / Convertir a Geomanifestación */}
            {!isProcessed && (
              <Tooltip title="Aceptar solicitud y convertir en borrador de geomanifestación">
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleAcceptRequest(record)}
                  className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 poppins-bold text-xs"
                >
                  Aceptar
                </Button>
              </Tooltip>
            )}

            {/* Revisar y Analizar (Proceso técnico completo) */}
            <Tooltip title="Revisión técnica detallada y mediciones">
              <Button
                size="small"
                icon={<ExperimentOutlined />}
                onClick={() => handleReviewAccept(record)}
                className="text-gray-700 hover:text-geoterra-blue border-gray-300"
              />
            </Tooltip>

            {/* Cambiar Estado */}
            <Tooltip title="Actualizar estado manualmente">
              <Button
                size="small"
                icon={<SyncOutlined />}
                onClick={() => handleOpenChangeStateModal(record)}
                className="text-gray-700 hover:text-geoterra-blue border-gray-300"
              />
            </Tooltip>

            {/* Ver Detalles */}
            <Tooltip title="Ver ficha completa">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(record)}
                className="text-geoterra-blue border-blue-200 bg-blue-50/50"
              />
            </Tooltip>

            {/* Eliminar */}
            <Popconfirm
              title="¿Eliminar esta solicitud?"
              description={`Se eliminará permanentemente la solicitud "${record.name}".`}
              okText="Eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record)}
            >
              <Tooltip title="Eliminar solicitud">
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  className="border-red-200"
                />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  // Mobile card component
  const MobileRequestCard = ({ request }) => {
    const isProcessed = (request.state || '').toLowerCase().includes('proc') ||
      (request.state || '').toLowerCase().includes('analiz') ||
      (request.state || '').toLowerCase().includes('acept');
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3 space-y-3 poppins transition hover:shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <span
              onClick={() => handleViewDetails(request)}
              className="poppins-bold text-base text-geoterra-blue block hover:underline cursor-pointer"
            >
              {request.name}
            </span>
            <span className="text-xs text-gray-400">
              #{request.id_soli} • {renderDateWithProse(request.created_at, { showIcon: false })}
            </span>
          </div>
          {renderStateBadge(request.state)}
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 space-y-1 border border-gray-100">
          <div className="flex items-center gap-2">
            <UserOutlined className="text-gray-400" />
            <span className="font-semibold text-gray-800">{request.owner_name || 'Sin solicitante'}</span>
          </div>
          {request.email && (
            <div className="flex items-center gap-2 text-gray-500">
              <MailOutlined className="text-gray-400" />
              <span>{request.email}</span>
            </div>
          )}
          {request.latitude && request.longitude && (
            <div className="flex items-center gap-2 text-gray-600 font-mono">
              <EnvironmentOutlined className="text-geoterra-blue" />
              <span>{parseFloat(request.latitude).toFixed(4)}°, {parseFloat(request.longitude).toFixed(4)}°</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {request.temperature_sensation && (
            <Tag color="volcano" className="text-xs">🌡️ {request.temperature_sensation}</Tag>
          )}
          {request.bubbles ? <Tag color="blue" className="text-xs">🫧 Burbujeo</Tag> : null}
          {request.current_usage && (
            <Tag className="text-xs bg-gray-50 text-gray-600">{request.current_usage}</Tag>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 flex-wrap">
          {!isProcessed && (
            <Button
              size="small"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleAcceptRequest(request)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium border-0 poppins-bold"
            >
              Aceptar
            </Button>
          )}
          <Button
            size="small"
            icon={<ExperimentOutlined />}
            onClick={() => handleReviewAccept(request)}
          >
            Revisar
          </Button>
          <Button
            size="small"
            icon={<SyncOutlined />}
            onClick={() => handleOpenChangeStateModal(request)}
          >
            Estado
          </Button>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(request)}
          >
            Ver
          </Button>
          <Popconfirm
            title="¿Eliminar solicitud?"
            onConfirm={() => handleDelete(request)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      </div>
    );
  };

  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-6 poppins">
        <Spin size="large" />
        <p className="mt-4 text-sm font-semibold text-geoterra-blue">Cargando solicitudes de investigación...</p>
      </div>
    );
  }

  if (error && requests.length === 0) {
    return (
      <div className="p-6 poppins max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
          <p className="font-bold text-red-800 text-lg m-0">No se pudieron cargar las solicitudes</p>
          <p className="text-red-600 text-sm m-0">{error}</p>
          <Button
            type="primary"
            onClick={refreshRequests}
            style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
            className="poppins-bold mt-2"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full p-4 md:p-8 space-y-6 poppins">
        {/* ========================================================================= */}
        {/* HEADER SECTION                                                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-bold text-geoterra-orange poppins">
                Administración • Geociencias
              </span>
              <Tag className="rounded-full font-semibold text-[11px] bg-blue-50 text-geoterra-blue border-blue-200">
                {requests.length} Solicitudes
              </Tag>
            </div>
            <h1 className="text-2xl md:text-3xl poppins-bold text-geoterra-blue m-0 flex items-center gap-2.5">
              <FileTextOutlined className="text-geoterra-blue" /> Gestión de Solicitudes
            </h1>
            <p className="text-xs md:text-sm text-gray-500 m-0 mt-1 poppins">
              Monitorea, revisa y aprueba solicitudes de investigación ciudadanas y de campo para su incorporación al inventario geotérmico oficial.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              icon={<QuestionCircleOutlined />}
              onClick={() => setGuideModalVisible(true)}
              className="poppins font-medium border-gray-300 text-gray-700 hover:text-geoterra-blue"
            >
              Guía de Flujo
            </Button>
            <Button
              type="primary"
              icon={<ReloadOutlined spin={loading} />}
              onClick={refreshRequests}
              loading={loading}
              style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
              className="poppins-bold"
            >
              Actualizar
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* METRICS DASHBOARD                                                         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card: Total */}
          <div
            onClick={() => setStateFilter('ALL')}
            className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${stateFilter === 'ALL'
              ? 'border-geoterra-blue shadow-md ring-2 ring-blue-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Recibidas</span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-geoterra-blue flex items-center justify-center text-base">
                <FileTextOutlined />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold poppins text-gray-900">{stats.total}</span>
              <span className="text-xs text-gray-400">solicitudes</span>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <span>Todas las registradas</span>
            </div>
          </div>

          {/* Card: Pendientes */}
          <div
            onClick={() => setStateFilter('Pendiente')}
            className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${stateFilter === 'Pendiente'
              ? 'border-amber-400 shadow-md ring-2 ring-amber-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pendientes</span>
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-base">
                <ClockCircleOutlined />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold poppins text-amber-900">{stats.pending}</span>
              <span className="text-xs text-amber-600">por revisar</span>
            </div>
            <div className="mt-2 text-xs text-amber-700 flex items-center gap-1 font-medium">
              <span>Requieren atención de campo</span>
            </div>
          </div>

          {/* Card: En Revision */}
          <div
            onClick={() => setStateFilter('Revisión')}
            className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${stateFilter === 'Revisión'
              ? 'border-blue-400 shadow-md ring-2 ring-blue-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">En Revisión</span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-base">
                <SyncOutlined />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold poppins text-blue-900">{stats.inReview}</span>
              <span className="text-xs text-blue-600">en análisis</span>
            </div>
            <div className="mt-2 text-xs text-blue-700 flex items-center gap-1 font-medium">
              <span>Evaluación técnica activa</span>
            </div>
          </div>

          {/* Card: Procesadas */}
          <div
            onClick={() => setStateFilter('Procesada')}
            className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${stateFilter === 'Procesada'
              ? 'border-emerald-400 shadow-md ring-2 ring-emerald-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Aceptadas / Procesadas</span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-base">
                <CheckCircleOutlined />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold poppins text-emerald-900">{stats.processed}</span>
              <span className="text-xs text-emerald-600">incorporadas</span>
            </div>
            <div className="mt-2 text-xs text-emerald-700 flex items-center gap-1 font-medium">
              <span>Convertidas a Geomanifestación</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WORKFLOW BANNER HELPER                                                    */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-blue-50/70 via-white to-amber-50/50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-geoterra-blue flex items-center justify-center text-lg flex-shrink-0">
              <CompassOutlined />
            </div>
            <div>
              <h4 className="font-bold text-sm text-geoterra-blue m-0 poppins">Flujo Oficial de Incorporación de Puntos</h4>
              <p className="text-xs text-gray-500 m-0 poppins">
                Acepta solicitudes ciudadanas para crear geomanifestaciones en borrador y vincularlas de inmediato a giras de campo.
              </p>
            </div>
          </div>
          <Button
            size="small"
            icon={<ArrowRightOutlined />}
            onClick={() => setGuideModalVisible(true)}
            className="poppins font-medium text-geoterra-blue border-blue-200 hover:border-geoterra-blue flex-shrink-0"
          >
            Ver Flujo de Trabajo
          </Button>
        </div>

        {/* ========================================================================= */}
        {/* FILTER & SEARCH BAR                                                       */}
        {/* ========================================================================= */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row gap-3 items-center">
              <Input
                placeholder="Buscar por ID, nombre, solicitante o correo..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="w-full sm:max-w-md rounded-lg py-1.5"
              />

              <Select
                value={stateFilter}
                onChange={(val) => setStateFilter(val)}
                className="w-full sm:w-48"
              >
                <Select.Option value="ALL">Todos los Estados</Select.Option>
                <Select.Option value="Pendiente">🟡 Solo Pendientes</Select.Option>
                <Select.Option value="Revisión">🔵 En Revisión</Select.Option>
                <Select.Option value="Procesada">🟢 Aceptadas / Procesadas</Select.Option>
              </Select>

              {(searchText || stateFilter !== 'ALL') && (
                <Button
                  icon={<ClearOutlined />}
                  onClick={() => {
                    setSearchText('');
                    setStateFilter('ALL');
                  }}
                  className="poppins text-xs text-gray-500"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>

            <div className="text-xs text-gray-400 poppins whitespace-nowrap self-end sm:self-center">
              Mostrando <strong className="text-gray-700">{filteredRequests.length}</strong> de <strong className="text-gray-700">{requests.length}</strong> solicitudes
            </div>
          </div>

          {/* ========================================================================= */}
          {/* DATA LIST: TABLE OR MOBILE CARDS                                          */}
          {/* ========================================================================= */}
          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <Empty
                description={
                  <span className="text-gray-500 text-sm poppins">
                    {requests.length === 0
                      ? 'No hay solicitudes registradas en el sistema'
                      : 'No se encontraron solicitudes que coincidan con los filtros aplicados'}
                  </span>
                }
              />
            </div>
          ) : isMobile ? (
            <div>
              {filteredRequests.map((request) => (
                <MobileRequestCard key={request.id_soli || request.key} request={request} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <Table
                dataSource={filteredRequests}
                columns={tableColumns}
                rowKey={(record) => record.id_soli || record.id || record.name}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50'],
                  className: 'poppins py-2',
                }}
                className="poppins"
              />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: VIEW REQUEST DETAILS                                               */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-xl text-geoterra-blue flex items-center gap-2">
              <FileTextOutlined className="text-geoterra-blue" />
              Detalle de Solicitud: {selectedRequest?.name}
            </span>
          </div>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          selectedRequest &&
          !(selectedRequest.state || '').toLowerCase().includes('proc') &&
          !(selectedRequest.state || '').toLowerCase().includes('analiz') &&
          !(selectedRequest.state || '').toLowerCase().includes('acept') && (
            <Button
              key="accept"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                setViewModalVisible(false);
                handleAcceptRequest(selectedRequest);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 poppins-bold border-0"
            >
              Aceptar Solicitud
            </Button>
          ),
          <Button
            key="state"
            icon={<SyncOutlined />}
            onClick={() => {
              setViewModalVisible(false);
              handleOpenChangeStateModal(selectedRequest);
            }}
            className="poppins font-medium"
          >
            Cambiar Estado
          </Button>,
          <Button key="close" onClick={() => setViewModalVisible(false)} className="poppins">
            Cerrar
          </Button>,
        ]}
        width={750}
        centered
        styles={{
          body: {
            maxHeight: 'calc(100vh - 160px)',
            overflowY: 'auto',
            paddingRight: 8,
          },
        }}
      >
        {selectedRequest && (
          <div className="py-2 space-y-4 poppins">
            {/* Header Status Bar */}
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Código</span>
                <p className="text-lg font-bold text-geoterra-blue m-0 font-mono">#{selectedRequest.id_soli}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Fecha de Creación</span>
                <p className="text-sm font-semibold text-gray-800 m-0">
                  {renderDateWithProse(selectedRequest.created_at, { showIcon: false })}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Estado Actual</span>
                <div className="mt-0.5">{renderStateBadge(selectedRequest.state)}</div>
              </div>
            </div>

            {/* Section 1: Solicitante */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
                <UserOutlined className="text-geoterra-blue" /> Información del Solicitante
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase">Nombre</span>
                  <p className="font-semibold text-gray-800 m-0">{selectedRequest.owner_name || 'No proporcionado'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase">Correo Electrónico</span>
                  <p className="text-gray-800 m-0">{selectedRequest.email || 'Sin correo'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase">Teléfono de Contacto</span>
                  <p className="text-gray-800 m-0">{selectedRequest.owner_contact_number || 'No especificado'}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Ubicación */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
                <EnvironmentOutlined className="text-geoterra-blue" /> Ubicación Geográfica
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase">Coordenadas GPS</span>
                  <p className="font-mono text-gray-800 m-0">
                    {selectedRequest.latitude && selectedRequest.longitude
                      ? `${parseFloat(selectedRequest.latitude).toFixed(5)}°, ${parseFloat(selectedRequest.longitude).toFixed(5)}°`
                      : 'No registradas'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase">Dirección Exacta</span>
                  <p className="text-gray-800 m-0">{selectedRequest.exact_address || 'No detallada'}</p>
                </div>
              </div>
            </div>

            {/* Section 3: Características Geotermales */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
                <ExperimentOutlined className="text-geoterra-blue" /> Características de la Manifestación
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase">Sensación Térmica</span>
                  <p className="font-semibold text-gray-800 m-0">{selectedRequest.temperature_sensation || 'Natural'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase">Burbujeo</span>
                  <p className="text-gray-800 m-0">{selectedRequest.bubbles ? '🫧 Sí detectado' : '❌ No presente'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold uppercase">Uso Actual</span>
                  <p className="text-gray-800 m-0">{selectedRequest.current_usage || 'No especificado'}</p>
                </div>
              </div>
              {selectedRequest.details && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-semibold uppercase">Detalles / Notas Adicionales</span>
                  <p className="text-xs text-gray-700 m-0 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {selectedRequest.details}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: REVIEW AND PROCESS (ADVANCED TECHNICAL)                             */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-xl text-geoterra-blue flex items-center gap-2">
              <ExperimentOutlined className="text-geoterra-blue" />
              Revisar y Procesar Análisis Geotérmico: {selectedRequest?.name}
            </span>
          </div>
        }
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
            disabled={fetchingDetails || submitting}
            className="poppins"
          >
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleSubmitApproval}
            disabled={fetchingDetails}
            style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
            className="poppins-bold"
          >
            Procesar y Crear Geomanifestación
          </Button>,
        ]}
        width={850}
        centered
        styles={{
          body: {
            maxHeight: 'calc(100vh - 160px)',
            overflowY: 'auto',
            paddingRight: 8,
          },
        }}
      >
        {fetchingDetails ? (
          <div className="flex flex-col items-center justify-center py-16 poppins">
            <Spin size="large" />
            <p className="mt-4 text-sm font-semibold text-geoterra-blue">Cargando detalles de la solicitud...</p>
          </div>
        ) : (
          <Form
            form={reviewForm}
            layout="vertical"
            scrollToFirstError
            disabled={fetchingDetails}
            className="poppins space-y-4 py-2"
          >
            <Form.Item name="id_soli" hidden>
              <Input />
            </Form.Item>

            {/* Section 1: Ubicación GPS */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
                <EnvironmentOutlined className="text-geoterra-blue" /> 1. Confirmar Coordenadas GPS
              </h3>
              <p className="text-xs text-gray-500 m-0">
                Haz clic en el mapa para confirmar o ajustar la ubicación precisa de la manifestación geotermal reportada.
              </p>
              <Form.Item style={{ marginBottom: 0 }}>
                <MapCoordinatePicker
                  latLng={
                    confirmedCoordinates || {
                      lat: parseFloat(selectedRequest?.latitude) || 9.9333,
                      lng: parseFloat(selectedRequest?.longitude) || -84.0833,
                    }
                  }
                  onCoordinatesChange={(coords) => setConfirmedCoordinates(coords)}
                  title="Coordenadas GPS"
                  mapHeight="320px"
                  showApplyButton={false}
                  showClearButton={false}
                />
              </Form.Item>
            </div>

            {/* Section 2: Mediciones In-Situ */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
                <BulbOutlined className="text-geoterra-blue" /> 2. Mediciones In-Situ de Campo
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Form.Item
                  name="temperature"
                  label={<span className="font-semibold text-gray-700">Temperatura (°C)</span>}
                  rules={[{ pattern: /^-?\d+(\.\d{1,2})?$/, message: 'Ingresa una temperatura válida' }]}
                >
                  <InputNumber style={{ width: '100%' }} placeholder="25.5" step={0.1} className="rounded-lg py-1" />
                </Form.Item>

                <Form.Item
                  name="field_pH"
                  label={<span className="font-semibold text-gray-700">pH Campo</span>}
                  rules={[{ pattern: /^\d+(\.\d{1,2})?$/, message: 'pH debe estar entre 0 y 14' }]}
                >
                  <InputNumber style={{ width: '100%' }} placeholder="7.0" step={0.01} min={0} max={14} className="rounded-lg py-1" />
                </Form.Item>

                <Form.Item
                  name="field_conductivity"
                  label={<span className="font-semibold text-gray-700">Conductividad Campo (μS/cm)</span>}
                >
                  <InputNumber style={{ width: '100%' }} placeholder="500" step={0.01} className="rounded-lg py-1" />
                </Form.Item>
              </div>
            </div>

            {/* Section 3: Mediciones de Laboratorio */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
                <ExperimentOutlined className="text-geoterra-blue" /> 3. Mediciones de Laboratorio
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Form.Item
                  name="lab_pH"
                  label={<span className="font-semibold text-gray-700">pH Laboratorio</span>}
                  rules={[{ pattern: /^\d+(\.\d{1,2})?$/, message: 'pH debe estar entre 0 y 14' }]}
                >
                  <InputNumber style={{ width: '100%' }} placeholder="7.0" step={0.01} min={0} max={14} className="rounded-lg py-1" />
                </Form.Item>

                <Form.Item
                  name="lab_conductivity"
                  label={<span className="font-semibold text-gray-700">Conductividad Lab (μS/cm)</span>}
                >
                  <InputNumber style={{ width: '100%' }} placeholder="500" step={0.01} className="rounded-lg py-1" />
                </Form.Item>
              </div>
            </div>

            {/* Section 4: Iones y Elementos */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
                <ExperimentOutlined className="text-geoterra-blue" /> 4. Iones y Elementos (mg/L)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Form.Item name="cl" label={<span className="font-semibold text-gray-700">Cl</span>}>
                  <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="10" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="ca" label={<span className="font-semibold text-gray-700">Ca</span>}>
                  <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="20" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="hco3" label={<span className="font-semibold text-gray-700">HCO3</span>}>
                  <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="30" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="so4" label={<span className="font-semibold text-gray-700">SO4</span>}>
                  <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="40" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="fe" label={<span className="font-semibold text-gray-700">Fe</span>}>
                  <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="0.07" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="si" label={<span className="font-semibold text-gray-700">Si</span>}>
                  <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="50" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="b" label={<span className="font-semibold text-gray-700">B</span>}>
                  <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="1.0" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="li" label={<span className="font-semibold text-gray-700">Li</span>}>
                  <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="1" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="f" label={<span className="font-semibold text-gray-700">F</span>}>
                  <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="0.5" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="na" label={<span className="font-semibold text-gray-700">Na</span>}>
                  <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="60" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="k" label={<span className="font-semibold text-gray-700">K</span>}>
                  <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="70" className="rounded-lg" />
                </Form.Item>
                <Form.Item name="mg" label={<span className="font-semibold text-gray-700">Mg</span>}>
                  <InputNumber style={{ width: '100%' }} step={0.0001} placeholder="80" className="rounded-lg" />
                </Form.Item>
              </div>
            </div>

            {/* Section 5: Observaciones */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h3 className="text-base font-bold text-geoterra-blue border-b border-gray-100 pb-2.5 flex items-center gap-2 m-0">
                <InfoCircleOutlined className="text-geoterra-blue" /> 5. Observaciones y Diagnóstico
              </h3>
              <Form.Item name="description" style={{ marginBottom: 0 }}>
                <Input.TextArea
                  rows={3}
                  placeholder="Detalles adicionales, contexto del sitio o notas geológicas..."
                  className="rounded-lg"
                />
              </Form.Item>
            </div>
          </Form>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: CHANGE REQUEST STATE                                               */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-xl text-geoterra-blue flex items-center gap-2">
              <SyncOutlined className="text-geoterra-blue" />
              Actualizar Estado: {selectedRequestForState?.name}
            </span>
          </div>
        }
        open={changeStateModalVisible}
        onOk={() => stateForm.submit()}
        onCancel={() => {
          setChangeStateModalVisible(false);
          setSelectedRequestForState(null);
          stateForm.resetFields();
        }}
        okText="Guardar Estado"
        cancelText="Cancelar"
        confirmLoading={submittingStateChange}
        okButtonProps={{
          style: { backgroundColor: '#12467E', borderColor: '#12467E' },
          className: 'poppins-bold',
        }}
        cancelButtonProps={{ className: 'poppins' }}
        centered
      >
        <div className="py-2 poppins">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <Form form={stateForm} layout="vertical" onFinish={handleSubmitStateChange} className="poppins">
              <Form.Item
                name="state"
                label={<span className="font-semibold text-gray-700">Nuevo Estado de la Solicitud</span>}
                rules={[{ required: true, message: 'Selecciona un estado' }]}
              >
                <Select placeholder="Selecciona el estado" className="rounded-lg">
                  <Select.Option value="Pendiente">
                    <Tag color="orange">🟡 Pendiente</Tag>
                  </Select.Option>
                  <Select.Option value="Revisión">
                    <Tag color="blue">🔵 En Revisión</Tag>
                  </Select.Option>
                  <Select.Option value="Procesada">
                    <Tag color="green">🟢 Procesada / Aceptada</Tag>
                  </Select.Option>
                  <Select.Option value="Rechazada">
                    <Tag color="red">🔴 Rechazada</Tag>
                  </Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="font-semibold text-gray-700">Justificación o Notas del Cambio</span>}
                rules={[{ required: true, message: 'Ingresa una descripción o justificación' }]}
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Ej: Aprobada tras verificación preliminar con el equipo técnico de campo"
                  className="rounded-lg"
                />
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: WORKFLOW GUIDE                                                     */}
      {/* ========================================================================= */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-xl text-geoterra-blue flex items-center gap-2">
              <QuestionCircleOutlined className="text-geoterra-blue" />
              Guía Oficial de Gestión de Solicitudes Geotérmicas
            </span>
          </div>
        }
        open={guideModalVisible}
        onCancel={() => setGuideModalVisible(false)}
        footer={[
          <Button
            key="ok"
            type="primary"
            style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
            className="poppins-bold"
            onClick={() => setGuideModalVisible(false)}
          >
            Entendido
          </Button>,
        ]}
        width={750}
        centered
      >
        <div className="py-2 space-y-4 poppins text-sm text-gray-700">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h4 className="font-bold text-geoterra-blue m-0 flex items-center gap-2 text-base">
              🔄 Flujo de Trabajo Recomendado
            </h4>
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-geoterra-blue font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  1
                </span>
                <div>
                  <strong className="text-gray-800 text-sm block">Revisar Solicitud Ciudadana o de Campo</strong>
                  <p className="text-gray-500 m-0">
                    Al recibir una nueva solicitud en estado <em>Pendiente</em>, revisa los datos de contacto, la sensación térmica y las coordenadas reportadas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  2
                </span>
                <div>
                  <strong className="text-gray-800 text-sm block">Aceptar Solicitud</strong>
                  <p className="text-gray-500 m-0">
                    Haz clic en el botón <strong>"Aceptar"</strong>. Esto creará automáticamente una <strong>Geomanifestación en borrador</strong> en el módulo de Geomanifestaciones con la ubicación satelital correspondiente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  3
                </span>
                <div>
                  <strong className="text-gray-800 text-sm block">Inspección Técnica en Gira de Campo</strong>
                  <p className="text-gray-500 m-0">
                    El equipo científico en campo o laboratorio puede vincular el borrador a una gira activa, ingresar pruebas in-situ o análisis de laboratorio y finalmente publicarla en el mapa oficial de GeoterRA.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2 text-xs">
            <h4 className="font-bold text-geoterra-blue m-0 flex items-center gap-2 text-sm">
              💡 Consejos de Buenas Prácticas
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 m-0">
              <li>Usa los filtros superiores para ubicar rápidamente solicitudes pendientes o de un cantón específico.</li>
              <li>Puedes ajustar el estado manualmente en cualquier momento desde el botón de estado rápido.</li>
              <li>Las solicitudes eliminadas no podrán recuperarse.</li>
            </ul>
          </div>
        </div>
      </Modal>

      <NotImplementedModal
        isOpen={isNotImplementedOpen}
        onClose={() => setIsNotImplementedOpen(false)}
      />
    </>
  );
};

export default RequestsManager;