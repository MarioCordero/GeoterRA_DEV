import { useSession } from './useSession';

// ============================================================
// PERMISSION CONSTANTS
// Add new permission keys here when creating new features.
// ============================================================
const PERMISSIONS = {
  // Solicitudes
  CREATE_REQUESTS:          'CREATE_REQUESTS',
  VIEW_OWN_REQUESTS:        'VIEW_OWN_REQUESTS',
  REVIEW_REQUESTS:          'REVIEW_REQUESTS',
  APPROVE_REQUESTS:         'APPROVE_REQUESTS',
  EDIT_REQUEST_COORDINATES: 'EDIT_REQUEST_COORDINATES',
  EDIT_REQUEST_CHEMISTRY:   'EDIT_REQUEST_CHEMISTRY',
  DELETE_REQUESTS:          'DELETE_REQUESTS',
  MANAGE_REQUEST_STATES:    'MANAGE_REQUEST_STATES',

  // Usuarios
  MANAGE_USERS:             'MANAGE_USERS',
  VIEW_USERS:               'VIEW_USERS',
  ASSIGN_ROLES:             'ASSIGN_ROLES',

  // Geociencia
  MANAGE_GEOMANIFESTATIONS: 'MANAGE_GEOMANIFESTATIONS',
  MANAGE_INSITU_TESTS:      'MANAGE_INSITU_TESTS',
  MANAGE_INLAB_TESTS:       'MANAGE_INLAB_TESTS',
  MANAGE_GEOREPORTS:        'MANAGE_GEOREPORTS',

  // Infraestructura / Sistema
  VIEW_INFRASTRUCTURE:      'VIEW_INFRASTRUCTURE',
  VIEW_SYSTEM_LOGS:         'VIEW_SYSTEM_LOGS',

  // Exportacion
  EXPORT_PDF:               'EXPORT_PDF',
  EXPORT_DATA:              'EXPORT_DATA',
};

// ============================================================
// PERMISSION MATRIX — Edita los permisos por rol aqui
//
// Para cambiar lo que un rol puede hacer, agrega o elimina
// una entrada PERMISSIONS.XXX del array del rol correspondiente.
//
// Roles disponibles:
//   user               - Ciudadano / usuario basico
//   admin              - Administrador del sistema
//   maintenance        - Mantenimiento tecnico
//   investigator       - Investigador completo
//   field_investigator - Investigador de campo
// ============================================================
const ROLE_PERMISSIONS = {

  // ──────────────────────────────────────────────────────────
  // user: acceso basico, solo sus propias solicitudes
  // ──────────────────────────────────────────────────────────
  user: [
    PERMISSIONS.CREATE_REQUESTS,
    PERMISSIONS.VIEW_OWN_REQUESTS,
    PERMISSIONS.EXPORT_PDF,
  ],

  // ──────────────────────────────────────────────────────────
  // admin: acceso completo al sistema
  // ──────────────────────────────────────────────────────────
  admin: [
    // Solicitudes
    PERMISSIONS.CREATE_REQUESTS,
    PERMISSIONS.VIEW_OWN_REQUESTS,
    PERMISSIONS.REVIEW_REQUESTS,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.EDIT_REQUEST_COORDINATES,
    PERMISSIONS.EDIT_REQUEST_CHEMISTRY,
    PERMISSIONS.DELETE_REQUESTS,
    PERMISSIONS.MANAGE_REQUEST_STATES,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EXPORT_PDF,

    // Usuarios
    PERMISSIONS.MANAGE_USERS,

    // Geociencia
    PERMISSIONS.MANAGE_GEOMANIFESTATIONS,
    PERMISSIONS.MANAGE_INSITU_TESTS,
    PERMISSIONS.MANAGE_INLAB_TESTS,
    PERMISSIONS.MANAGE_GEOREPORTS,
  ],

  // ──────────────────────────────────────────────────────────
  // maintenance: gestion tecnica e infraestructura
  // ──────────────────────────────────────────────────────────
  maintenance: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.ASSIGN_ROLES,
    PERMISSIONS.VIEW_INFRASTRUCTURE,
    PERMISSIONS.VIEW_SYSTEM_LOGS,
    PERMISSIONS.EXPORT_DATA,
  ],

  // ──────────────────────────────────────────────────────────
  // investigator: solicitudes + geociencia completa
  //   (Geomanifestaciones, Pruebas de Campo, Pruebas de Lab,
  //    Georeportes). El backend controla la autorizacion final.
  // ──────────────────────────────────────────────────────────
  investigator: [
    // Solicitudes
    PERMISSIONS.CREATE_REQUESTS,
    PERMISSIONS.VIEW_OWN_REQUESTS,
    PERMISSIONS.REVIEW_REQUESTS,
    PERMISSIONS.APPROVE_REQUESTS,
    PERMISSIONS.EDIT_REQUEST_COORDINATES,
    PERMISSIONS.EDIT_REQUEST_CHEMISTRY,
    PERMISSIONS.MANAGE_REQUEST_STATES,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EXPORT_PDF,

    // Geociencia
    PERMISSIONS.MANAGE_GEOMANIFESTATIONS,
    PERMISSIONS.MANAGE_INSITU_TESTS,
    PERMISSIONS.MANAGE_INLAB_TESTS,
    PERMISSIONS.MANAGE_GEOREPORTS,
  ],

  // ──────────────────────────────────────────────────────────
  // field_investigator: solicitudes + geomanifestaciones +
  //   pruebas de campo + georeportes.
  //   SIN acceso a Pruebas de Laboratorio.
  // ──────────────────────────────────────────────────────────
  field_investigator: [
    // Solicitudes
    PERMISSIONS.CREATE_REQUESTS,
    PERMISSIONS.VIEW_OWN_REQUESTS,
    PERMISSIONS.REVIEW_REQUESTS,
    PERMISSIONS.MANAGE_REQUEST_STATES,
    PERMISSIONS.EXPORT_PDF,

    // Geociencia (sin lab)
    PERMISSIONS.MANAGE_GEOMANIFESTATIONS,
    PERMISSIONS.MANAGE_INSITU_TESTS,
    PERMISSIONS.MANAGE_GEOREPORTS,
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