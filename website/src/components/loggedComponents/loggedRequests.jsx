import React, { useState, useEffect } from 'react';
import { Table, Typography, Divider, Spin, Alert, Tag, Button, Card, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import AddPointModal from './loggedAddPointModal';
import { useNavigate } from 'react-router-dom';
import '../../colorModule.css';
import '../../fontsModule.css';
import { buildApiUrl } from '../../config/apiConf';

const { Title, Text } = Typography;

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
      
      const data = await response.json();
      
      if (data.response === "Ok" && 
          data.data && 
          data.data.status === 'logged_in') {
        return data.data.user;
      }
      
      if (data.debug) {
        console.log("Debug info:", data.debug);
      }
      
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
        headers: buildHeaders(),
        body: `email=${encodeURIComponent(email)}`,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.response === "Ok") {
        return result.data || [];
      } else {
        if (result.message && result.message.includes("No se encontraron solicitudes")) {
          return [];
        }
        throw new Error(result.message || "Failed to fetch requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      if (error.message && error.message.includes("No se encontraron solicitudes")) {
        return [];
      }
      throw error;
    }
  };

  // Load requests on component mount with session verification
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const email = await getUserSession();
        if (!email) {
          setError("Usuario no autenticado");
          return;
        }
        
        setUserEmail(email);
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
        
        const currentEmail = await getUserSession();
        if (!currentEmail) {
          setError("Sesión expirada");
          return;
        }
        
        const userRequests = await fetchUserRequests(currentEmail);
        setRequests(userRequests);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error refreshing requests:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Enhanced delete function with token
  const handleDelete = async (record) => {
    try {
      const currentEmail = await getUserSession();
      if (!currentEmail) {
        setError("Sesión expirada");
        return;
      }

      console.log('Eliminar:', record);
    } catch (error) {
      console.error("Error deleting request:", error);
      setError("Error al eliminar la solicitud");
    }
  };

  const handleView = (record) => {
    console.log('Ver detalles:', record);
  };

  const handleEdit = (record) => {
    console.log('Editar:', record);
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

  // Desktop Table columns
  const columns = [
    {
      title: 'ID del Punto',
      dataIndex: 'id',
      key: 'id',
      width: '25%',
      responsive: ['md'],
    },
    {
      title: 'Fecha solicitud',
      dataIndex: 'fecha',
      key: 'fecha',
      width: '25%',
      responsive: ['sm'],
    },
    {
      title: 'Estado',
      key: 'estado',
      width: '25%',
      render: () => <Tag color="orange">Pendiente</Tag>,
      responsive: ['md'],
    },
    {
      title: 'Acciones',
      key: 'opciones',
      width: '25%',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <Button
            size="small"
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
          <Button
            size="small"
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            size="small"
            type="primary"
            icon={<EditOutlined />}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => handleEdit(record)}
          />
        </div>
      ),
    },
  ];

  // Mobile card component
  const MobileRequestCard = ({ request }) => (
    <Card
      size="small"
      style={{ 
        marginBottom: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: '14px' }}>
            {request.id}
          </Text>
          <Tag color="orange" style={{ margin: 0 }}>
            Pendiente
          </Tag>
        </div>
      }
    >
      <div style={{ marginBottom: '12px' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Fecha: {request.fecha}
        </Text>
      </div>
      
      {request.region && (
        <div style={{ marginBottom: '8px' }}>
          <Text style={{ fontSize: '13px' }}>
            <strong>Región:</strong> {request.region}
          </Text>
        </div>
      )}
      
      {request.propietario && (
        <div style={{ marginBottom: '8px' }}>
          <Text style={{ fontSize: '13px' }}>
            <strong>Propietario:</strong> {request.propietario}
          </Text>
        </div>
      )}
      
      {request.direccion && (
        <div style={{ marginBottom: '12px' }}>
          <Text style={{ fontSize: '13px' }}>
            <strong>Dirección:</strong> {request.direccion}
          </Text>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Button
          size="small"
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(request)}
        >
          Eliminar
        </Button>
        <Button
          size="small"
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleView(request)}
        >
          Ver
        </Button>
        <Button
          size="small"
          type="primary"
          icon={<EditOutlined />}
          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          onClick={() => handleEdit(request)}
        >
          Editar
        </Button>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div style={{ 
        padding: 'clamp(16px, 4vw, 24px)', 
        textAlign: 'center',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Spin size="large" />
        <p style={{ 
          marginTop: '16px', 
          fontSize: 'clamp(14px, 3vw, 16px)' 
        }}>
          Cargando solicitudes...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 'clamp(16px, 4vw, 24px)' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            error === "Sesión expirada" && (
              <Button 
                type="primary"
                size="small"
                onClick={() => navigate('/Login')}
              >
                Iniciar Sesión
              </Button>
            )
          }
        />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 'clamp(16px, 4vw, 24px)',
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        marginBottom: 'clamp(16px, 4vw, 24px)',
        gap: '16px'
      }}>
        <Title 
          level={isMobile ? 3 : 2} 
          style={{ 
            margin: 0,
            fontSize: isMobile ? 'clamp(18px, 5vw, 24px)' : 'clamp(24px, 4vw, 32px)'
          }}
        >
          Mis Solicitudes ({requests.length})
        </Title>
        
        <AddPointModal 
          onRequestAdded={refreshRequests}
          trigger={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-geoterra-orange"
              size={isMobile ? "middle" : "large"}
              style={{
                borderRadius: '8px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {isMobile ? "Agregar" : "Agregar Punto"}
            </Button>
          }
        />
      </div>
      
      <Divider style={{ margin: '16px 0' }} />
      
      {/* Content Section */}
      {requests.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 'clamp(24px, 6vw, 40px)',
          color: '#666',
          backgroundColor: '#fafafa',
          borderRadius: '8px',
          border: '1px dashed #d9d9d9'
        }}>
          <p style={{ 
            fontSize: 'clamp(14px, 3vw, 16px)',
            marginBottom: '8px'
          }}>
            No tienes solicitudes registradas
          </p>
          <p style={{ 
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            color: '#999'
          }}>
            Utiliza el botón "Agregar Punto" para crear tu primera solicitud
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View - Cards */}
          {isMobile ? (
            <div>
              {dataSource.map((request) => (
                <MobileRequestCard key={request.key} request={request} />
              ))}
            </div>
          ) : (
            /* Desktop View - Table */
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} de ${total} solicitudes`,
                responsive: true,
              }}
              bordered
              scroll={{ x: 800 }}
              style={{ 
                marginTop: '16px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
              size="middle"
            />
          )}
        </>
      )}
      
      <Divider style={{ margin: '16px 0' }} />
    </div>
  );
};

export default Requests;