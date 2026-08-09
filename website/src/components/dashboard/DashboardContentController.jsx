import React from 'react';
import UserRequests from '../common/UserRequests';
import { useSession } from '../../hooks/useSession';
import { usePermissions } from '../../hooks/usePermissions';
import SystemLogs from '../loggedComponents/views/logs/SystemLogs';
import UserWelcome from '../loggedComponents/views/home/UserWelcome';
import ProfilePage from '../loggedComponents/views/profile/ProfilePage';
import AdminDashboard from '../loggedComponents/views/home/AdminDashboard';
import UserManagement from '../loggedComponents/views/users/UserManagement';
import RequestManager from '../loggedComponents/views/manage/RequestsManager';
import DatabaseViewer from '../loggedComponents/views/database/DatabaseViewer';
import MaintenanceDashboard from '../loggedComponents/views/home/MaintenanceDashboard';
import FieldInvestigatorDashboard from '../loggedComponents/views/home/fieldInvestigatorDashboard';
import InvestigatorDashboard from '../loggedComponents/views/home/investigatorDashboard';

const DashboardContentController = ({ selectedKey }) => {
  const { hasPermission, PERMISSIONS } = usePermissions();
  const { user } = useSession();

  const renderHomeView = (role) => {
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'maintenance':
        return <MaintenanceDashboard />;
      case 'field_investigator':
      case 'fieldInvestigator':
        return <FieldInvestigatorDashboard />;
      case 'investigator':
        return <InvestigatorDashboard />;
      case 'user':
      default:
        return <UserWelcome />;
    }
  };

  switch (selectedKey) {
    case '1':
      // Dashboard - show different dashboard based on role
      return renderHomeView(user?.role);

    case '2':
      // My Requests - show list + add button
      return <UserRequests />;

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
      if (!hasPermission(PERMISSIONS.MANAGE_USERS)) {
        return <div style={{ padding: '24px', color: 'red' }}>Acceso denegado</div>;
      }
      return <UserManagement />;

    case '6':
      // Database - maintenance only
      if (!hasPermission(PERMISSIONS.VIEW_INFRASTRUCTURE)) {
        return <div style={{ padding: '24px', color: 'red' }}>Acceso denegado</div>;
      }
      return <DatabaseViewer />;

    case '7':
      // Logs - maintenance only
      if (!hasPermission(PERMISSIONS.VIEW_SYSTEM_LOGS)) {
        return <div style={{ padding: '24px', color: 'red' }}>Acceso denegado</div>;
      }
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
      // Fallback to home view based on role
      return renderHomeView(user?.role);
  }
};

export default DashboardContentController;