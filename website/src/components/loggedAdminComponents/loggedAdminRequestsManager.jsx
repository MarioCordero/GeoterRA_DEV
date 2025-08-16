import React, { useState, useEffect } from 'react';
import { Table, Typography, Divider, Spin, Alert, Modal, Descriptions, Form, Input, InputNumber, Select, message } from 'antd';
import '../../colorModule.css';
import '../../fontsModule.css';
import { buildApiUrl } from '../../config/apiConf';

const { Title } = Typography;
const { Option } = Select;

const AdminRequestsManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Function to get user session and verify admin role
  const getUserSession = async () => {
    try {
      const response = await fetch(buildApiUrl("check_session.php"), {
        method: "GET",
        credentials: "include",
      });
      const apiResponse = await response.json();
      
      // Debug: Log the full response to see the structure
      console.log("Admin Session API Response:", apiResponse);
      
      // Check for regular user session
      if (apiResponse.response === 'Ok' && apiResponse.data.status === 'logged_in') {
        return apiResponse.data.user;
      }
      
      // Check for admin session
      if (apiResponse.response === 'Ok' && apiResponse.data.status === 'admin_logged_in') {
        return apiResponse.data.admin || apiResponse.data.user;
      }
      
      return null;
    } catch (error) {
      console.error("Error checking session:", error);
      return null;
    }
  };

  // Function to fetch ALL requests (admin only)
  const fetchAllRequests = async () => {
    try {
      const response = await fetch(buildApiUrl("get_all_requests.inc.php"), {
        method: "GET",
        credentials: "include",
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

    const deleteRequest = async (requestId) => {
    try {
      const formData = new FormData();
      formData.append('id_soli', requestId);

      const response = await fetch(buildApiUrl("delete_request.inc.php"), {
        method: "POST",
        body: formData,
        credentials: "include",
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
      console.log("Submitting point data:", pointData); // Debug log
      
      // Validate required fields before sending
      const requiredFields = ['id', 'region', 'coord_x', 'coord_y'];
      for (const field of requiredFields) {
        if (!pointData[field]) {
          throw new Error(`Campo requerido faltante: ${field}`);
        }
      }

      // Clean and validate coordinates
      const coordX = parseFloat(pointData.coord_x);
      const coordY = parseFloat(pointData.coord_y);
      
      if (isNaN(coordX) || isNaN(coordY)) {
        throw new Error("Las coordenadas deben ser números válidos");
      }

      const formData = new FormData();
      
      // Map form fields to expected API fields with proper validation
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

      // Append all fields to FormData, only if they have valid values
      Object.entries(fieldMapping).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // For numeric fields, ensure they're valid numbers
          if (typeof value === 'number' && isNaN(value)) {
            console.warn(`Skipping invalid numeric value for ${key}:`, value);
            return;
          }
          formData.append(key, value);
        }
      });

      console.log("FormData entries:"); // Debug log
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value} (${typeof value})`);
      }

      const response = await fetch(buildApiUrl("add_approved_point.inc.php"), {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error("HTTP Error Response:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const responseText = await response.text();
      console.log("Raw API Response:", responseText); // Debug log
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Response text:", responseText);
        throw new Error("Respuesta inválida del servidor");
      }
      
      console.log("Parsed API Response:", result); // Debug log
      
      if (result.response === "Ok") {
        return true;
      } else {
        // Provide more detailed error information
        const errorMessage = result.message || "Failed to add approved point";
        const errors = result.errors || [];
        const debug = result.debug || {};
        
        console.error("API Error Details:", { errorMessage, errors, debug });
        
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

  // Handle review and accept
  const handleReviewAccept = (record) => {
    setSelectedRequest(record);
    // Pre-fill form with available data from the request
    reviewForm.setFieldsValue({
      id: record.id.replace('SOLI-', 'POINT-'), // Convert SOLI-0001 to POINT-0001
      region: record.region || '',
      coord_x: record.coord_x || '',
      coord_y: record.coord_y || '',
      temp: record.sens_termica === '3' ? 40 : record.sens_termica === '2' ? 25 : 15, // Estimate based on thermal sensation
      pH_campo: record.pH_campo || 7.0,
      cond_campo: record.cond_campo || 500,
      pH_lab: record.pH_campo || 7.0, // Use field pH as initial value
      cond_lab: record.cond_campo || 500, // Use field conductivity as initial value
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
      console.log("Form values before submission:", values); // Debug log
      
      setSubmitting(true);

      // Validate required numeric fields
      const requiredNumericFields = ['coord_x', 'coord_y', 'temp', 'pH_campo', 'cond_campo', 'pH_lab', 'cond_lab', 'Cl', 'Ca+', 'HCO3', 'SO4', 'Si', 'Na', 'K', 'MG+'];
      
      for (const field of requiredNumericFields) {
        if (!values[field] && values[field] !== 0) {
          throw new Error(`El campo ${field} es requerido`);
        }
      }

      // First, submit the approved point
      await submitApprovedPoint(values);
      
      // If successful, delete the request from solicitudes table
      const requestId = selectedRequest.key; // This should be the id_soli
      await deleteRequest(requestId);
      
      message.success('Punto aprobado, agregado exitosamente y solicitud eliminada');
      setReviewModalVisible(false);
      reviewForm.resetFields();
      setSelectedRequest(null);
      
      // Refresh the requests list
      await refreshRequests();
      
    } catch (error) {
      console.error("Error in handleSubmitApproval:", error); // Debug log
      
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

  // Table columns for admin view
  const columns = [
    {
      title: 'ID del punto',
      dataIndex: 'id',
      key: 'id',
      width: '40%',
    },
    {
      title: 'Fecha solicitud',
      dataIndex: 'fecha',
      key: 'fecha',
      width: '30%',
    },
    {
      title: 'Opciones',
      key: 'opciones',
      width: '30%',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button 
            style={{
              padding: '6px 12px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            onClick={() => handleViewDetails(record)}
          >
            Ver
          </button>
          <button 
            style={{
              padding: '6px 12px',
              backgroundColor: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            onClick={() => handleReviewAccept(record)}
          >
            Revisar y Aceptar
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Cargando todas las solicitudes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <button 
              onClick={refreshRequests}
              style={{
                padding: '4px 8px',
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reintentar
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          Gestión de Solicitudes ({requests.length})
        </Title>
        <button 
          onClick={refreshRequests}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Actualizar
        </button>
      </div>
      
      <Divider />
      
      {requests.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#666'
        }}>
          <p style={{ fontSize: '16px' }}>No hay solicitudes en el sistema</p>
        </div>
      ) : (
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} solicitudes`,
          }}
          bordered
          scroll={{ x: 1400 }}
          style={{ marginTop: '16px' }}
          size="small"
        />
      )}
      
      {/* View Details Modal */}
      <Modal
        title={`Detalles de la Solicitud ${selectedRequest?.id}`}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <button 
            key="close"
            onClick={() => setViewModalVisible(false)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#d9d9d9',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
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
          <button 
            key="cancel"
            onClick={() => setReviewModalVisible(false)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#d9d9d9',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '8px'
            }}
          >
            Cancelar
          </button>,
          <button 
            key="approve"
            onClick={handleSubmitApproval}
            disabled={submitting}
            style={{
              padding: '8px 16px',
              backgroundColor: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1
            }}
          >
            {submitting ? 'Aprobando...' : 'Aprobar y Agregar'}
          </button>
        ]}
        width={800}
      >
        <Form
          form={reviewForm}
          layout="vertical"
          scrollToFirstError
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
      
      <Divider />
    </div>
  );
};

export default AdminRequestsManager;