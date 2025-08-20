import React, { useEffect, useState } from 'react';
import "../../colorModule.css";
import '../../fontsModule.css';

import { buildApiUrl } from '../../config/apiConf';


const Dashboard = ({ user, loading, error }) => {
  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: '#666',
          background: '#f5f5f5',
          borderRadius: '8px',
          margin: '2rem 0',
          padding: '2rem',
        }}
      >
        Cargando....
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: '#ff4d4f',
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '8px',
          margin: '2rem 0',
          padding: '2rem',
        }}
      >
        Error: {error}
      </div>
    );
  }

  return (
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
      {user?.isAdmin && (
        <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#e6f7ff', borderRadius: '4px', color: '#1890ff' }}>
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
        const response = await fetch(buildApiUrl("check_session.php"), {
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
          console.log('Session is not active:', sessionData.message);
          setError('Sesión no activa. Por favor, inicia sesión nuevamente.');
          
          // Optional: Redirect to login page
          // window.location.href = '/login';
        }
      } catch (err) {
        console.error('Session initialization failed:', err);
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