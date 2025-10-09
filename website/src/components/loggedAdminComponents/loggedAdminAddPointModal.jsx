import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, Radio, DatePicker, Upload, message, Spin } from "antd";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useNavigate } from 'react-router-dom';
import "leaflet/dist/leaflet.css";
import dayjs from "dayjs";
import { buildApiUrl } from '../../config/apiConf';

// Common components
import PhoneInput from '../common/PhoneInput';


const defaultPosition = [9.93333, -84.08333]; // Example: San José, Costa Rica
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

const AddPointModal = ({ onRequestAdded }) => {
  const [visible, setVisible] = useState(false);
  const [latLng, setLatLng] = useState({});
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const navigate = useNavigate();

  // Session token management functions
  const getSessionToken = () => {
    return localStorage.getItem('geoterra_session_token');
  };

  const clearSessionToken = () => {
    localStorage.removeItem('geoterra_session_token');
  };

  const buildHeaders = () => {
    const headers = {};
    const token = getSessionToken();
    if (token) {
      headers['X-Session-Token'] = token;
    }
    return headers;
  };

  // Enhanced function to get user session with token and admin verification
  const getUserSession = async () => {
    try {
      setSessionLoading(true);
      const token = getSessionToken();
      
      // Check if token exists first
      if (!token) {
        console.log("No session token found");
        return null;
      }

      const response = await fetch(buildApiUrl("check_session.php"), {
        method: "GET",
        credentials: "include",
        headers: buildHeaders(), // Include session token
      });
      
      const apiResponse = await response.json();
      // console.log('Full session check response:', apiResponse);
      // console.log('Debug info:', apiResponse.debug);
      
      // Check if the API response is successful AND user is admin
      if (apiResponse.response === 'Ok' && 
          apiResponse.data && 
          apiResponse.data.status === 'logged_in') {
        
        // Verify admin privileges
        const userData = apiResponse.data;
        if (userData.user_type === 'admin' || userData.is_admin === true || userData.admin === true) {
          // console.log('✅ Admin session is active for user:', userData.user);
          return userData.user; // Return the email
        } else {
          console.log("User is not admin, redirecting...");
          message.error("No tienes privilegios de administrador");
          navigate('/Logged'); // Redirect non-admin users
          return null;
        }
      } else {
        console.log('Session is not active');
        clearSessionToken();
        navigate('/Login');
        return null;
      }
    } catch (error) {
      console.log('Session check failed:', error);
      clearSessionToken();
      navigate('/Login');
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
      // console.log("Admin user email loaded:", email);
    };
    
    loadUserEmail();
  }, []);

  // Load cached form data when modal opens
  useEffect(() => {
    if (visible) {
      const cached = localStorage.getItem(FORM_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Fix: Convert fecha to dayjs if it's a string
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
    // Save fecha as string for compatibility
    const cache = { ...allValues };
    if (cache.fecha && typeof cache.fecha !== "string") {
      cache.fecha = cache.fecha.format("YYYY-MM-DD");
    }
    localStorage.setItem(FORM_CACHE_KEY, JSON.stringify(cache));
  };

  const handleOk = async () => {
    try {
      // Verify admin session before submitting
      const currentUserEmail = await getUserSession();
      if (!currentUserEmail) {
        message.error("Sesión expirada o sin privilegios de administrador");
        return;
      }

      const values = await form.validateFields();
      setLoading(true);

      // Prepare form data for API with token
      const formData = new FormData();
      formData.append("pointId", values.pointId);
      formData.append("email", currentUserEmail); // Use the verified admin email
      formData.append("contactNumber", values.contactNumber);
      formData.append("fecha", values.fecha ? dayjs(values.fecha).format("YYYY-MM-DD") : "");
      formData.append("sensTermica", values.sensTermica);
      formData.append("propietario", values.propietario || "");
      formData.append("usoActual", values.usoActual || "");
      formData.append("burbujeo", values.burbujeo);
      formData.append("direccion", values.direccion || "");
      formData.append("lat", latLng.lat || "");
      formData.append("lng", latLng.lng || "");
      
      console.log("Admin email being sent:", currentUserEmail);

      // Handle file upload
      if (values.foto && values.foto.length > 0) {
        formData.append("foto", values.foto[0].originFileObj);
      }

      // Enhanced request with token headers
      const response = await fetch(buildApiUrl("request.inc.php"), {
        method: "POST",
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
          ...buildHeaders(), // Include session token (but not Content-Type)
        },
        body: formData,
        credentials: "include", // Include credentials for session
      });

      const result = await response.json();
      // console.log("API result:", result);

      if (result.response === "Ok") {
        setVisible(false);
        form.resetFields();
        localStorage.removeItem(FORM_CACHE_KEY);
        setLatLng({});
        
        // Call the callback to refresh the requests list
        if (onRequestAdded) {
          onRequestAdded();
        }
        
        Modal.success({
          title: "¡Solicitud enviada!",
          content: result.message || "La solicitud fue enviada correctamente.",
        });
      } else {
        const errorMessage = result.message || "Error al enviar la solicitud";
        const errors = result.errors || [];
        
        // Display detailed error information
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
    // Do not clear cache here, so user can resume later
  };

  // Update lat/lng in form and cache when map is clicked
  useEffect(() => {
    if (latLng.lat && latLng.lng) {
      form.setFieldsValue({ lat: latLng.lat, lng: latLng.lng });
      const current = form.getFieldsValue();
      localStorage.setItem(FORM_CACHE_KEY, JSON.stringify({ ...current, lat: latLng.lat, lng: latLng.lng }));
    }
    // eslint-disable-next-line
  }, [latLng]);

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        Agregar punto
      </Button>
      <Modal
        title="Formulario de solicitud de puntos (Admin)"
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
        {sessionLoading && (
          <div style={{ 
            padding: "10px", 
            backgroundColor: "#e6f7ff", 
            border: "1px solid #91d5ff", 
            borderRadius: "4px", 
            marginBottom: "16px",
            color: "#1890ff",
            textAlign: "center"
          }}>
            <Spin size="small" /> Verificando privilegios de administrador...
          </div>
        )}
        
        {!sessionLoading && !userEmail && (
          <div style={{ 
            padding: "10px", 
            backgroundColor: "#fff2e8", 
            border: "1px solid #ffbb96", 
            borderRadius: "4px", 
            marginBottom: "16px",
            color: "#d46b08"
          }}>
            ⚠️ No se pudo verificar la sesión de administrador
          </div>
        )}

        {!sessionLoading && userEmail && (
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
        )}
        
        <Form
          layout="vertical"
          form={form}
          onValuesChange={handleValuesChange}
        >
          <Form.Item label="Nombre del punto" name="pointId" rules={[{ required: true }]}>
            <Input placeholder="Ingrese el ID del punto" />
          </Form.Item>

          {/* Number of the contact */}
          <PhoneInput form={form} />
          
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