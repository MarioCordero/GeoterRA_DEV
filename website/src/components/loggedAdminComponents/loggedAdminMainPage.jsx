import React, { useEffect, useState } from 'react';
import "../../colorModule.css";
import '../../fontsModule.css';
import { buildApiUrl } from '../../config/apiConf';

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

        // Check session first
        const sessionResponse = await fetch(buildApiUrl("check_session.php"), {
          credentials: 'include',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!sessionResponse.ok) {
          throw new Error(`Session check failed: ${sessionResponse.status}`);
        }

        const sessionData = await sessionResponse.json();
        
        if (sessionData.response === "Ok" && sessionData.data.status === 'logged_in') {
          console.log('Session is active for user:', sessionData.data.user);
          
          // Fetch user data
          const userResponse = await fetch(buildApiUrl("user_info.php"), {
            credentials: 'include',
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            if (userData.response === "Ok") {
              setUser({
                name: userData.data.name || sessionData.data.user,
                requestedPoints: userData.data.requestedPoints || 0,
                isAdmin: sessionData.data.is_admin || false,
                userType: sessionData.data.user_type || 'usr'
              });
            } else {
              // Use session data as fallback
              setUser({
                name: sessionData.data.user,
                requestedPoints: 0,
                isAdmin: sessionData.data.is_admin || false,
                userType: sessionData.data.user_type || 'usr'
              });
            }
          } else {
            // Use session data as fallback
            setUser({
              name: sessionData.data.user,
              requestedPoints: 0,
              isAdmin: sessionData.data.is_admin || false,
              userType: sessionData.data.user_type || 'usr'
            });
          }
        } else {
          setError('Sesión no activa. Por favor, inicia sesión nuevamente.');
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