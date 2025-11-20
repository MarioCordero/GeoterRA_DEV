import React, { useState, useEffect } from 'react';
import { Spin, Tag, Button } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import AddPointModal from './AddPointModal';
import { useNavigate } from 'react-router-dom';
import '../../colorModule.css';
import '../../fontsModule.css';
import { buildApiUrl } from '../../config/apiConf';
import NotImplementedModal from './NotImplementedModal';

const RequestsTable = ({ isAdmin = false }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      
      if (data.response === "Ok" && data.data && data.data.status === 'logged_in') {
        // If admin required, verify privileges
        if (isAdmin) {
          const userData = data.data;
          if (userData.user_type === 'admin' || userData.is_admin === true || userData.admin === true) {
            return userData.user;
          } else {
            console.log("User is not admin");
            navigate('/Logged');
            return null;
          }
        }
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
          setError(isAdmin 
            ? "Usuario no autenticado o sin privilegios de administrador" 
            : "Usuario no autenticado");
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
  }, [navigate, isAdmin]);

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
  const handleDelete = (record) => {
    setIsModalOpen(true);
  };

  const handleView = (record) => {
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setIsModalOpen(true);
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

  // Mobile card component
  const MobileRequestCard = ({ request }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <p className="font-semibold text-sm">{request.id}</p>
        <Tag color="orange">Pendiente</Tag>
      </div>
      
      <p className="text-xs text-gray-500 mb-3">Fecha: {request.fecha}</p>
      
      {request.region && (
        <div className="mb-2">
          <p className="text-sm"><strong>Región:</strong> {request.region}</p>
        </div>
      )}
      
      {request.propietario && (
        <div className="mb-2">
          <p className="text-sm"><strong>Propietario:</strong> {request.propietario}</p>
        </div>
      )}
      
      {request.direccion && (
        <div className="mb-3">
          <p className="text-sm"><strong>Dirección:</strong> {request.direccion}</p>
        </div>
      )}
      
      <div className="flex gap-2 justify-end">
        <Button
          size="small"
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(request)}
        />
        <Button
          size="small"
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleView(request)}
        />
        <Button
          size="small"
          type="primary"
          icon={<EditOutlined />}
          className="bg-green-500 border-green-500"
          onClick={() => handleEdit(request)}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-52 p-6">
        <Spin size="large" />
        <p className="mt-4 text-sm md:text-base">Cargando solicitudes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="font-semibold text-red-800">Error</p>
          <p className="text-red-700 text-sm">{error}</p>
          {error === "Sesión expirada" && (
            <Button 
              type="primary"
              size="small"
              onClick={() => navigate('/Login')}
              className="mt-3"
            >
              Iniciar Sesión
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full p-4 md:p-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Mis Solicitudes ({requests.length})
          </h1>
          
          <AddPointModal 
            onRequestAdded={refreshRequests}
            isAdmin={isAdmin} 
            useTokenAuth={isAdmin}
          />
        </div>
        
        <hr className="my-4" />
        
        {/* Content Section */}
        {requests.length === 0 ? (
          <div className="text-center p-8 md:p-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-2">No tienes solicitudes registradas</p>
            <p className="text-gray-400 text-sm">
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
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="p-3 text-left font-semibold">ID del Punto</th>
                      <th className="p-3 text-left font-semibold">Fecha solicitud</th>
                      <th className="p-3 text-left font-semibold">Estado</th>
                      <th className="p-3 text-left font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataSource.map((request) => (
                      <tr key={request.key} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3">{request.id}</td>
                        <td className="p-3">{request.fecha}</td>
                        <td className="p-3">
                          <Tag color="orange">Pendiente</Tag>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              size="small"
                              type="primary"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete(request)}
                            />
                            <Button
                              size="small"
                              type="primary"
                              icon={<EyeOutlined />}
                              onClick={() => handleView(request)}
                            />
                            <Button
                              size="small"
                              type="primary"
                              icon={<EditOutlined />}
                              className="bg-green-500 border-green-500"
                              onClick={() => handleEdit(request)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        
        <hr className="my-4" />
      </div>

      {/* NotImplemented Modal */}
      <NotImplementedModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default RequestsTable;