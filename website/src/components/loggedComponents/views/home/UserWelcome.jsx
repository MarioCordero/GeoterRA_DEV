import React, { useEffect, useState } from 'react';
import { Tag, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../../../hooks/useSession';
import UserInfo from './userInfo';
import {
  FileTextOutlined,
  PlusCircleOutlined,
  CheckCircleOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import '../../../../colorModule.css';
import '../../../../fontsModule.css';

/**
 * UserWelcome Component
 * Shown to regular users (non-admin)
 * Upgraded with GeoterRA executive styling
 */
const UserWelcome = () => {
  const navigate = useNavigate();
  const { isLogged, loading, user: sessionUser } = useSession();
  const [user, setUser] = useState({ name: '', requestedPoints: 0 });

  useEffect(() => {
    if (!loading && isLogged && sessionUser) {
      setUser({
        name: sessionUser.name || sessionUser.first_name || sessionUser.email || 'Usuario',
        requestedPoints: sessionUser.requestedPoints || 0,
      });
    } else if (!loading && !isLogged) {
      navigate('/');
    }
  }, [loading, isLogged, sessionUser, navigate]);

  if (loading) {
    return (
      <div className="w-full min-h-96 flex items-center justify-center">
        <Spin size="large" tip="Verificando sesión..." />
      </div>
    );
  }

  if (!isLogged) {
    return (
      <div className="w-full min-h-96 flex items-center justify-center text-gray-500 poppins">
        Acceso no autorizado
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
              PORTAL INSTITUCIONAL • GEOTERRA
            </span>
            <Tag color="orange" className="m-0 text-[11px] font-semibold">
              Usuario General
            </Tag>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-geoterra-blue m-0 poppins">
            ¡Bienvenido, {user?.name}!
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-0 max-w-2xl">
            Portal de gestión de solicitudes de análisis hidrogeoquímico y seguimiento a estudios de geomanifestaciones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Tag color="success" className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircleOutlined /> Cuenta Activa
          </Tag>
        </div>
      </div>

      {/* User Info Component */}
      <UserInfo />

      {/* Quick Navigation Cards */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-geoterra-orange poppins block">
            ACCIONES Y SERVICIOS
          </span>
          <h3 className="text-lg font-bold text-geoterra-blue m-0 poppins">
            ¿Qué deseas realizar hoy?
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12467E] flex items-center justify-center text-lg mb-3">
              <FileTextOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Mis Solicitudes
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Consulta el estado de revisión, dictámenes y avances de tus solicitudes enviadas.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg mb-3">
              <PlusCircleOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Nueva Solicitud de Análisis
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Registra un punto de interés termal o geomanifestación para su estudio técnico.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#12467E] transition-all group">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-lg mb-3">
              <IdcardOutlined />
            </div>
            <h4 className="font-bold text-gray-800 text-base m-0 mb-1 group-hover:text-[#12467E] transition-colors">
              Mi Perfil y Credenciales
            </h4>
            <p className="text-xs text-gray-500 m-0">
              Actualiza tus datos de contacto institucional o cambia tu contraseña de acceso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserWelcome;