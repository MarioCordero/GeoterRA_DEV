import React from 'react';
import { Tag, Spin } from 'antd';
import {
  GlobalOutlined,
  CompassOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useSession } from '../../../../hooks/useSession';
import UserInfo from './userInfo';
import '../../../../colorModule.css';
import '../../../../fontsModule.css';

const InvestigatorDashboard = () => {
  const { user: sessionUser, loading } = useSession();

  if (loading) {
    return (
      <div className="w-full min-h-96 flex items-center justify-center">
        <Spin size="large" tip="Cargando panel de investigación..." />
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
              INVESTIGACIÓN CIENTÍFICA • GEOTERRA
            </span>
            <Tag color="blue" className="m-0 text-[11px] font-semibold">
              Investigador Principal
            </Tag>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-geoterra-blue m-0 poppins">
            ¡Bienvenido, {sessionUser?.first_name || sessionUser?.name || 'Investigador'}!
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-0 max-w-2xl">
            Centro de análisis geotérmico, caracterización hidrogeoquímica y validación de manifestaciones termales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tag color="success" className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircleOutlined /> Credenciales Activas
          </Tag>
        </div>
      </div>

      {/* User Info Cards */}
      <UserInfo />

      {/* Quick Navigation Cards */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-geoterra-orange poppins block">
            ESPACIOS DE TRABAJO CIENTÍFICO
          </span>
          <h3 className="text-lg font-bold text-geoterra-blue m-0 poppins">
            Módulos de Investigación Geotérmica
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12467E] flex items-center justify-center text-lg mb-3">
              <GlobalOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Geomanifestaciones y Ensayos
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Análisis hidrogeoquímicos, parámetros fisicoquímicos in-situ y pruebas de laboratorio.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg mb-3">
              <CompassOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Campañas y Giras de Terreno
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Coordinación de bitácoras de campo, muestreo de fluidos y geotermometría.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-lg mb-3">
              <DatabaseOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              División y Mapas SNIT
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Correlación cartográfica según la división político-administrativa oficial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestigatorDashboard;