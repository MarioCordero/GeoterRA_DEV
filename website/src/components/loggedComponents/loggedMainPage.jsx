import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    // Check session on mount and log result
    const checkSession = async () => {
      try {
        const response = await fetch(buildApiUrl("check_session.php"), { credentials: 'include' });
        const apiResponse = await response.json();
        if (apiResponse.response === 'Ok' && apiResponse.data.status === 'logged_in') {
          console.log('Session is active');
        } else {
          console.log('Session is not active');
        }
      } catch {
        console.log('Session check failed');
      }
    };

    checkSession();

    // Fetch user data as before
    const fetchUserData = async () => {
      try {
        const response = await fetch(buildApiUrl("user_info.php"), { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUser({
            name: data.name,
            requestedPoints: data.requestedPoints,
          });
        } else {
          setUser({ name: 'Usuario', requestedPoints: 0 });
        }
      } catch {
        setUser({ name: 'Usuario', requestedPoints: 0 });
      }
    };

    fetchUserData();
  }, []);

  return <Dashboard user={user} />;
};

export default LoggedMainPage;