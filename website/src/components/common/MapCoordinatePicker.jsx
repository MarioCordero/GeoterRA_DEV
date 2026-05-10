import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input, message, Spin } from 'antd';
import { EnvironmentOutlined, LoadingOutlined } from '@ant-design/icons';
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
 * Reusable fullscreen map component for coordinate selection
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.visible - Whether modal is visible
 * @param {Object} props.latLng - Current coordinates { lat, lng }
 * @param {Function} props.onConfirm - Callback on confirm: (latLng) => void
 * @param {Function} props.onCancel - Callback on cancel: () => void
 * @param {string} [props.title='Seleccionar ubicación en el mapa'] - Modal title
 * 
 * @example
 * <MapCoordinatePicker
 *   visible={mapOpen}
 *   latLng={selectedCoords}
 *   onConfirm={(coords) => setCoordinates(coords)}
 *   onCancel={() => setMapOpen(false)}
 * />
 */
const MapCoordinatePicker = ({
  visible,
  latLng = {},
  onConfirm,
  onCancel,
  title = 'Seleccionar ubicación en el mapa',
}) => {
  const [localLatLng, setLocalLatLng] = useState(latLng);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const locationRequestRef = useRef(null);
  const componentMountedRef = useRef(true);

  // Sync external latLng to local state
  useEffect(() => {
    if (visible && latLng && latLng.lat && latLng.lng) {
      setLocalLatLng(latLng);
      setManualLat(latLng.lat.toFixed(6));
      setManualLng(latLng.lng.toFixed(6));
    }
  }, [visible, latLng]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      componentMountedRef.current = false;
      locationRequestRef.current = null;
    };
  }, []);

  /**
   * Apply manual coordinates to map
   */
  const handleManualCoordinateChange = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (!isNaN(lat) && !isNaN(lng)) {
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setLocalLatLng({ lat, lng });
        message.success('Coordenadas establecidas correctamente');
      } else {
        message.error('Coordenadas inválidas. Lat: -90 a 90, Lng: -180 a 180');
      }
    } else {
      message.error('Por favor ingresa valores numéricos válidos');
    }
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
          setLocalLatLng(newLatLng);
          setManualLat(latitude.toFixed(6));
          setManualLng(longitude.toFixed(6));

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
      message.error('Por favor selecciona una ubicación');
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
    <Modal
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{title}</span>
          <div>
            {localLatLng.lat && localLatLng.lng && (
              <span style={{ fontSize: '12px', color: '#666', marginRight: '16px' }}>
                Lat: {localLatLng.lat.toFixed(6)}, Lng: {localLatLng.lng.toFixed(6)}
              </span>
            )}
          </div>
        </div>
      }
      open={visible}
      onCancel={handleCancelClick}
      width="95vw"
      centered
      footer={null}
      styles={{
        body: {
          height: '80vh',
          padding: 0,
          overflow: 'hidden',
          position: 'relative',
        },
      }}
    >
      <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Map Container - Takes remaining space */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <MapContainer
            center={localLatLng.lat ? [localLatLng.lat, localLatLng.lng] : defaultPosition}
            zoom={localLatLng.lat ? 15 : 8}
            style={{ height: '100%', width: '100%' }}
            key={`picker-map-${visible}`}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker setLatLng={setLocalLatLng} latLng={localLatLng} />
            <MapResizeHandler />
          </MapContainer>

          {/* Current Location Button in Top Right */}
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
        <div
          style={{
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
            zIndex: 999,
          }}
        >
          {/* Coordinate Input Section */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
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
          {localLatLng.lat && localLatLng.lng && (
            <div
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#52c41a',
                fontWeight: 500,
                padding: '8px',
                backgroundColor: '#f6ffed',
                borderRadius: 4,
                border: '1px solid #b7eb8f',
              }}
            >
              📍 Ubicación seleccionada: {localLatLng.lat.toFixed(6)}, {localLatLng.lng.toFixed(6)}
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
            }}
          >
            <Button onClick={handleCancelClick} size="large" style={{ minWidth: 120 }}>
              Cerrar
            </Button>
            <Button
              type="primary"
              onClick={handleConfirm}
              disabled={!localLatLng.lat || !localLatLng.lng}
              size="large"
              style={{ minWidth: 150 }}
            >
              Confirmar ubicación
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MapCoordinatePicker;