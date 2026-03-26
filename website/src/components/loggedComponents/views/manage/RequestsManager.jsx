import '../../../../colorModule.css';
import '../../../../fontsModule.css';
import React, { useState, useEffect } from 'react';
import { useSession } from '../../../../hooks/useSession';
import { analysisRequest } from '../../../../config/apiConf';
import NotImplementedModal from '../../../common/NotImplementedModal';
import { Spin, Tag, Button, Modal, Form, Input, InputNumber, Select, Checkbox, message } from 'antd';
import { EyeOutlined, DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

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
      // API CALL
      const res = await fetch(analysisRequest.adminIndex(), {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('No autorizado para ver todas las solicitudes');
      }
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      
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
      console.error('❌ [AdminRequests] Error fetching all requests:', error);
      throw error;
    }
  };

  const submitApprovedPoint = async (pointData) => {
    try {
      const payload = {
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
        state: 'Analizada',
      };

      // API CALL
      const res = await fetch(analysisRequest.update(pointData.id_soli), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('No autorizado para actualizar solicitudes');
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.errors?.[0]?.message || `HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      if (result.data || result.response === 'Ok') {
        return true;
      }
      throw new Error(result.errors?.[0]?.message || 'Error al actualizar');
    } catch (error) {
      console.error('❌ [AdminRequests] Error submitting approved point:', error);
      throw error;
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      const res = await fetch(analysisRequest.delete(requestId), {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('No autorizado para eliminar solicitudes');
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      if (result.data || result.response === 'Ok') {
        return true;
      }
      throw new Error(result.message || 'Error al eliminar');
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

  // Handle review and accept
  const handleReviewAccept = (record) => {
    setSelectedRequest(record);
    reviewForm.setFieldsValue({
      id_soli: record.id_soli,
      description: record.details || '',
      temperature: record.temperature_sensation === 'hot' ? 40 : record.temperature_sensation === 'warm' ? 25 : 15,
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
    setReviewModalVisible(true);
  };

  // Handle form submission for approved point
  const handleSubmitApproval = async () => {
    try {
      const values = await reviewForm.validateFields();
      
      setSubmitting(true);

      await submitApprovedPoint(values);
      
      message.success('✅ Análisis completado y solicitud actualizada');
      setReviewModalVisible(false);
      reviewForm.resetFields();
      setSelectedRequest(null);
      
      await refreshRequests();
      
    } catch (error) {
      if (error.errorFields) {
        message.error('Por favor complete todos los campos requeridos');
      } else {
        message.error('Error al procesar la solicitud: ' + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle refuse/reject
  const handleRefuse = (record) => {
    Modal.confirm({
      title: '¿Rechazar solicitud?',
      content: `¿Deseas rechazar la solicitud ${record.name}?`,
      okText: 'Sí, rechazar',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await submitApprovedPoint({
            id_soli: record.id_soli,
            state: 'Eliminada',
          });
          message.success('✅ Solicitud rechazada');
          await refreshRequests();
        } catch (error) {
          message.error('Error: ' + error.message);
        }
      },
    });
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
        />
        <Button
          size="small"
          type="primary"
          danger
          icon={<CloseOutlined />}
          onClick={() => handleRefuse(request)}
          disabled={request.state !== 'Pendiente'}
          title="Rechazar solicitud"
        />
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
          type="default"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(request)}
          title="Ver detalles"
        />
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
            🔄 Actualizar
          </Button>
        </div>
        
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
                            />
                            <Button
                              size="small"
                              type="primary"
                              danger
                              icon={<CloseOutlined />}
                              onClick={() => handleRefuse(request)}
                              disabled={request.state !== 'Pendiente'}
                              title="Rechazar solicitud"
                            />
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
                              type="default"
                              icon={<EyeOutlined />}
                              onClick={() => handleViewDetails(request)}
                              title="Ver detalles"
                            />
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
          >
            Cancelar
          </Button>,
          <Button 
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleSubmitApproval}
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
        <Form
          form={reviewForm}
          layout="vertical"
          scrollToFirstError
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
      </Modal>

      <NotImplementedModal 
        isOpen={isNotImplementedOpen} 
        onClose={() => setIsNotImplementedOpen(false)} 
      />
    </>
  );
};

export default RequestsManager;