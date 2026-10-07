import React, { useState, useEffect } from 'react';
import { useSession } from '../../../../hooks/useSession';
import { Tag, Spin } from 'antd';
import { maintenanceDashboardInfo } from '../../../../config/apiConf';
import {
  HddOutlined,
  TeamOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloudServerOutlined,
  CodeOutlined
} from '@ant-design/icons';
import '../../../../colorModule.css';
import '../../../../fontsModule.css';
import UserInfo from './userInfo';

const MaintenanceDashboard = () => {
  const { user: sessionUser, loading: sessionLoading } = useSession();

  // State Management
  const [dashboardData, setDashboardData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch Dashboard Stats
  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    try {
      const result = await maintenanceDashboardInfo();
      if (result.ok && result.data) {
        setDashboardData(result.data);
      } else {
        console.error('Error fetching dashboard stats:', result.error);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionUser) {
      fetchDashboardStats();
    }
  }, [sessionUser]);

  if (sessionLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Cargando panel de soporte..." />
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
              PANEL PRINCIPAL • INFRAESTRUCTURA Y SOPORTE
            </span>
            <Tag color="orange" className="m-0 text-[11px] font-semibold">
              Mantenimiento
            </Tag>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-geoterra-blue m-0 poppins">
            ¡Bienvenido, {sessionUser?.first_name || sessionUser?.name || 'Mantenimiento'}!
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-0 max-w-2xl">
            Supervisión técnica de salud del servidor, auditoría de base de datos e integridad operativa de GeoterRA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tag color="cyan" className="px-3 py-1 rounded-full text-xs font-semibold">
            Solo Lectura Segura
          </Tag>
        </div>
      </div>

      {/* User Info Component */}
      <UserInfo />

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Estado del Servidor
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <CloudServerOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {statsLoading ? '...' : (dashboardData?.serverStatus || 'Online')}
            </span>
            <span className="text-xs text-gray-500 font-medium">Core API</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Daemon activo y respondiendo
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Usuarios Activos
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12467E] flex items-center justify-center text-lg">
              <TeamOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {statsLoading ? '...' : (dashboardData?.activeUsers || 0)}
            </span>
            <span className="text-xs text-gray-500 font-medium">Cuentas</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium flex items-center gap-1">
            En base de datos institucional
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Solicitudes Pendientes
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
              <FileTextOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600 poppins">
              {statsLoading ? '...' : (dashboardData?.pendingRequests || 0)}
            </span>
            <span className="text-xs text-gray-500 font-medium">En espera</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium flex items-center gap-1">
            Flujo de solicitudes de análisis
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-[#12467E] p-5 rounded-2xl border border-gray-800 text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Carga del Sistema
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center text-lg">
              <DatabaseOutlined />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold poppins text-white">
              {dashboardData?.systemLoad || 'Baja'}
            </span>
            <p className="text-xs text-blue-200 m-0 mt-0.5 font-normal">
              Latencia reducida y memoria disponible
            </p>
          </div>
          <div className="mt-3 text-[11px] text-emerald-300 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> MySQL Pool Conectado
          </div>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-geoterra-orange poppins block">
            HERRAMIENTAS DE SOPORTE
          </span>
          <h3 className="text-lg font-bold text-geoterra-blue m-0 poppins">
            Módulos de Soporte e Infraestructura
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12467E] flex items-center justify-center text-lg mb-3">
              <DatabaseOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Explorador de Tablas
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Visualización y consulta estructurada de todas las entidades de la base de datos (solo lectura).
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg mb-3">
              <CodeOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Logs del Sistema
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Monitoreo en vivo de eventos del servidor, excepciones, llamadas HTTP y estado del daemon.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center text-lg mb-3">
              <TeamOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Soporte a Usuarios
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Gestión de cuentas institucionales, activación y resolución de incidencias de acceso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;