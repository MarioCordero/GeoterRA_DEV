import React from 'react';
import { Navigate } from 'react-router-dom';
import UserDashboard from '../loggedComponents/loggedMainPage';
import AdminDashboard from '../loggedAdminComponents/loggedAdminDashboard';
import UserRequests from '../common/UserRequests';
import AdminRequestsManager from '../loggedAdminComponents/loggedAdminRequestsManager';

/**
 * Placeholder for the Profile section
 */
const ProfilePlaceholder = ({ role }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] m-8 p-12 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl mb-6 text-blue-600">
      👤
    </div>
    <h2 className="text-2xl font-bold text-gray-800 poppins-bold">
      Perfil de {role === 'admin' ? 'Administrador' : role === 'maintenance' ? 'Mantenimiento' : 'Usuario'}
    </h2>
    <p className="text-gray-500 mt-2 poppins">Esta sección está actualmente en desarrollo.</p>
  </div>
);

/**
 * DashboardContentController
 * 
 * Decides which component to render based on the user's role and the selected menu key.
 * 
 * Keys:
 * 1: Dashboard (Admin or User)
 * 2: My Requests (Consistent for all)
 * 3: Manage Requests (Admin/Maintenance only)
 * 4: Profile (Consistent for all)
 */
const DashboardContentController = ({ selectedKey, user, setSelectedKey }) => {
  const role = user?.role || 'user';
  const isAdmin = role === 'admin' || role === 'maintenance';

  switch (selectedKey) {
    case '1':
      // Main Dashboard view
      return isAdmin ? <AdminDashboard /> : <UserDashboard />;
    
    case '2':
      // User's own requests
      return <UserRequests />;
    
    case '3':
      // Admin/Maintenance request manager
      if (isAdmin) {
        return <AdminRequestsManager />;
      }
      // If a regular user somehow lands here, redirect to dashboard
      setSelectedKey('1');
      return <UserDashboard />;
    
    case '4':
      // User profile
      return <ProfilePlaceholder role={role} />;
    
    default:
      // Fallback
      return isAdmin ? <AdminDashboard /> : <UserDashboard />;
  }
};

export default DashboardContentController;
