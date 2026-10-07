import React, { useState, useEffect, useMemo } from 'react';
import AddRequest from './AddRequest';
import RequestDetails from './RequestDetails';
import {
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ClearOutlined,
  QuestionCircleOutlined,
  CompassOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { analysisRequestIndex, analysisRequestDelete } from '../../config/apiConf';
import { Table, Button, Modal, Tag, message, Empty, Input, Select, Tooltip, Popconfirm, Spin, Space } from 'antd';
import { renderDateWithProse } from '../../utils/dateFormatter';

/**
 * UserRequests Component
 *
 * Displays list of user's submitted analysis requests.
 * Features: view details, delete request with confirmation, interactive KPI cards, search, filters, responsive table/card layout.
 */
const UserRequests = () => {
  // ─── View state ───
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // ─── Data state ───
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);

  // ─── Filters state ───
  const [searchText, setSearchText] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [guideModalVisible, setGuideModalVisible] = useState(false);

  // ─── Modal state ───
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

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
        setRequests((prev) =>
          prev.filter((r) => r.request_id !== requestId && r.id_soli !== requestId)
        );
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
      centered: true,
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

  // Compute metrics
  const stats = useMemo(() => {
    const total = requests.length;
    const registered = requests.filter((r) => {
      const s = (r.state || '').toLowerCase();
      return s.includes('reg') || s.includes('pend');
    }).length;
    const inReview = requests.filter((r) => (r.state || '').toLowerCase().includes('revis')).length;
    const approved = requests.filter((r) => {
      const s = (r.state || '').toLowerCase();
      return s.includes('aprob') || s.includes('proc') || s.includes('analiz') || s.includes('acept');
    }).length;
    return { total, registered, inReview, approved };
  }, [requests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const q = searchText.trim().toLowerCase();
      const locText = r.location
        ? `${r.location.province || ''} ${r.location.canton || ''} ${r.location.district || ''}`.toLowerCase()
        : '';
      const matchesSearch =
        !q ||
        locText.includes(q) ||
        (r.request_name && r.request_name.toLowerCase().includes(q)) ||
        (r.owner_name && r.owner_name.toLowerCase().includes(q)) ||
        (String(r.id_soli || r.request_id) && String(r.id_soli || r.request_id).includes(q));

      let matchesState = true;
      if (stateFilter !== 'ALL') {
        const s = (r.state || '').toLowerCase();
        if (stateFilter === 'REGISTRADA') matchesState = s.includes('reg') || s.includes('pend');
        else if (stateFilter === 'REVISION') matchesState = s.includes('revis');
        else if (stateFilter === 'APROBADA')
          matchesState = s.includes('aprob') || s.includes('proc') || s.includes('analiz') || s.includes('acept');
      }

      return matchesSearch && matchesState;
    });
  }, [requests, searchText, stateFilter]);

  // State badge renderer
  const renderStateBadge = (state) => {
    const s = (state || 'Registrada').toLowerCase();
    if (s.includes('reg') || s.includes('pend')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <ClockCircleOutlined /> Registrada
        </span>
      );
    }
    if (s.includes('revis')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <SyncOutlined spin /> En Revisión
        </span>
      );
    }
    if (s.includes('aprob') || s.includes('proc') || s.includes('analiz') || s.includes('acept')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircleOutlined /> Aprobada en Mapa
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
        {state || 'Registrada'}
      </span>
    );
  };

  // Mobile card
  const MobileRequestCard = ({ request }) => {
    const id = request.request_id || request.id_soli;
    const loc = request.location;
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3 space-y-3 poppins transition hover:shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <span
              onClick={() => handleViewDetails(request)}
              className="poppins-bold text-base text-geoterra-blue block hover:underline cursor-pointer"
            >
              {loc ? `${loc.province}, ${loc.canton}` : request.request_name || `Solicitud #${id}`}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              #{id} • {renderDateWithProse(request.created_at, { showIcon: false })}
            </span>
          </div>
          {renderStateBadge(request.state)}
        </div>

        <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-700 space-y-1 border border-gray-100">
          {loc?.district && (
            <div className="flex items-center gap-1 text-gray-600">
              <EnvironmentOutlined className="text-geoterra-blue" />
              <span>Distrito: {loc.district}</span>
            </div>
          )}
          {request.owner_name && (
            <p className="m-0 text-gray-600">👤 Titular: {request.owner_name}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(request)}
            className="text-geoterra-blue border-blue-200 bg-blue-50/50 poppins font-medium"
          >
            Ver Detalles
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(request)}
          />
        </div>
      </div>
    );
  };

  // Table columns
  const columns = [
    {
      title: 'Ubicación / Territorio',
      key: 'location',
      render: (_, record) => {
        const loc = record.location;
        const text = loc ? `${loc.province}, ${loc.canton}, ${loc.district}` : 'Sin ubicación';
        const id = record.request_id || record.id_soli;
        return (
          <div className="space-y-0.5 poppins">
            <div
              onClick={() => handleViewDetails(record)}
              className="poppins-bold text-sm text-geoterra-blue hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <EnvironmentOutlined className="text-xs text-geoterra-blue" />
              {text}
            </div>
            <span className="font-mono text-xs text-gray-400">ID: #{id}</span>
          </div>
        );
      },
    },
    {
      title: 'Propietario / Solicitante',
      dataIndex: 'owner_name',
      key: 'owner_name',
      render: (text) => (
        <span className="text-xs text-gray-700 poppins font-medium">
          {text || '(No especificado)'}
        </span>
      ),
    },
    {
      title: 'Fecha de Creación',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
      render: (date) => (
        <span className="text-xs text-gray-500 poppins">
          {renderDateWithProse(date, { showIcon: false })}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'state',
      key: 'state',
      align: 'center',
      render: (state) => renderStateBadge(state),
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalles completos">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              className="text-geoterra-blue border-blue-200 bg-blue-50/50"
            />
          </Tooltip>
          <Tooltip title="Eliminar solicitud">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              className="border-red-200"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full p-4 md:p-8 space-y-6 poppins bg-gray-50/50 min-h-screen">
      {/* ========================================================================= */}
      {/* HEADER SECTION                                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold text-geoterra-orange poppins">
              Solicitudes Ciudadanas y de Campo • Mis Registros
            </span>
            <Tag className="rounded-full font-semibold text-[11px] bg-blue-50 text-geoterra-blue border-blue-200">
              {requests.length} Solicitudes
            </Tag>
          </div>
          <h1 className="text-2xl md:text-3xl poppins-bold text-geoterra-blue m-0 flex items-center gap-2.5">
            <FileTextOutlined className="text-geoterra-blue" /> Mis Solicitudes de Análisis
          </h1>
          <p className="text-xs md:text-sm text-gray-500 m-0 mt-1 poppins">
            Consulta el avance, evaluación geocientífica e incorporación de tus puntos geotérmicos registrados.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <AddRequest onRequestAdded={handleRequestAdded} />
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={loadRequests}
            loading={loading}
            className="poppins font-medium border-gray-300"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* ========================================================================= */}
      {/* METRICS DASHBOARD                                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div
          onClick={() => setStateFilter('ALL')}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            stateFilter === 'ALL'
              ? 'border-geoterra-blue shadow-md ring-2 ring-blue-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Enviadas</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-geoterra-blue flex items-center justify-center text-base">
              <FileTextOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-gray-900">{stats.total}</span>
            <span className="text-xs text-gray-400">solicitudes</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">Histórico personal</div>
        </div>

        {/* Registradas */}
        <div
          onClick={() => setStateFilter('REGISTRADA')}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            stateFilter === 'REGISTRADA'
              ? 'border-amber-400 shadow-md ring-2 ring-amber-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Registradas</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-base">
              <ClockCircleOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-amber-900">{stats.registered}</span>
            <span className="text-xs text-amber-600">en espera</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium">Pendientes de revisión técnica</div>
        </div>

        {/* En Revision */}
        <div
          onClick={() => setStateFilter('REVISION')}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            stateFilter === 'REVISION'
              ? 'border-blue-400 shadow-md ring-2 ring-blue-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">En Revisión</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-base">
              <SyncOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-blue-900">{stats.inReview}</span>
            <span className="text-xs text-blue-600">en análisis</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium">Equipo técnico evaluando</div>
        </div>

        {/* Aprobadas */}
        <div
          onClick={() => setStateFilter('APROBADA')}
          className={`cursor-pointer bg-white p-5 rounded-xl border transition-all ${
            stateFilter === 'APROBADA'
              ? 'border-emerald-400 shadow-md ring-2 ring-emerald-100'
              : 'border-gray-200 shadow-sm hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Aprobadas</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-base">
              <CheckCircleOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold poppins text-emerald-900">{stats.approved}</span>
            <span className="text-xs text-emerald-600">en inventario</span>
          </div>
          <div className="mt-2 text-xs text-emerald-700 font-medium">Visibles en mapa de GeoterRA</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WORKFLOW BANNER HELPER                                                    */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-blue-50/70 via-white to-amber-50/50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-geoterra-blue flex items-center justify-center text-lg flex-shrink-0">
            <CompassOutlined />
          </div>
          <div>
            <h4 className="font-bold text-sm text-geoterra-blue m-0 poppins">Guía para el Ciudadano e Investigador</h4>
            <p className="text-xs text-gray-500 m-0 poppins">
              Conoce cómo se evalúan las solicitudes desde su registro hasta su publicación oficial en el mapa.
            </p>
          </div>
        </div>
        <Button
          size="small"
          icon={<QuestionCircleOutlined />}
          onClick={() => setGuideModalVisible(true)}
          className="poppins font-medium text-geoterra-blue border-blue-200 hover:border-geoterra-blue flex-shrink-0"
        >
          ¿Cómo Funciona?
        </Button>
      </div>

      {/* ========================================================================= */}
      {/* FILTER & DATA TABLE CARD                                                  */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row gap-3 items-center">
            <Input
              placeholder="Buscar por provincia, cantón, titular o ID..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="w-full sm:max-w-md rounded-lg py-1.5"
            />

            <Select
              value={stateFilter}
              onChange={(val) => setStateFilter(val)}
              className="w-full sm:w-48"
            >
              <Select.Option value="ALL">Todos los Estados</Select.Option>
              <Select.Option value="REGISTRADA">🟡 Registradas</Select.Option>
              <Select.Option value="REVISION">🔵 En Revisión</Select.Option>
              <Select.Option value="APROBADA">🟢 Aprobadas / En Mapa</Select.Option>
            </Select>

            {(searchText || stateFilter !== 'ALL') && (
              <Button
                icon={<ClearOutlined />}
                onClick={() => {
                  setSearchText('');
                  setStateFilter('ALL');
                }}
                className="poppins text-xs text-gray-500"
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-400 poppins whitespace-nowrap self-end sm:self-center">
            Mostrando <strong className="text-gray-700">{filteredRequests.length}</strong> de{' '}
            <strong className="text-gray-700">{requests.length}</strong> solicitudes
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <Spin size="large" tip="Cargando solicitudes..." />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-12 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
            <Empty
              description={
                <span className="text-gray-500 text-sm poppins">
                  {requests.length === 0
                    ? 'Aún no has registrado solicitudes de análisis geotérmico'
                    : 'No se encontraron solicitudes con los filtros aplicados'}
                </span>
              }
            />
          </div>
        ) : isMobile ? (
          <div>
            {filteredRequests.map((request, idx) => (
              <MobileRequestCard
                key={request.request_id || request.id_soli || idx}
                request={request}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <Table
              columns={columns}
              dataSource={filteredRequests}
              rowKey={(r) => r.request_id || r.id_soli}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                className: 'poppins py-2',
              }}
              className="poppins"
            />
          </div>
        )}
      </div>

      {/* Guide Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-xl text-geoterra-blue flex items-center gap-2">
              <QuestionCircleOutlined className="text-geoterra-blue" />
              Guía de Solicitudes Geotérmicas GeoterRA
            </span>
          </div>
        }
        open={guideModalVisible}
        onCancel={() => setGuideModalVisible(false)}
        footer={[
          <Button
            key="ok"
            type="primary"
            style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
            className="poppins-bold"
            onClick={() => setGuideModalVisible(false)}
          >
            Entendido
          </Button>,
        ]}
        width={750}
        centered
      >
        <div className="py-2 space-y-4 poppins text-sm text-gray-700">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h4 className="font-bold text-geoterra-blue m-0 flex items-center gap-2 text-base">
              📝 Pasos para Registrar una Solicitud
            </h4>
            <ol className="m-0 pl-5 space-y-1.5 text-xs text-gray-600">
              <li>Haz clic en el botón <strong>"Agregar Solicitud"</strong>.</li>
              <li>Selecciona la provincia, cantón y distrito de Costa Rica.</li>
              <li>Ubica el punto geotermal con precisión haciendo clic en el mapa satelital.</li>
              <li>Indica la temperatura estimada, si hay burbujeo o vapor, y el uso actual del terreno.</li>
              <li>Envía la solicitud para que el equipo científico programe su verificación de campo.</li>
            </ol>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2 text-xs">
            <h4 className="font-bold text-geoterra-blue m-0 flex items-center gap-2 text-sm">
              📊 Estados de la Solicitud
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                <strong>🟡 Registrada:</strong> Recibida por la plataforma, en espera de revisión.
              </div>
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                <strong>🔵 En Revisión:</strong> Investigadores analizando contexto y programando gira.
              </div>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
                <strong>🟢 Aprobada:</strong> Confirmada y publicada en el mapa oficial de GeoterRA.
              </div>
            </div>
          </div>
        </div>
      </Modal>

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