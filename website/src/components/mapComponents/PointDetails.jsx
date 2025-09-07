import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaShare, FaPrint, FaMapMarkerAlt, FaFlask, FaThermometerHalf, FaFileCsv } from 'react-icons/fa';
import { generatePointPDF, exportToCSV, formatPointForSharing } from './exportUtils';
import { buildApiUrl } from '../../config/apiConf';
import PiperDiagram from './PiperDiagram';

// Function to fetch single point data (if needed to refresh or get additional data)
const fetchPointData = async (pointId, region) => {
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
    
    if (result.response === "Ok") {
      const points = result.data || [];
      return points.find(point => point.id === pointId);
    } else {
      throw new Error(result.message || "Failed to fetch point data");
    }
  } catch (error) {
    console.error(`Error fetching point data:`, error);
    throw error;
  }
};

export default function PointDetails() {
  const { pointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [pointData, setPointData] = useState(location.state?.pointData || null);
  const [loading, setLoading] = useState(!pointData);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we don't have point data from navigation state, fetch it
    if (!pointData && pointId && location.state?.region) {
      const loadPointData = async () => {
        try {
          setLoading(true);
          const data = await fetchPointData(pointId, location.state.region);
          setPointData(data);
        } catch (err) {
          setError(`Failed to load point data: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };
      
      loadPointData();
    } else if (!pointData && !location.state?.region) {
      setError("No point data available. Please navigate from the map.");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [pointId, pointData, location.state]);

  const handleExportPDF = async () => {
    try {
      await generatePointPDF(pointData);
    } catch (error) {
      alert('Error al generar PDF: ' + error.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
          <div>Cargando detalles del punto...</div>
        </div>
      </div>
    );
  }

  if (error || !pointData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#e74c3c' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h2>Error</h2>
          <p>{error || 'Point data not found'}</p>
          <button onClick={handleGoBack} style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}>
            Volver al Mapa
          </button>
        </div>
      </div>
    );
  }

  // Piper Diagram data preparation
  const piperData = pointData
    ? {
        Ca: pointData["Ca+"] || 0,
        Mg: pointData["MG+"] || 0,
        Na: pointData.Na || 0,
        K: pointData.K || 0,
        Cl: pointData.Cl || 0,
        SO4: pointData.SO4 || 0,
        HCO3: pointData.HCO3 || 0,
      }
    : null;

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #ecf0f1',
        paddingBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={handleGoBack}
            style={{
              padding: '10px',
              backgroundColor: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 style={{ margin: 0, color: '#2c3e50' }}>
              <FaMapMarkerAlt style={{ marginRight: '10px', color: '#e74c3c' }} />
              {pointData.id}
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>
              Punto geotérmico en {pointData.region}
            </p>
          </div>
        </div>
        
        {/* Button part */}
        <div style={{ display: 'flex', gap: '10px' }}>

          <button onClick={handlePrint} style={{
            padding: '10px 15px',
            backgroundColor: '#9b59b6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <FaPrint /> Imprimir
          </button>

          <button onClick={handleExportPDF} style={{
            padding: '10px 15px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <FaDownload /> Exportar PDF
          </button>

        </div>

      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Location Information */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #ecf0f1'
        }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            📍 Información de Ubicación
          </h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <strong>Región:</strong> {pointData.region}
            </div>
            <div>
              <strong>Coordenada X:</strong> {pointData.coord_x}°
            </div>
            <div>
              <strong>Coordenada Y:</strong> {pointData.coord_y}°
            </div>
            <div style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '5px',
              fontSize: '14px',
              color: '#6c757d'
            }}>
              <strong>Ubicación exacta:</strong><br />
              Latitud: {parseFloat(pointData.coord_y).toFixed(6)}°<br />
              Longitud: {parseFloat(pointData.coord_x).toFixed(6)}°
            </div>
          </div>
        </div>

        {/* Field Measurements */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #ecf0f1'
        }}>
          <h2 style={{ color: '#27ae60', marginBottom: '20px' }}>
            <FaThermometerHalf style={{ marginRight: '10px' }} />
            Medidas de Campo
          </h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
              backgroundColor: '#fff5f5',
              borderRadius: '5px',
              border: '1px solid #fed7d7'
            }}>
              <strong>Temperatura:</strong>
              <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>{pointData.temp}°C</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
              backgroundColor: '#f0fff4',
              borderRadius: '5px',
              border: '1px solid #c6f6d5'
            }}>
              <strong>pH Campo:</strong>
              <span style={{ color: '#38a169', fontWeight: 'bold' }}>{pointData.pH_campo}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
              backgroundColor: '#f0f8ff',
              borderRadius: '5px',
              border: '1px solid #bee3f8'
            }}>
              <strong>Conductividad Campo:</strong>
              <span style={{ color: '#3182ce', fontWeight: 'bold' }}>{pointData.cond_campo} μS/cm</span>
            </div>
          </div>
        </div>

        {/* Laboratory Analysis */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          border: '1px solid #ecf0f1',
          gridColumn: 'span 2'
        }}>
          <h2 style={{ color: '#8e44ad', marginBottom: '20px' }}>
            <FaFlask style={{ marginRight: '10px' }} />
            Análisis de Laboratorio
          </h2>
          
          {/* Basic Lab Parameters */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#6c757d', marginBottom: '15px' }}>Parámetros Básicos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <strong>pH Laboratorio:</strong> {pointData.pH_lab}
              </div>
              <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <strong>Conductividad Lab:</strong> {pointData.cond_lab} μS/cm
              </div>
            </div>
          </div>

          {/* Major Ions */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#6c757d', marginBottom: '15px' }}>Iones Principales (mg/L)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>{pointData.Cl}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>Cl⁻</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>{pointData["Ca+"]}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>Ca²⁺</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>{pointData.HCO3}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>HCO₃⁻</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>{pointData.SO4}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>SO₄²⁻</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>{pointData.Na}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>Na⁺</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>{pointData.K}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>K⁺</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>{pointData["MG+"]}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>Mg²⁺</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>{pointData.Si}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>Si</div>
              </div>
            </div>
          </div>

          {/* Trace Elements */}
          <div>
            <h3 style={{ color: '#6c757d', marginBottom: '15px' }}>Elementos Traza (mg/L)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '10px', backgroundColor: '#fff5e6', borderRadius: '5px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fd7e14' }}>{pointData.Fe}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>Fe</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#fff5e6', borderRadius: '5px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fd7e14' }}>{pointData.B}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>B</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#fff5e6', borderRadius: '5px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fd7e14' }}>{pointData.Li}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>Li</div>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#fff5e6', borderRadius: '5px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fd7e14' }}>{pointData.F}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>F⁻</div>
              </div>
            </div>
          </div>
        </div>

        {/* Piper Diagram */}
        <div
          style={{
            marginTop: "30px",
            marginBottom: "30px",
            padding: "25px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            border: "1px solid #ecf0f1",
            width: "100%",
            height: "100%", // or any fixed height you want for the diagram area
            minHeight: "320px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gridColumn: 'span 2'
          }}
        >
          <h2 style={{ color: "#2980b9", marginBottom: "20px" }}>
            📊 Diagrama de Piper
          </h2>
          <div style={{ flex: 1, width: "100%", height: "100%" }}>
            {piperData ? (
              <PiperDiagram data={piperData} />
            ) : (
              <div style={{ color: "#888" }}>
                No hay datos suficientes para mostrar el diagrama de Piper.
              </div>
            )}
          </div>
          <div style={{ fontSize: "13px", color: "#888", marginTop: "10px" }}>
            El diagrama de Piper permite visualizar la composición iónica principal del agua.
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        textAlign: 'center',
        color: '#6c757d',
        fontSize: '14px'
      }}>
        <p>Datos geotérmicos del proyecto GeoterRA</p>
        <p>Para más información o reportar errores, contacte al equipo técnico.</p>
      </div>
    </div>
  );
}