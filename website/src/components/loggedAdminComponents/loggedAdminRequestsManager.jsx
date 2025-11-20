import React, { useState, useEffect } from 'react';
import { Spin, Tag, Button, Modal, Descriptions, Form, Input, InputNumber, message } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import '../../colorModule.css';
import '../../fontsModule.css';
import { buildApiUrl } from '../../config/apiConf';
import NotImplementedModal from '../common/NotImplementedModal';

const AdminRequestsManager = () => {
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

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Session token management functions
  const getSessionToken = () => {
    return localStorage.getItem('geoterra_session_token');
  };

  const buildHeaders = () => {
    const headers = {};
    const token = getSessionToken();
    if (token) {
      headers['X-Session-Token'] = token;
    }
    return headers;
  };

  // Updated function to get user session with token support
  const getUserSession = async () => {
    try {
      const response = await fetch(buildApiUrl("check_session.php"), {
        method: "GET",
        credentials: "include",
        headers: buildHeaders(),
      });
      
      const apiResponse = await response.json();
      
      if (apiResponse.response === 'Ok' && apiResponse.data.status === 'logged_in') {
        if (apiResponse.data.is_admin) {
          return apiResponse.data.user;
        } else {
          console.error("User is not admin");
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error checking session:", error);
      return null;
    }
  };

  // Also update fetchAllRequests to use token headers
  const fetchAllRequests = async () => {
    try {
      const response = await fetch(buildApiUrl("get_all_requests.inc.php"), {
        method: "GET",
        credentials: "include",
        headers: buildHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.response === "Ok") {
        return result.data || [];
      } else {
        throw new Error(result.message || "Failed to fetch requests");
      }
    } catch (error) {
      console.error("Error fetching all requests:", error);
      throw error;
    }
  };

  // Update deleteRequest to use token headers
  const deleteRequest = async (requestId) => {
    try {
      const formData = new FormData();
      formData.append('id_soli', requestId);

      const response = await fetch(buildApiUrl("delete_request.inc.php"), {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: buildHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.response === "Ok") {
        return true;
      } else {
        throw new Error(result.message || "Failed to delete request");
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      throw error;
    }
  };

  // Function to submit approved point to puntos_estudiados table
  const submitApprovedPoint = async (pointData) => {
    try {
      const requiredFields = ['id', 'region', 'coord_x', 'coord_y'];
      for (const field of requiredFields) {
        if (!pointData[field]) {
          throw new Error(`Campo requerido faltante: ${field}`);
        }
      }

      const coordX = parseFloat(pointData.coord_x);
      const coordY = parseFloat(pointData.coord_y);
      
      if (isNaN(coordX) || isNaN(coordY)) {
        throw new Error("Las coordenadas deben ser números válidos");
      }

      const formData = new FormData();
      
      const fieldMapping = {
        'id': String(pointData.id).trim(),
        'region': String(pointData.region).trim(),
        'coord_x': coordX,
        'coord_y': coordY,
        'temp': pointData.temp ? parseFloat(pointData.temp) : null,
        'pH_campo': pointData.pH_campo ? parseFloat(pointData.pH_campo) : null,
        'cond_campo': pointData.cond_campo ? parseFloat(pointData.cond_campo) : null,
        'pH_lab': pointData.pH_lab ? parseFloat(pointData.pH_lab) : null,
        'cond_lab': pointData.cond_lab ? parseFloat(pointData.cond_lab) : null,
        'Cl': pointData.Cl ? parseFloat(pointData.Cl) : null,
        'Ca+': pointData['Ca+'] ? parseFloat(pointData['Ca+']) : null,
        'HCO3': pointData.HCO3 ? parseFloat(pointData.HCO3) : null,
        'SO4': pointData.SO4 ? parseFloat(pointData.SO4) : null,
        'Fe': pointData.Fe ? String(pointData.Fe).trim() : null,
        'Si': pointData.Si ? parseFloat(pointData.Si) : null,
        'B': pointData.B ? String(pointData.B).trim() : null,
        'Li': pointData.Li ? String(pointData.Li).trim() : null,
        'F': pointData.F ? String(pointData.F).trim() : null,
        'Na': pointData.Na ? parseFloat(pointData.Na) : null,
        'K': pointData.K ? parseFloat(pointData.K) : null,
        'MG+': pointData['MG+'] ? parseFloat(pointData['MG+']) : null
      };

      Object.entries(fieldMapping).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'number' && isNaN(value)) {
            console.warn(`Skipping invalid numeric value for ${key}:`, value);
            return;
          }
          formData.append(key, value);
        }
      });

      const response = await fetch(buildApiUrl("add_approved_point.inc.php"), {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: buildHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("HTTP Error Response:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const responseText = await response.text();
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Response text:", responseText);
        throw new Error("Respuesta inválida del servidor");
      }
      
      if (result.response === "Ok") {
        return true;
      } else {
        const errorMessage = result.message || "Failed to add approved point";
        const errors = result.errors || [];
        
        console.error("API Error Details:", { errorMessage, errors });
        
        if (errors.length > 0) {
          throw new Error(`${errorMessage}. Detalles: ${errors.join(", ")}`);
        } else {
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Error submitting approved point:", error);
      throw error;
    }
  };

  // Load all requests on component mount
  useEffect(() => {
    const loadAllRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userEmail = await getUserSession();
        if (!userEmail) {
          setError("Usuario no autenticado");
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
  }, []);

  // Function to refresh requests
  const refreshRequests = async () => {
    try {
      setLoading(true);
      const allRequests = await fetchAllRequests();
      setRequests(allRequests);
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

  // Handle delete
  const handleDelete = (record) => {
    setIsNotImplementedOpen(true);
  };

  // Handle review and accept
  const handleReviewAccept = (record) => {
    setSelectedRequest(record);
    reviewForm.setFieldsValue({
      id: record.id.replace('SOLI-', 'POINT-'),
      region: record.region || '',
      coord_x: record.coord_x || '',
      coord_y: record.coord_y || '',
      temp: record.sens_termica === '3' ? 40 : record.sens_termica === '2' ? 25 : 15,
      pH_campo: record.pH_campo || 7.0,
      cond_campo: record.cond_campo || 500,
      pH_lab: record.pH_campo || 7.0,
      cond_lab: record.cond_campo || 500,
      Cl: 10,
      'Ca+': 20,
      HCO3: 30,
      SO4: 40,
      Fe: '< 0.07',
      Si: 50,
      B: '< 1.0',
      Li: '< 1',
      F: '< 0.5',
      Na: 60,
      K: 70,
      'MG+': 80
    });
    setReviewModalVisible(true);
  };

  // Handle form submission for approved point
  const handleSubmitApproval = async () => {
    try {
      const values = await reviewForm.validateFields();
      
      setSubmitting(true);

      const requiredNumericFields = ['coord_x', 'coord_y', 'temp', 'pH_campo', 'cond_campo', 'pH_lab', 'cond_lab', 'Cl', 'Ca+', 'HCO3', 'SO4', 'Si', 'Na', 'K', 'MG+'];
      
      for (const field of requiredNumericFields) {
        if (!values[field] && values[field] !== 0) {
          throw new Error(`El campo ${field} es requerido`);
        }
      }

      await submitApprovedPoint(values);
      
      const requestId = selectedRequest.key;
      await deleteRequest(requestId);
      
      message.success('Punto aprobado, agregado exitosamente y solicitud eliminada');
      setReviewModalVisible(false);
      reviewForm.resetFields();
      setSelectedRequest(null);
      
      await refreshRequests();
      
    } catch (error) {
      if (error.errorFields) {
        message.error('Por favor complete todos los campos requeridos');
      } else {
        message.error('Error al aprobar el punto: ' + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Format data for the table
  const dataSource = requests.map((request, index) => ({
    key: request.id_soli || index,
    id: `SOLI-${String(request.id_soli).padStart(4, '0')}`,
    fecha: request.fecha ? new Date(request.fecha).toLocaleDateString('es-ES') : 'N/A',
    email: request.email || 'Sin email',
    region: request.region,
    propietario: request.propietario,
    direccion: request.direccion,
    uso_actual: request.uso_actual,
    sens_termica: request.sens_termica,
    burbujeo: request.burbujeo,
    coord_x: request.coord_x,
    coord_y: request.coord_y,
    num_telefono: request.num_telefono,
    pH_campo: request.pH_campo,
    cond_campo: request.cond_campo,
  }));

  // Mobile card component
  const MobileRequestCard = ({ request }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <p className="font-semibold text-sm">{request.id}</p>
        <Tag color="blue">Pendiente Revisión</Tag>
      </div>
      
      <p className="text-xs text-gray-500 mb-3">Fecha: {request.fecha}</p>
      <p className="text-xs text-gray-500 mb-2">Email: {request.email}</p>
      
      {request.region && (
        <div className="mb-2">
          <p className="text-sm"><strong>Región:</strong> {request.region}</p>
        </div>
      )}
      
      {request.propietario && (
        <div className="mb-2">
          <p className="text-sm"><strong>Propietario:</strong> {request.propietario}</p>
        </div>
      )}
      
      {request.direccion && (
        <div className="mb-3">
          <p className="text-sm"><strong>Dirección:</strong> {request.direccion}</p>
        </div>
      )}
      
      <div className="flex gap-2 justify-end">
        <Button
          size="small"
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(request)}
        />
        <Button
          size="small"
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(request)}
        />
        <Button
          size="small"
          type="primary"
          className="bg-green-500 border-green-500"
          onClick={() => handleReviewAccept(request)}
        >
          Revisar
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
        {/* Header Section */}
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
        
        {/* Content Section */}
        {requests.length === 0 ? (
          <div className="text-center p-8 md:p-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-2">No hay solicitudes en el sistema</p>
            <p className="text-gray-400 text-sm">
              Cuando los usuarios creen nuevas solicitudes, aparecerán aquí
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            {isMobile ? (
              <div>
                {dataSource.map((request) => (
                  <MobileRequestCard key={request.key} request={request} />
                ))}
              </div>
            ) : (
              /* Desktop View - Table */
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="p-3 text-left font-semibold">ID del Punto</th>
                      <th className="p-3 text-left font-semibold">Fecha</th>
                      <th className="p-3 text-left font-semibold">Email</th>
                      <th className="p-3 text-left font-semibold">Estado</th>
                      <th className="p-3 text-left font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataSource.map((request) => (
                      <tr key={request.key} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3">{request.id}</td>
                        <td className="p-3">{request.fecha}</td>
                        <td className="p-3 text-sm">{request.email}</td>
                        <td className="p-3">
                          <Tag color="blue">Pendiente</Tag>
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
                            <Button
                              size="small"
                              type="primary"
                              className="bg-green-500 border-green-500"
                              onClick={() => handleReviewAccept(request)}
                              title="Revisar y aprobar"
                            >
                              Revisar
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
        title={`Detalles de la Solicitud ${selectedRequest?.id}`}
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
        width={700}
      >
        {selectedRequest && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="ID Solicitud">{selectedRequest.id}</Descriptions.Item>
            <Descriptions.Item label="Email Usuario">{selectedRequest.email}</Descriptions.Item>
            <Descriptions.Item label="Fecha">{selectedRequest.fecha}</Descriptions.Item>
            <Descriptions.Item label="Región">{selectedRequest.region}</Descriptions.Item>
            <Descriptions.Item label="Propietario">{selectedRequest.propietario}</Descriptions.Item>
            <Descriptions.Item label="Teléfono">{selectedRequest.num_telefono}</Descriptions.Item>
            <Descriptions.Item label="Coordenada X">{selectedRequest.coord_x}</Descriptions.Item>
            <Descriptions.Item label="Coordenada Y">{selectedRequest.coord_y}</Descriptions.Item>
            <Descriptions.Item label="Dirección" span={2}>{selectedRequest.direccion}</Descriptions.Item>
            <Descriptions.Item label="Uso Actual">{selectedRequest.uso_actual}</Descriptions.Item>
            <Descriptions.Item label="Sensación Térmica">
              {selectedRequest.sens_termica === '1' ? 'Frío' : 
               selectedRequest.sens_termica === '2' ? 'Tibio' : 'Caliente'}
            </Descriptions.Item>
            <Descriptions.Item label="Burbujeo">{selectedRequest.burbujeo ? 'Sí' : 'No'}</Descriptions.Item>
            <Descriptions.Item label="pH Campo">{selectedRequest.pH_campo || 'No medido'}</Descriptions.Item>
            <Descriptions.Item label="Conductividad Campo">{selectedRequest.cond_campo || 'No medida'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Review and Accept Modal */}
      <Modal
        title={`Revisar y Aprobar Solicitud ${selectedRequest?.id}`}
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={[
          <Button 
            key="cancel"
            onClick={() => setReviewModalVisible(false)}
          >
            Cancelar
          </Button>,
          <Button 
            key="approve"
            type="primary"
            onClick={handleSubmitApproval}
            loading={submitting}
            className="bg-green-500"
          >
            {submitting ? 'Aprobando...' : 'Aprobar y Agregar'}
          </Button>
        ]}
        width={800}
      >
        <Form
          form={reviewForm}
          layout="vertical"
          scrollToFirstError
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="ID del Punto" name="id" rules={[{ required: true, message: 'ID requerido' }]}>
              <Input placeholder="Ej: POINT-0001" />
            </Form.Item>
            <Form.Item label="Región" name="region" rules={[{ required: true, message: 'Región requerida' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Coordenada X (Longitud)" name="coord_x" rules={[{ required: true, message: 'Coordenada X requerida' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="-84.123456" />
            </Form.Item>
            <Form.Item label="Coordenada Y (Latitud)" name="coord_y" rules={[{ required: true, message: 'Coordenada Y requerida' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="9.123456" />
            </Form.Item>
            <Form.Item label="Temperatura (°C)" name="temp" rules={[{ required: true, message: 'Temperatura requerida' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="25.5" />
            </Form.Item>
            <Form.Item label="pH Campo" name="pH_campo" rules={[{ required: true, message: 'pH campo requerido' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="7.0" step={0.1} />
            </Form.Item>
            <Form.Item label="Conductividad Campo" name="cond_campo" rules={[{ required: true, message: 'Conductividad campo requerida' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="500" />
            </Form.Item>
            <Form.Item label="pH Laboratorio" name="pH_lab" rules={[{ required: true, message: 'pH lab requerido' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="7.0" step={0.1} />
            </Form.Item>
            <Form.Item label="Conductividad Lab" name="cond_lab" rules={[{ required: true, message: 'Conductividad lab requerida' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="500" />
            </Form.Item>
            <Form.Item label="Cl (mg/L)" name="Cl" rules={[{ required: true, message: 'Cl requerido' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="10" />
            </Form.Item>
            <Form.Item label="Ca+ (mg/L)" name="Ca+" rules={[{ required: true, message: 'Ca+ requerido' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="20" />
            </Form.Item>
            <Form.Item label="HCO3 (mg/L)" name="HCO3" rules={[{ required: true, message: 'HCO3 requerido' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="30" />
            </Form.Item>
            <Form.Item label="SO4 (mg/L)" name="SO4" rules={[{ required: true, message: 'SO4 requerido' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="40" />
            </Form.Item>
            <Form.Item label="Fe (mg/L)" name="Fe" rules={[{ required: true, message: 'Fe requerido' }]}>
              <Input placeholder="Ej: < 0.07 o 0.05" />
            </Form.Item>
            <Form.Item label="Si (mg/L)" name="Si" rules={[{ required: true, message: 'Si requerido' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="50" />
            </Form.Item>
            <Form.Item label="B (mg/L)" name="B" rules={[{ required: true, message: 'B requerido' }]}>
              <Input placeholder="Ej: < 1.0 o 0.8" />
            </Form.Item>
            <Form.Item label="Li (mg/L)" name="Li" rules={[{ required: true, message: 'Li requerido' }]}>
              <Input placeholder="Ej: < 1 o 0.5" />
            </Form.Item>
            <Form.Item label="F (mg/L)" name="F" rules={[{ required: true, message: 'F requerido' }]}>
              <Input placeholder="Ej: < 0.5 o 0.3" />
            </Form.Item>
            <Form.Item label="Na (mg/L)" name="Na" rules={[{ required: true, message: 'Na requerido' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="60" />
            </Form.Item>
            <Form.Item label="K (mg/L)" name="K" rules={[{ required: true, message: 'K requerido' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="70" />
            </Form.Item>
            <Form.Item label="MG (mg/L)" name="MG+" rules={[{ required: true, message: 'MG requerido' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="80" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* NotImplemented Modal */}
      <NotImplementedModal 
        isOpen={isNotImplementedOpen} 
        onClose={() => setIsNotImplementedOpen(false)} 
      />
    </>
  );
};

export default AdminRequestsManager;