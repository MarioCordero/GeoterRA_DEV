import AddRequest from './AddRequest';
import React, { useState, useEffect } from 'react';
import { DeleteOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { analysisRequestIndex, analysisRequestDelete } from '../../config/apiConf';
import { Table, Button, Modal, Tag, message, Empty, Collapse } from 'antd';
import RequestDetails from './RequestDetails';

/**
 * UserRequests Component
 * 
 * Displays list of user's submitted analysis requests.
 * Features: view details, edit request, delete request with confirmation, responsive table/card layout for mobile.
 * 
 * @component
 */
const UserRequests = () => {
  // ─── View state ───
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // ─── Data state ───
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);

  // ─── Modal state ───
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // ─── Effects ───

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRequestAdded = () => {
    loadRequests();
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ═══════════════════════════════════════════
  // API CALLS
  // ═══════════════════════════════════════════

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await analysisRequestIndex();
      if (response.ok && Array.isArray(response.data)) {
        setRequests(response.data);
      } else if (response.ok && response.data && Array.isArray(response.data.data)) {
        setRequests(response.data.data);
      } else {
        setRequests([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading requests:', err);
      setError(err.message || 'Error al cargar solicitudes');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      const response = await analysisRequestDelete(requestId);
      if (response.ok) {
        setRequests((prev) => prev.filter((r) => r.request_id !== requestId && r.id_soli !== requestId));
        message.success('Solicitud eliminada correctamente');
      } else {
        throw new Error(response.error || 'Error al eliminar la solicitud');
      }
    } catch (err) {
      console.error('Error deleting request:', err);
      message.error(err.message || 'Error al eliminar la solicitud');
    }
  };

  const handleDelete = (record) => {
    const id = record.request_id || record.id_soli;
    const locationText = record.location 
      ? `${record.location.province}, ${record.location.canton}`
      : record.request_name || `Solicitud #${id}`;

    Modal.confirm({
      title: '¿Eliminar solicitud?',
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: `¿Estás seguro de que deseas eliminar la solicitud de "${locationText}"? Esta acción es permanente y no se puede deshacer.`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        await deleteRequest(id);
      },
    });
  };

  const handleViewDetails = (record) => {
    const id = record.request_id || record.id_soli;
    setSelectedRequestId(id);
    setViewModalVisible(true);
  };

  const dataSource = (requests || []).map((request, index) => ({
    key: request.request_id || request.id_soli || index,
    ...request,
  }));

  // ─── Mobile card component ───

  const MobileRequestCard = ({ request }) => (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4 border-l-4 border-blue-500 poppins">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-bold text-sm text-gray-800 m-0">
            {request.location
              ? `${request.location.province}, ${request.location.canton}, ${request.location.district}`
              : 'Sin ubicación'}
          </p>
          <p className="text-xs text-gray-500 m-0 mt-0.5">{request.owner_name || 'Sin propietario especificado'}</p>
        </div>
        <Tag color={request.state === 'Registrada' ? 'blue' : request.state === 'En revisión' ? 'orange' : 'green'}>
          {request.state || 'Registrada'}
        </Tag>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        📅 {request.created_at ? new Date(request.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible'}
      </p>

      <div className="space-y-1.5 mb-4 text-xs text-gray-600">
        {request.owner_email && <p className="m-0">📧 Email: {request.owner_email}</p>}
        {request.owner_phone_number && (
          <p className="m-0">📞 Teléfono: {request.owner_phone_number}</p>
        )}
        {request.current_usage && <p className="m-0">🏗️ Uso Actual: {request.current_usage}</p>}
        {request.temperature_sensation && (
          <p className="m-0">
            🌡️ Sensación Térmica: {request.temperature_sensation}
          </p>
        )}
        {request.bubbles && <p className="m-0">💧 Burbujeo: Sí</p>}
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
        <Button
          size="small"
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(request)}
          title="Eliminar solicitud"
        />
        <Button
          size="small"
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(request)}
          title="Ver detalles"
        />
      </div>
    </div>
  );

  // ─── Table columns ───

  const columns = [
    {
      title: 'Ubicación (Provincia, Cantón, Distrito)',
      key: 'location',
      render: (_, record) => {
        const loc = record.location;
        const text = loc ? `${loc.province}, ${loc.canton}, ${loc.district}` : 'Sin ubicación';
        return <span className="font-semibold text-gray-800">{text}</span>;
      },
    },
    {
      title: 'Propietario / Solicitante',
      dataIndex: 'owner_name',
      key: 'owner_name',
      render: (text) => <span className="text-sm text-gray-600">{text || '(No especificado)'}</span>,
    },
    {
      title: 'Fecha de Creación',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <span className="text-sm text-gray-600">
          {date ? new Date(date).toLocaleDateString('es-ES') : '-'}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'state',
      key: 'state',
      render: (state) => (
        <Tag color={state === 'Registrada' ? 'blue' : state === 'En revisión' ? 'orange' : 'green'}>
          {state || 'Registrada'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="small"
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            title="Eliminar solicitud"
          />
          <Button
            size="small"
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            title="Ver detalles"
          />
        </div>
      ),
    },
  ];

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════

  return (
    <div className="p-6 bg-gray-50 min-h-screen poppins">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 m-0 mb-1">Mis Solicitudes de Análisis</h2>
          <p className="text-sm text-gray-500 m-0">
            {requests.length} solicitud{requests.length !== 1 ? 'es' : ''} registrada{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <AddRequest onRequestAdded={handleRequestAdded} />
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Collapsible Guidance */}
      <Collapse
        className="mb-6 shadow-sm border border-amber-200 bg-amber-50/50 rounded-xl overflow-hidden"
        items={[
          {
            key: '1',
            label: <span className="font-bold text-sm text-gray-800">💡 ¿Cómo crear una solicitud de análisis?</span>,
            children: (
              <div className="text-xs text-gray-700 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">📝 Pasos para crear una nueva solicitud:</h4>
                  <ol className="m-0 pl-5 space-y-1 text-gray-600">
                    <li><strong>Haz clic en "+ Nueva Solicitud"</strong> en la esquina superior derecha</li>
                    <li><strong>Selecciona la ubicación territorial</strong> (Provincia, Cantón y Distrito)</li>
                    <li><strong>Ingresa las coordenadas GPS</strong> usando el mapa interactivo incorporado</li>
                    <li><strong>Indica si conoces al propietario</strong> del terreno o si es información opcional</li>
                    <li><strong>Describe las manifestaciones</strong> de calor (temperatura, uso actual, burbujeo)</li>
                    <li><strong>Envía la solicitud</strong> para recibir la revisión por parte del equipo técnico</li>
                  </ol>
                </div>

                <h4 className="font-semibold text-gray-800 mb-2">📊 Estados de tu solicitud:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="p-2 bg-blue-50 border-l-4 border-blue-500 rounded text-blue-900">
                    <strong>🔵 Registrada:</strong> Solicitud recibida y en espera de revisión.
                  </div>
                  <div className="p-2 bg-amber-50 border-l-4 border-amber-500 rounded text-amber-900">
                    <strong>🟡 En revisión:</strong> El equipo científico está analizando los datos.
                  </div>
                  <div className="p-2 bg-emerald-50 border-l-4 border-emerald-500 rounded text-emerald-900">
                    <strong>✅ Aprobada:</strong> Solicitud aprobada y publicada en el mapa geotérmico.
                  </div>
                  <div className="p-2 bg-red-50 border-l-4 border-red-500 rounded text-red-900">
                    <strong>❌ Rechazada:</strong> Revisa las observaciones enviadas por el equipo.
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />

      {/* Mobile view - Card layout */}
      {isMobile ? (
        <div>
          {requests.length === 0 ? (
            <Empty
              description="No hay solicitudes registradas"
              style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px' }}
            />
          ) : (
            requests.map((request, idx) => (
              <MobileRequestCard key={request.request_id || request.id_soli || idx} request={request} />
            ))
          )}
        </div>
      ) : (
        /* Desktop view - Table layout */
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} solicitudes`,
            locale: {
              items_per_page: ' por página',
              jump_to: 'Ir a',
              jump_to_confirm: 'confirmar',
              page: '',
            },
          }}
          locale={{
            emptyText: (
              <Empty
                description="No hay solicitudes registradas"
                style={{ padding: '40px 0' }}
              />
            ),
          }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        />
      )}

      {/* Detail Modal Component */}
      <RequestDetails
        requestId={selectedRequestId}
        visible={viewModalVisible}
        onClose={() => setViewModalVisible(false)}
        onUpdated={loadRequests}
        onDeleted={loadRequests}
      />
    </div>
  );
};

export default UserRequests;