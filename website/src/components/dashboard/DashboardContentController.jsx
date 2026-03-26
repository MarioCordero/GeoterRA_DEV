import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

// Import all views
import UserWelcome from '../loggedComponents/views/home/UserWelcome';
import AdminDashboard from '../loggedComponents/views/home/AdminDashboard';
import UserRequestsList from '../loggedComponents/views/requests/UserRequestsList';
import RequestManager from '../loggedComponents/views/manage/RequestsManager';
import ProfilePage from '../loggedComponents/views/profile/ProfilePage';
import UserManagement from '../loggedComponents/views/users/UserManagement';
import SystemStatus from '../loggedComponents/views/infrastructure/SystemStatus';
import SystemLogs from '../loggedComponents/views/logs/SystemLogs';

/**
 * DashboardContentController
 * 
 * Router component that determines which view to render based on:
 * 1. The selected menu key (from sidebar)
 * 2. User permissions (via usePermissions hook)
 * 
 * Each route is handled as a separate view component organized by feature.
 * Views handle their own permission checks and content rendering.
 * 
 * Menu Keys:
 * 1 = Dashboard (UserWelcome for users, AdminDashboard for admin/maintenance)
 * 2 = My Requests (UserRequestsList)
 * 3 = Manage Requests (RequestManager - admin/maintenance only)
 * 4 = Profile (ProfilePage)
 * 5 = User Management (UserManagement - maintenance only)
 * 6 = System Status (SystemStatus - maintenance only)
 * 7 = System Logs (SystemLogs - maintenance only)
 */
const DashboardContentController = ({ selectedKey }) => {
  const { hasPermission, PERMISSIONS } = usePermissions();

  switch (selectedKey) {
    case '1': {
      // Dashboard - show different dashboard based on role
      if (hasPermission(PERMISSIONS.REVIEW_REQUESTS)) {
        return <AdminDashboard />;
      }
      return <UserWelcome />;
    }

    case '2':
      // My Requests - show to all users
      return <UserRequestsList />;

    case '3':
      // Manage Requests - admin/maintenance only
      if (!hasPermission(PERMISSIONS.REVIEW_REQUESTS)) {
        return <div style={{ padding: '24px', color: 'red' }}>Acceso denegado</div>;
      }
      return <RequestManager />;

    case '4':
      // Profile - show to all users
      return <ProfilePage />;

    case '5':
      // User Management - maintenance only
      return <UserManagement />;

    case '6':
      // System Status - maintenance only
      return <SystemLogs />;

    case '7':
      // System Logs - maintenance only
      return <SystemLogs />;

    case '8':
      // Export Data - admin/maintenance
      if (!hasPermission(PERMISSIONS.EXPORT_DATA)) {
        return <div style={{ padding: '24px', color: 'red' }}>Acceso denegado</div>;
      }
      return <div style={{ padding: '24px' }}>Exportar Datos - En desarrollo</div>;

    case '9':
      // Edit Chemistry - admin/maintenance
      if (!hasPermission(PERMISSIONS.EDIT_CHEMISTRY)) {
        return <div style={{ padding: '24px', color: 'red' }}>Acceso denegado</div>;
      }
      return <div style={{ padding: '24px' }}>Editar Química - En desarrollo</div>;

    case '10':
      // Settings - maintenance only
      if (!hasPermission(PERMISSIONS.VIEW_SYSTEM_LOGS)) {
        return <div style={{ padding: '24px', color: 'red' }}>Acceso denegado</div>;
      }
      return <div style={{ padding: '24px' }}>Configuración - En desarrollo</div>;

    default:
      // Fallback to dashboard
      if (hasPermission(PERMISSIONS.REVIEW_REQUESTS)) {
        return <AdminDashboard />;
      }
      return <UserWelcome />;
  }
};

export default DashboardContentController;