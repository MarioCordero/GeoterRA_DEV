import React from 'react';

const LindalDiagram = ({ temperature }) => {
  // Lindal diagram temperature ranges and uses
  const lindalRanges = [
    { min: 200, max: 300, use: "Generación eléctrica", color: "#ff4444", icon: "⚡" },
    { min: 150, max: 200, use: "Procesos industriales", color: "#ff8800", icon: "🏭" },
    { min: 100, max: 150, use: "Calefacción urbana", color: "#ffaa00", icon: "🏘️" },
    { min: 80, max: 100, use: "Secado de madera", color: "#ffcc00", icon: "🪵" },
    { min: 60, max: 80, use: "Calefacción espacial", color: "#88cc00", icon: "🏠" },
    { min: 40, max: 60, use: "Agricultura/Invernaderos", color: "#44cc44", icon: "🌱" },
    { min: 30, max: 40, use: "Acuicultura", color: "#44ccaa", icon: "🐟" },
    { min: 20, max: 30, use: "Balnearios/Turismo", color: "#4488cc", icon: "🏊" }
  ];

  // Find applicable uses for the given temperature
  const applicableUses = lindalRanges.filter(range => 
    temperature >= range.min && temperature <= range.max
  );

  // Get the primary use (highest temperature range that applies)
  const primaryUse = applicableUses.length > 0 
    ? applicableUses.reduce((max, current) => 
        current.min > max.min ? current : max
      )
    : null;

  if (!temperature || temperature < 20) {
    return (
      <div style={{
        fontSize: "9px",
        color: "#666",
        textAlign: "center",
        padding: "4px"
      }}>
        <div>❄️</div>
        <div>Temp. muy baja</div>
        <div>No aplica Lindal</div>
      </div>
    );
  }

  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "4px",
      padding: "4px",
      backgroundColor: "#fff",
      fontSize: "9px",
      textAlign: "center"
    }}>
      {/* Temperature indicator */}
      <div style={{
        backgroundColor: primaryUse ? primaryUse.color : "#ccc",
        color: "white",
        padding: "2px 4px",
        borderRadius: "3px",
        marginBottom: "3px",
        fontSize: "8px",
        fontWeight: "bold"
      }}>
        {temperature}°C
      </div>

      {/* Primary use */}
      {primaryUse && (
        <div style={{ marginBottom: "2px" }}>
          <div style={{ fontSize: "12px" }}>{primaryUse.icon}</div>
          <div style={{ 
            color: primaryUse.color,
            fontWeight: "bold",
            fontSize: "8px",
            lineHeight: "1.1"
          }}>
            {primaryUse.use}
          </div>
        </div>
      )}

      {/* Temperature scale visualization */}
      <div style={{
        height: "20px",
        display: "flex",
        marginTop: "3px",
        border: "1px solid #eee",
        borderRadius: "2px",
        overflow: "hidden"
      }}>
        {lindalRanges.map((range, index) => {
          const isActive = temperature >= range.min;
          return (
            <div
              key={index}
              style={{
                flex: 1,
                backgroundColor: isActive ? range.color : "#f0f0f0",
                opacity: isActive ? 1 : 0.3,
                borderRight: index < lindalRanges.length - 1 ? "1px solid #fff" : "none"
              }}
              title={`${range.min}-${range.max}°C: ${range.use}`}
            />
          );
        })}
      </div>

      {/* Additional applicable uses */}
      {applicableUses.length > 1 && (
        <div style={{
          marginTop: "3px",
          fontSize: "7px",
          color: "#666",
          lineHeight: "1.2"
        }}>
          +{applicableUses.length - 1} uso{applicableUses.length > 2 ? 's' : ''} más
        </div>
      )}
    </div>
  );
};

export default LindalDiagram;