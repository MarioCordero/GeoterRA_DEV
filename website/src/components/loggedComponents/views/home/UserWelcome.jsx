import { Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useSession } from '../../../../hooks/useSession';

/**
 * UserWelcome Component
 * Shown to regular users (non-admin)
 * Displays welcome message and requested points count
 */
const UserWelcome = () => {
  const navigate = useNavigate();
  const { isLogged, loading, user: sessionUser } = useSession();
  const [user, setUser] = useState({ name: '', requestedPoints: 0 });
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!loading && isLogged && sessionUser) {
      setUser({
        name: sessionUser.name || sessionUser.email || 'Usuario',
        requestedPoints: sessionUser.requestedPoints || 0,
      });
    } else if (!loading && !isLogged) {
      console.log('❌ Session invalid, redirecting to login');
      navigate('/');
    }
  }, [loading, isLogged, sessionUser, navigate]);

  if (loading || dataLoading) {
    return (
      <div className="flex justify-center items-center min-h-96 p-4">
        <p className="text-lg md:text-xl">
          Verificando sesión...
        </p>
      </div>
    );
  }

  if (!isLogged) {
    return (
      <div className="flex justify-center items-center min-h-96 p-4">
        <p className="text-lg md:text-xl text-center">
          Acceso no autorizado
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-8 p-4 md:p-8">
      {/* Welcome Section */}
      <div className="w-full max-w-3xl flex flex-col items-center justify-center text-2xl text-gray-900 bg-gray-100 rounded-lg p-8">
        <div className="mb-6 text-4xl font-bold text-center break-words">
          ¡Bienvenido, {user?.name || 'Usuario'}!
        </div>
        <div className="flex flex-col items-center text-center gap-2">
          <span className="font-bold">Puntos solicitados:</span>
          <span className="text-amber-500 text-2xl md:text-3xl font-semibold">
            {user?.requestedPoints ?? 0}
          </span>
        </div>
      </div>

      {/* Role Description Card */}
      <div className="w-full max-w-3xl">
        <Card className="mb-8 bg-blue-50 border-l-4 border-blue-500">
          <h3 className="text-xl font-bold mb-3">📋 Descripción del Rol: Usuario Autenticado</h3>
          <p className="text-gray-700 mb-4">
            Como Usuario Autenticado, eres responsable de recopilar datos sobre manifestaciones geotermales. 
            Tu rol te permite crear solicitudes de análisis, monitorear su estado en el proceso de revisión y 
            contribuir datos fundamentales para la investigación científica del potencial geotérmico.
          </p>
          <h4 className="font-semibold text-gray-800 mb-2">🎯 Responsabilidades Principales:</h4>
          <ul style={{ margin: '0', paddingLeft: '20px', color: '#333' }}>
            <li>Crear solicitudes de análisis para manifestaciones geotermales</li>
            <li>Proporcionar información precisa sobre temperatura, actividad de burbujeo y ubicación GPS</li>
            <li>Monitorear el estado de tus solicitudes en el proceso de revisión</li>
            <li>Editar o eliminar solicitudes pendientes de revisión</li>
            <li>Acceder a información detallada sobre cada solicitud enviada</li>
            <li>Exportar solicitudes en formato PDF cuando sea necesario</li>
          </ul>
        </Card>
      </div>

      {/* Capabilities Card */}
      <div className="w-full max-w-3xl">
        <Card className="mb-8 bg-amber-50 border-l-4 border-amber-500">
          <h3 className="text-lg font-bold mb-4">🎯 ¿Qué puedes hacer aquí?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">✅ Nueva Solicitud</h4>
              <p className="text-sm text-gray-600">Crea una nueva solicitud de análisis geotérmico indicando ubicación GPS, temperatura y características del sitio.</p>
            </div>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">📊 Ver Estado</h4>
              <p className="text-sm text-gray-600">Consulta el estado actual de todas tus solicitudes, desde registro inicial hasta aprobación final.</p>
            </div>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">✏️ Editar o Eliminar</h4>
              <p className="text-sm text-gray-600">Modifica o elimina tus solicitudes mientras estén en estado pendiente de revisión.</p>
            </div>
            <div className="p-4 bg-white rounded border border-gray-200">
              <h4 className="font-semibold text-blue-600 mb-2">📥 Exportar PDF</h4>
              <p className="text-sm text-gray-600">Descarga tus solicitudes en formato PDF con toda la información registrada.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserWelcome;