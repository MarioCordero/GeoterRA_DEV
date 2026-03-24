import React from 'react';
import { usePermissions } from '../../../../hooks/usePermissions';

/**
 * SystemLogs View
 * Maintenance role only - view system logs and monitoring
 * Requires VIEW_LOGS permission
 */
const SystemLogs = () => {
  const { hasPermission, PERMISSIONS } = usePermissions();

  if (!hasPermission(PERMISSIONS.VIEW_SYSTEM_LOGS)) {
    return (
      <div style={{ padding: '24px', color: 'red' }}>
        <h1>Acceso Denegado</h1>
        <p>No tienes permiso para acceder a esta sección</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>Registros del Sistema</h1>
      <p>Sistema de registros - En desarrollo</p>
    </div>
  );
};

export default SystemLogs;
