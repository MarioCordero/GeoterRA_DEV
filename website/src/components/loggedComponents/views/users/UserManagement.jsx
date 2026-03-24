import React from 'react';
import { usePermissions } from '../../../../hooks/usePermissions';

/**
 * UserManagement View
 * Maintenance role only - manage users and assign roles
 * Requires MANAGE_USERS permission
 */
const UserManagement = () => {
  const { hasPermission, PERMISSIONS } = usePermissions();

  if (!hasPermission(PERMISSIONS.MANAGE_USERS)) {
    return (
      <div style={{ padding: '24px', color: 'red' }}>
        <h1>Acceso Denegado</h1>
        <p>No tienes permiso para acceder a esta sección</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>Gestionar Usuarios</h1>
      <p>Página de gestión de usuarios - En desarrollo</p>
    </div>
  );
};

export default UserManagement;
