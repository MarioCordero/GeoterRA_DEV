import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaPrint, 
  FaMapMarkerAlt, 
  FaFlask, 
  FaThermometerHalf, 
  FaInfoCircle, 
  FaExclamationTriangle
} from 'react-icons/fa';
import PiperDiagram from './PiperDiagram';
import LindalDiagram from './LindalDiagram';
import { geomanifestationsShow, registeredManifestationsShow } from '../../config/apiConf';

/**
 * Utility function to transform API response into normalized component data structure.
 * Handles nested objects (insitu_test, inlab_test, location) as well as flat fallback structures.
 */
const transformManifestationData = (apiData, fallbackRegionName = 'Región desconocida') => {
  if (!apiData) return null;

  const toFloat = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const locationObj = apiData.location || {};
  const insitu = apiData.insitu_test || {};
  const inlab = apiData.inlab_test || {};

  const lat = apiData.latitude ?? locationObj.latitude ?? 0;
  const lng = apiData.longitude ?? locationObj.longitude ?? 0;

  const temp = apiData.temperature ?? insitu.temperature ?? 0;
  const fieldPH = apiData.field_pH ?? insitu.ph ?? 0;
  const fieldCond = apiData.field_conductivity ?? insitu.conductivity ?? 0;

  const labPH = apiData.lab_pH ?? inlab.ph ?? 0;
  const labCond = apiData.lab_conductivity ?? inlab.conductivity ?? 0;

  // Major Ions (mg/L)
  const cl = apiData.cl ?? inlab.cl ?? 0;
  const ca = apiData.ca ?? inlab.ca ?? 0;
  const hco3 = apiData.hco3 ?? inlab.hco3 ?? 0;
  const so4 = apiData.so4 ?? inlab.so4 ?? 0;
  const na = apiData.na ?? inlab.na ?? 0;
  const k = apiData.k ?? inlab.k ?? 0;
  const mg = apiData.mg ?? inlab.mg ?? 0;
  const si = apiData.si ?? inlab.si ?? 0;

  // Trace Elements
  const fe = apiData.fe ?? inlab.fe ?? 0;
  const b = apiData.b ?? inlab.b ?? 0;
  const li = apiData.li ?? inlab.li ?? 0;
  const f = apiData.f ?? inlab.f ?? 0;

  const province = locationObj.province || apiData.province || '';
  const canton = locationObj.canton || apiData.canton || '';
  const district = locationObj.district || apiData.district || '';

  const locationText = [province, canton, district].filter(Boolean).join(', ') || fallbackRegionName;

  const id = apiData.geomanifestation_id || apiData.id;
  const name = apiData.geomanifestation_name || apiData.name || `Punto ${id}`;

  const hasInsituTest = Boolean(apiData.insitu_test || toFloat(temp) > 0 || toFloat(fieldPH) > 0 || toFloat(fieldCond) > 0);
  const ionsSum = toFloat(cl) + toFloat(hco3) + toFloat(so4) + toFloat(ca) + toFloat(mg) + toFloat(na) + toFloat(k);
  const hasInlabTest = Boolean(apiData.inlab_test || ionsSum > 0 || toFloat(labPH) > 0 || toFloat(labCond) > 0);

  return {
    id,
    geomanifestation_id: id,
    name,
    description: apiData.description,
    region: locationText,
    province,
    canton,
    district,

    coord_x: String(lng),
    coord_y: String(lat),
    latitude: String(lat),
    longitude: String(lng),

    // Presence & Validation Flags
    hasInsituTest,
    hasInlabTest,
    ionsSum,

    // In Situ (Field Measurements)
    temp: toFloat(temp),
    temperature: toFloat(temp),
    pH_campo: toFloat(fieldPH),
    field_pH: toFloat(fieldPH),
    cond_campo: toFloat(fieldCond),
    field_conductivity: toFloat(fieldCond),

    // Laboratory
    pH_lab: toFloat(labPH),
    lab_pH: toFloat(labPH),
    cond_lab: toFloat(labCond),
    lab_conductivity: toFloat(labCond),

    // Major Ions (mg/L)
    Cl: toFloat(cl),
    cl: toFloat(cl),
    "Ca+": toFloat(ca),
    Ca: toFloat(ca),
    ca: toFloat(ca),
    HCO3: toFloat(hco3),
    hco3: toFloat(hco3),
    SO4: toFloat(so4),
    so4: toFloat(so4),
    Na: toFloat(na),
    na: toFloat(na),
    K: toFloat(k),
    k: toFloat(k),
    "MG+": toFloat(mg),
    Mg: toFloat(mg),
    mg: toFloat(mg),
    Si: toFloat(si),
    si: toFloat(si),

    // Trace Elements
    Fe: toFloat(fe),
    fe: toFloat(fe),
    B: toFloat(b),
    b: toFloat(b),
    Li: toFloat(li),
    li: toFloat(li),
    F: toFloat(f),
    f: toFloat(f),

    created_at: apiData.created_at,
    current_georeport: apiData.current_georeport,
    insitu_test: apiData.insitu_test,
    inlab_test: apiData.inlab_test
  };
};

