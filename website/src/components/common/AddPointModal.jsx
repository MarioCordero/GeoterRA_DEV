import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Input, Radio, DatePicker, Upload, message, Spin } from "antd";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useNavigate } from 'react-router-dom';
import { FullscreenOutlined, EnvironmentOutlined, LoadingOutlined } from "@ant-design/icons";
import "leaflet/dist/leaflet.css";
import dayjs from "dayjs";
import { buildApiUrl } from '../../config/apiConf';
import PhoneInput from './PhoneInput';

const defaultPosition = [9.93333, -84.08333];
const FORM_CACHE_KEY = "addPointFormCache";

// Session token management functions
const getSessionToken = () => {
  const localToken = localStorage.getItem('geoterra_session_token');
  const sessionToken = sessionStorage.getItem('geoterra_session_token');
  const token = localToken || sessionToken;
  return token;
};

const clearSessionToken = () => {
  localStorage.removeItem('geoterra_session_token');
  sessionStorage.removeItem('geoterra_session_token');
};

const setSessionToken = (token) => {
  localStorage.setItem('geoterra_session_token', token);
};

// Build headers for API requests
const buildHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = getSessionToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Session-Token'] = token;
  }
  return headers;
};

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
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const navigate = useNavigate();
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const locationRequestRef = useRef(null);
  const sessionLoadedRef = useRef(false);
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

  const getUserSession = async () => {
    try {
      setSessionLoading(true);
      const token = getSessionToken();
      if (useTokenAuth) {
        if (!token) {
          return null;
        }
      }

      const headers = useTokenAuth ? buildHeaders() : {
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(buildApiUrl("check_session.php"), {
        method: "GET",
        credentials: "include",
        headers,
      });
      
      if (!response.ok) {
        console.error('❌ Session check response not OK:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const apiResponse = await response.json();      
      if (apiResponse.response === 'Ok' && 
          apiResponse.data && 
          apiResponse.data.status === 'logged_in') {
        
        if (isAdmin) {
          const userData = apiResponse.data;
          if (userData.user_type === 'admin' || 
              userData.is_admin === true || 
              userData.admin === true ||
              userData.role === 'admin') {
            return userData.user || userData.email || userData.username;
          } else {
            message.error("No tienes privilegios de administrador");
            navigate('/Logged');
            return null;
          }
        } else {
          // Regular user session
          const userIdentifier = apiResponse.data.user || apiResponse.data.email || apiResponse.data.username;
          return userIdentifier;
        }
      } else {
        if (useTokenAuth) {
          clearSessionToken();
          navigate('/Login');
        }
        return null;
      }
    } catch (error) {
      if (useTokenAuth) {
        clearSessionToken();
        navigate('/Login');
      }
      return null;
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    if (sessionLoadedRef.current || !componentMountedRef.current) {
      return;
    }
    
    const loadUserEmail = async () => {
      if (sessionLoading) {
        return;
      }
      sessionLoadedRef.current = true;
      
      try {
        const email = await getUserSession();
        if (componentMountedRef.current) {
          setUserEmail(email);
        }
      } catch (error) {
        if (componentMountedRef.current) {
          sessionLoadedRef.current = false;
        }
      }
    };
    
    loadUserEmail();
  }, []);
  
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
    if (!visible && !mapFullscreen) {
      if (locationRequestRef.current !== null) {
        console.log('Modal closed - cancelling location request');
        locationRequestRef.current = null;
        setGettingLocation(false);
      }
    }
  }, [visible, mapFullscreen]);

  useEffect(() => {
    componentMountedRef.current = true;
    return () => {
      componentMountedRef.current = false;
      sessionLoadedRef.current = false;
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
      // TODO: REVIEW, SUPPORT MULTIPLE COUNTRY NUMBERS, ONLY WORKS FOR CR FOR NOW
      const phoneDigitsOnly = values.contactNumber.replace(/\D/g, '');
      const phoneNumber = phoneDigitsOnly.length > 8 
        ? phoneDigitsOnly.slice(3) 
        : phoneDigitsOnly;
      formData.append("contactNumber", phoneNumber);
      formData.append("fecha", values.fecha ? dayjs(values.fecha).format("YYYY-MM-DD") : "");
      formData.append("sensTermica", values.sensTermica);
      formData.append("propietario", values.propietario || "");
      formData.append("usoActual", values.usoActual || "");
      formData.append("burbujeo", values.burbujeo);
      formData.append("direccion", values.direccion || "");
      formData.append("lat", latLng.lat || "");
      formData.append("lng", latLng.lng || "");

      // Handle file upload
      if (values.foto && values.foto.length > 0) {
        formData.append("foto", values.foto[0].originFileObj);
      }

      // Build headers for FormData request (don't set Content-Type for FormData)
      const headers = {};
      if (useTokenAuth) {
        const token = getSessionToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          headers['X-Session-Token'] = token;
        }
      }

      const response = await fetch(buildApiUrl("request.inc.php"), {
        method: "POST",
        headers,
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (result.response === "Ok") {
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
          content: result.message || `${isAdmin ? 'La' : 'Tu'} solicitud fue enviada correctamente.`,
        });
      } else {
        const errorMessage = result.message || "Error al enviar la solicitud";
        const errors = result.errors || [];
        
        // Better error logging
        console.error("❌ API Response:", result);
        console.error("❌ Error Message:", errorMessage);
        console.error("❌ Errors Array:", errors);
        
        // Log each error in detail
        if (errors.length > 0) {
          errors.forEach((err, index) => {
            console.error(`Error ${index + 1}:`, err);
            if (typeof err === 'object') {
              console.error(`  - Message: ${err.message}`);
              console.error(`  - Field: ${err.field || 'N/A'}`);
              console.error(`  - Code: ${err.code || 'N/A'}`);
            }
          });
        }
        
        let detailedError = errorMessage;
        if (errors.length > 0) {
          detailedError += "\n\nDetalles:\n" + errors.map(err => 
            typeof err === 'object' ? (err.message || JSON.stringify(err)) : err
          ).join("\n");
        }
        
        message.error(detailedError);
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
    setMapFullscreen(false);
  };

  const toggleMapFullscreen = () => {
    setMapFullscreen(!mapFullscreen);
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
      
      {/* Main Modal */}
      <Modal
        title={`Formulario de solicitud de puntos${isAdmin ? ' (Admin)' : ''}`}
        open={visible && !mapFullscreen}
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
                  onClick={toggleMapFullscreen}
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

      {/* Fullscreen Map Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Seleccionar ubicación en el mapa</span>
            <div>
              {latLng.lat && latLng.lng && (
                <span style={{ fontSize: '12px', color: '#666', marginRight: '16px' }}>
                  Lat: {latLng.lat.toFixed(6)}, Lng: {latLng.lng.toFixed(6)}
                </span>
              )}
            </div>
          </div>
        }
        open={mapFullscreen}
        onCancel={() => setMapFullscreen(false)}
        width="95vw"
        centered
        footer={null} // Remove default footer
        styles={{
          body: { 
            height: '80vh', 
            padding: 0,
            overflow: 'hidden',
            position: 'relative'
          }
        }}
      >
        <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {/* Map Container - Takes remaining space */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <MapContainer 
              center={latLng.lat ? [latLng.lat, latLng.lng] : defaultPosition} 
              zoom={latLng.lat ? 15 : 8}
              style={{ height: "100%", width: "100%" }}
              key={`fullscreen-map-${mapFullscreen}`}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {/* Pass latLng as prop to LocationMarker in fullscreen too */}
              <LocationMarker setLatLng={setLatLng} latLng={latLng} />
              <MapResizeHandler />
            </MapContainer>
            
            {/* Current Location Button in Top Right */}
            <Button
              type="primary"
              icon={gettingLocation ? <LoadingOutlined /> : <EnvironmentOutlined />}
              onClick={() => {
                getCurrentLocation().catch(err => {
                  console.error('Fullscreen location request failed:', err.message);
                });
              }}
              loading={gettingLocation}
              disabled={gettingLocation}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1000,
                backgroundColor: gettingLocation ? '#ffc107' : '#34d399',
                borderColor: gettingLocation ? '#ffc107' : '#34d399',
              }}
              size="small"
            >
              {gettingLocation ? 'Obteniendo...' : 'Mi ubicación'}
            </Button>
          </div>

          {/* Bottom Control Panel - Fixed at bottom */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTop: '1px solid #d9d9d9',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
            zIndex: 999
          }}>
            {/* Coordinate Input Section */}
            <div style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '12px', color: '#666', minWidth: 50 }}>Latitud:</label>
                <Input
                  placeholder="Lat"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  style={{ width: 100 }}
                  size="small"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: '12px', color: '#666', minWidth: 60 }}>Longitud:</label>
                <Input
                  placeholder="Lng"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  style={{ width: 100 }}
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
                Aplicar Coordenadas
              </Button>
            </div>

            {/* Current Coordinates Display */}
            {latLng.lat && latLng.lng && (
              <div style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#52c41a',
                fontWeight: 500,
                padding: '8px',
                backgroundColor: '#f6ffed',
                borderRadius: 4,
                border: '1px solid #b7eb8f'
              }}>
                📍 Ubicación seleccionada: {latLng.lat.toFixed(6)}, {latLng.lng.toFixed(6)}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center'
            }}>
              <Button 
                onClick={() => setMapFullscreen(false)}
                size="large"
                style={{ minWidth: 120 }}
              >
                Cerrar
              </Button>
              <Button 
                type="primary"
                onClick={() => setMapFullscreen(false)}
                disabled={!latLng.lat || !latLng.lng}
                size="large"
                style={{ minWidth: 150 }}
              >
                Confirmar ubicación
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

// Export the utility functions for use in other components if needed
export { getSessionToken, setSessionToken, clearSessionToken, buildHeaders };

export default AddPointModal;