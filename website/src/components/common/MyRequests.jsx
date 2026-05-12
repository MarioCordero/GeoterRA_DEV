import AddRequest from './AddRequest';
import NotImplementedModal from './NotImplementedModal';
import React, { useState, useEffect, useRef } from 'react';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Table, Button, Modal, Tag, message, Empty, Drawer, Divider, Collapse } from 'antd';
import { analysisRequestIndex, analysisRequestDelete } from '../../config/apiConf';


/**
 * MyRequests Component
 * 
 * Displays list of user's submitted analysis requests.
 * Features: view details, delete request, responsive table/card layout for mobile.
 * 
 * @component
 * @example
 * <MyRequests />
 */
const MyRequests = () => {
  // ─── View state ───
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const reloadRef = useRef(0);

  // ─── Data state ───
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);

  // ─── Modal/Drawer state ───
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [notImplementedModalOpen, setNotImplementedModalOpen] = useState(false);

  // ─── Effects ───

  useEffect(() => {
    loadRequests();
  }, [reloadRef.current]);

  const handleRequestAdded = () => {
    // Trigger reload by updating ref
    reloadRef.current += 1;
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
      await analysisRequestDelete(requestId);
      setRequests((prev) => prev.filter((r) => r.id_soli !== requestId));
      message.success('Solicitud eliminada correctamente');
    } catch (err) {
      console.error('Error deleting request:', err);
      message.error(err.message || 'Error al eliminar solicitud');
    }
  };

  const handleDelete = (record) => {
    setNotImplementedModalOpen(true);
  };

  // ─── Render helpers ───

  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    setViewModalVisible(true);
  };

  const dataSource = (requests || []).map((request, index) => ({
    key: request.id_soli || index,
    ...request,
  }));

  // ─── Mobile card component ───

  const MobileRequestCard = ({ request }) => (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-sm">{request.name}</p>
          <p className="text-xs text-gray-500">{request.owner_name}</p>
        </div>
        <Tag color={request.state === 'Registrada' ? 'blue' : request.state === 'En revisión' ? 'orange' : 'green'}>
          {request.state || 'Registrada'}
        </Tag>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        📅 {new Date(request.created_at).toLocaleDateString('es-ES')}
      </p>

      <div className="space-y-2 mb-4 text-sm">
        {request.email && <p>📧 Email: {request.email}</p>}
        {request.owner_contact_number && (
          <p>📞 Teléfono: {request.owner_contact_number}</p>
        )}
        {request.current_usage && <p>🏗️ Uso Actual: {request.current_usage}</p>}
        {request.temperature_sensation && (
          <p>
            🌡️ Sensación Térmica:{' '}
            {request.temperature_sensation === 'Muy frío'
              ? '❄️ Muy frío'
              : request.temperature_sensation === 'Frío'
                ? '🥶 Frío'
                : request.temperature_sensation === 'Templado'
                  ? '🌤️ Templado'
                  : request.temperature_sensation === 'Cálido'
                    ? '🔥 Cálido'
                    : request.temperature_sensation === 'Muy Caliente'
                      ? '🔥🔥 Muy Caliente'
                      : '🌶️ ' + request.temperature_sensation}
          </p>
        )}
        {request.bubbles && <p>💧 Burbujeo: ✅</p>}
      </div>

      <div className="flex gap-2 justify-end">
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
      title: 'Solicitud',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Solicitante',
      dataIndex: 'owner_name',
      key: 'owner_name',
      render: (text) => <span className="text-sm">{text}</span>,
    },
    {
      title: 'Fecha',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <span className="text-sm">
          {new Date(date).toLocaleDateString('es-ES')}
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
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>Mis Solicitudes</h2>
          <p style={{ marginBottom: 0, color: '#666', fontSize: '14px' }}>
            {requests.length} solicitud{requests.length !== 1 ? 'es' : ''} registrada{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <AddRequest onRequestAdded={handleRequestAdded} />
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fff2e8',
            border: '1px solid #ffbb96',
            borderRadius: '4px',
            marginBottom: '16px',
            color: '#d46b08',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Collapsible Guidance */}
      <Collapse
        className="mb-8"
        style={{ backgroundColor: '#fefce8', borderColor: '#fcd34d' }}
        items={[
          {
            key: '1',
            label: <span style={{ fontSize: '16px', fontWeight: 'bold' }}>💡 ¿Cómo crear una solicitud de análisis?</span>,
            children: (
              <div>
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">📝 Pasos para crear una nueva solicitud:</h4>
                  <ol style={{ margin: '0', paddingLeft: '20px', color: '#333', lineHeight: '1.8' }}>
                    <li><strong>Haz clic en "+ Nueva Solicitud"</strong> en la esquina superior derecha de esta pantalla</li>
                    <li><strong>Completa el formulario</strong> con los datos del sitio: nombre, ubicación GPS, temperatura observada y otros detalles</li>
                    <li><strong>Selecciona la región geotérmica</strong> donde se encuentra la manifestación</li>
                    <li><strong>Proporciona tu información de contacto</strong> para que el equipo de revisión pueda comunicarse contigo si es necesario</li>
                    <li><strong>Describe las observaciones</strong> sobre la actividad del sitio (burbujeo, uso actual del terreno, etc.)</li>
                    <li><strong>Envía la solicitud</strong> y recibirás una confirmación con el número de seguimiento</li>
                  </ol>
                </div>
                
                <h4 className="font-semibold text-gray-800 mb-3">📊 Estados de tu solicitud - ¿Dónde está mi solicitud?</h4>
                <div className="space-y-2">
                  <div style={{ padding: '8px 12px', backgroundColor: '#e6f7ff', borderLeftWidth: '3px', borderLeftColor: '#1890ff', borderRadius: '4px' }}>
                    <strong style={{ color: '#0050b3' }}>🔵 Registrada:</strong>
                    <span style={{ color: '#0050b3', marginLeft: '8px' }}>Tu solicitud fue recibida. Ahora está en la cola esperando revisión por parte del equipo científico.</span>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#fff7e6', borderLeftWidth: '3px', borderLeftColor: '#faad14', borderRadius: '4px' }}>
                    <strong style={{ color: '#ad6800' }}>🟡 En revisión:</strong>
                    <span style={{ color: '#ad6800', marginLeft: '8px' }}>Un investigador está analizando tu solicitud y verificando los datos proporcionados.</span>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#f6f8fb', borderLeftWidth: '3px', borderLeftColor: '#faad14', borderRadius: '4px' }}>
                    <strong style={{ color: '#ad6800' }}>🔍 Verificación de campo:</strong>
                    <span style={{ color: '#ad6800', marginLeft: '8px' }}>Se realizará una verificación de campo para confirmar los datos y condiciones del sitio.</span>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#f6f8fb', borderLeftWidth: '3px', borderLeftColor: '#faad14', borderRadius: '4px' }}>
                    <strong style={{ color: '#ad6800' }}>🧪 Análisis en laboratorio:</strong>
                    <span style={{ color: '#ad6800', marginLeft: '8px' }}>Se están realizando análisis químicos y técnicos detallados de las muestras o datos recopilados.</span>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#f6f0ff', borderLeftWidth: '3px', borderLeftColor: '#52c41a', borderRadius: '4px' }}>
                    <strong style={{ color: '#274a1c' }}>✅ Aprobada:</strong>
                    <span style={{ color: '#274a1c', marginLeft: '8px' }}>¡Solicitud completada! Tu manifestación fue publicada en el mapa interactivo de GeoterRA.</span>
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#fff1f0', borderLeftWidth: '3px', borderLeftColor: '#ff4d4f', borderRadius: '4px' }}>
                    <strong style={{ color: '#7f0000' }}>❌ Rechazada:</strong>
                    <span style={{ color: '#7f0000', marginLeft: '8px' }}>Lamentablemente, la solicitud fue rechazada. Revisa los comentarios del equipo para más información.</span>
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
              description="No hay solicitudes"
              style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px' }}
            />
          ) : (
            requests.map((request) => <MobileRequestCard key={request.id_soli} request={request} />)
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
                description="No hay solicitudes"
                style={{ padding: '40px 0' }}
              />
            ),
          }}
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
          }}
        />
      )}

      {/* Detail Drawer */}
      <Drawer
        title="Detalles de la Solicitud"
        placement="right"
        onClose={() => setViewModalVisible(false)}
        open={viewModalVisible}
        width={isMobile ? '100%' : 400}
      >
        {selectedRequest && (
          <div>
            <div>
              <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#666' }}>Solicitud</p>
              <p style={{ marginBottom: '16px', fontSize: '16px' }}>{selectedRequest.name}</p>
            </div>

            <Divider />

            <div>
              <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#666' }}>Estado</p>
              <Tag color={selectedRequest.state === 'Registrada' ? 'blue' : selectedRequest.state === 'En revisión' ? 'orange' : 'green'}>
                {selectedRequest.state || 'Registrada'}
              </Tag>
            </div>

            <Divider />

            <div>
              <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#666' }}>Solicitante</p>
              <p style={{ marginBottom: '8px' }}>{selectedRequest.owner_name}</p>
              <p style={{ marginBottom: '8px' }}>📧 {selectedRequest.email}</p>
              {selectedRequest.owner_contact_number && (
                <p style={{ marginBottom: '16px' }}>📞 {selectedRequest.owner_contact_number}</p>
              )}
            </div>

            <Divider />

            <div>
              <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#666' }}>Información del Sitio</p>
              {selectedRequest.temperature_sensation && (
                <p style={{ marginBottom: '4px' }}>🌡️ Sensación Térmica: {selectedRequest.temperature_sensation}</p>
              )}
              {selectedRequest.bubbles && (
                <p style={{ marginBottom: '4px' }}>💧 Burbujeo: Sí</p>
              )}
              {selectedRequest.current_usage && (
                <p style={{ marginBottom: '8px' }}>🏗️ Uso Actual: {selectedRequest.current_usage}</p>
              )}
            </div>

            <Divider />

            <div>
              <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#666' }}>Ubicación GPS</p>
              <p style={{ marginBottom: '4px' }}>
                📍 Lat: {selectedRequest.latitude?.toFixed(6) || 'N/A'}
              </p>
              <p style={{ marginBottom: '8px' }}>
                📍 Lng: {selectedRequest.longitude?.toFixed(6) || 'N/A'}
              </p>
            </div>

            {selectedRequest.details && (
              <>
                <Divider />
                <div>
                  <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#666' }}>Detalles Adicionales</p>
                  <p style={{ marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
                    {selectedRequest.details}
                  </p>
                </div>
              </>
            )}

            <Divider />

            <div>
              <p style={{ fontWeight: 'bold', marginBottom: '4px', color: '#666' }}>Fecha de Creación</p>
              <p>
                {new Date(selectedRequest.created_at).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}
      </Drawer>

      {/* Not Implemented Modal for delete action */}
      <NotImplementedModal
        isOpen={notImplementedModalOpen}
        onClose={() => setNotImplementedModalOpen(false)}
      />
    </div>
  );
};

export default MyRequests;