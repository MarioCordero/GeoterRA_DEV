import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PiperDiagram = ({ data }) => {
  if (!data) {
    return <div className="text-center text-gray-500">No hay datos para mostrar el diagrama</div>;
  }

  // Calcular proporciones de cationes (%)
  const totalCations = (data.Ca || 0) + (data.Mg || 0) + (data.Na || 0) + (data.K || 0);
  const Ca_percent = totalCations > 0 ? ((data.Ca || 0) / totalCations) * 100 : 0;
  const Mg_percent = totalCations > 0 ? ((data.Mg || 0) / totalCations) * 100 : 0;
  const Na_K_percent = totalCations > 0 ? (((data.Na || 0) + (data.K || 0)) / totalCations) * 100 : 0;

  // Calcular proporciones de aniones (%)
  const totalAnions = (data.Cl || 0) + (data.SO4 || 0) + (data.HCO3 || 0);
  const Cl_percent = totalAnions > 0 ? ((data.Cl || 0) / totalAnions) * 100 : 0;
  const SO4_percent = totalAnions > 0 ? ((data.SO4 || 0) / totalAnions) * 100 : 0;
  const HCO3_percent = totalAnions > 0 ? ((data.HCO3 || 0) / totalAnions) * 100 : 0;

  // Convertir a coordenadas trilineales para el gráfico
  // Eje X: Na+K (0) a Mg (100)
  // Eje Y: Ca (0) a Cl (100)
  const piperX = Na_K_percent;
  const piperY = Ca_percent;

  // Datos para mostrar
  const chartData = [
    {
      x: piperX,
      y: piperY,
      name: 'Composición Iónica'
    }
  ];

  return (
    <div className="w-full h-full p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Gráfico de Piper */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">Diagrama Trilineal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Na+K ↔ Mg" 
                domain={[0, 100]}
                label={{ value: 'Na+K ← → Mg', position: 'bottom', offset: 10 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Ca ↔ Cl" 
                domain={[0, 100]}
                label={{ value: 'Ca ← → Cl', angle: -90, position: 'insideLeft', offset: 10 }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #ccc', borderRadius: '5px' }}
              />
              <Scatter 
                name="Punto" 
                data={chartData} 
                fill="#e74c3c" 
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Información de Composición */}
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Cationes (%)</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Calcio (Ca²⁺)</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-4 bg-gray-200 rounded overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${Ca_percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{Ca_percent.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Magnesio (Mg²⁺)</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-4 bg-gray-200 rounded overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: `${Mg_percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{Mg_percent.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sodio + Potasio (Na⁺ + K⁺)</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-4 bg-gray-200 rounded overflow-hidden">
                    <div 
                      className="h-full bg-orange-500" 
                      style={{ width: `${Na_K_percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{Na_K_percent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Aniones (%)</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Cloruro (Cl⁻)</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-4 bg-gray-200 rounded overflow-hidden">
                    <div 
                      className="h-full bg-red-500" 
                      style={{ width: `${Cl_percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{Cl_percent.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sulfato (SO₄²⁻)</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-4 bg-gray-200 rounded overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500" 
                      style={{ width: `${SO4_percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{SO4_percent.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bicarbonato (HCO₃⁻)</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-4 bg-gray-200 rounded overflow-hidden">
                    <div 
                      className="h-full bg-purple-500" 
                      style={{ width: `${HCO3_percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{HCO3_percent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interpretación */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">📋 Interpretación</h3>
        <p className="text-sm text-gray-700">
          El diagrama de Piper es una representación gráfica de la composición iónica del agua.
          La posición del punto indica el tipo de agua según la clasificación de Piper.
        </p>
      </div>
    </div>
  );
};

export default PiperDiagram;