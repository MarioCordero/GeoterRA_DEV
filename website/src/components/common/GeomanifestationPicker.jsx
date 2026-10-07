import React from 'react';
import EntityNavigatorPicker from './EntityNavigatorPicker';

/**
 * GeomanifestationPicker wrapper component.
 * Provides backward compatibility with existing views while leveraging the flexible EntityNavigatorPicker under the hood.
 */
const GeomanifestationPicker = ({
  selectedGeoId,
  onSelectGeo,
  manifestations = [],
  loading = false,
  onRefresh,
  mode = 'card',
  disabled = false,
}) => {
  return (
    <EntityNavigatorPicker
      entityType="geomanifestations"
      selectedId={selectedGeoId}
      onSelect={(id, item) => {
        if (onSelectGeo) {
          onSelectGeo(id, item);
        }
      }}
      items={manifestations}
      loading={loading}
      onRefresh={onRefresh}
      label="📍 Geomanifestación:"
      placeholder="Buscar por nombre, ID o provincia..."
      mode={mode}
      disabled={disabled}
    />
  );
};

export default GeomanifestationPicker;
