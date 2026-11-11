import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, message, Modal } from 'antd';
import {
  EnvironmentOutlined,
  LoadingOutlined,
  FullscreenOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  AimOutlined
} from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';

const defaultPosition = [9.93333, -84.08333];

/**
 * Marker component for map interaction
 */
function LocationMarker({ setLatLng, latLng }) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (latLng && latLng.lat && latLng.lng) {
      setPosition([latLng.lat, latLng.lng]);
    } else {
      setPosition(null);
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

/**
 * Recenter map viewport smoothly when coordinates change or geolocation triggers
 */
function MapRecenter({ latLng, zoom = 15 }) {
  const map = useMap();
  useEffect(() => {
    if (latLng && typeof latLng.lat === 'number' && typeof latLng.lng === 'number' && !isNaN(latLng.lat) && !isNaN(latLng.lng)) {
      map.flyTo([latLng.lat, latLng.lng], zoom, { duration: 1 });
    }
  }, [latLng?.lat, latLng?.lng, zoom, map]);
  return null;
}

/**
 * Ensures map displays correctly when modal shows/resizes
 */
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

/**
 * Reusable embedded map component for coordinate selection
 * Can be used inline within forms or as a standalone component
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.latLng - Current coordinates { lat, lng }
 * @param {Function} props.onCoordinatesChange - Callback when coordinates change: (latLng) => void
 * @param {string} [props.title='Coordenadas GPS'] - Title label
 * @param {Function} [props.onFullscreen] - Optional callback for fullscreen button
 * @param {string} [props.mapHeight='300px'] - Height of the map (default: 300px)
 * @param {boolean} [props.showApplyButton=false] - Show apply button for manual coordinates
 * @param {boolean} [props.showClearButton=true] - Show clear button
 * 
 * @example
 * <MapCoordinatePicker
 *   latLng={coordinates}
 *   onCoordinatesChange={(coords) => setCoordinates(coords)}
 *   onFullscreen={() => openFullscreenMap()}
 * />
 */
const MapCoordinatePicker = ({
  latLng = {},
  onCoordinatesChange,
  title = 'Coordenadas GPS',
  onFullscreen,
  mapHeight = '300px',
  showApplyButton = false,
  showClearButton = true,
}) => {
  const [localLatLng, setLocalLatLng] = useState(latLng || {});
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [fullscreenLatLng, setFullscreenLatLng] = useState({});
  const [fullscreenManualLat, setFullscreenManualLat] = useState('');
  const [fullscreenManualLng, setFullscreenManualLng] = useState('');
  const [fullscreenGettingLocation, setFullscreenGettingLocation] = useState(false);
  const locationRequestRef = useRef(null);
  const componentMountedRef = useRef(true);

  // Sync external latLng to local state
  useEffect(() => {
    if (latLng && latLng.lat && latLng.lng) {
      setLocalLatLng(latLng);
      setManualLat(latLng.lat.toFixed(6));
      setManualLng(latLng.lng.toFixed(6));
    }
  }, [latLng]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      componentMountedRef.current = false;
      locationRequestRef.current = null;
    };
  }, []);

  /**
   * Validate coordinates
   */
  const isValidCoordinate = (lat, lng) => {
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  /**
   * Update coordinates and notify parent
   */
  const updateCoordinates = (newLatLng) => {
    setLocalLatLng(newLatLng);
    if (onCoordinatesChange) {
      onCoordinatesChange(newLatLng);
    }
  };

  /**
   * Handle manual coordinate input (real-time)
   */
  const handleManualCoordinateChange = (newLat, newLng) => {
    setManualLat(newLat);
    setManualLng(newLng);

    // Auto-update map if both coordinates are valid (when not using apply button)
    if (!showApplyButton && newLat && newLng) {
      const lat = parseFloat(newLat);
      const lng = parseFloat(newLng);

      if (isValidCoordinate(lat, lng)) {
        updateCoordinates({ lat, lng });
      }
    }
  };

  /**
   * Apply manual coordinates (button click for non-real-time mode)
   */
  const handleApplyCoordinates = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (!isNaN(lat) && !isNaN(lng)) {
      if (isValidCoordinate(lat, lng)) {
        updateCoordinates({ lat, lng });
        message.success('Coordenadas aplicadas correctamente');
      } else {
        message.error('Coordenadas inválidas. Lat: -90 a 90, Lng: -180 a 180');
      }
    } else {
      message.error('Por favor ingresa valores numéricos válidos');
    }
  };

  /**
   * Clear coordinates
   */
  const handleClear = () => {
    setLocalLatLng({});
    setManualLat('');
    setManualLng('');
    if (onCoordinatesChange) {
      onCoordinatesChange({});
    }
    message.info('Marcador eliminado');
  };

  /**
   * Helper to request browser coordinates with fallback capability
   */
  const requestPosition = (enableHighAccuracy, timeout = 12000) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy,
        timeout,
        maximumAge: 60000,
      });
    });
  };

  /**
   * Get current location using geolocation API with auto-fallback
   */
  const getCurrentLocation = async () => {
    if (locationRequestRef.current !== null || gettingLocation) {
      return;
    }

    if (!navigator.geolocation) {
      message.error('La geolocalización no está soportada en este navegador');
      return;
    }

    const requestId = Date.now();
    locationRequestRef.current = requestId;
    setGettingLocation(true);

    try {
      let position;
      try {
        // Try high accuracy (GPS) first with 12s timeout
        position = await requestPosition(true, 12000);
      } catch (highAccErr) {
        // If high accuracy times out (code 3) or position is unavailable (code 2), fallback to standard accuracy
        if (highAccErr.code === 3 || highAccErr.code === 2) {
          position = await requestPosition(false, 8000);
        } else {
          throw highAccErr;
        }
      }

      if (locationRequestRef.current !== requestId || !componentMountedRef.current) {
        return;
      }

      const { latitude, longitude } = position.coords;
      const newLatLng = { lat: latitude, lng: longitude };
      setManualLat(latitude.toFixed(6));
      setManualLng(longitude.toFixed(6));
      updateCoordinates(newLatLng);
      message.success('Ubicación obtenida correctamente');
      return newLatLng;
    } catch (error) {
      if (locationRequestRef.current !== requestId || !componentMountedRef.current) {
        return;
      }

      let errorMessage = 'Error al obtener la ubicación';
      switch (error.code) {
        case 1:
          errorMessage = 'Permiso de ubicación denegado. Permite el acceso a la ubicación en tu navegador.';
          break;
        case 2:
          errorMessage = 'Información de ubicación no disponible en tu dispositivo.';
          break;
        case 3:
          errorMessage = 'Tiempo de espera agotado al consultar la ubicación.';
          break;
        default:
          errorMessage = error.message || 'Error desconocido al obtener la ubicación.';
          break;
      }
      message.error(errorMessage);
    } finally {
      if (componentMountedRef.current) {
        setGettingLocation(false);
      }
      locationRequestRef.current = null;
    }
  };

  /**
   * Handle confirmation - call parent callback with coordinates
   */
  const handleConfirm = () => {
    if (!localLatLng.lat || !localLatLng.lng) {
      message.error('Por favor selecciona una ubicación en el mapa o ingresa coordenadas válidas');
      return;
    }
    if (!isValidCoordinate(localLatLng.lat, localLatLng.lng)) {
      message.error('Las coordenadas ingresadas son inválidas. Verifica que Lat esté entre -90 y 90, y Lng entre -180 y 180.');
      return;
    }
    onConfirm(localLatLng);
  };

  /**
   * Handle cancel - reset local state and call parent callback
   */
  const handleCancelClick = () => {
    setLocalLatLng({});
    setManualLat('');
    setManualLng('');
    onCancel();
  };

  /**
   * Open fullscreen modal with current coordinates
   */
  const openFullscreenModal = () => {
    setFullscreenLatLng(localLatLng);
    setFullscreenManualLat(manualLat);
    setFullscreenManualLng(manualLng);
    setIsFullscreenModalOpen(true);
  };

  /**
   * Close fullscreen modal without saving
   */
  const closeFullscreenModal = () => {
    setIsFullscreenModalOpen(false);
    setFullscreenLatLng({});
    setFullscreenManualLat('');
    setFullscreenManualLng('');
    setFullscreenGettingLocation(false);
  };

  /**
   * Confirm coordinates from fullscreen modal
   */
  const confirmFullscreenCoordinates = () => {
    const lat = parseFloat(fullscreenManualLat);
    const lng = parseFloat(fullscreenManualLng);

    if (!isNaN(lat) && !isNaN(lng)) {
      if (isValidCoordinate(lat, lng)) {
        updateCoordinates({ lat, lng });
        closeFullscreenModal();
        message.success('Coordenadas confirmadas correctamente');
      } else {
        message.error('Coordenadas inválidas. Lat: -90 a 90, Lng: -180 a 180');
      }
    } else {
      message.error('Por favor ingresa valores numéricos válidos');
    }
  };

  /**
   * Handle manual coordinate input for fullscreen modal
   */
  const handleFullscreenManualCoordinateChange = (newLat, newLng) => {
    setFullscreenManualLat(newLat);
    setFullscreenManualLng(newLng);

    if (newLat && newLng) {
      const lat = parseFloat(newLat);
      const lng = parseFloat(newLng);

      if (isValidCoordinate(lat, lng)) {
        setFullscreenLatLng({ lat, lng });
      }
    }
  };

  /**
   * Get current location for fullscreen modal with auto-fallback
   */
  const getFullscreenCurrentLocation = async () => {
    if (locationRequestRef.current !== null || fullscreenGettingLocation) {
      return;
    }

    if (!navigator.geolocation) {
      message.error('La geolocalización no está soportada en este navegador');
      return;
    }

    const requestId = Date.now();
    locationRequestRef.current = requestId;
    setFullscreenGettingLocation(true);

    try {
      let position;
      try {
        position = await requestPosition(true, 12000);
      } catch (highAccErr) {
        if (highAccErr.code === 3 || highAccErr.code === 2) {
          position = await requestPosition(false, 8000);
        } else {
          throw highAccErr;
        }
      }

      if (locationRequestRef.current !== requestId || !componentMountedRef.current) {
        return;
      }

      const { latitude, longitude } = position.coords;
      const newLatLng = { lat: latitude, lng: longitude };
      setFullscreenManualLat(latitude.toFixed(6));
      setFullscreenManualLng(longitude.toFixed(6));
      setFullscreenLatLng(newLatLng);
      message.success('Ubicación obtenida correctamente');
      return newLatLng;
    } catch (error) {
      if (locationRequestRef.current !== requestId || !componentMountedRef.current) {
        return;
      }

      let errorMessage = 'Error al obtener la ubicación';
      switch (error.code) {
        case 1:
          errorMessage = 'Permiso de ubicación denegado. Permite el acceso a la ubicación en tu navegador.';
          break;
        case 2:
          errorMessage = 'Información de ubicación no disponible en tu dispositivo.';
          break;
        case 3:
          errorMessage = 'Tiempo de espera agotado al consultar la ubicación.';
          break;
        default:
          errorMessage = error.message || 'Error desconocido al obtener la ubicación.';
          break;
      }
      message.error(errorMessage);
    } finally {
      if (componentMountedRef.current) {
        setFullscreenGettingLocation(false);
      }
      locationRequestRef.current = null;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Coordinate Input Section */}
      <div
        style={{
          marginBottom: 12,
          padding: 12,
          backgroundColor: '#fafafa',
          border: '1px solid #d9d9d9',
          borderRadius: 6,
        }}
      >
        <div style={{ marginBottom: 8, fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6, color: '#12467E' }}>
          <EnvironmentOutlined /> {title}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ minWidth: 50, fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Lat:</label>
            <Input
              placeholder="9.933333"
              value={manualLat}
              onChange={(e) => handleManualCoordinateChange(e.target.value, manualLng)}
              style={{ width: 110 }}
              size="small"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ minWidth: 50, fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Lng:</label>
            <Input
              placeholder="-84.083333"
              value={manualLng}
              onChange={(e) => handleManualCoordinateChange(manualLat, e.target.value)}
              style={{ width: 110 }}
              size="small"
            />
          </div>

          <Button
            type="primary"
            size="small"
            icon={gettingLocation ? <LoadingOutlined /> : <AimOutlined />}
            onClick={() => {
              getCurrentLocation().catch((err) => {
                console.error('Location request failed:', err.message);
              });
            }}
            loading={gettingLocation}
            disabled={gettingLocation}
            style={{
              backgroundColor: '#12467E',
              borderColor: '#12467E',
            }}
            className="poppins font-medium shadow-sm"
          >
            {gettingLocation ? 'Obteniendo GPS...' : 'Mi Ubicación Actual'}
          </Button>

          {showApplyButton && (
            <Button
              type="primary"
              size="small"
              onClick={handleApplyCoordinates}
              disabled={!manualLat || !manualLng}
              style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
            >
              Aplicar
            </Button>
          )}
          {showClearButton && (
            <Button
              type="default"
              size="small"
              onClick={handleClear}
              disabled={!localLatLng.lat && !localLatLng.lng}
              danger
            >
              Limpiar
            </Button>
          )}
        </div>
        {localLatLng.lat && localLatLng.lng && (
          <div
            style={{
              marginTop: 8,
              fontSize: '11px',
              color: '#12467E',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <CheckCircleOutlined /> Coordenadas fijadas: {localLatLng.lat.toFixed(6)}, {localLatLng.lng.toFixed(6)}
          </div>
        )}
      </div>

      {/* Map Section */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <div
          style={{
            height: mapHeight,
            marginBottom: 8,
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <MapContainer
            center={localLatLng.lat ? [localLatLng.lat, localLatLng.lng] : defaultPosition}
            zoom={localLatLng.lat ? 15 : 8}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker setLatLng={(coords) => updateCoordinates(coords)} latLng={localLatLng} />
            <MapRecenter latLng={localLatLng} />
            <MapResizeHandler />
          </MapContainer>
        </div>

        {/* Map Control Buttons */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <Button
            type="primary"
            icon={gettingLocation ? <LoadingOutlined /> : <AimOutlined />}
            onClick={() => {
              getCurrentLocation().catch((err) => {
                console.error('Location request failed:', err.message);
              });
            }}
            loading={gettingLocation}
            disabled={gettingLocation}
            style={{
              backgroundColor: '#12467E',
              borderColor: '#12467E',
            }}
            size="small"
            title={gettingLocation ? 'Obteniendo ubicación...' : 'Obtener ubicación actual'}
          />

          <Button
            type="primary"
            icon={<FullscreenOutlined />}
            onClick={openFullscreenModal}
            style={{
              backgroundColor: '#12467E',
              borderColor: '#12467E',
            }}
            size="small"
            title="Pantalla completa"
          />
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          fontSize: '12px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <InfoCircleOutlined className="text-gray-400" />
        <span>Haga clic en el mapa para seleccionar una ubicación, use su ubicación actual, o ingrese las coordenadas manualmente.</span>
      </div>

      {/* Fullscreen Modal */}
      <Modal
        title="Seleccionar Ubicación - Pantalla Completa"
        open={isFullscreenModalOpen}
        onCancel={closeFullscreenModal}
        width="90vw"
        style={{ top: 20 }}
        styles={{ body: { height: '85vh', padding: 24, display: 'flex', flexDirection: 'column' } }}
        footer={[
          <Button key="cancel" onClick={closeFullscreenModal}>
            Cancelar
          </Button>,
          <Button key="confirm" type="primary" onClick={confirmFullscreenCoordinates}>
            Confirmar Ubicación
          </Button>,
        ]}
      >
        {/* Fullscreen Coordinate Input Section */}
        <div
          style={{
            marginBottom: 16,
            padding: 16,
            backgroundColor: '#fafafa',
            border: '1px solid #d9d9d9',
            borderRadius: 6,
          }}
        >
          <div style={{ marginBottom: 12, fontWeight: 600, fontSize: '16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <EnvironmentOutlined className="text-[#12467E]" /> {title}
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ minWidth: 70, fontSize: '13px', color: '#666', fontWeight: 500 }}>Latitud:</label>
              <Input
                placeholder="9.933333"
                value={fullscreenManualLat}
                onChange={(e) => handleFullscreenManualCoordinateChange(e.target.value, fullscreenManualLng)}
                style={{ width: 150 }}
                size="middle"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ minWidth: 75, fontSize: '13px', color: '#666', fontWeight: 500 }}>Longitud:</label>
              <Input
                placeholder="-84.083333"
                value={fullscreenManualLng}
                onChange={(e) => handleFullscreenManualCoordinateChange(fullscreenManualLat, e.target.value)}
                style={{ width: 150 }}
                size="middle"
              />
            </div>
            <Button
              type="primary"
              icon={fullscreenGettingLocation ? <LoadingOutlined /> : <EnvironmentOutlined />}
              onClick={() => {
                getFullscreenCurrentLocation().catch((err) => {
                  console.error('Location request failed:', err.message);
                });
              }}
              loading={fullscreenGettingLocation}
              disabled={fullscreenGettingLocation}
              style={{
                backgroundColor: fullscreenGettingLocation ? '#f39c29' : '#12467E',
                borderColor: fullscreenGettingLocation ? '#f39c29' : '#12467E',
              }}
              size="middle"
            >
              {fullscreenGettingLocation ? 'Obteniendo...' : 'Mi Ubicación'}
            </Button>
          </div>
          {fullscreenLatLng.lat && fullscreenLatLng.lng && (
            <div
              style={{
                marginTop: 12,
                fontSize: '13px',
                color: '#12467E',
                fontWeight: 600,
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CheckCircleOutlined /> Coordenadas seleccionadas: {fullscreenLatLng.lat.toFixed(6)}, {fullscreenLatLng.lng.toFixed(6)}
            </div>
          )}
        </div>

        {/* Fullscreen Map Section */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            border: '2px solid #d9d9d9',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <MapContainer
            center={fullscreenLatLng.lat ? [fullscreenLatLng.lat, fullscreenLatLng.lng] : defaultPosition}
            zoom={fullscreenLatLng.lat ? 15 : 8}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker setLatLng={(coords) => {
              setFullscreenLatLng(coords);
              setFullscreenManualLat(coords.lat.toFixed(6));
              setFullscreenManualLng(coords.lng.toFixed(6));
            }} latLng={fullscreenLatLng} />
            <MapRecenter latLng={fullscreenLatLng} />
            <MapResizeHandler />
          </MapContainer>

          {/* Fullscreen Instructions */}
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '12px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#333',
              maxWidth: '300px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            }}
          >
            <strong>Instrucciones:</strong> Haga clic en el mapa para marcar la ubicación, use su ubicación actual con el botón GPS, o ingrese las coordenadas manualmente. Luego confirme para aplicar los cambios.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MapCoordinatePicker;