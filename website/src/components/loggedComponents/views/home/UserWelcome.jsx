import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../../../hooks/useSession';
import { users } from '../../../../config/apiConf';
import "../../../../colorModule.css";
import '../../../../fontsModule.css';

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
    <div className="w-full max-w-3xl min-h-96 flex flex-col items-center justify-center text-2xl text-gray-900 bg-gray-100 rounded-lg m-8 p-8">
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
  );
};

export default UserWelcome;
