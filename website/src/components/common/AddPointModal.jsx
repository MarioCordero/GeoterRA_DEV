import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, Radio, DatePicker, Upload, message, Spin } from "antd";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useNavigate } from 'react-router-dom';
import "leaflet/dist/leaflet.css";
import dayjs from "dayjs";
import { buildApiUrl } from '../../config/apiConf';
import PhoneInput from './PhoneInput';

const defaultPosition = [9.93333, -84.08333];
const FORM_CACHE_KEY = "addPointFormCache";

function LocationMarker({ setLatLng }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLatLng(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

const AddPointModal = ({ 
  onRequestAdded,
  isAdmin = false,
  useTokenAuth = false 
}) => {
  const [visible, setVisible] = useState(false);
  const [latLng, setLatLng] = useState({});
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const navigate = useNavigate();

  // Session token management functions (only used when useTokenAuth is true)
  const getSessionToken = () => {
    return useTokenAuth ? localStorage.getItem('geoterra_session_token') : null;
  };

  const clearSessionToken = () => {
    if (useTokenAuth) {
      localStorage.removeItem('geoterra_session_token');
    }
  };

  const buildHeaders = () => {
    const headers = {};
    if (useTokenAuth) {
      const token = getSessionToken();
      if (token) {
        headers['X-Session-Token'] = token;
      }
    }
    return headers;
  };

  // Unified session management function
  const getUserSession = async () => {
    try {
      setSessionLoading(true);
      
      // For token-based auth, check token existence first
      if (useTokenAuth) {
        const token = getSessionToken();
        if (!token) {
          console.log("No session token found");
          return null;
        }
      }

      const response = await fetch(buildApiUrl("check_session.php"), {
        method: "GET",
        credentials: "include",
        headers: buildHeaders(),
      });
      
      const apiResponse = await response.json();
      
      if (apiResponse.response === 'Ok' && 
          apiResponse.data && 
          apiResponse.data.status === 'logged_in') {
        
        // If admin privileges are required, verify them
        if (isAdmin) {
          const userData = apiResponse.data;
          if (userData.user_type === 'admin' || userData.is_admin === true || userData.admin === true) {
            return userData.user;
          } else {
            console.log("User is not admin, redirecting...");
            message.error("No tienes privilegios de administrador");
            navigate('/Logged');
            return null;
          }
        } else {
          // Regular user session
          return apiResponse.data.user;
        }
      } else {
        console.log('Session is not active');
        if (useTokenAuth) {
          clearSessionToken();
          navigate('/Login');
        }
        return null;
      }
    } catch (error) {
      console.error("Error checking session:", error);
      if (useTokenAuth) {
        clearSessionToken();
        navigate('/Login');
      }
      return null;
    } finally {
      setSessionLoading(false);
    }
  };

  // Get user email when component mounts
  useEffect(() => {
    const loadUserEmail = async () => {
      const email = await getUserSession();
      setUserEmail(email);
      console.log(`${isAdmin ? 'Admin' : 'User'} email loaded:`, email);
    };
    
    loadUserEmail();
  }, []);

  // Load cached form data when modal opens
  useEffect(() => {
    if (visible) {
      const cached = localStorage.getItem(FORM_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.fecha && typeof parsed.fecha === "string") {
          parsed.fecha = dayjs(parsed.fecha);
        }
        form.setFieldsValue(parsed);
        if (parsed.lat && parsed.lng) setLatLng({ lat: parsed.lat, lng: parsed.lng });
      }
    }
  }, [visible, form]);

  // Save form data to cache on change
  const handleValuesChange = (_, allValues) => {
    const cache = { ...allValues };
    if (cache.fecha && typeof cache.fecha !== "string") {
      cache.fecha = cache.fecha.format("YYYY-MM-DD");
    }
    localStorage.setItem(FORM_CACHE_KEY, JSON.stringify(cache));
  };

  const handleOk = async () => {
    try {
      // Verify session before submitting (especially important for admin)
      const currentUserEmail = isAdmin ? await getUserSession() : userEmail;
      if (!currentUserEmail) {
        const errorMsg = isAdmin 
          ? "Sesión expirada o sin privilegios de administrador"
          : "Debes estar autenticado para enviar una solicitud";
        message.error(errorMsg);
        return;
      }

      const values = await form.validateFields();
      setLoading(true);

      // Prepare form data for API
      const formData = new FormData();
      formData.append("pointId", values.pointId);
      formData.append("email", currentUserEmail);
      formData.append("contactNumber", values.contactNumber);
      formData.append("fecha", values.fecha ? dayjs(values.fecha).format("YYYY-MM-DD") : "");
      formData.append("sensTermica", values.sensTermica);
      formData.append("propietario", values.propietario || "");
      formData.append("usoActual", values.usoActual || "");
      formData.append("burbujeo", values.burbujeo);
      formData.append("direccion", values.direccion || "");
      formData.append("lat", latLng.lat || "");
      formData.append("lng", latLng.lng || "");
      
      console.log(`${isAdmin ? 'Admin' : 'User'} email being sent:`, currentUserEmail);

      // Handle file upload
      if (values.foto && values.foto.length > 0) {
        formData.append("foto", values.foto[0].originFileObj);
      }

      const response = await fetch(buildApiUrl("request.inc.php"), {
        method: "POST",
        headers: buildHeaders(),
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (result.response === "Ok") {
        setVisible(false);
        form.resetFields();
        localStorage.removeItem(FORM_CACHE_KEY);
        setLatLng({});
        
        if (onRequestAdded) {
          onRequestAdded();
        }
        
        Modal.success({
          title: "¡Solicitud enviada!",
          content: result.message || `${isAdmin ? 'La' : 'Tu'} solicitud fue enviada correctamente.`,
        });
      } else {
        const errorMessage = result.message || "Error al enviar la solicitud";
        const errors = result.errors || [];
        
        let detailedError = errorMessage;
        if (errors.length > 0) {
          detailedError += "\n\nDetalles:\n" + errors.map(err => 
            typeof err === 'object' ? err.message : err
          ).join("\n");
        }
        
        message.error(detailedError);
        console.error("API errors:", errors);
      }
    } catch (err) {
      console.error("Request error:", err);
      message.error("Error al enviar la solicitud: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  // Update lat/lng in form and cache when map is clicked
  useEffect(() => {
    if (latLng.lat && latLng.lng) {
      form.setFieldsValue({ lat: latLng.lat, lng: latLng.lng });
      const current = form.getFieldsValue();
      localStorage.setItem(FORM_CACHE_KEY, JSON.stringify({ ...current, lat: latLng.lat, lng: latLng.lng }));
    }
  }, [latLng]);

  // Render status messages
  const renderStatusMessage = () => {
    if (sessionLoading) {
      return (
        <div style={{ 
          padding: "10px", 
          backgroundColor: "#e6f7ff", 
          border: "1px solid #91d5ff", 
          borderRadius: "4px", 
          marginBottom: "16px",
          color: "#1890ff",
          textAlign: "center"
        }}>
          <Spin size="small" /> {isAdmin ? 'Verificando privilegios de administrador...' : 'Verificando sesión de usuario...'}
        </div>
      );
    }

    if (!userEmail) {
      return (
        <div style={{ 
          padding: "10px", 
          backgroundColor: "#fff2e8", 
          border: "1px solid #ffbb96", 
          borderRadius: "4px", 
          marginBottom: "16px",
          color: "#d46b08"
        }}>
          ⚠️ {isAdmin ? 'No se pudo verificar la sesión de administrador' : 'Verificando sesión de usuario...'}
        </div>
      );
    }

    if (isAdmin) {
      return (
        <div style={{ 
          padding: "10px", 
          backgroundColor: "#f6ffed", 
          border: "1px solid #b7eb8f", 
          borderRadius: "4px", 
          marginBottom: "16px",
          color: "#389e0d"
        }}>
          ✅ Sesión de administrador verificada: {userEmail}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        Agregar punto
      </Button>
      <Modal
        title={`Formulario de solicitud de puntos${isAdmin ? ' (Admin)' : ''}`}
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
        confirmLoading={loading}
        footer={[
          <Button key="back" onClick={handleCancel} disabled={loading || sessionLoading}>
            Cancelar
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleOk} 
            loading={loading}
            disabled={!userEmail || sessionLoading}
          >
            Enviar
          </Button>,
        ]}
      >
        {renderStatusMessage()}
        
        <Form
          layout="vertical"
          form={form}
          onValuesChange={handleValuesChange}
        >
          <Form.Item label="Nombre del punto" name="pointId" rules={[{ required: true }]}>
            <Input placeholder="Ingrese el ID del punto" />
          </Form.Item>

          {/* Conditionally use PhoneInput for admin or regular Input for users */}
          <PhoneInput form={form} name="contactNumber" required={true} />
          
          <Form.Item label="Fecha" name="fecha" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Sensación térmica" name="sensTermica" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="3">Caliente</Radio>
              <Radio value="2">Tibio</Radio>
              <Radio value="1">Frio</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Propietario de la zona" name="propietario">
            <Input placeholder="En caso de que sea en propiedad privada" />
          </Form.Item>
          <Form.Item label="Uso actual" name="usoActual">
            <Input placeholder="Uso que se le da a la zona" />
          </Form.Item>
          <Form.Item label="Presenta burbujeo" name="burbujeo" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="1">Sí</Radio>
              <Radio value="0">No</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Indicaciones para llegar al lugar" name="direccion">
            <Input.TextArea placeholder="Como se llega a la zona" />
          </Form.Item>
          <Form.Item label="Subir Foto" name="foto" valuePropName="fileList" getValueFromEvent={e => e && e.fileList}>
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button>Seleccionar archivo</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Lugar en GPS">
            <div style={{ height: 250, marginBottom: 8 }}>
              <MapContainer center={defaultPosition} zoom={8} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker setLatLng={setLatLng} />
              </MapContainer>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Input
                placeholder="Latitud"
                value={latLng.lat || ""}
                readOnly
                style={{ width: "50%" }}
              />
              <Input
                placeholder="Longitud"
                value={latLng.lng || ""}
                readOnly
                style={{ width: "50%" }}
              />
            </div>
          </Form.Item>
        </Form>
        {loading && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Spin />
          </div>
        )}
      </Modal>
    </>
  );
};

export default AddPointModal;