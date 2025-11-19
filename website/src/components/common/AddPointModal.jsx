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
  // Updated to match the actual key used in your app
  const localToken = localStorage.getItem('geoterra_session_token');
  const sessionToken = sessionStorage.getItem('geoterra_session_token');
  const token = localToken || sessionToken;
  
  console.log('🔍 Token search results:', {
    localStorage: localToken,
    sessionStorage: sessionToken,
    finalToken: token
  });
  
  return token;
};

const clearSessionToken = () => {
  localStorage.removeItem('geoterra_session_token');
  sessionStorage.removeItem('geoterra_session_token');
  console.log('🗑️ Session tokens cleared');
};

const setSessionToken = (token) => {
  localStorage.setItem('geoterra_session_token', token);
  console.log('💾 Session token stored:', token);
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

// Component to handle map resize
function MapResizeHandler() {
  const map = useMap();
  
  useEffect(() => {
    // Invalidate map size when component mounts
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
  
  // Use refs to prevent duplicate calls - better implementation
  const locationRequestRef = useRef(null); // Store the actual request ID
  const sessionLoadedRef = useRef(false);
  const componentMountedRef = useRef(true);

  // Improved geolocation function with better cancellation
  const getCurrentLocation = () => {
    // Prevent duplicate calls
    if (locationRequestRef.current !== null || gettingLocation) {
      console.log('Location request already in progress, skipping...');
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
      
      console.log('Starting geolocation request...');
      
      const timeoutId = setTimeout(() => {
        if (locationRequestRef.current === requestId && componentMountedRef.current) {
          console.log('Geolocation timeout reached');
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
            console.log('Geolocation cancelled, ignoring result');
            return;
          }
          
          if (!componentMountedRef.current) {
            console.log('Component unmounted, ignoring geolocation result');
            return;
          }
          
          console.log('Geolocation success:', position);
          
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
            console.log('Geolocation error ignored - request was cancelled');
            return;
          }
          
          if (!componentMountedRef.current) {
            console.log('Component unmounted, ignoring geolocation error');
            return;
          }
          
          console.log('Geolocation error:', error);
          
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

  // Unified session management function
  const getUserSession = async () => {
    try {
      setSessionLoading(true);
      
      const token = getSessionToken();
      console.log('🔑 Token check in getUserSession:', token);
      
      // For token-based auth, check token existence first
      if (useTokenAuth) {
        if (!token) {
          console.log("❌ No session token found");
          return null;
        }
        console.log("✅ Token found for token-based auth:", token);
      }

      // Build headers for the request
      const headers = useTokenAuth ? buildHeaders() : {
        'Content-Type': 'application/json'
      };

      console.log('📤 Making session check request with headers:', headers);

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
      console.log('📥 Session check API response:', apiResponse);
      
      if (apiResponse.response === 'Ok' && 
          apiResponse.data && 
          apiResponse.data.status === 'logged_in') {
        
        console.log('✅ Session is active, checking user data:', apiResponse.data);
        
        // If admin privileges are required, verify them
        if (isAdmin) {
          const userData = apiResponse.data;
          console.log('🔍 Checking admin privileges for user:', userData);
          
          if (userData.user_type === 'admin' || 
              userData.is_admin === true || 
              userData.admin === true ||
              userData.role === 'admin') {
            console.log('✅ Admin privileges confirmed');
            return userData.user || userData.email || userData.username;
          } else {
            console.log("❌ User is not admin, redirecting...");
            message.error("No tienes privilegios de administrador");
            navigate('/Logged');
            return null;
          }
        } else {
          // Regular user session
          const userIdentifier = apiResponse.data.user || apiResponse.data.email || apiResponse.data.username;
          console.log('✅ Regular user session confirmed:', userIdentifier);
          return userIdentifier;
        }
      } else {
        console.log('❌ Session is not active or invalid response:', {
          response: apiResponse.response,
          data: apiResponse.data,
          status: apiResponse.data?.status
        });
        
        if (useTokenAuth) {
          clearSessionToken();
          navigate('/Login');
        }
        return null;
      }
    } catch (error) {
      console.error("❌ Error checking session:", error);
      if (useTokenAuth) {
        clearSessionToken();
        navigate('/Login');
      }
      return null;
    } finally {
      setSessionLoading(false);
    }
  };

  // Get user email when component mounts - prevent duplicate calls with better debugging
  useEffect(() => {
    if (sessionLoadedRef.current || !componentMountedRef.current) {
      console.log('⏭️ Skipping session load:', {
        sessionLoaded: sessionLoadedRef.current,
        componentMounted: componentMountedRef.current
      });
      return;
    }
    
    const loadUserEmail = async () => {
      if (sessionLoading) {
        console.log('⏳ Session already loading, skipping...');
        return;
      }
      
      console.log('🔄 Starting session load...');
      sessionLoadedRef.current = true;
      
      try {
        const email = await getUserSession();
        if (componentMountedRef.current) {
          setUserEmail(email);
          console.log(`✅ ${isAdmin ? 'Admin' : 'User'} email loaded:`, email);
        }
      } catch (error) {
        console.error('❌ Error loading user session:', error);
        if (componentMountedRef.current) {
          sessionLoadedRef.current = false; // Allow retry on error
        }
      }
    };
    
    loadUserEmail();
  }, []); // Empty dependency array

  // Debug token on component mount
  useEffect(() => {
    console.log('🚀 AddPointModal mounted with props:', {
      isAdmin,
      useTokenAuth,
      currentToken: getSessionToken()
    });
  }, [isAdmin, useTokenAuth]);
  
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

  // Reset refs when modal closes
  useEffect(() => {
    if (!visible && !mapFullscreen) {
      if (locationRequestRef.current !== null) {
        console.log('Modal closed - cancelling location request');
        locationRequestRef.current = null;
        setGettingLocation(false);
      }
    }
  }, [visible, mapFullscreen]);

  // Component unmount cleanup
  useEffect(() => {
    componentMountedRef.current = true;
    return () => {
      componentMountedRef.current = false;
      sessionLoadedRef.current = false;
      locationRequestRef.current = null;
    };
  }, []);

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
    // Cancel any ongoing location request
    if (locationRequestRef.current !== null) {
      console.log('Cancelling ongoing location request');
      locationRequestRef.current = null;
      setGettingLocation(false);
    }
    
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
          <Form.Item label="Nombre del punto" name="pointId" rules={[{ required: true }]}>
            <Input placeholder="Ingrese el ID del punto" />
          </Form.Item>

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
          
          {/* Map Section with Fullscreen and Current Location Buttons */}
          <Form.Item label="Lugar en GPS">
            <div style={{ position: 'relative' }}>
              <div style={{ height: 300, marginBottom: 8, border: '1px solid #d9d9d9', borderRadius: '6px', overflow: 'hidden' }}>
                <MapContainer 
                  center={latLng.lat ? [latLng.lat, latLng.lng] : defaultPosition} 
                  zoom={latLng.lat ? 15 : 8} 
                  style={{ height: "100%", width: "100%" }}
                  key={`map-${latLng.lat}-${latLng.lng}`}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker setLatLng={setLatLng} />
                  <MapResizeHandler />
                </MapContainer>
              </div>
              
              {/* Map Control Buttons with fixed styling */}
              <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                {/* Current Location Button - Fixed CSS conflict */}
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
                
                {/* Fullscreen Button */}
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
            
            {/* Location Status */}
            {latLng.lat && latLng.lng && (
              <div style={{ 
                marginTop: 8, 
                padding: 8, 
                backgroundColor: '#f6ffed', 
                border: '1px solid #b7eb8f', 
                borderRadius: 4,
                fontSize: '12px',
                color: '#389e0d'
              }}>
                📍 Ubicación seleccionada: {latLng.lat.toFixed(6)}, {latLng.lng.toFixed(6)}
              </div>
            )}
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
        footer={[
          <Button key="close" onClick={() => setMapFullscreen(false)}>
            Cerrar
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            onClick={() => setMapFullscreen(false)}
            disabled={!latLng.lat || !latLng.lng}
          >
            Confirmar ubicación
          </Button>,
        ]}
        styles={{
          body: { 
            height: '80vh', 
            padding: 0,
            overflow: 'hidden'
          }
        }}
      >
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
          <MapContainer 
            center={latLng.lat ? [latLng.lat, latLng.lng] : defaultPosition} 
            zoom={latLng.lat ? 15 : 8}
            style={{ height: "100%", width: "100%" }}
            key={`fullscreen-map-${mapFullscreen}-${Date.now()}`}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker setLatLng={setLatLng} />
            <MapResizeHandler />
          </MapContainer>
          
          {/* Fixed Fullscreen Location Button */}
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
      </Modal>
    </>
  );
};

// Export the utility functions for use in other components if needed
export { getSessionToken, setSessionToken, clearSessionToken, buildHeaders };

export default AddPointModal;