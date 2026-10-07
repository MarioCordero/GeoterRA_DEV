import {
  DashboardOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  UserOutlined,
  TeamOutlined,
  DatabaseOutlined,
  HistoryOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  CompassOutlined,
  AppstoreOutlined,
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

  // 1. Dashboard - always visible
  menuItems.push({
    key: '1',
    icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
    label: 'Dashboard',
    shortLabel: 'Inicio',
  });

  // 2. Solicitudes - Unificado en 1 solo ítem "Solicitudes"
  const solicitudesChildren = [];
  if (permissions.hasRequests) {
    solicitudesChildren.push({
      key: '2',
      icon: <FileTextOutlined style={{ fontSize: '16px' }} />,
      label: 'Mis Solicitudes',
      shortLabel: 'Mis Sol.',
    });
  }
  if (permissions.hasReviewRequests) {
    solicitudesChildren.push({
      key: '3',
      icon: <ExperimentOutlined style={{ fontSize: '16px' }} />,
      label: 'Gestionar Solicitudes',
      shortLabel: 'Gestionar',
    });
  }

  if (solicitudesChildren.length === 1) {
    menuItems.push({
      key: solicitudesChildren[0].key,
      icon: solicitudesChildren[0].icon,
      label: 'Solicitudes',
      shortLabel: 'Solicitudes',
    });
  } else if (solicitudesChildren.length > 1) {
    menuItems.push({
      key: 'sub-solicitudes',
      icon: <FileTextOutlined style={{ fontSize: '18px' }} />,
      label: 'Solicitudes',
      shortLabel: 'Solicitudes',
      children: solicitudesChildren,
    });
  }

  // 3. Geociencia
  if (permissions.hasFieldTrips) {
    menuItems.push({
      key: '13',
      icon: <CompassOutlined style={{ fontSize: '18px' }} />,
      label: 'Giras de Campo',
      shortLabel: 'Giras',
    });
  }

  if (permissions.hasManageGeomanifestations) {
    menuItems.push({
      key: '8',
      icon: <EnvironmentOutlined style={{ fontSize: '18px' }} />,
      label: 'Geomanifestaciones',
      shortLabel: 'GeoManif.',
    });
  }

  // 4. Otros - Agrupa Perfil, Territorio, Gestionar Usuarios y herramientas del sistema
  const otrosChildren = [];

  // Perfil - siempre visible
  otrosChildren.push({
    key: '4',
    icon: <UserOutlined style={{ fontSize: '16px' }} />,
    label: 'Perfil',
    shortLabel: 'Perfil',
  });

  // Territorio
  if (permissions.hasManageTerritory) {
    otrosChildren.push({
      key: '12',
      icon: <GlobalOutlined style={{ fontSize: '16px' }} />,
      label: 'Territorio',
      shortLabel: 'Territorio',
    });
  }

  // Gestionar Usuarios
  if (permissions.hasManageUsers) {
    otrosChildren.push({
      key: '5',
      icon: <TeamOutlined style={{ fontSize: '16px' }} />,
      label: 'Gestionar Usuarios',
      shortLabel: 'Usuarios',
    });
  }

  // Base de datos - mantenimiento
  if (permissions.hasViewInfrastructure) {
    otrosChildren.push({
      key: '6',
      icon: <DatabaseOutlined style={{ fontSize: '16px' }} />,
      label: 'Base de datos',
      shortLabel: 'BD',
    });
  }

  // Logs - mantenimiento
  if (permissions.hasSystemLogs) {
    otrosChildren.push({
      key: '7',
      icon: <HistoryOutlined style={{ fontSize: '16px' }} />,
      label: 'Logs del Sistema',
      shortLabel: 'Logs',
    });
  }

  if (otrosChildren.length > 0) {
    menuItems.push({
      key: 'sub-otros',
      icon: <AppstoreOutlined style={{ fontSize: '18px' }} />,
      label: 'Otros',
      shortLabel: 'Otros',
      children: otrosChildren,
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

  // Field Trips
  hasFieldTrips:
    hasPermissionFn(PERMISSIONS.VIEW_FIELD_TRIPS) ||
    hasPermissionFn(PERMISSIONS.MANAGE_FIELD_TRIPS),

  // Maintenance
  hasManageUsers: hasPermissionFn(PERMISSIONS.MANAGE_USERS),
  hasViewInfrastructure: hasPermissionFn(PERMISSIONS.VIEW_INFRASTRUCTURE),
  hasExportData: hasPermissionFn(PERMISSIONS.EXPORT_DATA),
  hasSystemLogs: hasPermissionFn(PERMISSIONS.VIEW_SYSTEM_LOGS),

  // Geoscience
  hasManageGeomanifestations: hasPermissionFn(PERMISSIONS.MANAGE_GEOMANIFESTATIONS),
  hasManageInsituTests: hasPermissionFn(PERMISSIONS.MANAGE_INSITU_TESTS),
  hasManageInlabTests: hasPermissionFn(PERMISSIONS.MANAGE_INLAB_TESTS),
  hasManageGeoreports: hasPermissionFn(PERMISSIONS.MANAGE_GEOREPORTS),
  hasManageTerritory: hasPermissionFn(PERMISSIONS.MANAGE_TERRITORY),
});