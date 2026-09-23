import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Modal, Table, Input, Tag, Space, Typography, Tabs, Tooltip, Row, Col, Badge, Empty, Select } from 'antd';
import {
  EnvironmentOutlined,
  FileSearchOutlined,
  InboxOutlined,
  BulbOutlined,
  ExperimentOutlined,
  SearchOutlined,
  CheckOutlined,
  ReloadOutlined,
  FilterOutlined,
  RightOutlined,
  CompassOutlined,
  SwapOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { fieldTripsIndex } from '../../config/apiConf';

const { Text, Title } = Typography;

const extractList = (resData) => {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData.data)) return resData.data;
  if (Array.isArray(resData.data?.data)) return resData.data.data;
  if (Array.isArray(resData.items)) return resData.items;
  return [];
};

// Schema metadata definitions for all 5 core GeoterRA entities
export const ENTITY_SCHEMAS = {
  geomanifestations: {
    key: 'geomanifestations',
    name: 'Geomanifestación',
    plural: 'Geomanifestaciones',
    icon: <EnvironmentOutlined style={{ color: '#1890ff' }} />,
    color: 'blue',
    idField: (item) => item.geomanifestation_id || item.id,
    titleField: (item) => item.geomanifestation_name || item.name || `Punto ${item.geomanifestation_id || item.id}`,
    subtitleField: (item) => {
      const parts = [item.location?.province || item.province, item.location?.canton || item.canton].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'Costa Rica';
    },
    searchMatcher: (item, term) => {
      const id = String(item.geomanifestation_id || item.id || '').toLowerCase();
      const name = String(item.geomanifestation_name || item.name || '').toLowerCase();
      const desc = String(item.description || '').toLowerCase();
      const prov = String(item.location?.province || item.province || '').toLowerCase();
      const canton = String(item.location?.canton || item.canton || '').toLowerCase();
      const tripId = String(item.field_trip_id || '').toLowerCase();
      const tripName = String(item.field_trip_name || '').toLowerCase();
      return id.includes(term) || name.includes(term) || desc.includes(term) || prov.includes(term) || canton.includes(term) || tripId.includes(term) || tripName.includes(term);
    },
  },
  georeports: {
    key: 'georeports',
    name: 'Georeporte',
    plural: 'Georeportes',
    icon: <FileSearchOutlined style={{ color: '#fa8c16' }} />,
    color: 'orange',
    idField: (item) => item.georeport_id || item.id,
    titleField: (item) => item.details || `Reporte ${item.georeport_id || item.id}`,
    subtitleField: (item) => `GM: ${item.geomanifestation_id || item.geomanifestation_name || 'N/A'}`,
    searchMatcher: (item, term) => {
      const id = String(item.georeport_id || item.id || '').toLowerCase();
      const geoId = String(item.geomanifestation_id || '').toLowerCase();
      const insituId = String(item.insitu_test_id || '').toLowerCase();
      const inlabId = String(item.inlab_test_id || '').toLowerCase();
      const details = String(item.details || '').toLowerCase();
      return id.includes(term) || geoId.includes(term) || insituId.includes(term) || inlabId.includes(term) || details.includes(term);
    },
  },
  requests: {
    key: 'requests',
    name: 'Solicitud de Análisis',
    plural: 'Solicitudes',
    icon: <InboxOutlined style={{ color: '#52c41a' }} />,
    color: 'green',
    idField: (item) => item.request_id || item.id_soli || item.id,
    titleField: (item) => item.request_name || item.name || `SOLI-${item.request_id || item.id}`,
    subtitleField: (item) => item.owner_name || item.owner_email || item.email || 'Solicitante sin nombre',
    searchMatcher: (item, term) => {
      const id = String(item.request_id || item.id_soli || item.id || '').toLowerCase();
      const name = String(item.request_name || item.name || '').toLowerCase();
      const owner = String(item.owner_name || item.email || '').toLowerCase();
      const usage = String(item.current_usage || '').toLowerCase();
      return id.includes(term) || name.includes(term) || owner.includes(term) || usage.includes(term);
    },
  },
  insitu_tests: {
    key: 'insitu_tests',
    name: 'Prueba In-Situ',
    plural: 'Pruebas In-Situ',
    icon: <BulbOutlined style={{ color: '#13c2c2' }} />,
    color: 'cyan',
    idField: (item) => item.insitu_test_id || item.id,
    titleField: (item) => `Prueba In-Situ ${item.insitu_test_id || item.id}`,
    subtitleField: (item) => `Temp: ${item.temperature ?? 'N/A'}°C | pH: ${item.ph ?? 'N/A'} | Cond: ${item.conductivity ?? 'N/A'}`,
    searchMatcher: (item, term) => {
      const id = String(item.insitu_test_id || item.id || '').toLowerCase();
      const geoId = String(item.geomanifestation_id || '').toLowerCase();
      const desc = String(item.description || '').toLowerCase();
      return id.includes(term) || geoId.includes(term) || desc.includes(term);
    },
  },
  inlab_tests: {
    key: 'inlab_tests',
    name: 'Prueba Lab',
    plural: 'Pruebas de Laboratorio',
    icon: <ExperimentOutlined style={{ color: '#722ed1' }} />,
    color: 'purple',
    idField: (item) => item.inlab_test_id || item.id,
    titleField: (item) => `Prueba Lab ${item.inlab_test_id || item.id}`,
    subtitleField: (item) => `pH: ${item.ph ?? 'N/A'} | Cond: ${item.conductivity ?? 'N/A'} | Cl: ${item.cl ?? 'N/A'}`,
    searchMatcher: (item, term) => {
      const id = String(item.inlab_test_id || item.id || '').toLowerCase();
      const geoId = String(item.geomanifestation_id || '').toLowerCase();
      const desc = String(item.description || '').toLowerCase();
      return id.includes(term) || geoId.includes(term) || desc.includes(term);
    },
  },
};

