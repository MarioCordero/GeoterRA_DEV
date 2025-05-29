// REMEMBER: This code requires the Leaflet and React-Leaflet libraries to be installed in your project.
// npm install leaflet react-leaflet
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon issue with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

const fetchPoints = async (region = "Guanacaste") => {
  // Adjust the API endpoint as needed
  const response = await fetch("/API/map_data.inc.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `region=${encodeURIComponent(region)}`,
  });
  const text = await response.text();
  // Parse multiple JSON objects from the response
  const points = [];
  const regex = /{[^}]+}/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      points.push(JSON.parse(match[0] + "}"));
    } catch (e) {}
  }
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
        (error) => {
          alert("No se pudo obtener la ubicación.");
        }
      );
    }
  }, [map]);
  return null;
}

export default function MapComponent() {
  const [points, setPoints] = useState([]);
  const [region, setRegion] = useState("Guanacaste");

  useEffect(() => {
    fetchPoints(region).then(setPoints);
  }, [region]);

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <button onClick={() => setRegion("Guanacaste")}>Guanacaste</button>
      <button onClick={() => setRegion("Cartago")}>Cartago</button>
      <MapContainer center={[9.9366, -84.0442]} zoom={10} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <CenterOnUser />
        {points.map((point, idx) => (
          <Marker
            key={idx}
            position={[parseFloat(point.coord_y), parseFloat(point.coord_x)]}
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
        ))}
      </MapContainer>
    </div>
  );
}