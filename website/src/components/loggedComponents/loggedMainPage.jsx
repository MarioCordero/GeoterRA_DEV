import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../colorModule.css";
import '../../fontsModule.css';
import { buildApiUrl } from '../../config/apiConf';

const Dashboard = ({ user }) => (
  <div
    style={{
      width: '100%',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      color: '#222',
      background: '#f5f5f5',
      borderRadius: '8px',
      margin: '2rem 0',
      padding: '2rem',
    }}
  >
    <div style={{ marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 'bold' }}>
      ¡Bienvenido, {user?.name || 'Usuario'}!
    </div>
    <div>
      <span style={{ fontWeight: 'bold' }}>Puntos solicitados:</span>{' '}
      <span style={{ color: '#fa8c16', fontSize: '1.8rem' }}>
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <p>Verificando sesión...</p>
      </div>
    );
  }

  // Only render dashboard if user is properly logged in
  if (!isLogged) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <p>Acceso no autorizado</p>
      </div>
    );
  }

  return <Dashboard user={user} />;
};

export default LoggedMainPage;