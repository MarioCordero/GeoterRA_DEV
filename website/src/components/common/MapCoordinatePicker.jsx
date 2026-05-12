import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, message } from 'antd';
import { EnvironmentOutlined, LoadingOutlined, FullscreenOutlined } from '@ant-design/icons';
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
   * Get current location using geolocation API
   */
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
      const requestId = Date.now();
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

          if (locationRequestRef.current !== requestId) {
            return;
          }

          if (!componentMountedRef.current) {
            return;
          }

          const { latitude, longitude } = position.coords;
          const newLatLng = { lat: latitude, lng: longitude };
          setManualLat(latitude.toFixed(6));
          setManualLng(longitude.toFixed(6));
          updateCoordinates(newLatLng);
          message.success('Ubicación actual obtenida correctamente');
          setGettingLocation(false);
          locationRequestRef.current = null;
          resolve(newLatLng);
        },
        (error) => {
          clearTimeout(timeoutId);

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
          maximumAge: 60000,
        }
      );
    });
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
        <div style={{ marginBottom: 8, fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          📍 {title}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ minWidth: 60, fontSize: '12px', color: '#666' }}>Latitud:</label>
            <Input
              placeholder="9.933333"
              value={manualLat}
              onChange={(e) => handleManualCoordinateChange(e.target.value, manualLng)}
              style={{ width: 120 }}
              size="small"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ minWidth: 65, fontSize: '12px', color: '#666' }}>Longitud:</label>
            <Input
              placeholder="-84.083333"
              value={manualLng}
              onChange={(e) => handleManualCoordinateChange(manualLat, e.target.value)}
              style={{ width: 120 }}
              size="small"
            />
          </div>
          {showApplyButton && (
            <Button
              type="primary"
              size="small"
              onClick={handleApplyCoordinates}
              disabled={!manualLat || !manualLng}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
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
              color: '#52c41a',
              fontWeight: 500,
            }}
          >
            ✅ Coordenadas actuales: {localLatLng.lat.toFixed(6)}, {localLatLng.lng.toFixed(6)}
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
            key={`map-${localLatLng.lat}`}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker setLatLng={(coords) => updateCoordinates(coords)} latLng={localLatLng} />
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
            icon={gettingLocation ? <LoadingOutlined /> : <EnvironmentOutlined />}
            onClick={() => {
              getCurrentLocation().catch((err) => {
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
            title={gettingLocation ? 'Obteniendo ubicación...' : 'Obtener ubicación actual'}
          />

          {onFullscreen && (
            <Button
              type="primary"
              icon={<FullscreenOutlined />}
              onClick={onFullscreen}
              style={{
                backgroundColor: '#1890ff',
                borderColor: '#1890ff',
              }}
              size="small"
              title="Pantalla completa"
            />
          )}
        </div>
      </div>

      {/* Instructions */}
      <div
        style={{
          fontSize: '12px',
          color: '#666',
          fontStyle: 'italic',
        }}
      >
        💡 Haz clic en el mapa para seleccionar una ubicación, usa tu ubicación actual, o ingresa las coordenadas manualmente.
      </div>
    </div>
  );
};

export default MapCoordinatePicker;