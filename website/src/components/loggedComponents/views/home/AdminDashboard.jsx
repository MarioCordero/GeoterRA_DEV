import React, { useState, useEffect } from 'react';
import { useSession } from '../../../../hooks/useSession';
import { analysisRequest } from '../../../../config/apiConf';
import { usePermissions } from '../../../../hooks/usePermissions';
import { Spin, Card, Tag, Button } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  GlobalOutlined,
  CompassOutlined,
  DatabaseOutlined,
  RocketOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import '../../../../colorModule.css';
import '../../../../fontsModule.css';
import UserInfo from './userInfo';

const AdminDashboard = () => {
  const { user: sessionUser, loading, error } = useSession();
  const { hasPermission, PERMISSIONS } = usePermissions();
  const [stats, setStats] = useState({ total: 0, pending: 0, analyzed: 0, rejected: 0 });
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!hasPermission(PERMISSIONS.REVIEW_REQUESTS)) return;

      try {
        setStatsLoading(true);
        const res = await fetch(analysisRequest.adminIndex(), {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' },
        });

        if (!res.ok) return;

        const result = await res.json();
        if (result.data && Array.isArray(result.data)) {
          const data = result.data;
          setStats({
            total: data.length,
            pending: data.filter(r => r.state === 'Pendiente' || r.state === 'Registrada').length,
            analyzed: data.filter(r => r.state === 'Aprobada' || r.state === 'Analizada').length,
            rejected: data.filter(r => r.state === 'Rechazada' || r.state === 'Eliminada').length,
          });
        }
      } catch (err) {
        console.warn('Stats fetch warning:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [hasPermission, PERMISSIONS]);

  if (loading) {
    return (
      <div className="w-full min-h-96 flex items-center justify-center">
        <Spin size="large" tip="Cargando panel de administración..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-96 flex items-center justify-center text-red-600 bg-red-50 border border-red-200 rounded-2xl m-8 p-8 poppins">
        Error al cargar sesión: {error}
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
              PANEL PRINCIPAL • CONTROL GLOBAL
            </span>
            <Tag color="magenta" className="m-0 text-[11px] font-semibold">
              Administrador
            </Tag>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-geoterra-blue m-0 poppins">
            ¡Bienvenido, {sessionUser?.first_name || sessionUser?.name || 'Administrador'}!
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-0 max-w-2xl">
            Centro de mando institucional para supervisión operativa, investigación geotérmica y gestión integral del sistema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tag color="blue" className="px-3 py-1 rounded-full text-xs font-semibold">
            Nivel 1 • Acceso Total
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
              Solicitudes Recibidas
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12467E] flex items-center justify-center text-lg">
              <FileTextOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {statsLoading ? '...' : stats.total}
            </span>
            <span className="text-xs text-gray-500 font-medium">Globales</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Flujo de investigación
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Pendientes de Revisión
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
              <ClockCircleOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600 poppins">
              {statsLoading ? '...' : stats.pending}
            </span>
            <span className="text-xs text-gray-500 font-medium">En espera</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium flex items-center gap-1">
            Requieren dictamen técnico
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Dictaminadas / Aprobadas
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <CheckCircleOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600 poppins">
              {statsLoading ? '...' : stats.analyzed}
            </span>
            <span className="text-xs text-gray-500 font-medium">Aprobadas</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium flex items-center gap-1">
            Procesadas con éxito
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-[#12467E] p-5 rounded-2xl border border-gray-800 text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Estado de la Plataforma
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center text-lg">
              <SafetyCertificateOutlined />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold poppins text-white">Óptimo</span>
            <p className="text-xs text-blue-200 m-0 mt-0.5 font-normal">
              Servicios backend y bases de datos sincronizadas
            </p>
          </div>
          <div className="mt-3 text-[11px] text-emerald-300 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> 100% operatividad
          </div>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-geoterra-orange poppins block">
            ACCESOS DIRECTOS INSTITUCIONALES
          </span>
          <h3 className="text-lg font-bold text-geoterra-blue m-0 poppins">
            Módulos Principales de Administración
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12467E] flex items-center justify-center text-lg mb-3">
              <GlobalOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Geomanifestaciones
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Catálogo de puntos termales, fumarolas, pruebas in-situ y de laboratorio.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg mb-3">
              <CompassOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Giras de Campo
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Bitácoras, expediciones geocientíficas y registro rápido en terreno.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center text-lg mb-3">
              <TeamOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Gestión de Usuarios
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Asignación de roles, verificación de cuentas y permisos del personal.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-lg mb-3">
              <DatabaseOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Territorio SNIT
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Administración oficial de la división político-administrativa de Costa Rica.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;