const EntityNavigatorPicker = ({
  entityType = 'geomanifestations',
  allowedEntityTypes = ['geomanifestations'],
  allowTypeSwitching = false,
  selectedId = null,
  value = null,
  onSelect = null,
  onChange = null,
  items = [],
  loading = false,
  onRefresh = null,
  label = null,
  placeholder = null,
  mode = 'banner', // 'banner' | 'compact' | 'button'
  filterParams = null,
  disabled = false,
  customColumns = null,
}) => {
  const [currentType, setCurrentType] = useState(entityType);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [fieldTripFilter, setFieldTripFilter] = useState('all'); // 'all' | 'in_trip' | 'no_trip' | specific field_trip_id
  const [fieldTrips, setFieldTrips] = useState([]);

  useEffect(() => {
    setCurrentType(entityType);
  }, [entityType]);

  // Load field trips to show names and filter options
  useEffect(() => {
    let isMounted = true;
    const loadFieldTrips = async () => {
      try {
        const res = await fieldTripsIndex({ limit: 1000 });
        if (isMounted && res.ok && res.data) {
          setFieldTrips(extractList(res.data));
        }
      } catch (err) {
        console.error('Error loading field trips in navigator:', err);
      }
    };

    loadFieldTrips();
    return () => {
      isMounted = false;
    };
  }, []);

  const fieldTripsMap = useMemo(() => {
    const map = {};
    (fieldTrips || []).forEach((trip) => {
      const id = trip.field_trip_id || trip.id;
      if (id) map[id] = trip;
    });
    return map;
  }, [fieldTrips]);

  const activeSchema = ENTITY_SCHEMAS[currentType] || ENTITY_SCHEMAS.geomanifestations;
  const activeSelectedId = selectedId !== null && selectedId !== undefined ? selectedId : value;

  // Filter items by search text, field trip filter, & filterParams
  const filteredItems = useMemo(() => {
    let list = Array.isArray(items) ? items : [];

    if (filterParams) {
      list = list.filter((item) => {
        return Object.entries(filterParams).every(([key, val]) => {
          if (!val) return true;
          return item[key] === val;
        });
      });
    }

    // Filter by field trip (for geomanifestations)
    if (currentType === 'geomanifestations' && fieldTripFilter !== 'all') {
      if (fieldTripFilter === 'in_trip') {
        list = list.filter((item) => Boolean(item.field_trip_id));
      } else if (fieldTripFilter === 'no_trip') {
        list = list.filter((item) => !item.field_trip_id);
      } else {
        list = list.filter((item) => String(item.field_trip_id) === String(fieldTripFilter));
      }
    }

    if (!searchText) return list;
    const term = searchText.toLowerCase();
    return list.filter((item) => activeSchema.searchMatcher(item, term));
  }, [items, searchText, activeSchema, filterParams, currentType, fieldTripFilter]);

  // Find currently selected item
  const selectedItem = useMemo(() => {
    if (!activeSelectedId) return null;
    return items.find((item) => String(activeSchema.idField(item)) === String(activeSelectedId));
  }, [items, activeSelectedId, activeSchema]);

  const handleItemSelect = (record) => {
    const id = activeSchema.idField(record);
    if (onSelect) {
      onSelect(id, record, currentType);
    }
    if (onChange) {
      onChange(id, record, currentType);
    }
    setModalVisible(false);
  };

  // Generate Table Columns based on entity type
  const columns = useMemo(() => {
    if (customColumns) return customColumns;

    const baseColumns = [
      {
        title: activeSchema.name,
        key: 'primary_info',
        render: (_, record) => {
          const id = activeSchema.idField(record);
          const title = activeSchema.titleField(record);
          const subtitle = activeSchema.subtitleField(record);
          return (
            <div>
              <div className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                {activeSchema.icon}
                <span>{title}</span>
              </div>
              <div className="text-xs text-gray-500 font-mono mt-0.5">
                ID: <span className="text-gray-700">{id}</span> {subtitle ? `— ${subtitle}` : ''}
              </div>
            </div>
          );
        },
      },
    ];

    if (currentType === 'geomanifestations') {
      baseColumns.push(
        {
          title: 'Gira de Campo',
          key: 'field_trip',
          width: 170,
          render: (_, record) => {
            const tripId = record.field_trip_id;
            const trip = tripId ? fieldTripsMap[tripId] : null;
            const tripName = trip?.field_trip_name || record.field_trip_name;

            return tripId ? (
              <Tooltip title={`Gira: ${tripName || tripId} ${trip?.field_trip_scheduled_date ? `(${trip.field_trip_scheduled_date})` : ''}`}>
                <Tag
                  color="orange"
                  icon={<CompassOutlined />}
                  style={{
                    fontWeight: 500,
                    maxWidth: 155,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    verticalAlign: 'middle',
                  }}
                >
                  {tripName || `Gira: ${String(tripId).slice(0, 8)}...`}
                </Tag>
              </Tooltip>
            ) : (
              <Tag color="default" style={{ color: '#8c8c8c' }}>
                Sin Gira
              </Tag>
            );
          },
        },
        {
          title: 'Ubicación / Coordenadas',
          key: 'coords',
          render: (_, record) => {
            const lat = record.location?.latitude ?? record.latitude;
            const lng = record.location?.longitude ?? record.longitude;
            return lat && lng ? (
              <span className="font-mono text-xs text-gray-600">
                {parseFloat(lat).toFixed(4)}°, {parseFloat(lng).toFixed(4)}°
              </span>
            ) : (
              <Tag color="default">Sin coords</Tag>
            );
          },
        },
        {
          title: 'Visibilidad',
          key: 'vis',
          width: 100,
          render: (_, record) => {
            const isPublic = record.visibility === 1 || record.visibility === true || record.visibility === '1';
            return isPublic ? <Tag color="green">Pública</Tag> : <Tag color="default">Borrador</Tag>;
          },
        }
      );
    } else if (currentType === 'georeports') {
      baseColumns.push(
        {
          title: 'Pruebas Vinculadas',
          key: 'linked_tests',
          render: (_, record) => (
            <Space size={4}>
              {record.insitu_test_id ? (
                <Tag color="cyan">In-Situ: {String(record.insitu_test_id).slice(0, 8)}...</Tag>
              ) : (
                <Tag color="default">Sin In-Situ</Tag>
              )}
              {record.inlab_test_id ? (
                <Tag color="purple">Lab: {String(record.inlab_test_id).slice(0, 8)}...</Tag>
              ) : (
                <Tag color="default">Sin Lab</Tag>
              )}
            </Space>
          ),
        },
        {
          title: 'Fecha',
          key: 'created_at',
          width: 120,
          render: (_, record) => (record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'),
        }
      );
    } else if (currentType === 'requests') {
      baseColumns.push(
        {
          title: 'Uso Actual',
          dataIndex: 'current_usage',
          key: 'usage',
          render: (val) => <Tag color="blue">{val || 'Otro'}</Tag>,
        },
        {
          title: 'Estado',
          key: 'state',
          render: (_, record) => {
            const st = record.state || record.current_state || 'Pendiente';
            const colorMap = { Pendiente: 'orange', Revisión: 'blue', Procesada: 'green' };
            return <Tag color={colorMap[st] || 'default'}>{st}</Tag>;
          },
        }
      );
    } else if (currentType === 'insitu_tests' || currentType === 'inlab_tests') {
      baseColumns.push(
        {
          title: 'Geomanifestación ID',
          dataIndex: 'geomanifestation_id',
          key: 'geo_id',
          render: (val) => <span className="font-mono text-xs text-blue-600">{val ? String(val).slice(0, 10) + '...' : 'N/A'}</span>,
        },
        {
          title: 'Fecha Registro',
          dataIndex: 'created_at',
          key: 'created_at',
          width: 120,
          render: (val) => (val ? new Date(val).toLocaleDateString() : 'N/A'),
        }
      );
    }

    // Action column
    baseColumns.push({
      title: 'Acción',
      key: 'action',
      width: 140,
      align: 'right',
      render: (_, record) => {
        const id = activeSchema.idField(record);
        const isSelected = String(id) === String(activeSelectedId);
        return (
          <Button
            type={isSelected ? 'primary' : 'default'}
            size="small"
            icon={isSelected ? <CheckOutlined /> : <CompassOutlined />}
            onClick={() => handleItemSelect(record)}
            style={isSelected ? { backgroundColor: '#1890ff', borderColor: '#1890ff' } : {}}
          >
            {isSelected ? 'Seleccionado' : 'Seleccionar'}
          </Button>
        );
      },
    });

    return baseColumns;
  }, [currentType, activeSchema, activeSelectedId, customColumns, fieldTripsMap]);

  // Form Compact / Button Trigger Mode
  if (mode === 'compact' || mode === 'button') {
    return (
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button
            type="dashed"
            icon={<SearchOutlined />}
            onClick={() => setModalVisible(true)}
            disabled={disabled}
            style={{ minWidth: 220, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeSchema.icon}
              <span>
                {selectedItem ? activeSchema.titleField(selectedItem) : `Explorar y seleccionar ${activeSchema.name.toLowerCase()}...`}
              </span>
            </span>
            <Space size={4}>
              {selectedItem?.field_trip_id && (
                <Tag color="orange" icon={<CompassOutlined />} style={{ margin: 0 }}>
                  Gira
                </Tag>
              )}
              <Tag color={selectedItem ? activeSchema.color : 'default'} style={{ margin: 0 }}>
                {selectedItem ? `ID: ${activeSelectedId}` : `${items.length} disponibles`}
              </Tag>
            </Space>
          </Button>

          {onRefresh && (
            <Tooltip title="Actualizar catálogo">
              <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} disabled={disabled} />
            </Tooltip>
          )}
        </div>

        {/* Modal Catalog Browser */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {activeSchema.icon}
              <span>Navegador de {activeSchema.plural} ({items.length} registros)</span>
            </div>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[<Button key="close" onClick={() => setModalVisible(false)}>Cerrar</Button>]}
          width={920}
          centered
        >
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <Input
              placeholder="Buscar por ID, nombre, gira o palabras clave..."
              prefix={<SearchOutlined style={{ color: '#aaa' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="middle"
              style={{ flex: 1, minWidth: 240 }}
            />

            {currentType === 'geomanifestations' && (
              <Select
                value={fieldTripFilter}
                onChange={setFieldTripFilter}
                style={{ minWidth: 230 }}
                options={[
                  { value: 'all', label: '🧭 Todas las Geomanifestaciones' },
                  { value: 'in_trip', label: '⭐ Solo en Giras de Campo' },
                  { value: 'no_trip', label: '📍 Solo Sin Gira de Campo' },
                  ...(fieldTrips.length > 0
                    ? [
                        {
                          label: 'Filtrar por Gira Específica',
                          options: fieldTrips.map((t) => ({
                            value: t.field_trip_id || t.id,
                            label: `🧭 ${t.field_trip_name} (${t.field_trip_scheduled_date || 'Sin fecha'})`,
                          })),
                        },
                      ]
                    : []),
                ]}
              />
            )}
          </div>

          <Table
            dataSource={filteredItems}
            columns={columns}
            rowKey={(record) => activeSchema.idField(record)}
            pagination={{ pageSize: 7, showSizeChanger: true }}
            size="small"
            locale={{ emptyText: `No se encontraron ${activeSchema.plural.toLowerCase()}` }}
          />
        </Modal>
      </div>
    );
  }

  // Explorative Banner Mode (Default)
  return (
    <Card
      type="inner"
      style={{
        marginBottom: 20,
        background: selectedItem ? '#f0f9ff' : '#f8fafc',
        borderRadius: 12,
        border: selectedItem ? '1px solid #bae6fd' : '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        {/* Left Side: Current Entity Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 280 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: selectedItem ? '#e0f2fe' : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            {activeSchema.icon}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label || `ENTIDAD SELECCIONADA PARA TRABAJAR:`}
              </Text>
              {selectedItem && (
                <Tag color={activeSchema.color} style={{ borderRadius: 10 }}>
                  {activeSchema.name}
                </Tag>
              )}
            </div>

            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginTop: 2 }}>
              {selectedItem ? (
                activeSchema.titleField(selectedItem)
              ) : (
                <span className="text-gray-400 italic">No hay ninguna {activeSchema.name.toLowerCase()} seleccionada</span>
              )}
            </div>

            {selectedItem && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  📍 {activeSchema.subtitleField(selectedItem)}
                </Text>
                <Text type="secondary" style={{ fontSize: '11px' }} className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                  ID: {activeSelectedId}
                </Text>

                {selectedItem.field_trip_id && (
                  <Tooltip title={`ID de Gira: ${selectedItem.field_trip_id}`}>
                    <Tag color="orange" icon={<CompassOutlined />} style={{ borderRadius: 10, fontWeight: 500 }}>
                      Gira: {fieldTripsMap[selectedItem.field_trip_id]?.field_trip_name || selectedItem.field_trip_name || String(selectedItem.field_trip_id).slice(0, 8)}
                    </Tag>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Explorative Actions */}
        <Space flexWrap>
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={() => setModalVisible(true)}
            disabled={disabled}
            style={{
              backgroundColor: '#1890ff',
              borderRadius: 8,
              fontWeight: 500,
              boxShadow: '0 2px 6px rgba(24,144,255,0.25)',
            }}
          >
            {selectedItem ? 'Explorar y Cambiar Entidad' : `Explorar ${activeSchema.plural}`} ({items.length})
          </Button>

          {onRefresh && (
            <Tooltip title="Actualizar catálogo">
              <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} disabled={disabled} size="large" />
            </Tooltip>
          )}
        </Space>
      </div>

      {/* Explorative Catalog Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CompassOutlined style={{ color: '#1890ff', fontSize: 20 }} />
            <span>Navegador Exploratorio de {activeSchema.plural} ({items.length} disponibles)</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Cerrar Navegador
          </Button>,
        ]}
        width={960}
        centered
      >
        {/* Category Tabs if allowed */}
        {allowTypeSwitching && allowedEntityTypes.length > 1 && (
          <Tabs
            activeKey={currentType}
            onChange={(type) => {
              setCurrentType(type);
              setSearchText('');
              setFieldTripFilter('all');
            }}
            size="middle"
            style={{ marginBottom: 16 }}
            items={allowedEntityTypes.map((type) => {
              const schema = ENTITY_SCHEMAS[type] || {};
              return {
                key: type,
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                    {schema.icon}
                    <span>{schema.plural}</span>
                  </span>
                ),
              };
            })}
          />
        )}

        {/* Search and Filters Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder={`Buscar por ID, nombre, provincia o gira...`}
            prefix={<SearchOutlined style={{ color: '#aaa' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="large"
            style={{ flex: 1, minWidth: 260 }}
          />

          {currentType === 'geomanifestations' && (
            <Select
              size="large"
              value={fieldTripFilter}
              onChange={setFieldTripFilter}
              style={{ minWidth: 240 }}
              options={[
                { value: 'all', label: '🧭 Todas las Geomanifestaciones' },
                { value: 'in_trip', label: '⭐ Solo en Giras de Campo' },
                { value: 'no_trip', label: '📍 Solo Sin Gira de Campo' },
                ...(fieldTrips.length > 0
                  ? [
                      {
                        label: 'Filtrar por Gira Específica',
                        options: fieldTrips.map((t) => ({
                          value: t.field_trip_id || t.id,
                          label: `🧭 ${t.field_trip_name} (${t.field_trip_scheduled_date || 'Sin fecha'})`,
                        })),
                      },
                    ]
                  : []),
              ]}
            />
          )}
        </div>

        <Table
          dataSource={filteredItems}
          columns={columns}
          rowKey={(record) => activeSchema.idField(record)}
          pagination={{ pageSize: 7, showSizeChanger: true, pageSizeOptions: ['7', '15', '30', '50'] }}
          size="small"
          locale={{ emptyText: `No se encontraron ${activeSchema.plural.toLowerCase()}` }}
        />
      </Modal>
    </Card>
  );
};

export default EntityNavigatorPicker;
