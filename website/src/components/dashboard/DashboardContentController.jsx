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
import GeomanifeStationsManager from '../loggedComponents/views/geoscience/GeomanifeStationsManager';
import InsituTestsManager from '../loggedComponents/views/geoscience/InsituTestsManager';
import InlabTestsManager from '../loggedComponents/views/geoscience/InlabTestsManager';
import GeoreportsManager from '../loggedComponents/views/geoscience/GeoreportsManager';
import TerritoryManager from '../loggedComponents/views/territory/TerritoryManager';

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
      // Geomanifestaciones - admin only
      if (!hasPermission(PERMISSIONS.MANAGE_GEOMANIFESTATIONS)) {
        return <div style={{ padding: '24px', color: 'red' }}>Acceso denegado</div>;
      }
      return <GeomanifeStationsManager />;

    case '9':
      // Pruebas de Campo (In-Situ) - admin only
      if (!hasPermission(PERMISSIONS.MANAGE_INSITU_TESTS)) {
        return <div style={{ padding: '24px', color: 'red' }}>Acceso denegado</div>;
      }
      return <InsituTestsManager />;

    case '10':
      // Pruebas de Laboratorio (In-Lab) - admin only
      if (!hasPermission(PERMISSIONS.MANAGE_INLAB_TESTS)) {
        return <div style={{ padding: '24px', color: 'red' }}>Acceso denegado</div>;
      }
      return <InlabTestsManager />;

    case '11':
      // Georeportes - admin only
      if (!hasPermission(PERMISSIONS.MANAGE_GEOREPORTS)) {
        return <div style={{ padding: '24px', color: 'red' }}>Acceso denegado</div>;
      }
      return <GeoreportsManager />;

    case '12':
      // Territorio - admin only
      if (!hasPermission(PERMISSIONS.MANAGE_TERRITORY)) {
        return <div style={{ padding: '24px', color: 'red' }}>Acceso denegado</div>;
      }
      return <TerritoryManager />;

    default:
      // Fallback to home view based on role
      return renderHomeView(user?.role);
  }
};

export default DashboardContentController;