import React, { useState, useEffect } from 'react';
import { Table, Typography, Divider, Spin, Alert, Tag } from 'antd';
import { useNavigate } from 'react-router-dom'; // Add this import
import AdminAddPointModal from './loggedAdminAddPointModal';
import '../../colorModule.css';
import '../../fontsModule.css';
import { buildApiUrl } from '../../config/apiConf';

const { Title } = Typography;

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate(); // Add this hook declaration


  // Session token management functions
  const getSessionToken = () => {
    return localStorage.getItem('geoterra_session_token');
  };

  const clearSessionToken = () => {
    localStorage.removeItem('geoterra_session_token');
  };

  const buildHeaders = () => {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded"
    };
    const token = getSessionToken();
    if (token) {
      headers['X-Session-Token'] = token;
    }
    return headers;
  };

  // Enhanced function to get user session with token
  const getUserSession = async () => {
    try {
      const token = getSessionToken();
      
      // Check if token exists first
      if (!token) {
        console.log("No session token found");
        return null;
      }

      const response = await fetch(buildApiUrl("check_session.php"), {
        method: "GET",
        credentials: "include",
        headers: {
          'X-Session-Token': token
        },
      });
      
      const apiResponse = await response.json();
      // console.log("Session check response:", apiResponse);
      
      // Check if the API response is successful AND user is admin
      if (apiResponse.response === 'Ok' && 
          apiResponse.data && 
          apiResponse.data.status === 'logged_in') {
        
        // Verify admin privileges
        const userData = apiResponse.data;
        if (userData.user_type === 'admin' || userData.is_admin === true || userData.admin === true) {
          return userData.user; // Return the email
        } else {
          console.log("User is not admin, redirecting...");
          navigate('/Logged'); // Redirect non-admin users to regular user page
          return null;
        }
      }
      
      // Clear invalid token and redirect
      console.log("Invalid session, clearing token");
      clearSessionToken();
      navigate('/Login');
      return null;
    } catch (error) {
      console.error("Error checking session:", error);
      clearSessionToken();
      navigate('/Login');
      return null;
    }
  };

  // Enhanced function to fetch user's requests with token
  const fetchUserRequests = async (email) => {
    try {
      const response = await fetch(buildApiUrl("get_request.inc.php"), {
        method: "POST",
        headers: buildHeaders(), // Include session token
        body: `email=${encodeURIComponent(email)}`,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      // console.log("Fetch requests response:", result);
      
      if (result.response === "Ok") {
        return result.data || [];
      } else {
        // If the API returns an error but it's about "no requests found", return empty array
        if (result.message && result.message.includes("No se encontraron solicitudes")) {
          return [];
        }
        throw new Error(result.message || "Failed to fetch requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      // If it's a "no requests found" error, return empty array instead of throwing
      if (error.message && error.message.includes("No se encontraron solicitudes")) {
        return [];
      }
      throw error;
    }
  };

  // Load requests on component mount with token verification
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First verify session and admin privileges with token
        const email = await getUserSession();
        if (!email) {
          setError("Usuario no autenticado o sin privilegios de administrador");
          return;
        }
        
        // console.log("✅ Admin session verified for user:", email);
        setUserEmail(email);
        
        // Then fetch user's requests with token
        const userRequests = await fetchUserRequests(email);
        setRequests(userRequests);
        
      } catch (err) {
        setError(err.message);
        console.error("Error loading requests:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadRequests();
  }, [navigate]);

  // Function to refresh requests with session check
  const refreshRequests = async () => {
    if (userEmail) {
      try {
        setLoading(true);
        
        // Verify session before refreshing
        const currentEmail = await getUserSession();
        if (!currentEmail) {
          setError("Sesión expirada o sin privilegios");
          return;
        }
        
        const userRequests = await fetchUserRequests(currentEmail);
        setRequests(userRequests);
        setError(null); // Clear any previous errors
      } catch (err) {
        setError(err.message);
        console.error("Error refreshing requests:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Format data for the table
  const dataSource = requests.map((request, index) => ({
    key: request.id_soli || index,
    id: `SOLI-${String(request.id_soli).padStart(4, '0')}`,
    fecha: request.fecha ? new Date(request.fecha).toLocaleDateString('es-ES') : 'N/A',
    region: request.region,
    propietario: request.propietario,
    direccion: request.direccion,
    uso_actual: request.uso_actual,
    sens_termica: request.sens_termica,
    burbujeo: request.burbujeo,
    coord_x: request.coord_x,
    coord_y: request.coord_y,
    num_telefono: request.num_telefono,
    pH_campo: request.pH_campo,
    cond_campo: request.cond_campo,
  }));

  // Table columns
  const columns = [
    {
      title: 'ID del Punto',
      dataIndex: 'id',
      key: 'id',
      width: '25%',
    },
    {
      title: 'Fecha solicitud',
      dataIndex: 'fecha',
      key: 'fecha',
      width: '25%',
    },
    {
      title: 'Estado',
      key: 'estado',
      width: '25%',
      render: () => <Tag color="orange">Pendiente</Tag>,
    },
    {
      title: 'Opciones',
      key: 'opciones',
      width: '25%',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            style={{
              padding: '4px 8px',
              backgroundColor: '#f5222d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            onClick={() => {
              // Delete functionality
              console.log('Eliminar:', record);
            }}
          >
            Eliminar
          </button>
          <button 
            style={{
              padding: '4px 8px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            onClick={() => {
              // View details functionality
              console.log('Ver detalles:', record);
            }}
          >
            Ver
          </button>
          <button 
            style={{
              padding: '4px 8px',
              backgroundColor: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            onClick={() => {
              // Edit functionality
              console.log('Editar:', record);
            }}
          >
            Editar
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Cargando solicitudes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        Mis Solicitudes ({requests.length})
      </Title>
      <div style={{ marginBottom: '16px', textAlign: 'right' }}>
        <AdminAddPointModal onRequestAdded={refreshRequests} />
      </div>
      <Divider />
      
      {requests.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#666'
        }}>
          <p style={{ fontSize: '16px' }}>No tienes solicitudes registradas</p>
          <p>Utiliza el botón "Agregar Punto" para crear tu primera solicitud</p>
        </div>
      ) : (
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} solicitudes`,
          }}
          bordered
          scroll={{ x: 1200 }}
          style={{ marginTop: '16px' }}
        />
      )}
      
      <Divider />
    </div>
  );
};

export default Requests;