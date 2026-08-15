import {
  DashboardOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  UserOutlined,
  TeamOutlined,
  DatabaseOutlined,
  HistoryOutlined,
  EnvironmentOutlined,
  BulbOutlined,
  BarChartOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';

/**
 * Get menu items based on user permissions
 * Pure function - no hooks, can be called from anywhere
 * 
 * @param {Object} permissions - Object with permission checks
 * @returns {Array} Menu items array
 */
export const getMenuItems = (permissions) => {
  const menuItems = [];

  // Dashboard - always visible
  menuItems.push({
    key: '1',
    icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
    label: 'Dashboard',
    shortLabel: 'Inicio',
  });

  // Mis Solicitudes - user, investigator, field_investigator
  if (permissions.hasRequests) {
    menuItems.push({
      key: '2',
      icon: <FileTextOutlined style={{ fontSize: '18px' }} />,
      label: 'Mis Solicitudes',
      shortLabel: 'Solicitudes',
    });
  }

  // Gestionar Solicitudes - admin, investigator, field_investigator
  if (permissions.hasReviewRequests) {
    menuItems.push({
      key: '3',
      icon: <ExperimentOutlined style={{ fontSize: '18px' }} />,
      label: 'Gestionar Solicitudes',
      shortLabel: 'Gestionar',
    });
  }

  // Perfil - always visible
  menuItems.push({
    key: '4',
    icon: <UserOutlined style={{ fontSize: '18px' }} />,
    label: 'Perfil',
    shortLabel: 'Perfil',
  });

  // ─── Sección admin: gestión geociencia ─────────────────────────────────
  if (permissions.hasManageGeomanifestations) {
    menuItems.push({
      key: '8',
      icon: <EnvironmentOutlined style={{ fontSize: '18px' }} />,
      label: 'Geomanifestaciones',
      shortLabel: 'GeoManif.',
    });
  }

  if (permissions.hasManageInsituTests) {
    menuItems.push({
      key: '9',
      icon: <BulbOutlined style={{ fontSize: '18px' }} />,
      label: 'Pruebas de Campo',
      shortLabel: 'Campo',
    });
  }

  if (permissions.hasManageInlabTests) {
    menuItems.push({
      key: '10',
      icon: <BarChartOutlined style={{ fontSize: '18px' }} />,
      label: 'Pruebas de Laboratorio',
      shortLabel: 'Laboratorio',
    });
  }

  if (permissions.hasManageGeoreports) {
    menuItems.push({
      key: '11',
      icon: <FileSearchOutlined style={{ fontSize: '18px' }} />,
      label: 'Georeportes',
      shortLabel: 'Reportes',
    });
  }

  // ─── Sección mantenimiento ─────────────────────────────────────────────
  if (permissions.hasManageUsers) {
    menuItems.push({
      key: '5',
      icon: <TeamOutlined style={{ fontSize: '18px' }} />,
      label: 'Gestionar Usuarios',
      shortLabel: 'Usuarios',
    });
  }

  if (permissions.hasViewInfrastructure) {
    menuItems.push({
      key: '6',
      icon: <DatabaseOutlined style={{ fontSize: '18px' }} />,
      label: 'Base de datos',
      shortLabel: 'BD',
    });
  }

  if (permissions.hasSystemLogs) {
    menuItems.push({
      key: '7',
      icon: <HistoryOutlined style={{ fontSize: '18px' }} />,
      label: 'Logs',
      shortLabel: 'Logs',
    });
  }

  return menuItems;
};

/**
 * Convert usePermissions hook result to permission object
 * Bridge between hook and utility function
 */
export const createPermissionsObject = (hasPermissionFn, PERMISSIONS) => ({
  // Requests
  hasReviewRequests: hasPermissionFn(PERMISSIONS.REVIEW_REQUESTS),
  hasRequests:
    hasPermissionFn(PERMISSIONS.CREATE_REQUESTS) ||
    hasPermissionFn(PERMISSIONS.VIEW_OWN_REQUESTS) ||
    hasPermissionFn(PERMISSIONS.REVIEW_REQUESTS),

  // Maintenance
  hasManageUsers: hasPermissionFn(PERMISSIONS.MANAGE_USERS),
  hasViewInfrastructure: hasPermissionFn(PERMISSIONS.VIEW_INFRASTRUCTURE),
  hasExportData: hasPermissionFn(PERMISSIONS.EXPORT_DATA),
  hasSystemLogs: hasPermissionFn(PERMISSIONS.VIEW_SYSTEM_LOGS),

  // Geoscience (admin only at API level)
  hasManageGeomanifestations: hasPermissionFn(PERMISSIONS.MANAGE_GEOMANIFESTATIONS),
  hasManageInsituTests: hasPermissionFn(PERMISSIONS.MANAGE_INSITU_TESTS),
  hasManageInlabTests: hasPermissionFn(PERMISSIONS.MANAGE_INLAB_TESTS),
  hasManageGeoreports: hasPermissionFn(PERMISSIONS.MANAGE_GEOREPORTS),
});


