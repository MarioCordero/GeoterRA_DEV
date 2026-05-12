import dayjs from "dayjs";
import "leaflet/dist/leaflet.css";
import PhoneInput from './PhoneInput';
import { analysisRequestStore } from '../../config/apiConf';
import { useSession } from '../../hooks/useSession';
import MapCoordinatePicker from './MapCoordinatePicker';
import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Input, Radio, DatePicker, Upload, message, Spin } from "antd";

const FORM_CACHE_KEY = "addPointFormCache";

const AddRequest = ({ 
  onRequestAdded,
  isAdmin = false,
  useTokenAuth = false 
}) => {
  const { user, loading: sessionLoading } = useSession();
  const userEmail = user?.email;

  const [visible, setVisible] = useState(false);
  const [latLng, setLatLng] = useState({});
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const locationRequestRef = useRef(null);
  const componentMountedRef = useRef(true);

  useEffect(() => {
    if (visible) {
      const cached = localStorage.getItem(FORM_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.fecha && typeof parsed.fecha === "string") {
          parsed.fecha = dayjs(parsed.fecha);
        }
        form.setFieldsValue(parsed);
        if (parsed.lat && parsed.lng) {
          setLatLng({ lat: parsed.lat, lng: parsed.lng });
        }
      }
    }
  }, [visible, form]);

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

  useEffect(() => {
    if (!visible) {
      if (locationRequestRef.current !== null) {
        console.log('Modal closed - cancelling location request');
        locationRequestRef.current = null;
      }
    }
  }, [visible]);

  const handleOk = async () => {
    try {
      // Verify session before submitting
      if (!userEmail) {
        message.error("Debes estar autenticado para enviar una solicitud");
        return;
      }

      const values = await form.validateFields();
      setLoading(true);

      // Map temperature sensation values
      const temperatureSensationMap = {
        "3": "Cálido",
        "2": "Templado",
        "1": "Frío"
      };

      // Prepare payload for API - using AnalysisRequestDTO structure
      const payload = {
        region: 1, // TODO: Make this selectable - add region selector to form
        email: userEmail,
        owner_contact_number: values.contactNumber,
        owner_name: values.propietario || "",
        temperature_sensation: temperatureSensationMap[values.sensTermica],
        bubbles: values.burbujeo === "1",
        details: values.direccion || "",
        current_usage: values.usoActual || "",
        latitude: latLng.lat || "",
        longitude: latLng.lng || "",
        state: "Registrada"
        // TODO: Photo handling for future implementation
        // photos: [] - Convert images from upload component and upload to separate endpoint
      };

      const result = await analysisRequestStore(payload);
      if (result.ok) {
        setVisible(false);
        form.resetFields();
        localStorage.removeItem(FORM_CACHE_KEY);
        setLatLng({});
        
        if (onRequestAdded) {
          onRequestAdded();
        }
        
        Modal.success({
          title: "¡Solicitud enviada!",
          content: result.data?.message || "Tu solicitud fue enviada correctamente.",
        });
      } else {
        const errorMessage = result.error || "Error al enviar la solicitud";
        
        console.error("❌ API Response Error:", result);
        console.error("❌ Error Message:", errorMessage);
        
        message.error(errorMessage);
      }
    } catch (err) {
      console.error("Request error:", err);
      message.error("Error al enviar la solicitud: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Cancel any ongoing location request
    if (locationRequestRef.current !== null) {
      console.log('Cancelling ongoing location request');
      locationRequestRef.current = null;
    }
    
    // Reset coordinates
    setLatLng({});
    
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
          <Spin size="small" /> Verificando sesión de usuario...
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
          ⚠️ Debes iniciar sesión para agregar una solicitud
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)} disabled={!userEmail}>
        Agregar Solicitud
      </Button>
      
      {/* Main Modal */}
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
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleOk} 
            loading={loading}
            disabled={!userEmail}
          >
            Enviar
          </Button>,
        ]}
      >
        {renderStatusMessage()}
        
        <Form
          layout="vertical"
          form={form}
        >
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
          
          {/* Map Section with Coordinate Picker */}
          <Form.Item label="Lugar en GPS">
            <MapCoordinatePicker
              latLng={latLng} 
              onCoordinatesChange={(coords) => {
                setLatLng(coords);
              }}
              title="Coordenadas GPS"
              mapHeight="300px"
              showApplyButton={false}
              showClearButton={true}
            />
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


export default AddRequest;