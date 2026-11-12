import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LindalDiagram from './LindalDiagram';
import { useNavigate } from "react-router-dom";
import { useSession } from '../../hooks/useSession';
import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  geomanifestationsIndex,
  provincesIndex,
  cantonsIndex,
  districtsIndex
} from '../../config/apiConf';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, useMap } from "react-leaflet";
import {
  FaExpand,
  FaCompress,
  FaChevronRight,
  FaChevronLeft,
  FaMapMarkerAlt,
  FaLayerGroup,
  FaSlidersH,
  FaTimes,
  FaUndo,
  FaThermometerHalf,
  FaGlobeAmericas,
  FaChartBar
} from "react-icons/fa";

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Function to fetch all geomanifestations
const fetchGeomanifestations = async () => {
  try {
    const res = await geomanifestationsIndex();
    let rawData = [];

    if (res.ok && res.data) {
      if (Array.isArray(res.data.data)) {
        rawData = res.data.data;
      } else if (Array.isArray(res.data.data?.data)) {
        rawData = res.data.data.data;
      } else if (Array.isArray(res.data)) {
        rawData = res.data;
      }
    }

    // Normalize and transform geomanifestation points
    return rawData.map(item => {
      const id = item.geomanifestation_id || item.id;
      const lat = item.location?.latitude ?? item.latitude;
      const lng = item.location?.longitude ?? item.longitude;
      const temp = item.insitu_test?.temperature ?? item.temperature;

      const province = item.location?.province || item.province || '';
      const canton = item.location?.canton || item.canton || '';
      const district = item.location?.district || item.district || '';
      const locationName = [province, canton, district].filter(Boolean).join(', ') || 'Costa Rica';

      return {
        id,
        geomanifestation_id: id,
        name: item.geomanifestation_name || item.name || `Punto ${id}`,
        geomanifestation_name: item.geomanifestation_name || item.name || `Punto ${id}`,
        description: item.description,
        latitude: lat,
        longitude: lng,
        province,
        canton,
        district,
        temperature: temp !== undefined && temp !== null ? parseFloat(temp) : null,
        location: item.location || { province, canton, district },
        locationName,
        insitu_test: item.insitu_test,
        inlab_test: item.inlab_test,
        originalData: item
      };
    });
  } catch (err) {
    console.error("Error fetching geomanifestations:", err);
    return [];
  }
};

function CenterOnUser() {
  const map = useMap();

  useEffect(() => {
    const existingControls = document.querySelectorAll('.custom-location-control');
    if (existingControls.length > 0) {
      return;
    }

    const LocationControl = L.Control.extend({
      onAdd: function (map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom custom-location-control');
        container.className += ' bg-white w-10 h-10 cursor-pointer flex items-center justify-center rounded-lg shadow-md hover:bg-gray-50 border border-gray-200 transition-all';
        container.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12467E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
        container.title = 'Ir a mi ubicación';

        container.onclick = function () {
          if (navigator.geolocation) {
            container.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12467E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="10"></circle></svg>';
            container.style.pointerEvents = 'none';

            navigator.geolocation.getCurrentPosition(
              (position) => {
                map.setView([position.coords.latitude, position.coords.longitude], 15);

                map.eachLayer(layer => {
                  if (layer.options && layer.options.isLocationMarker) {
                    map.removeLayer(layer);
                  }
                });

                const customIcon = L.divIcon({
                  className: 'custom-location-marker',
                  html: '<div style="background-color: #12467E; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                });

                L.marker([position.coords.latitude, position.coords.longitude], {
                  icon: customIcon,
                  isLocationMarker: true
                })
                  .addTo(map)
                  .bindPopup("Ubicación actual")
                  .openPopup();

                container.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12467E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
                container.style.pointerEvents = 'auto';
              },
              (error) => {
                console.error("Geolocation error:", error);
                container.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12467E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
                container.style.pointerEvents = 'auto';
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000
              }
            );
          }
        };

        return container;
      }
    });

    const control = new LocationControl({ position: 'topright' }).addTo(map);

    return () => {
      try {
        map.removeControl(control);
      } catch (e) { }
    };
  }, [map]);

  return null;
}

function FullscreenControl({ fullscreen, handleFullscreen }) {
  const map = useMap();

  useEffect(() => {
    const existingControls = document.querySelectorAll('.custom-fullscreen-control');
    if (existingControls.length > 0) {
      return;
    }

    const FullscreenControlButton = L.Control.extend({
      onAdd: function (map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom custom-fullscreen-control');
        container.className += ' bg-white w-10 h-10 cursor-pointer flex items-center justify-center mt-2 rounded-lg shadow-md hover:bg-gray-50 border border-gray-200 transition-all';
        container.innerHTML = fullscreen
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12467E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12467E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6m0 6v6h-6M9 21H3v-6M3 9V3h6"></path></svg>';
        container.title = fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa';

        container.onclick = function () {
          handleFullscreen();
        };

        return container;
      }
    });

    const control = new FullscreenControlButton({ position: 'topright' }).addTo(map);

    const updateButton = () => {
      const button = control.getContainer();
      if (button) {
        button.innerHTML = fullscreen
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12467E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12467E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6m0 6v6h-6M9 21H3v-6M3 9V3h6"></path></svg>';
        button.title = fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa';
      }
    };

    updateButton();

    return () => {
      try {
        map.removeControl(control);
      } catch (e) { }
    };
  }, [map, fullscreen, handleFullscreen]);

  return null;
}

export default function MapComponent() {
  const { user } = useSession();
  const isMaintenance = user?.role === 'maintenance';
  const navigate = useNavigate();
  const [allPoints, setAllPoints] = useState([]);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const [fullscreen, setFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapContainerRef = useRef(null);

  // SNIT WMS layers state
  const [snitLayers, setSnitLayers] = useState({
    provincial: true,
    cantonal: true,
    distrital: false,
  });

  // Filter States
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCanton, setSelectedCanton] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [minTemp, setMinTemp] = useState('');
  const [maxTemp, setMaxTemp] = useState('');
  const [activeTempPreset, setActiveTempPreset] = useState('all');

  const toggleSnitLayer = (layerKey) => {
    setSnitLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  // Load geomanifestations on mount
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;

      try {
        setLoading(true);
        setError(null);

        const points = await fetchGeomanifestations();

        if (isMounted) {
          setAllPoints(points);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load map data");
          console.error("Error loading map data:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshData = async () => {
    setError(null);
    try {
      setLoading(true);
      const points = await fetchGeomanifestations();
      setAllPoints(points);
    } catch (err) {
      setError("Error al actualizar puntos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cascading Location Dropdown Options derived dynamically from allPoints
  const provinceOptions = useMemo(() => {
    const set = new Set();
    allPoints.forEach(p => {
      const prov = p.province || p.location?.province;
      if (prov) set.add(prov);
    });
    return Array.from(set).sort();
  }, [allPoints]);

  const cantonOptions = useMemo(() => {
    const set = new Set();
    allPoints.forEach(p => {
      const prov = p.province || p.location?.province || '';
      const cant = p.canton || p.location?.canton;
      if (cant) {
        if (!selectedProvince || prov.toLowerCase() === selectedProvince.toLowerCase()) {
          set.add(cant);
        }
      }
    });
    return Array.from(set).sort();
  }, [allPoints, selectedProvince]);

  const districtOptions = useMemo(() => {
    const set = new Set();
    allPoints.forEach(p => {
      const prov = p.province || p.location?.province || '';
      const cant = p.canton || p.location?.canton || '';
      const dist = p.district || p.location?.district;
      if (dist) {
        if ((!selectedProvince || prov.toLowerCase() === selectedProvince.toLowerCase()) &&
          (!selectedCanton || cant.toLowerCase() === selectedCanton.toLowerCase())) {
          set.add(dist);
        }
      }
    });
    return Array.from(set).sort();
  }, [allPoints, selectedProvince, selectedCanton]);

  // Handlers for Location Select Changes
  const handleProvinceChange = (e) => {
    const prov = e.target.value;
    setSelectedProvince(prov);
    setSelectedCanton('');
    setSelectedDistrict('');
  };

  const handleCantonChange = (e) => {
    const cant = e.target.value;
    setSelectedCanton(cant);
    setSelectedDistrict('');
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
  };

  // Preset Handler for Temperature Filters
  const applyTempPreset = (presetKey) => {
    setActiveTempPreset(presetKey);
    switch (presetKey) {
      case 'low':
        setMinTemp('');
        setMaxTemp('40');
        break;
      case 'medium':
        setMinTemp('40');
        setMaxTemp('60');
        break;
      case 'high':
        setMinTemp('60');
        setMaxTemp('');
        break;
      case 'all':
      default:
        setMinTemp('');
        setMaxTemp('');
        break;
    }
  };

  const resetAllFilters = () => {
    setSelectedProvince('');
    setSelectedCanton('');
    setSelectedDistrict('');
    setMinTemp('');
    setMaxTemp('');
    setActiveTempPreset('all');
  };

  // Filtered Points Computation
  const visiblePoints = useMemo(() => {
    return allPoints.filter(point => {
      // Province Filter
      const prov = point.province || point.location?.province || '';
      if (selectedProvince && prov.toLowerCase() !== selectedProvince.toLowerCase()) {
        return false;
      }

      // Canton Filter
      const cant = point.canton || point.location?.canton || '';
      if (selectedCanton && cant.toLowerCase() !== selectedCanton.toLowerCase()) {
        return false;
      }

      // District Filter
      const dist = point.district || point.location?.district || '';
      if (selectedDistrict && dist.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }

      // Temperature Filter
      const temp = point.temperature;
      if (minTemp !== '' && (temp === null || temp < parseFloat(minTemp))) {
        return false;
      }
      if (maxTemp !== '' && (temp === null || temp > parseFloat(maxTemp))) {
        return false;
      }

      return true;
    });
  }, [allPoints, selectedProvince, selectedCanton, selectedDistrict, minTemp, maxTemp]);

  // Fullscreen handler
  const handleFullscreen = () => {
    if (!fullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
    setFullscreen(f => !f);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreen(false);
      } else {
        setFullscreen(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div>
      <div
        ref={mapContainerRef}
        className={`
          ${fullscreen
            ? 'fixed top-0 left-0 w-screen h-screen z-[9999] mt-0'
            : 'h-[680px] w-[94%] block mx-auto mt-24 mb-8 shadow-2xl rounded-2xl overflow-hidden border border-gray-200'
          }
        `}
      >
        <MapContainer
          center={[10.123456, -85.2]}
          zoom={9}
          className="h-full w-full relative z-[1]"
          zoomControl={false}
        >
          {/* Base Tile Layer */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* SNIT WMS Raster Layers (Costa Rica IGN WMS Service) */}
          {snitLayers.provincial && (
            <WMSTileLayer
              url="https://geos.snitcr.go.cr/be/IGN_5_CO/wms"
              params={{
                layers: 'limiteprovincial_5k',
                format: 'image/png',
                transparent: true,
                version: '1.3.0',
              }}
            />
          )}

          {snitLayers.cantonal && (
            <WMSTileLayer
              url="https://geos.snitcr.go.cr/be/IGN_5_CO/wms"
              params={{
                layers: 'limitecantonal_5k',
                format: 'image/png',
                transparent: true,
                version: '1.3.0',
              }}
            />
          )}

          {snitLayers.distrital && (
            <WMSTileLayer
              url="https://geos.snitcr.go.cr/be/IGN_5_CO/wms"
              params={{
                layers: 'limitedistrital_5k',
                format: 'image/png',
                transparent: true,
                version: '1.3.0',
              }}
            />
          )}

          <CenterOnUser />
          <FullscreenControl fullscreen={fullscreen} handleFullscreen={handleFullscreen} />

          {error && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/95 px-5 py-2.5 rounded-lg shadow-lg border border-red-300 text-red-600 max-w-[80%] text-center poppins">
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white/95 px-6 py-3 rounded-xl shadow-2xl border border-blue-200 text-geoterra-blue font-bold text-sm poppins flex items-center gap-3">
              <span className="animate-spin">🌀</span> Cargando geomanifestaciones...
            </div>
          )}

          {/* Geomanifestation Markers */}
          {visiblePoints.map((point, idx) => {
            const lat = parseFloat(point.latitude);
            const lng = parseFloat(point.longitude);

            if (isNaN(lat) || isNaN(lng)) {
              return null;
            }

            const handleViewDetails = () => {
              navigate(`/point-details/${encodeURIComponent(point.id)}`, {
                state: {
                  pointData: point,
                  geomanifestationData: point
                }
              });
            };

            const temperature = point.temperature;

            return (
              <Marker
                key={`${point.id}-${idx}`}
                position={[lat, lng]}
              >
                <Popup
                  maxWidth={isMobile ? 320 : 580}
                  minWidth={isMobile ? 260 : 450}
                  autoPanPaddingTopLeft={[16, 75]}
                  autoPanPaddingBottomRight={[16, 25]}
                  className="geoterra-point-popup"
                >
                  <div className="w-full max-w-[calc(100vw-48px)] sm:max-w-[530px] p-1 sm:p-2.5 poppins">
                    {/* Header */}
                    <div className="mb-2 sm:mb-4 border-b-2 border-[#12467E] pb-1.5 sm:pb-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-geoterra-orange poppins">
                          MANIFESTACIÓN GEOTÉRMICA
                        </span>
                        {isMaintenance && point.id && (
                          <span className="font-mono text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            #{String(point.id).slice(0, 8)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-xl md:text-2xl font-bold text-[#12467E] m-0 leading-tight break-words">
                        {point.name || (isMaintenance ? `Punto #${point.id}` : 'Punto Geotermal')}
                      </h3>
                    </div>

                    {/* Ubicación y Coordenadas */}
                    <div className="mb-2 sm:mb-4 bg-slate-50 border border-slate-200 rounded-xl p-2 sm:p-3.5">
                      <div className="text-xs sm:text-sm text-gray-800 font-semibold flex items-center gap-1.5 sm:gap-2 mb-1">
                        <FaMapMarkerAlt className="text-[#12467E] text-xs sm:text-sm shrink-0" />
                        <span className="truncate">{point.locationName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs text-gray-500 font-mono">
                        <span className="bg-white border border-gray-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded shadow-2xs">
                          Lat: {lat.toFixed(5)}°
                        </span>
                        <span className="bg-white border border-gray-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded shadow-2xs">
                          Lon: {lng.toFixed(5)}°
                        </span>
                      </div>
                    </div>

                    {/* Métricas In-Situ & Clasificación Lindal */}
                    {temperature !== null ? (
                      <div className="grid grid-cols-2 gap-2 sm:gap-3.5 mb-2.5 sm:mb-4 p-2 sm:p-4 bg-gradient-to-br from-orange-50/60 to-slate-50 rounded-xl border border-orange-100 shadow-2xs">
                        {/* Termómetro / Temperatura */}
                        <div className="flex flex-col justify-center items-center text-center p-1.5 sm:p-3.5 bg-white rounded-xl border border-orange-100 shadow-2xs">
                          <div className="flex items-center gap-1 text-orange-600 mb-0.5">
                            <FaThermometerHalf className="text-xs sm:text-base shrink-0" />
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
                              Temp. In-Situ
                            </span>
                          </div>
                          <div className="text-2xl sm:text-4xl font-black text-orange-600 tracking-tight my-0.5">
                            {temperature.toFixed(1)}°C
                          </div>
                          {point.insitu_test && (point.insitu_test.ph || point.insitu_test.conductivity) ? (
                            <div className="mt-1 pt-1 border-t border-gray-100 flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500 font-mono flex-wrap">
                              {Number(point.insitu_test.ph) > 0 && <span>pH: {parseFloat(point.insitu_test.ph).toFixed(1)}</span>}
                              {Number(point.insitu_test.conductivity) > 0 && <span>• {parseFloat(point.insitu_test.conductivity).toFixed(0)} µS</span>}
                            </div>
                          ) : null}
                        </div>

                        {/* Clasificación Lindal */}
                        <div className="flex flex-col justify-center">
                          <div className="text-[10px] sm:text-xs text-[#12467E] font-bold text-center mb-1">
                            Clasificación de Usos (Lindal)
                          </div>
                          <div className="w-full">
                            <LindalDiagram temperature={temperature} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-2 sm:mb-4 p-2 sm:p-3.5 bg-amber-50 rounded-xl text-center border border-amber-200 text-xs sm:text-sm text-amber-800">
                        Temperatura in-situ no registrada
                      </div>
                    )}

                    {/* Botón de Acción Principal */}
                    <button
                      onClick={handleViewDetails}
                      className="w-full py-2.5 sm:py-3 px-3 sm:px-5 bg-[#12467E] hover:bg-[#0d3460] text-white rounded-xl text-xs sm:text-sm md:text-base font-bold flex items-center justify-center gap-1.5 sm:gap-2.5 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <FaChartBar className="text-sm sm:text-base shrink-0" />
                      <span className="truncate">Ver Detalles Completos y Diagramas</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* SIDEBAR & FILTERS CONTAINER */}
          {!sidebarOpen ? (
            /* Collapsed Floating Trigger */
            <div className="absolute top-4 left-4 z-[1000]">
              <button
                onClick={() => setSidebarOpen(true)}
                className="bg-white/95 hover:bg-white text-geoterra-blue font-bold px-4 py-2.5 rounded-full shadow-xl border border-gray-200 flex items-center gap-2.5 cursor-pointer transition-all duration-200 hover:scale-105 poppins text-sm"
                title="Abrir panel de filtros y capas"
              >
                <FaSlidersH className="text-blue-600" />
                <span>Filtros y Capas</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-mono font-bold">
                  {visiblePoints.length}
                </span>
              </button>
            </div>
          ) : (
            /* Expanded Floating Sidebar Drawer */
            <div className="absolute top-3 left-3 z-[1000] w-[320px] max-w-[calc(100vw-32px)] h-[calc(100%-24px)] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-300 overflow-hidden poppins">

              {/* Header */}
              <div className="bg-[#12467E] text-white p-3.5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <FaSlidersH className="text-blue-300" />
                  <span>Capas y Filtros</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
                  title="Cerrar panel"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-4 space-y-5 overflow-y-auto flex-1 text-xs">

                {/* Section 1: Capas Cartográficas SNIT */}
                <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200/80">
                  <h4 className="m-0 mb-2.5 font-bold text-gray-800 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <FaLayerGroup className="text-blue-600" /> Capas SNIT (IGN)
                    </span>
                  </h4>

                  <div className="space-y-1.5 text-gray-700">
                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={snitLayers.provincial}
                        onChange={() => toggleSnitLayer('provincial')}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <span className="font-medium">Límite Provincial</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={snitLayers.cantonal}
                        onChange={() => toggleSnitLayer('cantonal')}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <span className="font-medium">Límite Cantonal</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        checked={snitLayers.distrital}
                        onChange={() => toggleSnitLayer('distrital')}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <span className="font-medium">Límite Distrital</span>
                    </label>
                  </div>
                </div>

                {/* Section 2: Filtros de Ubicación Territorial */}
                <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200/80 space-y-3">
                  <h4 className="m-0 font-bold text-gray-800 flex items-center gap-1.5 text-xs">
                    <FaGlobeAmericas className="text-emerald-600" /> Ubicación Territorial
                  </h4>

                  {/* Province Select */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Provincia:
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={handleProvinceChange}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">Todas las provincias</option>
                      {provinceOptions.map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  {/* Canton Select */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Cantón:
                    </label>
                    <select
                      value={selectedCanton}
                      onChange={handleCantonChange}
                      disabled={cantonOptions.length === 0}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="">Todos los cantones</option>
                      {cantonOptions.map(cant => (
                        <option key={cant} value={cant}>{cant}</option>
                      ))}
                    </select>
                  </div>

                  {/* District Select */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Distrito:
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      disabled={districtOptions.length === 0}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="">Todos los distritos</option>
                      {districtOptions.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section 3: Filtro de Temperatura (°C) */}
                <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200/80 space-y-3">
                  <h4 className="m-0 font-bold text-gray-800 flex items-center gap-1.5 text-xs">
                    <FaThermometerHalf className="text-red-500" /> Temperatura (°C)
                  </h4>

                  {/* Quick Presets */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyTempPreset('all')}
                      className={`py-1 px-2 rounded-lg text-[11px] font-semibold border cursor-pointer transition-all ${activeTempPreset === 'all' && minTemp === '' && maxTemp === ''
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                      Todas
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTempPreset('low')}
                      className={`py-1 px-2 rounded-lg text-[11px] font-semibold border cursor-pointer transition-all ${activeTempPreset === 'low'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                      &lt; 40°C
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTempPreset('medium')}
                      className={`py-1 px-2 rounded-lg text-[11px] font-semibold border cursor-pointer transition-all ${activeTempPreset === 'medium'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                      40°C - 60°C
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTempPreset('high')}
                      className={`py-1 px-2 rounded-lg text-[11px] font-semibold border cursor-pointer transition-all ${activeTempPreset === 'high'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                      &gt; 60°C
                    </button>
                  </div>

                  {/* Range Inputs */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-500 font-semibold mb-0.5">Mín (°C)</label>
                      <input
                        type="number"
                        placeholder="Mín"
                        value={minTemp}
                        onChange={(e) => {
                          setMinTemp(e.target.value);
                          setActiveTempPreset('custom');
                        }}
                        className="w-full p-1.5 bg-white border border-gray-300 rounded-lg text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-gray-400 font-bold text-xs pt-3">-</span>
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-500 font-semibold mb-0.5">Máx (°C)</label>
                      <input
                        type="number"
                        placeholder="Máx"
                        value={maxTemp}
                        onChange={(e) => {
                          setMaxTemp(e.target.value);
                          setActiveTempPreset('custom');
                        }}
                        className="w-full p-1.5 bg-white border border-gray-300 rounded-lg text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Summary & Action Controls */}
              <div className="p-3 bg-gray-100/90 border-t border-gray-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-700 px-1">
                  <span>Puntos Filtrados:</span>
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full font-mono font-bold text-[11px]">
                    {visiblePoints.length} / {allPoints.length}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={resetAllFilters}
                    className="flex-1 py-2 px-2 bg-white hover:bg-gray-200 border border-gray-300 text-gray-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                    title="Restablecer todos los filtros"
                  >
                    <FaUndo className="text-[10px]" /> Limpiar
                  </button>
                  <button
                    onClick={refreshData}
                    disabled={loading}
                    className="flex-1 py-2 px-2 bg-geoterra-blue hover:bg-blue-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? "..." : "🔄 Actualizar"}
                  </button>
                </div>
              </div>

            </div>
          )}
        </MapContainer>
      </div>
    </div>
  );
}