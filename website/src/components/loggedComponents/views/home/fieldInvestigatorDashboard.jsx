import React from 'react';
import { Tag, Spin } from 'antd';
import {
  CompassOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useSession } from '../../../../hooks/useSession';
import UserInfo from './userInfo';
import '../../../../colorModule.css';
import '../../../../fontsModule.css';

const FieldInvestigatorDashboard = () => {
  const { user: sessionUser, loading } = useSession();

  if (loading) {
    return (
      <div className="w-full min-h-96 flex items-center justify-center">
        <Spin size="large" tip="Cargando panel de campo..." />
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-8 space-y-6 poppins">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-geoterra-orange poppins">
              OPERACIONES DE CAMPO • GEOTERRA
            </span>
            <Tag color="cyan" className="m-0 text-[11px] font-semibold">
              Investigador de Campo
            </Tag>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-geoterra-blue m-0 poppins">
            ¡Bienvenido, {sessionUser?.first_name || sessionUser?.name || 'Investigador de Campo'}!
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-0 max-w-2xl">
            Gestión expedita para toma de mediciones bajo condiciones de alta temperatura y registro rápido en terreno.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tag color="success" className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircleOutlined /> Modo Terreno Habilitado
          </Tag>
        </div>
      </div>

      {/* User Info Cards */}
      <UserInfo />

      {/* Quick Navigation Cards */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-geoterra-orange poppins block">
            OPERACIONES EN TERRENO
          </span>
          <h3 className="text-lg font-bold text-geoterra-blue m-0 poppins">
            Herramientas de Expedición y Levantamiento
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center text-lg mb-3">
              <CompassOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Giras Asignadas
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Consulta las giras vigentes, bitácoras y miembros del equipo de expedición.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center text-lg mb-3">
              <ThunderboltOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Puntos Rápidos
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Captura inmediata de coordenadas GPS, fotos y temperatura en fumarolas o manantiales.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12467E] flex items-center justify-center text-lg mb-3">
              <EnvironmentOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Borradores en Estudio
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Sitios pendientes de revisión de laboratorio antes de la publicación oficial en el mapa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldInvestigatorDashboard;