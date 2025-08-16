import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, Radio, DatePicker, Upload, message, Spin } from "antd";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import dayjs from "dayjs";
import { buildApiUrl } from '../../config/apiConf';

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

  // Function to get user session and email
  const getUserSession = async () => {
    try {
      const response = await fetch(buildApiUrl("check_session.php"), {
        method: "GET",
        credentials: "include",
      });
      const apiResponse = await response.json();
      
      if (apiResponse.response === 'Ok' && apiResponse.data.status === 'logged_in') {
        return apiResponse.data.user; // This should be the email
      }
      return null;
    } catch (error) {
      console.error("Error checking session:", error);
      return null;
    }
  };

  // Get user email when component mounts
  useEffect(() => {
    const loadUserEmail = async () => {
      const email = await getUserSession();
      setUserEmail(email);
      console.log("User email loaded:", email);
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
      // Check if user is logged in
      if (!userEmail) {
        message.error("Debes estar autenticado para enviar una solicitud");
        return;
      }

      const values = await form.validateFields();
      setLoading(true);

      // Prepare form data for API
      const formData = new FormData();
      formData.append("pointId", values.pointId);
      formData.append("email", userEmail); // Use the email from session
      formData.append("contactNumber", values.contactNumber);
      formData.append("fecha", values.fecha ? dayjs(values.fecha).format("YYYY-MM-DD") : "");
      formData.append("sensTermica", values.sensTermica);
      formData.append("propietario", values.propietario || "");
      formData.append("usoActual", values.usoActual || "");
      formData.append("burbujeo", values.burbujeo);
      formData.append("direccion", values.direccion || "");
      formData.append("lat", latLng.lat || "");
      formData.append("lng", latLng.lng || "");
      
      console.log("Email being sent:", userEmail);

      // Handle file upload
      if (values.foto && values.foto.length > 0) {
        formData.append("foto", values.foto[0].originFileObj);
      }

      const response = await fetch(buildApiUrl("request.inc.php"), {
        method: "POST",
        body: formData,
        credentials: "include", // Include credentials for session
      });

      const result = await response.json();
      console.log("API result:", result);

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
          content: result.message || "Tu solicitud fue enviada correctamente.",
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
        title="Formulario de solicitud de puntos"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
        confirmLoading={loading}
        footer={[
          <Button key="back" onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk} loading={loading}>
            Enviar
          </Button>,
        ]}
      >
        {!userEmail && (
          <div style={{ 
            padding: "10px", 
            backgroundColor: "#fff2e8", 
            border: "1px solid #ffbb96", 
            borderRadius: "4px", 
            marginBottom: "16px",
            color: "#d46b08"
          }}>
            ⚠️ Verificando sesión de usuario...
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
          <Form.Item label="Número de contacto" name="contactNumber" rules={[{ required: true }]}>
            <Input placeholder="Ingrese un número de contacto" />
          </Form.Item>
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