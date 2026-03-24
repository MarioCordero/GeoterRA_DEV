import {
  DashboardOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  UserOutlined,
  TeamOutlined,
  ToolOutlined,
  DesktopOutlined,
  DatabaseOutlined,
  SafetyOutlined,
  SettingOutlined,
} from '@ant-design/icons';

/**
 * Get menu items based on user permissions
 * Pure function - no hooks, can be called from anywhere
 * 
 * @param {Object} permissions - Object with permission checks
 *   Example: { hasReviewRequests: true, hasManageUsers: false, ... }
 * @returns {Array} Menu items array
 */
export const getMenuItems = (permissions) => {
  const menuItems = [];

  // ===== ALWAYS SHOW =====
  menuItems.push({
    key: '1',
    icon: <DashboardOutlined style={{ fontSize: '18px' }} />,
    label: 'Dashboard',
    shortLabel: 'Inicio',
  });

  menuItems.push({
    key: '2',
    icon: <FileTextOutlined style={{ fontSize: '18px' }} />,
    label: 'Mis Solicitudes',
    shortLabel: 'Solicitudes',
  });

  // ===== CONDITIONAL =====
  if (permissions.hasReviewRequests) {
    menuItems.push({
      key: '3',
      icon: <ExperimentOutlined style={{ fontSize: '18px' }} />,
      label: 'Gestionar Solicitudes',
      shortLabel: 'Gestionar',
    });
  }

  menuItems.push({
    key: '4',
    icon: <UserOutlined style={{ fontSize: '18px' }} />,
    label: 'Perfil',
    shortLabel: 'Perfil',
  });

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
      icon: <ToolOutlined style={{ fontSize: '18px' }} />,
      label: 'Sistema',
      shortLabel: 'Sistema',
    });
  }

  if (permissions.hasViewLogs) {
    menuItems.push({
      key: '7',
      icon: <DesktopOutlined style={{ fontSize: '18px' }} />,
      label: 'Registros',
      shortLabel: 'Registros',
    });
  }

  if (permissions.hasExportData) {
    menuItems.push({
      key: '8',
      icon: <DatabaseOutlined style={{ fontSize: '18px' }} />,
      label: 'Exportar Datos',
      shortLabel: 'Exportar',
    });
  }

  if (permissions.hasEditChemistry) {
    menuItems.push({
      key: '9',
      icon: <SafetyOutlined style={{ fontSize: '18px' }} />,
      label: 'Editar Química',
      shortLabel: 'Química',
    });
  }

  if (permissions.hasSystemLogs) {
    menuItems.push({
      key: '10',
      icon: <SettingOutlined style={{ fontSize: '18px' }} />,
      label: 'Configuración',
      shortLabel: 'Config',
    });
  }

  return menuItems;
};

/**
 * Convert usePermissions hook result to permission object
 * Bridge between hook and utility function
 */
export const createPermissionsObject = (hasPermissionFn, PERMISSIONS) => ({
  hasReviewRequests: hasPermissionFn(PERMISSIONS.REVIEW_REQUESTS),
  hasManageUsers: hasPermissionFn(PERMISSIONS.MANAGE_USERS),
  hasViewInfrastructure: hasPermissionFn(PERMISSIONS.VIEW_INFRASTRUCTURE),
  hasViewLogs: hasPermissionFn(PERMISSIONS.VIEW_LOGS),
  hasExportData: hasPermissionFn(PERMISSIONS.EXPORT_DATA),
  hasEditChemistry: hasPermissionFn(PERMISSIONS.EDIT_CHEMISTRY),
  hasSystemLogs: hasPermissionFn(PERMISSIONS.VIEW_SYSTEM_LOGS),
});
