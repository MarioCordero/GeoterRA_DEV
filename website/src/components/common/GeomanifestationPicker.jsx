import React, { useState } from 'react';
import { Card, Select, Button, Modal, Table, Input, Tag, Space, Typography } from 'antd';
import { SearchOutlined, EnvironmentOutlined, CheckOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

const GeomanifestationPicker = ({ selectedGeoId, onSelectGeo, manifestations = [], loading = false, onRefresh }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSearchText, setModalSearchText] = useState('');

  const selectedItem = manifestations.find(item => (item.geomanifestation_id || item.id) === selectedGeoId);

  const handleSelect = (item) => {
    const id = item.geomanifestation_id || item.id;
    if (onSelectGeo) {
      onSelectGeo(id, item);
    }
    setModalVisible(false);
  };

  const filteredModalList = manifestations.filter(item => {
    if (!modalSearchText) return true;
    const term = modalSearchText.toLowerCase();
    const name = (item.geomanifestation_name || item.name || '').toLowerCase();
    const id = (item.geomanifestation_id || item.id || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const prov = (item.location?.province || item.province || '').toLowerCase();
    return name.includes(term) || id.includes(term) || desc.includes(term) || prov.includes(term);
  });

  const columns = [
    {
      title: 'Geomanifestación',
      key: 'name',
      render: (_, record) => {
        const id = record.geomanifestation_id || record.id;
        const name = record.geomanifestation_name || record.name || `Punto ${id}`;
        return (
          <div>
            <span className="font-semibold text-gray-800 block">{name}</span>
            <Text type="secondary" style={{ fontSize: '11px' }} className="font-mono">ID: {id}</Text>
          </div>
        );
      },
    },
    {
      title: 'Ubicación',
      key: 'location',
      render: (_, record) => {
        const prov = record.location?.province || record.province;
        const canton = record.location?.canton || record.canton;
        const parts = [prov, canton].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'Costa Rica';
      },
    },
    {
      title: 'Coordenadas GPS',
      key: 'coords',
      render: (_, record) => {
        const lat = record.location?.latitude ?? record.latitude;
        const lng = record.location?.longitude ?? record.longitude;
        return lat && lng ? (
          <span className="font-mono text-xs text-gray-600">
            {parseFloat(lat).toFixed(4)}°, {parseFloat(lng).toFixed(4)}°
          </span>
        ) : 'N/A';
      },
    },
    {
      title: 'Visibilidad',
      key: 'vis',
      render: (_, record) => {
        const isPublic = record.visibility === 1 || record.visibility === true || record.visibility === '1';
        return isPublic ? <Tag color="green">Pública</Tag> : <Tag color="default">Borrador</Tag>;
      },
    },
    {
      title: 'Acción',
      key: 'action',
      render: (_, record) => {
        const id = record.geomanifestation_id || record.id;
        const isSelected = id === selectedGeoId;
        return (
          <Button
            type={isSelected ? 'primary' : 'default'}
            size="small"
            icon={isSelected ? <CheckOutlined /> : null}
            onClick={() => handleSelect(record)}
          >
            {isSelected ? 'Seleccionado' : 'Seleccionar'}
          </Button>
        );
      },
    },
  ];

  return (
    <Card type="inner" style={{ marginBottom: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Text strong style={{ minWidth: 160 }}>📍 Geomanifestación:</Text>

        {/* Searchable Select */}
        <Select
          showSearch
          style={{ minWidth: 320, flex: 1 }}
          placeholder="Buscar por nombre, ID o provincia..."
          value={selectedGeoId}
          onChange={(val) => {
            const found = manifestations.find(item => (item.geomanifestation_id || item.id) === val);
            if (onSelectGeo) onSelectGeo(val, found);
          }}
          loading={loading}
          filterOption={(input, option) => {
            const label = option?.children ? String(option.children) : '';
            return label.toLowerCase().includes(input.toLowerCase());
          }}
        >
          {manifestations.map((item) => {
            const id = item.geomanifestation_id || item.id;
            const name = item.geomanifestation_name || item.name || `Punto ${id}`;
            const prov = item.location?.province || item.province || 'Costa Rica';
            return (
              <Select.Option key={id} value={id}>
                {name} — ({prov}) [ID: {id}]
              </Select.Option>
            );
          })}
        </Select>

        {/* Advanced Modal Picker Trigger Button */}
        <Button
          icon={<SearchOutlined />}
          onClick={() => setModalVisible(true)}
          title="Abrir buscador avanzado de geomanifestaciones"
        >
          Buscar en catálogo ({manifestations.length})
        </Button>

        {onRefresh && (
          <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} title="Actualizar catálogo" />
        )}
      </div>

      {selectedItem && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <Text type="secondary" style={{ fontSize: '11px' }}>SELECCIONADO ACTUALMENTE:</Text>
            <div className="font-bold text-gray-800 text-sm">
              {selectedItem.geomanifestation_name || selectedItem.name}
            </div>
          </div>
          <Tag icon={<EnvironmentOutlined />} color="blue">
            {selectedItem.location?.province || selectedItem.province || 'Costa Rica'}
          </Tag>
          <Text type="secondary" style={{ fontSize: '11px' }} className="font-mono">
            ID: {selectedGeoId}
          </Text>
        </div>
      )}

      {/* Advanced Selector Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EnvironmentOutlined style={{ color: '#1890ff' }} />
            <span>Buscador Avanzado de Geomanifestaciones ({manifestations.length} puntos)</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[<Button key="close" onClick={() => setModalVisible(false)}>Cerrar</Button>]}
        width={850}
        centered
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Escribe el nombre, ID, provincia o palabra clave..."
            prefix={<SearchOutlined style={{ color: '#aaa' }} />}
            value={modalSearchText}
            onChange={(e) => setModalSearchText(e.target.value)}
            allowClear
            size="large"
          />
        </div>

        <Table
          dataSource={filteredModalList}
          columns={columns}
          rowKey={(item) => item.geomanifestation_id || item.id}
          pagination={{ pageSize: 7, showSizeChanger: true, pageSizeOptions: ['7', '15', '30', '50'] }}
          size="small"
          locale={{ emptyText: 'No se encontraron geomanifestaciones' }}
        />
      </Modal>
    </Card>
  );
};

export default GeomanifestationPicker;
