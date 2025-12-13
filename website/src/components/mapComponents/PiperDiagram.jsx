import React, { useMemo, useState, useEffect } from 'react';
import { BarChart2, Info, X } from 'lucide-react';

const CONFIG = {
  viewBoxW: 1000,
  viewBoxH: 750,
  side: 300,
  margin: 60,
  triangleGapX: 60,
  gap: 0,
  gridSteps: 5,
  colors: {
    grid: "#e5e7eb",
    border: "#4b5563",
    text: "#6b7280",
    cation: "#3b82f6",
    anion: "#10b981",
    diamond: "#ef4444"
  }
};

const PiperDiagram = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDebugLines, setShowDebugLines] = useState(false);

  // --- GEOMETRÍA ---
  const triH = CONFIG.side * (Math.sqrt(3) / 2);

  const origins = {
    cation: { x: CONFIG.margin + CONFIG.triangleGapX, y: CONFIG.viewBoxH - CONFIG.margin },
    anion: { x: CONFIG.viewBoxW - CONFIG.margin - CONFIG.side - CONFIG.triangleGapX, y: CONFIG.viewBoxH - CONFIG.margin },
  };

  // Centro del Rombo
  const diamondCenterY = origins.cation.y - triH - CONFIG.gap - (triH / 2.3);
  const diamondCenterX = CONFIG.viewBoxW / 2;

  // Coordenadas del Rombo
  const diamondPath = useMemo(() => {
    const cx = diamondCenterX;
    const cy = diamondCenterY;
    const hHalf = triH * 1.1;
    const sHalf = CONFIG.side / 1.8;
    // Top, Right, Bottom, Left
    return `M ${cx} ${cy - hHalf} L ${cx + sHalf} ${cy} L ${cx} ${cy + hHalf} L ${cx - sHalf} ${cy} Z`;
  }, [diamondCenterX, diamondCenterY, triH]);

  // --- LÓGICA DE DATOS ---
  const { points, percentages } = useMemo(() => {
    if (!data) return { points: null, percentages: {} };
    const safe = (v) => v || 0;

    const sumCat = safe(data.Ca) + safe(data.Mg) + safe(data.Na) + safe(data.K);
    const sumAn = safe(data.Cl) + safe(data.SO4) + safe(data.HCO3);
    const p = {
      Ca: sumCat ? (safe(data.Ca) / sumCat) * 100 : 0,
      Mg: sumCat ? (safe(data.Mg) / sumCat) * 100 : 0,
      NaK: sumCat ? ((safe(data.Na) + safe(data.K)) / sumCat) * 100 : 0,
      Cl: sumAn ? (safe(data.Cl) / sumAn) * 100 : 0,
      SO4: sumAn ? (safe(data.SO4) / sumAn) * 100 : 0,
      HCO3: sumAn ? (safe(data.HCO3) / sumAn) * 100 : 0,
    };

    const cxLocal = (p.NaK + 0.5 * p.Mg) / 100 * CONFIG.side;
    const cyLocal = (p.Mg) / 100 * triH;
    const catPt = { x: origins.cation.x + cxLocal, y: origins.cation.y - cyLocal };

    const axLocal = (p.Cl + 0.5 * p.SO4) / 100 * CONFIG.side;
    const ayLocal = (p.SO4) / 100 * triH;
    const anPt = { x: origins.anion.x + axLocal, y: origins.anion.y - ayLocal };

    const m = Math.sqrt(3);
    const b1 = catPt.y - (-m * catPt.x);
    const b2 = anPt.y - (m * anPt.x);
    const dx = (b1 - b2) / (2 * m);
    const dy = -m * dx + b1;

    return { percentages: p, points: { cation: catPt, anion: anPt, diamond: { x: dx, y: dy } } };
  }, [data, triH]);

  useEffect(() => {
    console.log('=== PORCENTAJES PIPER DIAGRAM ===');
    console.log('CATIONES:');
    console.log(`  Ca: ${percentages.Ca?.toFixed(2)}%`);
    console.log(`  Mg: ${percentages.Mg?.toFixed(2)}%`);
    console.log(`  Na+K: ${percentages.NaK?.toFixed(2)}%`);
    console.log('ANIONES:');
    console.log(`  Cl: ${percentages.Cl?.toFixed(2)}%`);
    console.log(`  SO4: ${percentages.SO4?.toFixed(2)}%`);
    console.log(`  HCO3: ${percentages.HCO3?.toFixed(2)}%`);
    console.log('================================');
  }, [percentages]);

  const renderClippedGrid = (angle) => {
    const lines = [];
    const stepSize = triH / CONFIG.gridSteps;

    for (let i = 1; i < CONFIG.gridSteps; i++) {
      const yOffset = (i * stepSize) - (triH / 2);
      lines.push(
        <line
          key={`grid-${angle}-${i}`}
          x1={-CONFIG.side} y1={yOffset}
          x2={CONFIG.side} y2={yOffset}
          stroke={CONFIG.colors.grid}
          strokeWidth="1"
        />
      );
    }

    return (
      <g transform={`rotate(${angle}, ${diamondCenterX}, ${diamondCenterY}) translate(${diamondCenterX}, ${diamondCenterY})`}>
        {lines}
      </g>
    );
  };

  const SVGContent = () => (
    <>
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="diamond-clip">
            <path d={diamondPath} />
          </clipPath>
        </defs>
      </svg>

      <svg viewBox={`0 0 ${CONFIG.viewBoxW} ${CONFIG.viewBoxH}`} className="w-full h-auto max-w-[1000px]">
        {/* LÍNEAS DE DEPURACIÓN */}
        {showDebugLines && (
          <>
            {/* Línea horizontal de los origenes de triángulos */}
            <line x1={0} y1={origins.cation.y} x2={CONFIG.viewBoxW} y2={origins.cation.y} stroke="red" strokeWidth="2" strokeDasharray="5" opacity="0.5" />
            <text x={10} y={origins.cation.y - 10} fontSize="12" fill="red" fontWeight="bold">
              y: {origins.cation.y.toFixed(0)}
            </text>

            {/* Línea vertical del centro del rombo */}
            <line x1={diamondCenterX} y1={0} x2={diamondCenterX} y2={CONFIG.viewBoxH} stroke="blue" strokeWidth="2" strokeDasharray="5" opacity="0.5" />
            <text x={diamondCenterX + 10} y={20} fontSize="12" fill="blue" fontWeight="bold">
              x: {diamondCenterX.toFixed(0)}
            </text>

            {/* Línea horizontal del centro del rombo */}
            <line x1={0} y1={diamondCenterY} x2={CONFIG.viewBoxW} y2={diamondCenterY} stroke="green" strokeWidth="2" strokeDasharray="5" opacity="0.5" />
            <text x={10} y={diamondCenterY - 10} fontSize="12" fill="green" fontWeight="bold">
              y: {diamondCenterY.toFixed(0)}
            </text>

            {/* Punto origen triángulo cationes */}
            <circle cx={origins.cation.x} cy={origins.cation.y} r="8" fill="red" opacity="0.7" />
            <text x={origins.cation.x + 15} y={origins.cation.y} fontSize="11" fill="red" fontWeight="bold">
              Cat ({origins.cation.x.toFixed(0)}, {origins.cation.y.toFixed(0)})
            </text>

            {/* Punto origen triángulo aniones */}
            <circle cx={origins.anion.x} cy={origins.anion.y} r="8" fill="orange" opacity="0.7" />
            <text x={origins.anion.x - 200} y={origins.anion.y - 15} fontSize="11" fill="orange" fontWeight="bold">
              Anion ({origins.anion.x.toFixed(0)}, {origins.anion.y.toFixed(0)})
            </text>

            {/* Punto centro rombo */}
            <circle cx={diamondCenterX} cy={diamondCenterY} r="8" fill="blue" opacity="0.7" />
            <text x={diamondCenterX + 15} y={diamondCenterY - 20} fontSize="11" fill="blue" fontWeight="bold">
              Diamond ({diamondCenterX.toFixed(0)}, {diamondCenterY.toFixed(0)})
            </text>

            {/* Mostrar triH */}
            <text x={20} y={100} fontSize="12" fill="purple" fontWeight="bold">
              triH: {triH.toFixed(2)}
            </text>

            {/* Mostrar CONFIG */}
            <text x={20} y={120} fontSize="11" fill="purple" fontWeight="normal">
              side: {CONFIG.side}, margin: {CONFIG.margin}, gap: {CONFIG.gap}
            </text>

            {/* LÍNEAS DIAGONALES DE PROYECCIÓN */}
            {/* Esquina Top-Left del rombo a esquina inferior-izquierda del triángulo cationes */}
            <line 
              x1={origins.cation.x}
              y1={origins.cation.y}

              x2={origins.cation.x + (CONFIG.side / 2) * 4}
              y2={origins.cation.y - triH * 4}
              stroke="cyan" 
              strokeWidth="2" 
              strokeDasharray="5" 
              opacity="0.6" 
            />

            {/* Esquina Top-Right del rombo a esquina inferior-derecha del triángulo aniones */}
            <line 
              x1={origins.anion.x + CONFIG.side} 
              y1={origins.anion.y} 
              x2={origins.anion.x + CONFIG.side - (CONFIG.side / 2) * 4}
              y2={origins.anion.y - triH * 4}
              stroke="cyan" 
              strokeWidth="2" 
              strokeDasharray="5" 
              opacity="0.6" 
            />
          </>
        )}

        {/* 1. TRIÁNGULO CATIONES */}
        <g transform={`translate(${origins.cation.x}, ${origins.cation.y})`}>
          {Array.from({ length: 5 }).map((_, i) => {
            const f = (i + 1) / 5;
            return (
              <g key={i}>
                <line x1={(CONFIG.side / 2) * f} y1={-triH * f} x2={CONFIG.side - (CONFIG.side / 2) * f} y2={-triH * f} stroke={CONFIG.colors.grid} />
                <line x1={CONFIG.side * f} y1={0} x2={(CONFIG.side / 2) * (1 + f)} y2={-triH * (1 - f)} stroke={CONFIG.colors.grid} />
                <line x1={CONFIG.side * (1 - f)} y1={0} x2={(CONFIG.side / 2) * (1 - f)} y2={-triH * (1 - f)} stroke={CONFIG.colors.grid} />
              </g>
            );
          })}
          <polygon points={`0,0 ${CONFIG.side},0 ${CONFIG.side / 2},${-triH}`} fill="none" stroke={CONFIG.colors.border} strokeWidth="1.5" />

          <text x={-20} y={40} textAnchor="middle" fontSize="12" fill="#374151" fontWeight="bold">Ca</text>
          <text x={160} y={-270} textAnchor="end" fontSize="12" fill="#374151" fontWeight="bold">Mg</text>
          <text x={CONFIG.side + 15} y={40} textAnchor="start" fontSize="12" fill="#374151" fontWeight="bold">Na+K</text>

          <text x={CONFIG.side / 2} y={50} textAnchor="middle" fontSize="14" fill="#374151" fontWeight="bold">Cationes</text>

          {[0, 20, 40, 60, 80, 100].map((num) => (
            <text key={`base-${num}`} x={(num / 100) * CONFIG.side} y={20} textAnchor="middle" fontSize="10" fill="#9ca3af">
              {num}
            </text>
          ))}

          {[0, 20, 40, 60, 80, 100].map((num) => {
            const ratio = (100 - num) / 100;
            const x = (CONFIG.side / 2) * ratio;
            const y = -triH * ratio;
            return (
              <text key={`left-${num}`} x={x - 18} y={y + 5} textAnchor="end" fontSize="10" fill="#9ca3af" transform={`rotate(-60, ${x - 18}, ${y + 5})`}>
                {num}
              </text>
            );
          })}

          {[0, 20, 40, 60, 80, 100].map((num) => {
            const ratio = (num / 100);
            const x = CONFIG.side - (CONFIG.side / 2) * ratio;
            const y = -triH * ratio;
            return (
              <text key={`right-${num}`} x={x + 18} y={y + 5} textAnchor="start" fontSize="10" fill="#9ca3af" transform={`rotate(60, ${x + 18}, ${y + 5})`}>
                {num}
              </text>
            );
          })}
        </g>

        {/* 2. TRIÁNGULO ANIONES */}
        <g transform={`translate(${origins.anion.x}, ${origins.anion.y})`}>
          {Array.from({ length: 5 }).map((_, i) => {
            const f = (i + 1) / 5;
            return (
              <g key={i}>
                <line x1={(CONFIG.side / 2) * f} y1={-triH * f} x2={CONFIG.side - (CONFIG.side / 2) * f} y2={-triH * f} stroke={CONFIG.colors.grid} />
                <line x1={CONFIG.side * f} y1={0} x2={(CONFIG.side / 2) * (1 + f)} y2={-triH * (1 - f)} stroke={CONFIG.colors.grid} />
                <line x1={CONFIG.side * (1 - f)} y1={0} x2={(CONFIG.side / 2) * (1 - f)} y2={-triH * (1 - f)} stroke={CONFIG.colors.grid} />
              </g>
            );
          })}
          <polygon points={`0,0 ${CONFIG.side},0 ${CONFIG.side / 2},${-triH}`} fill="none" stroke={CONFIG.colors.border} strokeWidth="1.5" />

          <text x={CONFIG.side + 30} y={40} textAnchor="middle" fontSize="12" fill="#374151" fontWeight="bold">Cl</text>
          <text x={-20} y={40} textAnchor="end" fontSize="12" fill="#374151" fontWeight="bold">HCO3</text>
          <text x={140} y={-270} textAnchor="start" fontSize="12" fill="#374151" fontWeight="bold">SO4</text>

          <text x={CONFIG.side / 2} y={50} textAnchor="middle" fontSize="14" fill="#374151" fontWeight="bold">Aniones</text>

          {[0, 20, 40, 60, 80, 100].map((num) => (
            <text key={`base-${num}`} x={(num / 100) * CONFIG.side} y={20} textAnchor="middle" fontSize="10" fill="#9ca3af">
              {num}
            </text>
          ))}

          {[0, 20, 40, 60, 80, 100].map((num) => {
            const ratio = (100 - num) / 100;
            const x = (CONFIG.side / 2) * ratio;
            const y = -triH * ratio;
            return (
              <text key={`left-${num}`} x={x - 18} y={y + 5} textAnchor="end" fontSize="10" fill="#9ca3af" transform={`rotate(-60, ${x - 18}, ${y + 5})`}>
                {num}
              </text>
            );
          })}

          {[0, 20, 40, 60, 80, 100].map((num) => {
            const ratio = (num / 100);
            const x = CONFIG.side - (CONFIG.side / 2) * ratio;
            const y = -triH * ratio;
            return (
              <text key={`right-${num}`} x={x + 18} y={y + 5} textAnchor="start" fontSize="10" fill="#9ca3af" transform={`rotate(60, ${x + 18}, ${y + 5})`}>
                {num}
              </text>
            );
          })}
        </g>

        {/* 3. ROMBO CENTRAL */}
        <g>
          <g clipPath="url(#diamond-clip)">
            {renderClippedGrid(60)}
            {renderClippedGrid(-60)}
          </g>

          <path d={diamondPath} fill="none" stroke={CONFIG.colors.border} strokeWidth="1.5" />

          {/* Etiquetas principales Rombo */}
          <text x={diamondCenterX} y={diamondCenterY - 50} textAnchor="end" fontSize="11" fontWeight="bold" fill="#374151" transform={`rotate(-60, ${diamondCenterX - CONFIG.side / 2 - 10}, ${diamondCenterY})`}>SO4 + Cl</text>
          <text x={diamondCenterX} y={diamondCenterY - 50} textAnchor="start" fontSize="11" fontWeight="bold" fill="#374151" transform={`rotate(60, ${diamondCenterX + CONFIG.side / 2 + 10}, ${diamondCenterY})`}>Mg + Ca</text>
          <text x={diamondCenterX + 120} y={diamondCenterY + 170} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#374151" transform={`rotate(60, ${diamondCenterX}, ${diamondCenterY - 50})`}>Na + K</text>
          <text x={diamondCenterX - 150} y={diamondCenterY + 340} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#374151" transform={`rotate(-62, ${diamondCenterX - CONFIG.side / 2 - 10}, ${diamondCenterY})`}>CO3 + HCO3</text>

          {/* NÚMEROS EN LADO SUPERIOR IZQUIERDO (Top a Left) */}
          {[100, 80, 60, 40, 20, 0].map((num) => {
            const ratio = (100 - num) / 100;
            const hHalf = triH * 1.1;
            const sHalf = CONFIG.side / 1.9;

            const x = diamondCenterX - (sHalf * ratio);
            const y = (diamondCenterY - hHalf) + (hHalf * ratio);

            return (
              <text key={`dl-${num}`} x={x - 12} y={y - 8} textAnchor="end" fontSize="9" fill="#9ca3af">
                {num}
              </text>
            );
          })}

          {/* NÚMEROS EN LADO SUPERIOR DERECHO (Top a Right) */}
          {[100, 80, 60, 40, 20, 0].map((num) => {
            const ratio = (100 - num) / 100;
            const hHalf = triH * 1.1;
            const sHalf = CONFIG.side / 1.9;

            const x = diamondCenterX + (sHalf * ratio);
            const y = (diamondCenterY - hHalf) + (hHalf * ratio);

            return (
              <text key={`dr-${num}`} x={x + 12} y={y - 8} textAnchor="start" fontSize="9" fill="#9ca3af">
                {num}
              </text>
            );
          })}

          {/* NÚMEROS EN LADO INFERIOR IZQUIERDO (Bottom a Left) */}
          {[0, 20, 40, 60, 80, 100].map((num) => {
            const ratio = (100 - num) / 100;
            const hHalf = triH * 1.1;
            const sHalf = CONFIG.side / 1.9;

            const x = diamondCenterX - (sHalf * ratio);
            const y = (diamondCenterY + hHalf) - (hHalf * ratio);

            return (
              <text key={`dbl-${num}`} x={x - 12} y={y + 8} textAnchor="end" fontSize="9" fill="#9ca3af">
                {num}
              </text>
            );
          })}

          {/* NÚMEROS EN LADO INFERIOR DERECHO (Bottom a Right) */}
          {[0, 20, 40, 60, 80, 100].map((num) => {
            const ratio = (100 - num) / 100;
            const hHalf = triH * 1.1;
            const sHalf = CONFIG.side / 1.9;

            const x = diamondCenterX + (sHalf * ratio);
            const y = (diamondCenterY + hHalf) - (hHalf * ratio);

            return (
              <text key={`dbr-${num}`} x={x + 12} y={y + 8} textAnchor="start" fontSize="9" fill="#9ca3af">
                {num}
              </text>
            );
          })}
        </g>

        {/* 4. PUNTOS */}
        {points && (
          <>
            <line x1={points.cation.x} y1={points.cation.y} x2={points.diamond.x} y2={points.diamond.y} stroke={CONFIG.colors.cation} strokeDasharray="4" opacity="0.5" />
            <line x1={points.anion.x} y1={points.anion.y} x2={points.diamond.x} y2={points.diamond.y} stroke={CONFIG.colors.anion} strokeDasharray="4" opacity="0.5" />

            <circle cx={points.cation.x} cy={points.cation.y} r="5" fill={CONFIG.colors.cation} stroke="white" strokeWidth="1" />
            <circle cx={points.anion.x} cy={points.anion.y} r="5" fill={CONFIG.colors.anion} stroke="white" strokeWidth="1" />
            <circle cx={points.diamond.x} cy={points.diamond.y} r="6" fill={CONFIG.colors.diamond} stroke="white" strokeWidth="2" />
          </>
        )}
      </svg>
    </>
  );

  if (!data) return <div className="p-8 text-gray-500">Cargando...</div>;

  return (
    <>
      {/* BOTÓN DEBUG */}
      <button
        onClick={() => setShowDebugLines(!showDebugLines)}
        className="mb-4 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-bold hover:bg-purple-600 transition"
      >
        {showDebugLines ? '❌ Ocultar Debug' : '👁️ Mostrar Debug'}
      </button>

      {/* VISTA NORMAL */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 w-full cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all" onClick={() => setIsExpanded(true)}>
        <div className="flex justify-center bg-gray-50/50 rounded-xl border border-gray-100 py-6 group">
          <div className="relative w-full">
            <SVGContent />
            {/* Indicador visual de click */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-lg">
              <span className="text-blue-600 font-semibold text-sm">Haz click para ampliar</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EXPANDIDO */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsExpanded(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-6xl max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Encabezado del Modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Diagrama de Piper - Vista Ampliada</h2>
              <button onClick={() => setIsExpanded(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-gray-50">
              <div className="w-full">
                <SVGContent />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
              Presiona Esc o haz click fuera para cerrar
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PiperDiagram;