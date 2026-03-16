import React, { useEffect, useState } from 'react';
import "../../colorModule.css";
import '../../fontsModule.css';
import { users } from '../../config/apiConf';

const Dashboard = ({ user, loading, error }) => {
  if (loading) {
    return (
      <div className="w-full min-h-96 flex items-center justify-center text-2xl text-gray-600 bg-gray-100 rounded-lg m-8 p-8">
        Cargando....
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-96 flex items-center justify-center text-2xl text-red-600 bg-red-50 border border-red-200 rounded-lg m-8 p-8">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full min-h-96 flex flex-col items-center justify-center text-2xl text-gray-900 bg-gray-100 rounded-lg m-8 p-8">
      <div className="mb-6 text-4xl font-bold">
        ¡Bienvenido, {user?.name || 'Usuario'}!
      </div>
      <div className="flex gap-2">
        <span className="font-bold">Puntos solicitados:</span>
        <span className="text-amber-500 text-3xl font-semibold">
          {user?.requestedPoints ?? 0}
        </span>
      </div>
      {user?.isAdmin && (
        <div className="mt-4 px-4 py-2 bg-blue-100 rounded text-blue-600 font-semibold">
          Panel de Administrador
        </div>
      )}
    </div>
  );
};

const LoggedMainPage = () => {
  const [user, setUser] = useState({ name: '', requestedPoints: 0, isAdmin: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(users.me(), {
          credentials: 'include',
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (res.status === 401) {
          setError('Sesión no activa. Por favor, inicia sesión nuevamente.');
          return;
        }

        if (!res.ok) {
          throw new Error(`Error en la petición: ${res.status}`);
        }

        const body = await res.json();

        if (body.response === 'Ok' && body.data) {
          setUser({
            name: body.data.name || body.data.email || '',
            requestedPoints: body.data.requestedPoints || 0,
            isAdmin: !!body.data.is_admin,
            userType: body.data.user_type || 'usr',
          });
        } else {
          setError(body.message || 'No se pudo obtener la información del usuario.');
        }
      } catch (err) {
        setError(`Error al verificar la sesión: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  return <Dashboard user={user} loading={loading} error={error} />;
};

export default LoggedMainPage;