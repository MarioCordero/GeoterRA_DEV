<?php
declare(strict_types=1);

namespace Services;

use DTO\AllowedUserRoles;
use DTO\PermissionsDTO as Permissions;

/**
 * Service for managing role-based permissions
 *
 * Provides methods to:
 * - Get all permissions for a given role
 * - Check if a user (via role) has a specific permission
 * - Check if a user has any of multiple permissions
 */
final class PermissionService
{
    /**
     * Map roles to their available permissions
     */
    private static array $rolePermissions = [
      AllowedUserRoles::USER => [
        Permissions::CREATE_REQUESTS,
        Permissions::VIEW_OWN_REQUESTS,
      ],

      // Investigator: full access to geothermal resources and all requests/states
      AllowedUserRoles::INVESTIGATOR => [
        Permissions::CREATE_REQUESTS,
        Permissions::VIEW_OWN_REQUESTS,
        // Request Management (all requests and states)
        Permissions::VIEW_ALL_REQUESTS,
        Permissions::MANAGE_ALL_REQUESTS,
        Permissions::MANAGE_REQUEST_STATES,

        // Geothermal resources
        Permissions::MANAGE_GEOMANIFESTATIONS,
        Permissions::MANAGE_GEOREPORTS,
        Permissions::MANAGE_INLAB_TESTS,
        Permissions::MANAGE_INSITU_TESTS,
        Permissions::MANAGE_TERRITORIES,
      ],

      // Maintenance: user management, system logs, infrastructure, export
      AllowedUserRoles::MAINTENANCE => [
        Permissions::CREATE_REQUESTS,
        Permissions::VIEW_OWN_REQUESTS,

        Permissions::VIEW_USERS,
        Permissions::MANAGE_USERS,
        Permissions::ASSIGN_ROLES,
        Permissions::VIEW_INFRASTRUCTURE,
        Permissions::VIEW_SYSTEM_LOGS,
        Permissions::EXPORT_DATA,
      ],

      // Admin: all permissions (simply use all defined values)
      AllowedUserRoles::ADMIN => [
        Permissions::CREATE_REQUESTS,
        Permissions::VIEW_OWN_REQUESTS,

        Permissions::VIEW_ALL_REQUESTS,
        Permissions::MANAGE_ALL_REQUESTS,
        Permissions::MANAGE_REQUEST_STATES,

        // Geothermal resources
        Permissions::MANAGE_GEOMANIFESTATIONS,
        Permissions::MANAGE_GEOREPORTS,
        Permissions::MANAGE_INLAB_TESTS,
        Permissions::MANAGE_INSITU_TESTS,
        Permissions::MANAGE_TERRITORIES,

        Permissions::VIEW_USERS,
        Permissions::MANAGE_USERS,
        Permissions::ASSIGN_ROLES,
        Permissions::VIEW_INFRASTRUCTURE,
        Permissions::VIEW_SYSTEM_LOGS,
        Permissions::EXPORT_DATA,      ]
    ];

    /**
     * Get all permissions for a given role
     *
     * @param string $role The user role (admin, user, maintenance)
     * @return array List of permission strings available to this role
     */
    public static function getPermissionsForRole(string $role): array
    {
        if (!AllowedUserRoles::isValid($role)) {
            return [];
        }

        return self::$rolePermissions[$role] ?? [];
    }

    /**
     * Check if a role has a specific permission
     *
     * @param string $role The user role
     * @param string $permission The permission to check
     * @return bool True if role has permission, false otherwise
     */
    public static function hasPermission(string $role, string $permission): bool
    {
        if (!AllowedUserRoles::isValid($role) || !Permissions::isValid($permission)) {
            return false;
        }

        $rolePermissions = self::$rolePermissions[$role] ?? [];
        return in_array($permission, $rolePermissions, true);
    }

    /**
     * Check if a role has any of the specified permissions
     *
     * @param string $role The user role
     * @param array $permissions List of permissions to check
     * @return bool True if role has at least one of the permissions
     */
    public static function hasAnyPermission(string $role, array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (self::hasPermission($role, $permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if a role has all of the specified permissions
     *
     * @param string $role The user role
     * @param array $permissions List of permissions to check
     * @return bool True if role has all of the permissions
     */
    public static function hasAllPermissions(string $role, array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!self::hasPermission($role, $permission)) {
                return false;
            }
        }
        return true;
    }
}