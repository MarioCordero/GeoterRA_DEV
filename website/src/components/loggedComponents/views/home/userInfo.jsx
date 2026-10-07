import React, { useState, useEffect } from 'react';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  TagOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { userMe } from '../../../../config/apiConf';
import { Tag, Spin, Alert } from 'antd';
import '../../../../colorModule.css';
import '../../../../fontsModule.css';

const UserInfo = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const result = await userMe();
        if (result.ok && result.data) {
          setUserData(result.data);
        } else {
          setError(result.error || 'No se pudieron cargar los datos del usuario.');
        }
      } catch (err) {
        setError(err.message || 'Error de conexión.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <Spin tip="Cargando información de usuario..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        className="mb-6 rounded-xl"
      />
    );
  }

  if (!userData) return null;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#12467E] border border-blue-200">
            <UserOutlined /> Administrador Global
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <SafetyCertificateOutlined /> Soporte / Mantenimiento
          </span>
        );
      case 'field_investigator':
      case 'fieldInvestigator':
      case 'fieldInvestigastor':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
            <UserOutlined /> Investigador de Campo
          </span>
        );
      case 'investigator':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <UserOutlined /> Investigador Científico
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <UserOutlined /> Usuario Institucional
          </span>
        );
    }
  };

  const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Usuario';

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 mb-6 poppins">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <IdcardOutlined className="text-xl text-[#12467E]" />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-geoterra-orange poppins block">
              SESIÓN ACTIVA • IDENTIDAD INSTITUCIONAL
            </span>
            <h3 className="text-base font-bold text-geoterra-blue m-0 poppins">
              Información del Usuario Autenticado
            </h3>
          </div>
        </div>
        <div>
          {userData.is_verified ? (
            <Tag color="success" className="px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <CheckCircleOutlined className="mr-1" /> Verificado
            </Tag>
          ) : (
            <Tag color="warning" className="px-2.5 py-0.5 rounded-full text-xs font-semibold">
              Pendiente de Verificación
            </Tag>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#12467E] flex items-center justify-center text-lg shrink-0">
            <UserOutlined />
          </div>
          <div className="min-w-0">
            <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider block">
              Nombre Completo
            </span>
            <span className="font-bold text-gray-800 text-sm truncate block">
              {fullName}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#12467E] flex items-center justify-center text-lg shrink-0">
            <MailOutlined />
          </div>
          <div className="min-w-0">
            <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider block">
              Correo Electrónico
            </span>
            <span className="font-bold text-gray-800 text-sm truncate block">
              {userData.email}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#12467E] flex items-center justify-center text-lg shrink-0">
            <TagOutlined />
          </div>
          <div className="min-w-0">
            <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider block mb-1">
              Rol del Sistema
            </span>
            <div>{getRoleBadge(userData.role)}</div>
          </div>
        </div>

        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#12467E] flex items-center justify-center text-lg shrink-0">
            <PhoneOutlined />
          </div>
          <div className="min-w-0">
            <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider block">
              Teléfono
            </span>
            <span className="font-bold text-gray-800 text-sm truncate block">
              {userData.phone_number || 'No especificado'}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex items-center gap-3 sm:col-span-2 lg:col-span-2">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#12467E] flex items-center justify-center text-lg shrink-0">
            <CalendarOutlined />
          </div>
          <div className="min-w-0">
            <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider block">
              Fecha de Incorporación
            </span>
            <span className="font-bold text-gray-800 text-sm truncate block">
              {userData.created_at
                ? new Date(userData.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Registro Fundacional'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;