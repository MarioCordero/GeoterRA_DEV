import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaExpand, FaCompress, FaChevronRight, FaChevronLeft, FaMapMarkerAlt } from "react-icons/fa";
import { buildApiUrl } from '../../config/apiConf';
import LindalDiagram from './LindalDiagram';

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Function to fetch points for a specific region
const fetchPoints = async (region) => {
  try {
    const response = await fetch(buildApiUrl("map_data.inc.php"), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `region=${encodeURIComponent(region)}`,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Handle the API response structure
    if (result.response === "Ok") {
      return result.data || [];
    } else {
      console.error(`API Error for region ${region}:`, result.message, result.errors);
      throw new Error(result.message || "Failed to fetch points");
    }
  } catch (error) {
    console.error(`Error fetching points for region ${region}:`, error);
    throw error;
  }
};

// Function to fetch regions
const fetchRegions = async () => {
  try {
    const response = await fetch(buildApiUrl("get_regions.inc.php"));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Handle the API response structure
    if (result.response === "Ok") {
      return result.data || [];
    } else {
      console.error("API Error fetching regions:", result.message, result.errors);
      return [];
    }
  } catch (error) {
    console.error("Error fetching regions:", error);
    return [];
  }
};

// Function to check user session
const checkUserSession = async () => {
  try {
    const response = await fetch(buildApiUrl("check_session.php"));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error checking session:", error);
    return { status: 'not_logged_in' };
  }
};

function CenterOnUser() {
  const map = useMap();
  
  useEffect(() => {
    // Check if control already exists to prevent duplicates
    const existingControls = document.querySelectorAll('.custom-location-control');
    if (existingControls.length > 0) {
      return;
    }

    // Add a manual location button
    const LocationControl = L.Control.extend({
      onAdd: function(map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom custom-location-control');
        container.className += ' bg-white w-10 h-10 cursor-pointer flex items-center justify-center hover:bg-gray-50';
        container.innerHTML = '<span style="font-size: 16px;">📍</span>';
        container.title = 'Ir a mi ubicación';
        
        container.onclick = function() {
          if (navigator.geolocation) {
            container.innerHTML = '<span style="font-size: 16px;">⏳</span>';
            container.style.pointerEvents = 'none';
            
            navigator.geolocation.getCurrentPosition(
              (position) => {
                map.setView([position.coords.latitude, position.coords.longitude], 17);
                
                // Clear any existing location markers first
                map.eachLayer(layer => {
                  if (layer.options && layer.options.isLocationMarker) {
                    map.removeLayer(layer);
                  }
                });
                
                // Create a custom icon to avoid the default Leaflet pin
                const customIcon = L.divIcon({
                  className: 'custom-location-marker',
                  html: '<div style="background-color: #ff4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                });
                
                L.marker([position.coords.latitude, position.coords.longitude], { 
                  icon: customIcon,
                  isLocationMarker: true
                })
                  .addTo(map)
                  .bindPopup("📍 Tu ubicación actual")
                  .openPopup();
                
                container.innerHTML = '<span style="font-size: 16px;">📍</span>';
                container.style.pointerEvents = 'auto';
              },
              (error) => {
                console.error("Geolocation error:", error);
                container.innerHTML = '<span style="font-size: 16px;">📍</span>';
                container.style.pointerEvents = 'auto';
                
                let errorMessage = "No se pudo obtener tu ubicación.";
                if (error.code === 1) {
                  errorMessage = "Acceso denegado. Habilita la ubicación en tu navegador.";
                }
                
                L.popup()
                  .setLatLng([9.9366, -84.0442])
                  .setContent(`⚠️ ${errorMessage}`)
                  .openOn(map);
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
    
    // Cleanup function to remove the control
    return () => {
      try {
        map.removeControl(control);
      } catch (e) {
        // Control might already be removed
      }
    };
  }, [map]);
  
  return null;
}

// Add this new component for the fullscreen button
function FullscreenControl({ fullscreen, handleFullscreen }) {
  const map = useMap();
  
  useEffect(() => {
    // Check if control already exists to prevent duplicates
    const existingControls = document.querySelectorAll('.custom-fullscreen-control');
    if (existingControls.length > 0) {
      return;
    }

    const FullscreenControlButton = L.Control.extend({
      onAdd: function(map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom custom-fullscreen-control');
        container.className += ' bg-white w-10 h-10 cursor-pointer flex items-center justify-center mt-2 hover:bg-gray-50';
        container.innerHTML = `<span style="font-size: 16px;">${fullscreen ? '🔲' : '⛶'}</span>`;
        container.title = fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa';
        
        container.onclick = function() {
          handleFullscreen();
        };
        
        return container;
      }
    });
    
    const control = new FullscreenControlButton({ position: 'topright' }).addTo(map);
    
    // Update button icon when fullscreen state changes
    const updateButton = () => {
      const button = control.getContainer();
      if (button) {
        button.innerHTML = `<span style="font-size: 16px;">${fullscreen ? '🔲' : '⛶'}</span>`;
        button.title = fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa';
      }
    };
    
    updateButton();
    
    return () => {
      try {
        map.removeControl(control);
      } catch (e) {
        // Control might already be removed
      }
    };
  }, [map, fullscreen, handleFullscreen]);
  
  return null;
}

export default function MapComponent() {
  const navigate = useNavigate();
  const [allPoints, setAllPoints] = useState({}); // Stores points by region
  const [visiblePoints, setVisiblePoints] = useState([]); // Points to display
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [regions, setRegions] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userSession, setUserSession] = useState(null);
  const mapContainerRef = useRef(null);

  // Check user session on mount - prevent double execution
  useEffect(() => {
    let isMounted = true;
    
    const initializeSession = async () => {
      if (isMounted) {
        const session = await checkUserSession();
        if (isMounted) {
          setUserSession(session);
        }
      }
    };
    
    initializeSession();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch regions on mount - prevent double execution
  useEffect(() => {
    let isMounted = true;
    
    const loadRegions = async () => {
      if (isMounted) {
        try {
          setLoading(true);
          setError(null);
          const regionsData = await fetchRegions();
          
          if (isMounted) {
            setRegions(regionsData);
            
            // Auto-select first region if available
            if (regionsData.length > 0) {
              setSelectedRegions([regionsData[0]]);
            }
          }
        } catch (err) {
          if (isMounted) {
            setError("Failed to load regions");
            console.error("Error loading regions:", err);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };
    
    loadRegions();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch points when selected regions change - prevent double execution
  useEffect(() => {
    let isMounted = true;
    
    const fetchDataForRegions = async () => {
      if (!isMounted) return;
      
      if (selectedRegions.length === 0) {
        if (isMounted) {
          setVisiblePoints([]);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      
      const newPoints = { ...allPoints };
      let hasNewData = false;
      const errors = [];

      // Fetch data for newly selected regions that we don't have yet
      for (const region of selectedRegions) {
        if (!allPoints[region] && isMounted) {
          try {
            const points = await fetchPoints(region);
            if (isMounted) {
              newPoints[region] = points;
              hasNewData = true;
            }
          } catch (error) {
            if (isMounted) {
              console.error(`Error fetching data for ${region}:`, error);
              errors.push(`Failed to load data for ${region}: ${error.message}`);
            }
          }
        }
      }

      if (isMounted) {
        if (hasNewData) {
          setAllPoints(newPoints);
        }

        // Update visible points
        const pointsToShow = selectedRegions.flatMap(region => newPoints[region] || []);
        setVisiblePoints(pointsToShow);
        
        if (errors.length > 0) {
          setError(errors.join('; '));
        }
        
        setLoading(false);
      }
    };

    fetchDataForRegions();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line
  }, [selectedRegions]);

  const toggleRegion = (region) => {
    console.log("Toggling region:", region);
    setSelectedRegions(prev => 
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const refreshData = async () => {
    setAllPoints({});
    setVisiblePoints([]);
    setError(null);
    
    // Reload regions
    try {
      setLoading(true);
      const regionsData = await fetchRegions();
      setRegions(regionsData);
      
      // Keep current selections if they still exist
      const validSelections = selectedRegions.filter(region => regionsData.includes(region));
      setSelectedRegions(validSelections);
    } catch (err) {
      setError("Failed to refresh data");
      console.error("Error refreshing data:", err);
    } finally {
      setLoading(false);
    }
  };

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
            : 'h-[600px] w-[90%] block mx-auto my-[10vh] shadow-lg'
          }
        `}
      >
        <MapContainer 
          center={[9.9366, -84.0442]} 
          zoom={10} 
          className="h-full w-full relative z-[1]"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <CenterOnUser />
          <FullscreenControl fullscreen={fullscreen} handleFullscreen={handleFullscreen} />
          
          {error && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/95 px-5 py-2.5 rounded-lg shadow-lg border border-red-300 text-red-600 max-w-[80%] text-center">
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white/90 px-5 py-2.5 rounded-lg shadow-lg">
              Cargando datos...
            </div>
          )}

          {visiblePoints.map((point, idx) => {
            const lat = parseFloat(point.coord_y);
            const lng = parseFloat(point.coord_x);
            if (isNaN(lat) || isNaN(lng)) return null; // Skip invalid points
            
            const handleViewDetails = () => {
              // Navigate to point details page using React Router
              navigate(`/point-details/${encodeURIComponent(point.id)}`, {
                state: { 
                  pointData: point,
                  region: point.region 
                }
              });
            };
            
            return (
              <Marker
                key={`${point.region}-${idx}`}
                position={[lat, lng]}
              >
                <Popup maxWidth={400} minWidth={320}>
                  {/* POINT POP UP INFO */}
                  <div className="w-full max-w-[380px] min-w-0 overflow-x-hidden m-2 p-2">
                    <h4 className="mb-2 text-[16px] text-[#2c3e50] border-b-2 border-[#3498db] pb-1 font-semibold">
                      {point.id || "Punto"}
                    </h4>
                    
                    <div className="mb-2">
                      <div className="text-[12px] text-gray-500 mb-1">
                        <strong>📍 {point.region}</strong>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {lat.toFixed(4)}°, {lng.toFixed(4)}°
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 text-[11px] mb-3 p-2 bg-gray-50 rounded">
                      {/* Temperature info */}
                      <div className="text-center mb-2">
                        <div className="font-bold text-red-500">{point.temp}°C</div>
                        <div className="text-[9px] text-gray-500">Temperatura</div>
                      </div>
                      {/* Lindal Diagram info */}
                      <div className="text-center mb-2">
                        <div className="text-[10px] text-blue-700 mb-0.5">
                          Lindal: usos según temperatura
                        </div>
                        <div className="max-w-[120px] mx-auto">
                          <LindalDiagram temperature={point.temp} />
                        </div>
                        <div className="text-[9px] text-gray-500">
                          El diagrama de Lindal muestra los posibles usos del recurso geotérmico según la temperatura.
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleViewDetails}
                      className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[12px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      📊 Ver Detalles Completos
                    </button> 
                    
                    <div className="text-[9px] text-gray-300 text-center mt-1">
                      Análisis completo • Exportar PDF • Más opciones
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* SIDEBAR */}
          <div className={`
            absolute top-0 z-[1000] bg-white/90 rounded-r-lg shadow-lg transition-all duration-300 overflow-hidden
            ${sidebarOpen ? 'w-[250px] h-full' : 'w-10 h-10'}
          `}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full px-3 py-2 border-0 bg-blue-600 text-white cursor-pointer flex justify-center items-center"
            >
              {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
            </button>

            {sidebarOpen && (
              <div className="p-2.5">
                <h3 className="m-0 mb-2.5 text-gray-800 text-base flex items-center gap-2">
                  🗺️ Regiones 
                  <span className="text-xs text-gray-600 font-normal">
                    ({selectedRegions.length} seleccionadas)
                  </span>
                </h3>
                
                {regions.length === 0 && !loading && (
                  <div className="p-5 text-center text-gray-600 text-sm">
                    No se encontraron regiones disponibles
                  </div>
                )}
                
                <div className="max-h-[calc(100%-50px)] overflow-y-auto">
                  {Array.isArray(regions) && regions.map((reg) => {
                    const pointCount = allPoints[reg] ? allPoints[reg].length : 0;
                    const isSelected = selectedRegions.includes(reg);
                    
                    return (
                      <div 
                        key={reg}
                        className={`
                          flex items-center py-2 cursor-pointer rounded transition-colors duration-200
                          ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                        `}
                        onClick={e => {
                          // Only toggle if not clicking the checkbox itself
                          if (e.target.type !== "checkbox") {
                            toggleRegion(reg);
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => {
                            // Only toggle from checkbox
                            toggleRegion(reg);
                          }}
                          className="mr-2.5 cursor-pointer w-4 h-4"
                        />
                        <FaMapMarkerAlt className={`mr-2 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                        <div className="flex-1">
                          <div className={`
                            text-sm
                            ${isSelected ? 'text-blue-600 font-semibold' : 'text-gray-800 font-normal'}
                          `}>
                            {reg}
                          </div>
                          {pointCount > 0 && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {pointCount} punto{pointCount !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {selectedRegions.length > 0 && (
                    <div className="mt-4 p-2.5 bg-gray-50 rounded text-xs text-gray-600">
                      <div className="mb-2">
                        <strong>Total de puntos visibles:</strong> {visiblePoints.length}
                      </div>
                      
                      <button
                        onClick={refreshData}
                        disabled={loading}
                        className={`
                          w-full px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-600 text-xs transition-all duration-200
                          ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'}
                        `}
                      >
                        {loading ? "🔄 Actualizando..." : "🔄 Actualizar datos"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* SIDEBAR */}
        </MapContainer>
      </div>
    </div>
  );
}