// Function to fetch single point data
const fetchPointData = async (pointId) => {
  try {
    // 1. Try geomanifestationsShow endpoint first
    const geoResult = await geomanifestationsShow(pointId);
    if (geoResult.ok && geoResult.data) {
      const dataObj = geoResult.data.data || geoResult.data;
      return transformManifestationData(dataObj);
    }

    // 2. Fallback to registeredManifestationsShow
    const regResult = await registeredManifestationsShow(pointId);
    if (regResult.ok && regResult.data) {
      const dataObj = regResult.data.data || regResult.data;
      return transformManifestationData(dataObj);
    }

    throw new Error('No se encontraron datos para la geomanifestación solicitada.');
  } catch (error) {
    console.error(`Error al obtener los datos del punto:`, error);
    throw error;
  }
};

export default function PointDetails() {
  const { pointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Transform navigation state data if it exists
  const navStateData = useMemo(() => {
    return location.state?.pointData
      ? transformManifestationData(location.state.pointData, location.state?.region || 'Costa Rica')
      : null;
  }, [location.state]);

  const [pointData, setPointData] = useState(navStateData || null);
  const [loading, setLoading] = useState(!navStateData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navStateData && pointId) {
      const loadPointData = async () => {
        try {
          setLoading(true);
          const data = await fetchPointData(pointId);
          setPointData(data);
        } catch (err) {
          setError(err.message || 'Error al cargar datos del punto.');
        } finally {
          setLoading(false);
        }
      };

      loadPointData();
    } else if (navStateData) {
      setLoading(false);
    } else if (!navStateData && !pointId) {
      setError("No hay datos de manifestación seleccionados. Por favor selecciona un punto desde el mapa.");
      setLoading(false);
    }
  }, [pointId, navStateData]);

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Rule 2: In-Situ condition (insitu_tests exists AND temperature > 0)
  const isInsituValid = useMemo(() => {
    if (!pointData) return false;
    return Boolean(pointData.hasInsituTest && pointData.temp > 0);
  }, [pointData]);

  // Rule 3: Chemical inlab condition (inlab_tests exists AND sum of major ions > 0)
  const isInlabValid = useMemo(() => {
    if (!pointData) return false;
    return Boolean(pointData.hasInlabTest && pointData.ionsSum > 0);
  }, [pointData]);

  // Prepared data for Piper Diagram (only populated if isInlabValid is true)
  const piperData = useMemo(() => {
    if (!isInlabValid || !pointData) return null;
    return {
      Ca: pointData.Ca || 0,
      Mg: pointData.Mg || 0,
      Na: pointData.Na || 0,
      K: pointData.K || 0,
      Cl: pointData.Cl || 0,
      SO4: pointData.SO4 || 0,
      HCO3: pointData.HCO3 || 0,
    };
  }, [isInlabValid, pointData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100 max-w-md">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-700">Cargando ficha técnica de la geomanifestación...</div>
          <p className="text-xs text-gray-400 mt-2">Consultando parámetros in-situ y análisis de laboratorio...</p>
        </div>
      </div>
    );
  }

  if (error || !pointData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg border border-red-100">
          <div className="text-5xl text-red-500 mb-4 flex justify-center">
            <FaExclamationTriangle />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error de Carga</h2>
          <p className="text-gray-600 text-sm mb-6">{error || 'No fue posible encontrar la información del punto especificado.'}</p>
          <button 
            onClick={handleGoBack}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            <FaArrowLeft /> Volver al Mapa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 poppins">
      {/* Rule 1: Header & General Info (Always Visible) */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-6 mb-8 pb-6 border-b-2 border-gray-200">
        <div className="flex items-start gap-4">
          <button 
            onClick={handleGoBack}
            className="p-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition cursor-pointer shadow-sm mt-1"
            title="Volver"
          >
            <FaArrowLeft />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <FaMapMarkerAlt className="text-red-500 text-2xl shrink-0" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 m-0">
                {pointData.name}
              </h1>
            </div>
            <p className="text-gray-500 text-sm m-0">
              📍 {pointData.region} • ID: <span className="font-mono text-gray-700 font-semibold">{pointData.id}</span>
            </p>
            {pointData.description && (
              <p className="text-gray-600 text-sm mt-2 italic bg-gray-50 p-2.5 rounded-md border border-gray-100">
                "{pointData.description}"
              </p>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold text-sm cursor-pointer shadow-sm w-full md:w-auto justify-center shrink-0"
        >
          <FaPrint /> Imprimir / Exportar PDF
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Rule 1: Location Information (Always Visible) */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📍 Información General y Ubicación
          </h2>
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <strong className="text-gray-700 block mb-1">Ubicación Territorial:</strong>
              <p className="text-gray-800 font-medium m-0">{pointData.region}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <strong className="text-gray-700 block mb-1">Coordenadas GPS:</strong>
              <p className="text-gray-800 font-mono m-0">
                Lat: {parseFloat(pointData.latitude).toFixed(6)}° | Lng: {parseFloat(pointData.longitude).toFixed(6)}°
              </p>
            </div>
            {pointData.created_at && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <strong className="text-gray-700 block mb-1">Fecha de Registro:</strong>
                <p className="text-gray-800 m-0">{pointData.created_at}</p>
              </div>
            )}
          </div>
        </div>

        {/* Rule 2: In-Situ Section & Lindal Diagram (Graceful Degradation) */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
            <FaThermometerHalf /> Medidas de Campo e In-Situ
          </h2>

          {isInsituValid ? (
            <>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <strong className="text-gray-700">Temperatura In-Situ:</strong>
                  <span className="font-bold text-red-600 text-lg">{pointData.temp}°C</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <strong className="text-gray-700">pH Campo:</strong>
                  <span className="font-bold text-green-600">{pointData.pH_campo || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <strong className="text-gray-700">Conductividad Campo:</strong>
                  <span className="font-bold text-blue-600">{pointData.cond_campo || 'N/A'} μS/cm</span>
                </div>
              </div>

              {/* Lindal Classification Diagram */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Diagrama de Lindal (Usos directos según temperatura)
                </h3>
                <LindalDiagram temperature={pointData.temp} />
              </div>
            </>
          ) : (
            <div className="p-6 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-base">
                <FaInfoCircle className="text-amber-600 text-xl shrink-0" />
                <span>Temperatura pendiente de medición</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed m-0">
                No existen registros de mediciones in-situ ni temperatura válida (&gt; 0°C) para esta manifestación geotérmica. El diagrama de Lindal se mantiene oculto hasta contar con datos térmicos de campo.
              </p>
            </div>
          )}
        </div>

        {/* Rule 3: Chemical Section & Piper Diagram (Graceful Degradation) */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">
            <FaFlask /> Análisis Fisicoquímico de Laboratorio
          </h2>

          {isInlabValid ? (
            <>
              {/* Basic Lab Parameters */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">Parámetros Básicos de Laboratorio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <strong className="text-gray-700">pH Laboratorio:</strong> {pointData.pH_lab || 'N/A'}
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <strong className="text-gray-700">Conductividad Lab:</strong> {pointData.cond_lab || 'N/A'} μS/cm
                  </div>
                </div>
              </div>

              {/* Major Ions Grid */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">Iones Principales (mg/L)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg text-center border border-green-300">
                    <div className="text-xl font-bold text-green-700">{pointData.Cl}</div>
                    <div className="text-xs text-gray-600 font-medium">Cl⁻</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center border border-green-300">
                    <div className="text-xl font-bold text-green-700">{pointData.Ca}</div>
                    <div className="text-xs text-gray-600 font-medium">Ca²⁺</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center border border-green-300">
                    <div className="text-xl font-bold text-green-700">{pointData.HCO3}</div>
                    <div className="text-xs text-gray-600 font-medium">HCO₃⁻</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center border border-green-300">
                    <div className="text-xl font-bold text-green-700">{pointData.SO4}</div>
                    <div className="text-xs text-gray-600 font-medium">SO₄²⁻</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center border border-green-300">
                    <div className="text-xl font-bold text-green-700">{pointData.Na}</div>
                    <div className="text-xs text-gray-600 font-medium">Na⁺</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center border border-green-300">
                    <div className="text-xl font-bold text-green-700">{pointData.K}</div>
                    <div className="text-xs text-gray-600 font-medium">K⁺</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center border border-green-300">
                    <div className="text-xl font-bold text-green-700">{pointData.Mg}</div>
                    <div className="text-xs text-gray-600 font-medium">Mg²⁺</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center border border-green-300">
                    <div className="text-xl font-bold text-green-700">{pointData.Si}</div>
                    <div className="text-xs text-gray-600 font-medium">Si</div>
                  </div>
                </div>
              </div>

              {/* Trace Elements */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">Elementos Traza (mg/L)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-yellow-50 rounded-lg text-center border border-yellow-300">
                    <div className="text-lg font-bold text-yellow-700">{pointData.Fe}</div>
                    <div className="text-xs text-gray-600 font-medium">Fe</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg text-center border border-yellow-300">
                    <div className="text-lg font-bold text-yellow-700">{pointData.B}</div>
                    <div className="text-xs text-gray-600 font-medium">B</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg text-center border border-yellow-300">
                    <div className="text-lg font-bold text-yellow-700">{pointData.Li}</div>
                    <div className="text-xs text-gray-600 font-medium">Li</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg text-center border border-yellow-300">
                    <div className="text-lg font-bold text-yellow-700">{pointData.F}</div>
                    <div className="text-xs text-gray-600 font-medium">F⁻</div>
                  </div>
                </div>
              </div>

              {/* Piper Diagram Component */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                  📊 Diagrama de Piper (Clasificación Hidrogeoquímica)
                </h3>
                <div className="min-h-96 flex items-center justify-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                  {piperData ? (
                    <PiperDiagram data={piperData} />
                  ) : (
                    <div className="text-gray-400 text-sm">
                      No hay concentraciones iónicas suficientes para construir el ternario de Piper.
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  El diagrama hidroquímico de Piper representa la proporción relativa de aniones y cationes principales para determinar las facies de agua geotermal.
                </p>
              </div>
            </>
          ) : (
            <div className="p-8 bg-purple-50 rounded-xl border border-purple-200 text-center text-purple-900 space-y-3">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                <FaFlask />
              </div>
              <h3 className="text-lg font-bold text-purple-800 m-0">
                Análisis químico de fluidos no disponible o no aplicable
              </h3>
              <p className="text-sm text-purple-700 max-w-xl mx-auto leading-relaxed m-0">
                Esta manifestación no cuenta con muestra o estudio hidrogeoquímico registrado (ej. emanación gaseosa de fumarola seca sin fase líquida condensada o análisis de laboratorio pendiente). El diagrama de Piper se omite para prevenir distorsiones analíticas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 p-6 bg-gray-100 rounded-xl text-center text-gray-600 text-sm border border-gray-200">
        <p className="mb-1 font-semibold text-gray-700">Sistema GeoterRA - Ficha Técnica de Geomanifestaciones</p>
        <p className="m-0 text-xs text-gray-500">
          Información oficial según catálogo del Instituto Geográfico Nacional (IGN) y SNIT Costa Rica.
        </p>
      </div>
    </div>
  );
}