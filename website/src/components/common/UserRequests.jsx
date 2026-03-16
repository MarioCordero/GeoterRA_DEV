import React, { useState, useEffect } from 'react';
import { Spin, Tag, Button } from 'antd';
import AddPointModal from './AddPointModal';
import { useNavigate } from 'react-router-dom';
import '../../colorModule.css';
import '../../fontsModule.css';
import { registeredManifestations } from '../../config/apiConf';
import NotImplementedModal from './NotImplementedModal';
import UserRequestsMobile from './mobile/UserRequestsMobile';
import UserRequestsDesktop from './desktop/UserRequestsDesktop';

const RequestsTable = ({ isAdmin = false }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth <= 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchUserRequests = async () => {
    try {
      const res = await fetch(registeredManifestations.index(), {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (res.status === 401) {
        navigate('/Login');
        return [];
      }
      if (res.status === 403) {
        navigate(isAdmin ? '/Logged' : '/Login');
        return [];
      }
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      if (result.response === 'Ok') return result.data || [];
      if (result.message && result.message.includes('No se encontraron solicitudes')) return [];
      throw new Error(result.message || 'Failed to fetch requests');
    } catch (err) {
      console.error('Error fetching registered manifestations:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUserRequests();
        setRequests(data);
      } catch (err) {
        setError(err.message || 'Error cargando solicitudes');
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [navigate, isAdmin]);

  const refreshRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUserRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Error refrescando solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record) => {
    setSelectedRequest(record);
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedRequest(record);
    setIsModalOpen(true);
  };

  const handleDelete = (record) => {
    setSelectedRequest(record);
    setIsModalOpen(true);
  };

  const dataSource = (requests || []).map((request, index) => ({
    key: request.id_soli || index,
    id: `SOLI-${String(request.id_soli || index).padStart(4, '0')}`,
    fecha: request.fecha ? new Date(request.fecha).toLocaleDateString('es-ES') : 'N/A',
    region: request.region || '',
    propietario: request.propietario || '',
    direccion: request.direccion || '',
    uso_actual: request.uso_actual || '',
    sens_termica: request.sens_termica || '',
    burbujeo: request.burbujeo || '',
    coord_x: request.coord_x || '',
    coord_y: request.coord_y || '',
    num_telefono: request.num_telefono || '',
    pH_campo: request.pH_campo || '',
    cond_campo: request.cond_campo || '',
    raw: request,
  }));

  return (
    <>
      <div className="w-full p-4 md:p-6">
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

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-52 p-6">
            <Spin size="large" />
            <p className="mt-4 text-sm md:text-base">Cargando solicitudes...</p>
          </div>
        ) : error ? (
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
        ) : requests.length === 0 ? (
          <div className="text-center p-8 md:p-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-2">No tienes solicitudes registradas</p>
            <p className="text-gray-400 text-sm">Utiliza el botón "Agregar Punto" para crear tu primera solicitud</p>
          </div>
        ) : (
          <>
            {isMobile ? (
              <UserRequestsMobile
                data={dataSource}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                refresh={refreshRequests}
              />
            ) : (
              <UserRequestsDesktop
                data={dataSource}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                refresh={refreshRequests}
              />
            )}
          </>
        )}

        <hr className="my-4" />
      </div>

      <NotImplementedModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default RequestsTable;