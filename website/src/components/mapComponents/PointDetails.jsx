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
import { geomanifestationsShow } from '../../config/apiConf';
import { useSession } from '../../hooks/useSession';

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
  const name = apiData.geomanifestation_name || apiData.name || 'Punto Geotermal';

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
    const geoResult = await geomanifestationsShow(pointId);
    if (geoResult.ok && geoResult.data) {
      const dataObj = geoResult.data.data || geoResult.data;
      return transformManifestationData(dataObj);
    }

    throw new Error('No se encontraron datos para la geomanifestación solicitada.');
  } catch (error) {
    console.error(`Error al obtener los datos del punto:`, error);
    throw error;
  }
};

export default function PointDetails() {
  const { user } = useSession();
  const isMaintenance = user?.role === 'maintenance';
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
    <div className="max-w-7xl mx-auto p-4 md:p-6 poppins print:max-w-full print:p-0 print:m-0">
      {/* Institutional Header (Print Only) */}
      <div className="hidden print:flex items-center justify-between pb-3 mb-4 border-b-2 border-[#12467E]">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-xl font-bold tracking-tight text-[#12467E] uppercase leading-none">
              Geoter<span className="text-[#F39C29]">RA</span>
            </div>
            <div className="text-[10px] text-slate-600 font-medium tracking-wide mt-1">
              Universidad de Costa Rica • Instituto de Investigaciones en Ingeniería (INII)
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Ficha Técnica de Geomanifestación
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Fecha de emisión: {new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-6 mb-6 pb-4 border-b border-gray-200 print:mb-3 print:pb-2 print:border-slate-300">
        <div className="flex items-start gap-3">
          <button 
            onClick={handleGoBack}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition cursor-pointer shadow-sm mt-1 print:hidden"
            title="Volver"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <FaMapMarkerAlt className="text-red-500 text-xl shrink-0 print:text-[#12467E]" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 m-0 print:text-xl">
                {pointData.name}
              </h1>
            </div>
            <p className="text-gray-500 text-xs md:text-sm m-0 print:text-xs">
              {pointData.region}
              {pointData.id && (
                <> • <span className="font-semibold text-gray-700">Código ID:</span> <span className="font-mono text-gray-800">{pointData.id}</span></>
              )}
            </p>
            {pointData.description && (
              <p className="text-gray-600 text-xs md:text-sm mt-2 italic bg-gray-50 p-2.5 rounded-lg border border-gray-200 print:mt-1 print:p-1.5 print:text-xs">
                "{pointData.description}"
              </p>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#12467E] hover:bg-[#084F9D] text-white rounded-lg transition font-semibold text-sm cursor-pointer shadow-sm w-full md:w-auto justify-center shrink-0 print:hidden"
        >
          <FaPrint /> Imprimir / Exportar PDF
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 print:grid-cols-2 print:gap-3 print:mb-3">
        
        {/* Rule 1: Location Information (Always Visible) */}
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200 print:p-3 print:rounded-lg print:shadow-none print:border-slate-300 print-avoid-break">
          <h2 className="text-base md:text-lg font-bold text-[#12467E] mb-3 flex items-center gap-2 print:text-sm print:mb-2">
            <FaMapMarkerAlt className="text-[#12467E] text-base" /> Información General y Ubicación
          </h2>
          <div className="space-y-2.5 text-xs md:text-sm print:space-y-1.5 print:text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 print:p-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Ubicación Territorial</span>
              <p className="text-slate-900 font-medium m-0 mt-0.5">{pointData.region}</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 print:p-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Coordenadas Geográficas (WGS84)</span>
              <p className="text-slate-900 font-mono m-0 mt-0.5">
                Lat: {parseFloat(pointData.latitude).toFixed(6)}° | Lng: {parseFloat(pointData.longitude).toFixed(6)}°
              </p>
            </div>
            {pointData.created_at && (
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 print:p-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Fecha de Registro</span>
                <p className="text-slate-900 m-0 mt-0.5">{pointData.created_at}</p>
              </div>
            )}
          </div>
        </div>

        {/* Rule 2: In-Situ Section & Lindal Diagram (Graceful Degradation) */}
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200 print:p-3 print:rounded-lg print:shadow-none print:border-slate-300 print-avoid-break">
          <h2 className="text-base md:text-lg font-bold text-[#12467E] mb-3 flex items-center gap-2 print:text-sm print:mb-2">
            <FaThermometerHalf className="text-[#F39C29] text-base" /> Medidas de Campo e In-Situ
          </h2>

          {isInsituValid ? (
            <>
              <div className="grid grid-cols-3 gap-2 mb-3 print:gap-1.5 print:mb-2">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center print:p-1.5">
                  <span className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Temperatura</span>
                  <div className="font-bold text-[#ea580c] text-base md:text-lg mt-0.5">{pointData.temp}°C</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center print:p-1.5">
                  <span className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">pH Campo</span>
                  <div className="font-bold text-slate-800 text-base md:text-lg mt-0.5">{pointData.pH_campo || 'N/A'}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center print:p-1.5">
                  <span className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Conductividad</span>
                  <div className="font-bold text-slate-800 text-sm md:text-base mt-0.5">{pointData.cond_campo || 'N/A'} <span className="text-[10px] font-normal text-slate-500">μS/cm</span></div>
                </div>
              </div>

              {/* Lindal Classification Diagram */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 print:p-1.5">
                <h3 className="text-[10px] md:text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Diagrama de Lindal (Usos directos según temperatura)
                </h3>
                <LindalDiagram temperature={pointData.temp} />
              </div>
            </>
          ) : (
            <div className="p-5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-2 print:p-3">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <FaInfoCircle className="text-amber-600 text-lg shrink-0" />
                <span>Temperatura pendiente de medición</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed m-0">
                No existen registros de mediciones in-situ ni temperatura válida (&gt; 0°C) para esta manifestación geotérmica. El diagrama de Lindal se mantiene oculto hasta contar con datos térmicos de campo.
              </p>
            </div>
          )}
        </div>

        {/* Rule 3: Chemical Section & Piper Diagram (Graceful Degradation) */}
        <div className="md:col-span-2 bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200 print:col-span-2 print:p-3 print:rounded-lg print:shadow-none print:border-slate-300 print-avoid-break">
          <h2 className="text-base md:text-lg font-bold text-[#12467E] mb-3 flex items-center gap-2 print:text-sm print:mb-2">
            <FaFlask className="text-[#12467E] text-base" /> Análisis Fisicoquímico de Laboratorio
          </h2>

          {isInlabValid ? (
            <>
              {/* Basic Lab Parameters */}
              <div className="mb-4 print:mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Parámetros Básicos de Laboratorio
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs md:text-sm print:gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center print:p-1.5">
                    <strong className="text-slate-600">pH Laboratorio:</strong>
                    <span className="font-bold text-slate-900">{pointData.pH_lab || 'N/A'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center print:p-1.5">
                    <strong className="text-slate-600">Conductividad Laboratorio:</strong>
                    <span className="font-bold text-slate-900">{pointData.cond_lab || 'N/A'} μS/cm</span>
                  </div>
                </div>
              </div>

              {/* Major Ions Grid */}
              <div className="mb-4 print:mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Iones Principales (mg/L)
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 print:gap-1.5">
                  <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-200 print:p-1">
                    <div className="text-sm md:text-base font-bold text-[#12467E]">{pointData.Cl}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Cl⁻</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-200 print:p-1">
                    <div className="text-sm md:text-base font-bold text-[#12467E]">{pointData.Ca}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Ca²⁺</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-200 print:p-1">
                    <div className="text-sm md:text-base font-bold text-[#12467E]">{pointData.HCO3}</div>
                    <div className="text-[10px] text-slate-500 font-medium">HCO₃⁻</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-200 print:p-1">
                    <div className="text-sm md:text-base font-bold text-[#12467E]">{pointData.SO4}</div>
                    <div className="text-[10px] text-slate-500 font-medium">SO₄²⁻</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-200 print:p-1">
                    <div className="text-sm md:text-base font-bold text-[#12467E]">{pointData.Na}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Na⁺</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-200 print:p-1">
                    <div className="text-sm md:text-base font-bold text-[#12467E]">{pointData.K}</div>
                    <div className="text-[10px] text-slate-500 font-medium">K⁺</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-200 print:p-1">
                    <div className="text-sm md:text-base font-bold text-[#12467E]">{pointData.Mg}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Mg²⁺</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-200 print:p-1">
                    <div className="text-sm md:text-base font-bold text-[#12467E]">{pointData.Si}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Si</div>
                  </div>
                </div>
              </div>

              {/* Trace Elements */}
              <div className="mb-4 print:mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Elementos Traza (mg/L)
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 print:gap-1.5">
                  <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-200 print:p-1">
                    <div className="text-sm md:text-base font-bold text-slate-800">{pointData.Fe}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Fe</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-200 print:p-1">
                    <div className="text-sm md:text-base font-bold text-slate-800">{pointData.B}</div>
                    <div className="text-[10px] text-slate-500 font-medium">B</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-200 print:p-1">
                    <div className="text-sm md:text-base font-bold text-slate-800">{pointData.Li}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Li</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-center border border-slate-200 print:p-1">
                    <div className="text-sm md:text-base font-bold text-slate-800">{pointData.F}</div>
                    <div className="text-[10px] text-slate-500 font-medium">F⁻</div>
                  </div>
                </div>
              </div>

              {/* Piper Diagram Component */}
              <div className="pt-3 border-t border-slate-200 print-avoid-break">
                <h3 className="text-sm md:text-base font-bold text-[#12467E] mb-2 flex items-center gap-2 print:text-xs print:mb-1">
                  <FaFlask className="text-[#12467E] text-sm" /> Diagrama de Piper (Clasificación Hidrogeoquímica)
                </h3>
                <div className="min-h-80 md:min-h-96 print:min-h-0 flex items-center justify-center bg-slate-50 rounded-xl p-3 md:p-4 print:p-1 border border-slate-200">
                  {piperData ? (
                    <PiperDiagram data={piperData} />
                  ) : (
                    <div className="text-slate-400 text-xs">
                      No hay concentraciones iónicas suficientes para construir el ternario de Piper.
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-2 print:mt-1 print:text-[10px]">
                  El diagrama hidroquímico de Piper representa la proporción relativa de aniones y cationes principales para clasificar las facies de agua geotermal.
                </p>
              </div>
            </>
          ) : (
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-700 space-y-2 print:p-3">
              <div className="w-10 h-10 bg-blue-50 text-[#12467E] rounded-full flex items-center justify-center mx-auto text-lg">
                <FaFlask />
              </div>
              <h3 className="text-base font-bold text-slate-800 m-0 print:text-sm">
                Análisis químico de fluidos no disponible o no aplicable
              </h3>
              <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed m-0">
                Esta manifestación no cuenta con muestra o estudio hidrogeoquímico registrado (ej. emanación gaseosa de fumarola seca sin fase líquida condensada o análisis de laboratorio pendiente). El diagrama de Piper se omite para prevenir distorsiones analíticas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 print:mt-3 p-4 bg-slate-50 rounded-xl text-center text-slate-500 text-xs border border-slate-200 print:p-1.5 print:text-[9px] print:bg-transparent print:border-t print:border-slate-300 print:rounded-none">
        <p className="mb-0.5 font-semibold text-slate-700">Sistema GeoterRA — Ficha Técnica Oficial de Geomanifestaciones</p>
        <p className="m-0 text-slate-500">
          Universidad de Costa Rica • Instituto de Investigaciones en Ingeniería (INII) • Información con fines científicos y técnicos.
        </p>
      </div>
    </div>
  );
}