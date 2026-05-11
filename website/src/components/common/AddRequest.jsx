import dayjs from "dayjs";
import "leaflet/dist/leaflet.css";
import PhoneInput from './PhoneInput';
import { analysisRequestStore } from '../../config/apiConf';
import { useSession } from '../../hooks/useSession';
import MapCoordinatePicker from './MapCoordinatePicker';
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { Modal, Button, Form, Input, Radio, DatePicker, Upload, message, Spin } from "antd";
import { FullscreenOutlined, EnvironmentOutlined, LoadingOutlined } from "@ant-design/icons";

const defaultPosition = [9.93333, -84.08333];
const FORM_CACHE_KEY = "addPointFormCache";

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
  const [gettingLocation, setGettingLocation] = useState(false);
  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const locationRequestRef = useRef(null);
  const componentMountedRef = useRef(true);
  const handleManualCoordinateChange = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setLatLng({ lat, lng });
        message.success('Coordenadas establecidas correctamente');
      } else {
        message.error('Coordenadas inválidas. Lat: -90 a 90, Lng: -180 a 180');
      }
    }
  };

  useEffect(() => {
    if (latLng.lat && latLng.lng) {
      setManualLat(latLng.lat.toFixed(6));
      setManualLng(latLng.lng.toFixed(6));
      
      form.setFieldsValue({ lat: latLng.lat, lng: latLng.lng });
      const current = form.getFieldsValue();
      localStorage.setItem(FORM_CACHE_KEY, JSON.stringify({ ...current, lat: latLng.lat, lng: latLng.lng }));
    }
  }, [latLng, form]);

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
          setManualLat(parsed.lat.toString());
          setManualLng(parsed.lng.toString());
        }
      }
    }
  }, [visible, form]);

  const getCurrentLocation = () => {
    // Prevent duplicate calls
    if (locationRequestRef.current !== null || gettingLocation) {
      return Promise.reject(new Error('Location request already in progress'));
    }

    if (!navigator.geolocation) {
      message.error('La geolocalización no está soportada en este navegador');
      return Promise.reject(new Error('Geolocation not supported'));
    }

    return new Promise((resolve, reject) => {
      const requestId = Date.now(); // Unique ID for this request
      locationRequestRef.current = requestId;
      setGettingLocation(true);
      
      const timeoutId = setTimeout(() => {
        if (locationRequestRef.current === requestId && componentMountedRef.current) {
          locationRequestRef.current = null;
          setGettingLocation(false);
          reject(new Error('Geolocation timeout'));
        }
      }, 15000);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          
          // Check if this request is still valid and component is mounted
          if (locationRequestRef.current !== requestId) {
            return;
          }
          
          if (!componentMountedRef.current) {
            return;
          }
          
          const { latitude, longitude } = position.coords;
          const newLatLng = { lat: latitude, lng: longitude };
          setLatLng(newLatLng);
          
          message.success('Ubicación actual obtenida correctamente');
          setGettingLocation(false);
          locationRequestRef.current = null;
          resolve(newLatLng);
        },
        (error) => {
          clearTimeout(timeoutId);
          
          // Only process error if this request is still valid
          if (locationRequestRef.current !== requestId) {
            return;
          }
          
          if (!componentMountedRef.current) {
            return;
          }
          
          let errorMessage = 'Error al obtener la ubicación';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso de ubicación denegado. Por favor, permite el acceso a la ubicación.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado al obtener la ubicación.';
              break;
            default:
              errorMessage = 'Error desconocido al obtener la ubicación.';
              break;
          }
          
          message.error(errorMessage);
          setGettingLocation(false);
          locationRequestRef.current = null;
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };


  
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
        setGettingLocation(false);
      }
    }
  }, [visible]);

  useEffect(() => {
    componentMountedRef.current = true;
    return () => {
      componentMountedRef.current = false;
      locationRequestRef.current = null;
    };
  }, []);

  const handleValuesChange = (_, allValues) => {
    const cache = { ...allValues };
    if (cache.fecha && typeof cache.fecha !== "string") {
      cache.fecha = cache.fecha.format("YYYY-MM-DD");
    }
    localStorage.setItem(FORM_CACHE_KEY, JSON.stringify(cache));
  };

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
        setManualLat('');
        setManualLng('');
        
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
      setGettingLocation(false);
    }
    
    // Reset coordinates and manual inputs
    setLatLng({});
    setManualLat('');
    setManualLng('');
    
    setVisible(false);
  };

  const handleMapPickerConfirm = (coordinates) => {
    setLatLng(coordinates);
    setMapPickerVisible(false);
    message.success('Coordenadas cargadas desde el mapa');
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
        Agregar punto
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
          onValuesChange={handleValuesChange}
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
          
          {/* Map Section with Manual Coordinate Inputs */}
          <Form.Item label="Lugar en GPS">
            {/* Manual Coordinate Input Section */}
            <div style={{ 
              marginBottom: 12, 
              padding: 12, 
              backgroundColor: '#fafafa', 
              border: '1px solid #d9d9d9', 
              borderRadius: 6 
            }}>
              <div style={{ marginBottom: 8, fontWeight: 500, fontSize: '14px' }}>
                📍 Coordenadas GPS
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ minWidth: 60, fontSize: '12px', color: '#666' }}>Latitud:</label>
                  <Input
                    placeholder="9.933333"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    style={{ width: 120 }}
                    size="small"
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ minWidth: 65, fontSize: '12px', color: '#666' }}>Longitud:</label>
                  <Input
                    placeholder="-84.083333"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    style={{ width: 120 }}
                    size="small"
                  />
                </div>
                <Button 
                  type="primary" 
                  size="small"
                  onClick={handleManualCoordinateChange}
                  disabled={!manualLat || !manualLng}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Aplicar
                </Button>
                <Button 
                  type="default" 
                  size="small"
                  onClick={() => {
                    setLatLng({});
                    setManualLat('');
                    setManualLng('');
                    message.info('Marcador eliminado');
                  }}
                  disabled={!latLng.lat && !latLng.lng}
                  danger
                >
                  Limpiar
                </Button>
              </div>
              {latLng.lat && latLng.lng && (
                <div style={{ 
                  marginTop: 8, 
                  fontSize: '11px', 
                  color: '#52c41a',
                  fontWeight: 500
                }}>
                  ✅ Coordenadas actuales: {latLng.lat.toFixed(6)}, {latLng.lng.toFixed(6)}
                </div>
              )}
            </div>

            {/* Map Section */}
            <div style={{ position: 'relative' }}>
              <div style={{ height: 300, marginBottom: 8, border: '1px solid #d9d9d9', borderRadius: '6px', overflow: 'hidden' }}>
                <MapContainer 
                  center={latLng.lat ? [latLng.lat, latLng.lng] : defaultPosition} 
                  zoom={latLng.lat ? 15 : 8} 
                  style={{ height: "100%", width: "100%" }}
                  key={`map-${visible}`} // Simplified key to avoid constant re-renders
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {/* Pass latLng as prop to LocationMarker */}
                  <LocationMarker setLatLng={setLatLng} latLng={latLng} />
                  <MapResizeHandler />
                </MapContainer>
              </div>
              
              {/* Map Control Buttons */}
              <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <Button
                  type="primary"
                  icon={gettingLocation ? <LoadingOutlined /> : <EnvironmentOutlined />}
                  onClick={() => {
                    getCurrentLocation().catch(err => {
                      console.error('Location request failed:', err.message);
                    });
                  }}
                  loading={gettingLocation}
                  disabled={gettingLocation}
                  style={{
                    backgroundColor: gettingLocation ? '#ffc107' : '#34d399',
                    borderColor: gettingLocation ? '#ffc107' : '#34d399',
                  }}
                  size="small"
                  title={gettingLocation ? "Obteniendo ubicación..." : "Obtener ubicación actual"}
                />
                
                <Button
                  type="primary"
                  icon={<FullscreenOutlined />}
                  onClick={() => setMapPickerVisible(true)}
                  style={{
                    backgroundColor: '#1890ff',
                    borderColor: '#1890ff',
                  }}
                  size="small"
                  title="Pantalla completa"
                />
              </div>
            </div>
            
            {/* Instructions */}
            <div style={{ 
              marginTop: 8, 
              fontSize: '12px', 
              color: '#666',
              fontStyle: 'italic'
            }}>
              💡 Haz clic en el mapa para seleccionar una ubicación, usa tu ubicación actual, o ingresa las coordenadas manualmente.
            </div>
          </Form.Item>
        </Form>
        
        {loading && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Spin />
          </div>
        )}
      </Modal>

      {/* Map Coordinate Picker Modal */}
      <MapCoordinatePicker
        visible={mapPickerVisible}
        latLng={latLng}
        onConfirm={handleMapPickerConfirm}
        onCancel={() => setMapPickerVisible(false)}
        title="Seleccionar ubicación en el mapa"
      />
    </>
  );
};


export default AddRequest;