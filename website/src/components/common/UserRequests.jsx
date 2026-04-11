import React, { useState, useEffect } from 'react';
import { Spin, Tag, Button, Modal, message, Form, Input, Select, InputNumber, Checkbox } from 'antd';
import { EyeOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../../colorModule.css';
import '../../fontsModule.css';
import { analysisRequest } from '../../config/apiConf';
import NotImplementedModal from './NotImplementedModal';
import { useSession } from '../../hooks/useSession';

const RequestsTable = ({ isAdmin = false }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [isNotImplementedOpen, setIsNotImplementedOpen] = useState(false);
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useSession();

  const userIsAdmin = user?.is_admin || user?.role === 'admin';

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth <= 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const loadRequests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await fetchRequests();
        setRequests(data);
      } catch (err) {
        setError(err.message || 'Error cargando solicitudes');
      } finally {
        setLoading(false);
      }
    };
    
    loadRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(analysisRequest.index(), {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (res.status === 401 || res.status === 403) {
        return [];
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
        }));
      }
      
      return [];
    } catch (err) {
      console.error('❌ [UserRequests] Error fetching requests:', err);
      throw err;
    }
  };

  const handleCreateRequest = async (formValues) => {
    try {
      setCreatingRequest(true);

      const payload = {
        email: formValues.email,
        owner_name: formValues.owner_name,
        owner_contact_number: formValues.owner_contact_number || null,
        temperature_sensation: formValues.temperature_sensation || null,
        bubbles: formValues.bubbles ? 1 : 0,
        details: formValues.details || null,
        current_usage: formValues.current_usage || null,
        latitude: formValues.latitude ? parseFloat(formValues.latitude) : null,
        longitude: formValues.longitude ? parseFloat(formValues.longitude) : null,
        region_id: formValues.region_id || null,
      };

      // ✅ Use analysisRequest.store() for POST
      const res = await fetch(analysisRequest.store(), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('No autorizado para crear solicitudes');
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.errors?.[0]?.message || `HTTP error! status: ${res.status}`);
      }

      const result = await res.json();

      if (result.data || result.response === 'Ok') {
        message.success('✅ Solicitud creada correctamente');
        form.resetFields();
        setCreateModalVisible(false);
        refreshRequests();
      } else {
        throw new Error(result.errors?.[0]?.message || 'Error al crear solicitud');
      }
    } catch (error) {
      console.error('❌ Error creating request:', error);
      message.error('Error: ' + error.message);
    } finally {
      setCreatingRequest(false);
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      const url = analysisRequest.delete(requestId);
      
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('No autorizado para eliminar esta solicitud');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.data || result.response === "Ok") {
        message.success('Solicitud eliminada correctamente');
        refreshRequests();
        return true;
      }
      throw new Error(result.message || "Failed to delete request");
    } catch (error) {
      console.error("❌ Error deleting request:", error);
      message.error('Error al eliminar la solicitud: ' + error.message);
      throw error;
    }
  };

  const refreshRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRequests();
      setRequests(data);
      message.success('Solicitudes actualizadas');
    } catch (err) {
      setError(err.message || 'Error refrescando solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    setViewModalVisible(true);
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

  const dataSource = (requests || []).map((request, index) => ({
    key: request.id_soli || index,
    ...request,
  }));

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
        {request.owner_contact_number && <p>📞 Teléfono: {request.owner_contact_number}</p>}
        {request.current_usage && <p>🏗️ Uso Actual: {request.current_usage}</p>}
        {request.temperature_sensation && (
          <p>🌡️ Sensación Térmica: {
            request.temperature_sensation === 'hot' ? '🔥 Caliente' :
            request.temperature_sensation === 'warm' ? '🌡️ Tibio' : '❄️ Frío'
          }</p>
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 p-6">
        <Spin size="large" />
        <p className="mt-4 text-sm md:text-base">Cargando tus solicitudes...</p>
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
            Mis Solicitudes ({requests.length})
          </h1>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              className="flex-1 md:flex-initial"
            >
              Nueva Solicitud
            </Button>
            <Button 
              type="default"
              onClick={refreshRequests}
              className="flex-1 md:flex-initial"
            >
              🔄 Actualizar
            </Button>
          </div>
        </div>

        <hr className="my-4" />

        {requests.length === 0 ? (
          <div className="text-center p-8 md:p-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-2">
              No tienes solicitudes registradas
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Accede al módulo de "Agregar Punto" para crear tu primera solicitud
            </p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Crear Nueva Solicitud
            </Button>
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
                        <td className="p-3 text-sm">
                          {new Date(request.created_at).toLocaleDateString('es-ES')}
                        </td>
                        <td className="p-3">
                          <Tag color={request.state === 'Pendiente' ? 'orange' : 'green'}>
                            {request.state}
                          </Tag>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
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

      {/* ✅ View Details Modal */}
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
                <p className="text-xs text-gray-500 uppercase">Solicitud ID</p>
                <p className="text-lg font-bold text-gray-800">{selectedRequest.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Estado</p>
                <Tag color={selectedRequest.state === 'Pendiente' ? 'orange' : 'green'}>
                  {selectedRequest.state}
                </Tag>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Fecha de Creación</p>
                <p className="text-sm text-gray-700">
                  {new Date(selectedRequest.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Región</p>
                <p className="text-sm text-gray-700">{selectedRequest.region_id || 'N/A'}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">👤 Información del Solicitante</h3>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Nombre</p>
                  <p className="font-semibold text-gray-800">{selectedRequest.owner_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-700 break-all">{selectedRequest.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-sm text-gray-700">{selectedRequest.owner_contact_number || 'No disponible'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">📍 Ubicación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="text-xs text-gray-500">Latitud</p>
                  <p className="font-semibold text-gray-800">{selectedRequest.latitude}°</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Longitud</p>
                  <p className="font-semibold text-gray-800">{selectedRequest.longitude}°</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">🌡️ Características de la Manifestación</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-xs text-gray-500">Uso Actual</p>
                  <p className="font-semibold text-orange-700">{selectedRequest.current_usage || 'No especificado'}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-gray-500">Sensación Térmica</p>
                  <p className="font-semibold text-red-700">
                    {selectedRequest.temperature_sensation === 'hot' ? '🔥 Caliente' :
                    selectedRequest.temperature_sensation === 'warm' ? '🌡️ Tibio' : '❄️ Frío'}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-500">Burbujeo Visible</p>
                  <p className="font-semibold text-purple-700">
                    {selectedRequest.bubbles ? '✅ Sí' : '❌ No'}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Detalles Adicionales</p>
                  <p className="text-sm text-gray-700">{selectedRequest.details || 'Sin detalles adicionales'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ✅ Create New Request Modal */}
      <Modal
        title="➕ Crear Nueva Solicitud de Análisis"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button 
            key="cancel"
            onClick={() => {
              setCreateModalVisible(false);
              form.resetFields();
            }}
          >
            Cancelar
          </Button>,
          <Button 
            key="submit"
            type="primary"
            loading={creatingRequest}
            onClick={() => form.submit()}
          >
            Crear Solicitud
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateRequest}
          className="mt-4"
        >
          {/* Email required */}
          <Form.Item
            name="email"
            label="📧 Email"
            rules={[
              { required: true, message: 'El email es requerido' },
              { type: 'email', message: 'Ingresa un email válido' }
            ]}
          >
            <Input placeholder="correo@ejemplo.com" />
          </Form.Item>

          {/* Owner name required */}
          <Form.Item
            name="owner_name"
            label="👤 Nombre del Solicitante"
            rules={[{ required: true, message: 'El nombre es requerido' }]}
          >
            <Input placeholder="Ej: Juan Pérez" />
          </Form.Item>

          {/* Phone optional */}
          <Form.Item
            name="owner_contact_number"
            label="📞 Teléfono"
          >
            <Input placeholder="+56912345678" />
          </Form.Item>

          {/* Region optional */}
          <Form.Item
            name="region_id"
            label="🗺️ Región"
          >
            <Select
              placeholder="Selecciona una región"
              options={[
                { value: 1, label: 'Región de Arica y Parinacota' },
                { value: 2, label: 'Región de Tarapacá' },
                { value: 3, label: 'Región de Antofagasta' },
                { value: 4, label: 'Región de Atacama' },
                { value: 5, label: 'Región de Coquimbo' },
                { value: 6, label: 'Región de Valparaíso' },
                { value: 7, label: 'Región del Libertador General Bernardo O\'Higgins' },
                { value: 8, label: 'Región del Maule' },
                { value: 9, label: 'Región de Ñuble' },
                { value: 10, label: 'Región de Los Lagos' },
                { value: 11, label: 'Región de Magallanes' },
              ]}
            />
          </Form.Item>

          {/* Temperature sensation optional */}
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

          {/* Bubbles optional */}
          <Form.Item
            name="bubbles"
            valuePropName="checked"
            label="💧 Burbujeo"
          >
            <Checkbox>Hay burbujeo visible</Checkbox>
          </Form.Item>

          {/* Current usage optional */}
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

          {/* Coordinates optional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="latitude"
              label="📍 Latitud"
              rules={[
                {
                  pattern: /^-?(\d+\.?\d*|\.\d+)$/,
                  message: 'Ingresa una latitud válida (ej: -33.4569)'
                }
              ]}
            >
              <Input placeholder="-33.4569" type="number" step="0.0000001" />
            </Form.Item>

            <Form.Item
              name="longitude"
              label="📍 Longitud"
              rules={[
                {
                  pattern: /^-?(\d+\.?\d*|\.\d+)$/,
                  message: 'Ingresa una longitud válida (ej: -70.6483)'
                }
              ]}
            >
              <Input placeholder="-70.6483" type="number" step="0.0000001" />
            </Form.Item>
          </div>

          {/* Details optional */}
          <Form.Item
            name="details"
            label="📝 Detalles Adicionales"
          >
            <Input.TextArea 
              rows={4}
              placeholder="Describe cualquier información adicional sobre la manifestación geotérmica..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <NotImplementedModal 
        isOpen={isNotImplementedOpen} 
        onClose={() => setIsNotImplementedOpen(false)} 
      />
    </>
  );
};

export default RequestsTable;