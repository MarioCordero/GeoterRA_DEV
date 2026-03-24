import { useSession } from './useSession';

// Permission constants - must match API/src/DTO/Permissions.php
const PERMISSIONS = {
  // Request Management
  CREATE_REQUESTS: 'CREATE_REQUESTS',
  VIEW_OWN_REQUESTS: 'VIEW_OWN_REQUESTS',
  REVIEW_REQUESTS: 'REVIEW_REQUESTS',
  APPROVE_REQUESTS: 'APPROVE_REQUESTS',
  EDIT_REQUEST_COORDINATES: 'EDIT_REQUEST_COORDINATES',
  EDIT_REQUEST_CHEMISTRY: 'EDIT_REQUEST_CHEMISTRY',
  DELETE_REQUESTS: 'DELETE_REQUESTS',
  
  // User Management
  MANAGE_USERS: 'MANAGE_USERS',
  VIEW_USERS: 'VIEW_USERS',
  ASSIGN_ROLES: 'ASSIGN_ROLES',
  
  // Infrastructure/System
  VIEW_INFRASTRUCTURE: 'VIEW_INFRASTRUCTURE',
  VIEW_SYSTEM_LOGS: 'VIEW_SYSTEM_LOGS',
  
  // Export/Data
  EXPORT_PDF: 'EXPORT_PDF',
  EXPORT_DATA: 'EXPORT_DATA',
};

// Role to permissions mapping - must match API/src/Services/PermissionService.php
const ROLE_PERMISSIONS = {
  user: [
    PERMISSIONS.CREATE_REQUESTS,
    PERMISSIONS.VIEW_OWN_REQUESTS,
    PERMISSIONS.EXPORT_PDF,
  ],
  
  admin: [
    // All user permissions
    PERMISSIONS.CREATE_REQUESTS,
    PERMISSIONS.VIEW_OWN_REQUESTS,
    PERMISSIONS.EXPORT_PDF,
    
    // Admin permissions
    PERMISSIONS.REVIEW_REQUESTS,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.EDIT_REQUEST_COORDINATES,
    PERMISSIONS.EDIT_REQUEST_CHEMISTRY,
    PERMISSIONS.DELETE_REQUESTS,
    PERMISSIONS.VIEW_USERS,
  ],
  
  maintenance: [
    // All admin permissions
    PERMISSIONS.CREATE_REQUESTS,
    PERMISSIONS.VIEW_OWN_REQUESTS,
    PERMISSIONS.EXPORT_PDF,
    PERMISSIONS.REVIEW_REQUESTS,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.EDIT_REQUEST_COORDINATES,
    PERMISSIONS.EDIT_REQUEST_CHEMISTRY,
    PERMISSIONS.DELETE_REQUESTS,
    PERMISSIONS.VIEW_USERS,
    
    // Maintenance-specific permissions
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.ASSIGN_ROLES,
    PERMISSIONS.VIEW_INFRASTRUCTURE,
    PERMISSIONS.VIEW_SYSTEM_LOGS,
    PERMISSIONS.EXPORT_DATA,
  ],
};

/**
 * Hook to check user permissions
 * 
 * Usage:
 * const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
 * 
 * if (hasPermission('APPROVE_REQUESTS')) {
 *   // Show admin-only content
 * }
 */
export const usePermissions = () => {
  const { user } = useSession();
  
  /**
   * Check if the user has a specific permission
   * @param {string} permission - The permission to check
   * @returns {boolean} True if user has permission, false otherwise
   */
  const hasPermission = (permission) => {
    if (!user || !user.role) {
      return false;
    }
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };
  
  /**
   * Check if the user has any of the specified permissions
   * @param {Array<string>} permissions - List of permissions to check
   * @returns {boolean} True if user has at least one of the permissions
   */
  const hasAnyPermission = (permissions) => {
    if (!Array.isArray(permissions)) {
      return false;
    }
    
    return permissions.some(permission => hasPermission(permission));
  };
  
  /**
   * Check if the user has all of the specified permissions
   * @param {Array<string>} permissions - List of permissions to check
   * @returns {boolean} True if user has all of the permissions
   */
  const hasAllPermissions = (permissions) => {
    if (!Array.isArray(permissions)) {
      return false;
    }
    
    return permissions.every(permission => hasPermission(permission));
  };
  
  return {
    // Permission checking functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Exported permissions object for convenience
    PERMISSIONS,
    
    // Current user role
    userRole: user?.role || null,
  };
};

export default usePermissions;
