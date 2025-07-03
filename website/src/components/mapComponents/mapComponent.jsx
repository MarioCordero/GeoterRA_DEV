import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaExpand, FaCompress, FaChevronRight, FaChevronLeft, FaMapMarkerAlt } from "react-icons/fa";

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Function to fetch points for a specific region
const fetchPoints = async (region) => {
  const response = await fetch("http://geoterra.com/API/map_data.inc.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `region=${encodeURIComponent(region)}`,
  });
  const points = await response.json();
  return points;
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
  const [allPoints, setAllPoints] = useState({}); // Stores points by region
  const [visiblePoints, setVisiblePoints] = useState([]); // Points to display
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [regions, setRegions] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // Fetch regions on mount
  useEffect(() => {
    fetch("http://geoterra.com/API/get_regions.inc.php")
      .then(res => res.json())
      .then(data => {
        // Defensive: ensure regions is always an array
        setRegions(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedRegions([data[0]]);
        }
      })
      .catch(() => setRegions([]));
  }, []);

  // Fetch points when selected regions change
  useEffect(() => {
    const fetchDataForRegions = async () => {
      setLoading(true);
      const newPoints = { ...allPoints };
      let hasNewData = false;

      // Fetch data for newly selected regions that we don't have yet
      for (const region of selectedRegions) {
        if (!allPoints[region]) {
          try {
            const points = await fetchPoints(region);
            newPoints[region] = points;
            hasNewData = true;
          } catch (error) {
            console.error(`Error fetching data for ${region}:`, error);
          }
        }
      }

      if (hasNewData) {
        setAllPoints(newPoints);
      }

      // Update visible points
      const pointsToShow = selectedRegions.flatMap(region => newPoints[region] || []);
      setVisiblePoints(pointsToShow);
      setLoading(false);
    };

    if (selectedRegions.length > 0) {
      fetchDataForRegions();
    } else {
      setVisiblePoints([]);
    }
    // eslint-disable-next-line
  }, [selectedRegions]);

  const toggleRegion = (region) => {
    setSelectedRegions(prev => 
      prev.includes(region)
        ? prev.filter(r => r !== region) // Remove if already selected
        : [...prev, region] // Add if not selected
    );
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
            return (
              <Marker
                key={`${point.region}-${idx}`}
                position={[lat, lng]}
              >
                <Popup>
                  <div>
                    <strong>{point.id || "Punto"}</strong>
                    <br />
                    Región: {point.region}
                    <br />
                    X: {point.coord_x}
                    <br />
                    Y: {point.coord_y}
                    <br />
                    Temp: {point.temp}
                    <br />
                    pH: {point.pH_campo}
                    <br />
                    Cond: {point.cond_campo}
                  </div>
                </Popup>
              </Marker>
            );
          })}
          
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
                <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "16px" }}>Regiones</h3>
                <div style={{ maxHeight: "calc(100% - 50px)", overflowY: "auto" }}>
                  {Array.isArray(regions) && regions.map((reg) => (
                    <div 
                      key={reg}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "8px 0",
                        cursor: "pointer",
                        borderRadius: "4px",
                        ':hover': {
                          backgroundColor: "#f5f5f5"
                        }
                      }}
                      onClick={() => toggleRegion(reg)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRegions.includes(reg)}
                        onChange={() => toggleRegion(reg)}
                        style={{
                          marginRight: "10px",
                          cursor: "pointer",
                          width: "16px",
                          height: "16px",
                        }}
                      />
                      <FaMapMarkerAlt style={{ 
                        color: selectedRegions.includes(reg) ? "#2a5bd6" : "#666",
                        marginRight: "8px"
                      }} />
                      <span style={{ 
                        color: selectedRegions.includes(reg) ? "#2a5bd6" : "#333",
                        fontWeight: selectedRegions.includes(reg) ? "600" : "400"
                      }}>
                        {reg}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </MapContainer>
      </div>
    </div>
  );
}