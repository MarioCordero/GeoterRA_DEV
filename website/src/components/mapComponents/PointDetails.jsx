import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaShare, FaPrint, FaMapMarkerAlt, FaFlask, FaThermometerHalf, FaFileCsv } from 'react-icons/fa';
import { buildApiUrl } from '../../config/apiConf';
import PiperDiagram from './PiperDiagram';
import '../../colorModule.css';
import '../../fontsModule.css';

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

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-3xl mb-4">🔄</div>
          <div className="text-lg">Cargando detalles del punto...</div>
        </div>
      </div>
    );
  }

  if (error || !pointData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-500">
          <div className="text-5xl mb-5">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Point data not found'}</p>
          <button 
            onClick={handleGoBack}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
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
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-6 mb-8 pb-6 border-b-2 border-gray-200">
        <div className="flex items-start gap-4">
          <button 
            onClick={handleGoBack}
            className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition"
          >
            <FaArrowLeft />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FaMapMarkerAlt className="text-red-500 text-xl" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {pointData.id}
              </h1>
            </div>
            <p className="text-gray-500">
              Punto geotérmico en {pointData.region}
            </p>
          </div>
        </div>
        
        {/* Buttons */}
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition w-full md:w-auto justify-center md:justify-start"
        >
          <FaPrint /> Imprimir / Exportar PDF
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Location Information */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📍 Información de Ubicación
          </h2>
          <div className="space-y-4">
            <div>
              <strong className="text-gray-700">Región:</strong>
              <p className="text-gray-600">{pointData.region}</p>
            </div>
            <div>
              <strong className="text-gray-700">Coordenada X:</strong>
              <p className="text-gray-600">{pointData.coord_x}°</p>
            </div>
            <div>
              <strong className="text-gray-700">Coordenada Y:</strong>
              <p className="text-gray-600">{pointData.coord_y}°</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
              <strong className="text-gray-700">Ubicación exacta:</strong><br />
              Latitud: {parseFloat(pointData.coord_y).toFixed(6)}°<br />
              Longitud: {parseFloat(pointData.coord_x).toFixed(6)}°
            </div>
          </div>
        </div>

        {/* Field Measurements */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-green-600 mb-4">
            <FaThermometerHalf className="inline mr-2" />
            Medidas de Campo
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
              <strong className="text-gray-700">Temperatura:</strong>
              <span className="font-bold text-red-600">{pointData.temp}°C</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <strong className="text-gray-700">pH Campo:</strong>
              <span className="font-bold text-green-600">{pointData.pH_campo}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <strong className="text-gray-700">Conductividad:</strong>
              <span className="font-bold text-blue-600">{pointData.cond_campo} μS/cm</span>
            </div>
          </div>
        </div>

        {/* Laboratory Analysis */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-purple-600 mb-4">
            <FaFlask className="inline mr-2" />
            Análisis de Laboratorio
          </h2>
          
          {/* Basic Lab Parameters */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Parámetros Básicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <strong className="text-gray-700">pH Laboratorio:</strong> {pointData.pH_lab}
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <strong className="text-gray-700">Conductividad Lab:</strong> {pointData.cond_lab} μS/cm
              </div>
            </div>
          </div>

          {/* Major Ions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Iones Principales (mg/L)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-green-100 rounded-lg text-center border border-green-300">
                <div className="text-xl font-bold text-green-600">{pointData.Cl}</div>
                <div className="text-xs text-gray-600">Cl⁻</div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg text-center border border-green-300">
                <div className="text-xl font-bold text-green-600">{pointData["Ca+"]}</div>
                <div className="text-xs text-gray-600">Ca²⁺</div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg text-center border border-green-300">
                <div className="text-xl font-bold text-green-600">{pointData.HCO3}</div>
                <div className="text-xs text-gray-600">HCO₃⁻</div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg text-center border border-green-300">
                <div className="text-xl font-bold text-green-600">{pointData.SO4}</div>
                <div className="text-xs text-gray-600">SO₄²⁻</div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg text-center border border-green-300">
                <div className="text-xl font-bold text-green-600">{pointData.Na}</div>
                <div className="text-xs text-gray-600">Na⁺</div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg text-center border border-green-300">
                <div className="text-xl font-bold text-green-600">{pointData.K}</div>
                <div className="text-xs text-gray-600">K⁺</div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg text-center border border-green-300">
                <div className="text-xl font-bold text-green-600">{pointData["MG+"]}</div>
                <div className="text-xs text-gray-600">Mg²⁺</div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg text-center border border-green-300">
                <div className="text-xl font-bold text-green-600">{pointData.Si}</div>
                <div className="text-xs text-gray-600">Si</div>
              </div>
            </div>
          </div>

          {/* Trace Elements */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Elementos Traza (mg/L)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg text-center border border-yellow-300">
                <div className="text-lg font-bold text-yellow-600">{pointData.Fe}</div>
                <div className="text-xs text-gray-600">Fe</div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg text-center border border-yellow-300">
                <div className="text-lg font-bold text-yellow-600">{pointData.B}</div>
                <div className="text-xs text-gray-600">B</div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg text-center border border-yellow-300">
                <div className="text-lg font-bold text-yellow-600">{pointData.Li}</div>
                <div className="text-xs text-gray-600">Li</div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg text-center border border-yellow-300">
                <div className="text-lg font-bold text-yellow-600">{pointData.F}</div>
                <div className="text-xs text-gray-600">F⁻</div>
              </div>
            </div>
          </div>
        </div>

        {/* Piper Diagram */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-blue-600 mb-4">
            📊 Diagrama de Piper
          </h2>
          <div className="min-h-96 flex items-center justify-center">
            {piperData ? (
              <PiperDiagram data={piperData} />
            ) : (
              <div className="text-gray-400">
                No hay datos suficientes para mostrar el diagrama de Piper.
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-4">
            El diagrama de Piper permite visualizar la composición iónica principal del agua.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 p-6 bg-gray-100 rounded-lg text-center text-gray-600 text-sm">
        <p className="mb-2">Datos geotérmicos del proyecto GeoterRA</p>
        <p>Para más información o reportar errores, contacte al equipo técnico.</p>
      </div>
    </div>
  );
}