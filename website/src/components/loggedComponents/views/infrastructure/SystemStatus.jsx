import React from 'react';
import { usePermissions } from '../../../../hooks/usePermissions';

/**
 * SystemStatus View
 * Maintenance role only - view infrastructure and system status
 * Requires VIEW_INFRASTRUCTURE permission
 */
const SystemStatus = () => {
  const { hasPermission, PERMISSIONS } = usePermissions();

  if (!hasPermission(PERMISSIONS.VIEW_INFRASTRUCTURE)) {
    return (
      <div style={{ padding: '24px', color: 'red' }}>
        <h1>Acceso Denegado</h1>
        <p>No tienes permiso para acceder a esta sección</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>Estado del Sistema</h1>
      <p>Dashboard de infraestructura - En desarrollo</p>
    </div>
  );
};

export default SystemStatus;
