import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaExpand, FaCompress, FaChevronRight, FaChevronLeft, FaMapMarkerAlt } from "react-icons/fa";
import { buildApiUrl } from '../../config/apiConf';


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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.setView([position.coords.latitude, position.coords.longitude], 17);
          L.marker([position.coords.latitude, position.coords.longitude])
            .addTo(map)
            .bindPopup("Ubicación actual")
            .openPopup();
        },
        () => {
          alert("No se pudo obtener la ubicación.");
        }
      );
    }
  }, [map]);
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

  // Check user session on mount
  useEffect(() => {
    const initializeSession = async () => {
      const session = await checkUserSession();
      setUserSession(session);
    };
    initializeSession();
  }, []);

  // Fetch regions on mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        setLoading(true);
        setError(null);
        const regionsData = await fetchRegions();
        setRegions(regionsData);
        
        // Auto-select first region if available
        if (regionsData.length > 0) {
          setSelectedRegions([regionsData[0]]);
        }
      } catch (err) {
        setError("Failed to load regions");
        console.error("Error loading regions:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadRegions();
  }, []);

  // Fetch points when selected regions change
  useEffect(() => {
    const fetchDataForRegions = async () => {
      if (selectedRegions.length === 0) {
        setVisiblePoints([]);
        return;
      }

      setLoading(true);
      setError(null);
      const newPoints = { ...allPoints };
      let hasNewData = false;
      const errors = [];

      // Fetch data for newly selected regions that we don't have yet
      for (const region of selectedRegions) {
        if (!allPoints[region]) {
          try {
            const points = await fetchPoints(region);
            newPoints[region] = points;
            hasNewData = true;
          } catch (error) {
            console.error(`Error fetching data for ${region}:`, error);
            errors.push(`Failed to load data for ${region}: ${error.message}`);
          }
        }
      }

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
    };

    fetchDataForRegions();
    // eslint-disable-next-line
  }, [selectedRegions]);

  const toggleRegion = (region) => {
    setSelectedRegions(prev => 
      prev.includes(region)
        ? prev.filter(r => r !== region) // Remove if already selected
        : [...prev, region] // Add if not selected
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

  const mapStyle = fullscreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        marginTop: 0,
      }
    : {
        height: "600px",
        width: "90%",
        display: "block",
        margin: "10svh auto",
        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
      };

  return (
    <div>
      <div style={mapStyle}>
        <MapContainer 
          center={[9.9366, -84.0442]} 
          zoom={10} 
          style={{ height: "100%", width: "100%", position: "relative", zIndex: 1 }} 
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <CenterOnUser />
          
          {error && (
            <div style={{
              position: "absolute",
              top: "80px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              backgroundColor: "rgba(255,255,255,0.95)",
              padding: "10px 20px",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              border: "1px solid #ff6b6b",
              color: "#d63031",
              maxWidth: "80%",
              textAlign: "center",
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              backgroundColor: "rgba(255,255,255,0.9)",
              padding: "10px 20px",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}>
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
                <Popup maxWidth={280}>
                  <div style={{ minWidth: "200px" }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "4px", fontSize: "16px" }}>
                      {point.id || "Punto"}
                    </h4>
                    
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ fontSize: "12px", color: "#7f8c8d", marginBottom: "4px" }}>
                        <strong>📍 {point.region}</strong>
                      </div>
                      <div style={{ fontSize: "11px", color: "#95a5a6" }}>
                        {lat.toFixed(4)}°, {lng.toFixed(4)}°
                      </div>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", fontSize: "11px", marginBottom: "12px", padding: "8px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: "bold", color: "#e74c3c" }}>{point.temp}°C</div>
                        <div style={{ fontSize: "9px", color: "#7f8c8d" }}>Temperatura</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: "bold", color: "#27ae60" }}>{point.pH_campo}</div>
                        <div style={{ fontSize: "9px", color: "#7f8c8d" }}>pH Campo</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: "bold", color: "#3498db" }}>{point.cond_campo}</div>
                        <div style={{ fontSize: "9px", color: "#7f8c8d" }}>Conductividad</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleViewDetails}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        backgroundColor: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "background-color 0.2s ease"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "#2980b9"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "#3498db"}
                    >
                      📊 Ver Detalles Completos
                    </button>
                    
                    <div style={{ fontSize: "9px", color: "#bdc3c7", textAlign: "center", marginTop: "4px" }}>
                      Análisis completo • Exportar PDF • Más opciones
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
          {/* User session indicator at top left corner */}
          {userSession && (
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: sidebarOpen ? "290px" : "60px",
                zIndex: 1000,
                backgroundColor: userSession.status === 'logged_in' ? "rgba(46, 204, 113, 0.9)" : "rgba(231, 76, 60, 0.9)",
                borderRadius: "20px",
                padding: "8px 16px",
                color: "white",
                fontSize: "12px",
                fontWeight: "500",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                transition: "all 0.3s ease",
              }}
            >
              {userSession.status === 'logged_in' ? `👤 ${userSession.user}` : '🔒 No autenticado'}
            </div>
          )}

          {/* Fullscreen button at top right */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              zIndex: 1000,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            <button 
              onClick={() => setFullscreen((f) => !f)}
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#4a7dff",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              {fullscreen ? <><FaCompress /> Salir de pantalla completa</> : <><FaExpand /> Pantalla completa</>}
            </button>
          </div>

          {/* Regions sidebar with checkboxes */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: sidebarOpen ? "20px" : "0",
              zIndex: 1000,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease",
              overflow: "hidden",
              width: sidebarOpen ? "250px" : "40px",
              height: sidebarOpen ? "calc(100% - 40px)" : "40px",
            }}
          >
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: "8px 12px",
                border: "none",
                backgroundColor: "#4a7dff",
                color: "white",
                cursor: "pointer",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
            </button>

            {sidebarOpen && (
              <div style={{ padding: "10px" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  🗺️ Regiones 
                  <span style={{ fontSize: "12px", color: "#666", fontWeight: "normal" }}>
                    ({selectedRegions.length} seleccionadas)
                  </span>
                </h3>
                
                {regions.length === 0 && !loading && (
                  <div style={{ 
                    padding: "20px", 
                    textAlign: "center", 
                    color: "#666",
                    fontSize: "14px"
                  }}>
                    No se encontraron regiones disponibles
                  </div>
                )}
                
                <div style={{ maxHeight: "calc(100% - 50px)", overflowY: "auto" }}>
                  {Array.isArray(regions) && regions.map((reg) => {
                    const pointCount = allPoints[reg] ? allPoints[reg].length : 0;
                    const isSelected = selectedRegions.includes(reg);
                    
                    return (
                      <div 
                        key={reg}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "8px 0",
                          cursor: "pointer",
                          borderRadius: "4px",
                          backgroundColor: isSelected ? "#f0f8ff" : "transparent",
                          transition: "background-color 0.2s ease",
                        }}
                        onClick={() => toggleRegion(reg)}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.target.style.backgroundColor = "#f5f5f5";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.target.style.backgroundColor = "transparent";
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRegion(reg)}
                          style={{
                            marginRight: "10px",
                            cursor: "pointer",
                            width: "16px",
                            height: "16px",
                          }}
                        />
                        <FaMapMarkerAlt style={{ 
                          color: isSelected ? "#2a5bd6" : "#666",
                          marginRight: "8px"
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            color: isSelected ? "#2a5bd6" : "#333",
                            fontWeight: isSelected ? "600" : "400",
                            fontSize: "14px"
                          }}>
                            {reg}
                          </div>
                          {pointCount > 0 && (
                            <div style={{ 
                              fontSize: "11px", 
                              color: "#888",
                              marginTop: "2px"
                            }}>
                              {pointCount} punto{pointCount !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {selectedRegions.length > 0 && (
                    <div style={{
                      marginTop: "15px",
                      padding: "10px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#666"
                    }}>
                      <div style={{ marginBottom: "8px" }}>
                        <strong>Total de puntos visibles:</strong> {visiblePoints.length}
                      </div>
                      
                      <button
                        onClick={refreshData}
                        disabled={loading}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "4px",
                          border: "1px solid #ddd",
                          backgroundColor: "#fff",
                          color: "#666",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontSize: "11px",
                          width: "100%",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.target.style.backgroundColor = "#f0f0f0";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.backgroundColor = "#fff";
                          }
                        }}
                      >
                        {loading ? "🔄 Actualizando..." : "🔄 Actualizar datos"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </MapContainer>
      </div>
    </div>
  );
}