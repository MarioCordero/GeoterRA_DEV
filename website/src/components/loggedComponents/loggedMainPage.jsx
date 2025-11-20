import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../colorModule.css";
import '../../fontsModule.css';
import { buildApiUrl } from '../../config/apiConf';

const Dashboard = ({ user }) => (
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

const LoggedMainPage = () => {
  const [user, setUser] = useState({ name: '', requestedPoints: 0 });
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Session token management functions
  const getSessionToken = () => {
    return localStorage.getItem('geoterra_session_token');
  };

  const buildHeaders = () => {
    const headers = {};
    const token = getSessionToken();
    if (token) {
      headers['X-Session-Token'] = token;
    }
    return headers;
  };

  useEffect(() => {
    // First check session, then fetch user data if logged in
    const checkSessionAndFetchData = async () => {
      try {
        setLoading(true);
        
        // Step 1: Verify session
        const token = getSessionToken();
        const response = await fetch(buildApiUrl("check_session.php"), {
          method: "GET",
          credentials: "include",
          headers: buildHeaders(),
        });
        
        const apiResponse = await response.json();
        
        if (apiResponse.response === 'Ok' && 
            apiResponse.data && 
            apiResponse.data.status === 'logged_in') {
          
          setIsLogged(true);
          
          // Step 2: Only fetch user data if session is valid
          await fetchUserData();
          
        } else {
          // Session invalid - redirect to login
          console.log('❌ Session invalid, redirecting to login');
          setIsLogged(false);
          if (token) {
            localStorage.removeItem('geoterra_session_token');
          }
          navigate('/');
        }
      } catch (err) {
        console.error("Session check failed:", err);
        setIsLogged(false);
        localStorage.removeItem('geoterra_session_token');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    // Fetch user data (only called after session verification)
    const fetchUserData = async () => {
      try {
        const response = await fetch(buildApiUrl("user_info.php"), { 
          credentials: 'include',
          headers: buildHeaders(), // Include session token
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.response === 'Ok' && data.data) {
            setUser({
              name: data.data.name || data.data.email || 'Usuario',
              requestedPoints: data.data.requestedPoints || 0,
            });
          } else {
            setUser({ name: 'Usuario', requestedPoints: 0 });
          }
        } else {
          setUser({ name: 'Usuario', requestedPoints: 0 });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser({ name: 'Usuario', requestedPoints: 0 });
      }
    };

    checkSessionAndFetchData();
  }, [navigate]);

  // Show loading while verifying session
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96 p-4">
        <p className="text-lg md:text-xl">
          Verificando sesión...
        </p>
      </div>
    );
  }

  // Only render dashboard if user is properly logged in
  if (!isLogged) {
    return (
      <div className="flex justify-center items-center min-h-96 p-4">
        <p className="text-lg md:text-xl text-center">
          Acceso no autorizado
        </p>
      </div>
    );
  }

  return <Dashboard user={user} />;
};

export default LoggedMainPage;