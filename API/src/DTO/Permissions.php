<?php
declare(strict_types=1);

namespace DTO;

/**
 * Permission constants for role-based access control
 * 
 * Define all available permissions in the system. These are mapped to roles
 * in the PermissionService and used for authorization checks.
 */
final class Permissions
{
    // Request Management
    public const CREATE_REQUESTS = 'CREATE_REQUESTS';
    public const VIEW_OWN_REQUESTS = 'VIEW_OWN_REQUESTS';
    public const REVIEW_REQUESTS = 'REVIEW_REQUESTS';
    public const APPROVE_REQUESTS = 'APPROVE_REQUESTS';
    public const EDIT_REQUEST_COORDINATES = 'EDIT_REQUEST_COORDINATES';
    public const EDIT_REQUEST_CHEMISTRY = 'EDIT_REQUEST_CHEMISTRY';
    public const DELETE_REQUESTS = 'DELETE_REQUESTS';
    
    // User Management
    public const MANAGE_USERS = 'MANAGE_USERS';
    public const VIEW_USERS = 'VIEW_USERS';
    public const ASSIGN_ROLES = 'ASSIGN_ROLES';
    
    // Infrastructure/System
    public const VIEW_INFRASTRUCTURE = 'VIEW_INFRASTRUCTURE';
    public const VIEW_SYSTEM_LOGS = 'VIEW_SYSTEM_LOGS';
    
    // Export/Data
    public const EXPORT_PDF = 'EXPORT_PDF';
    public const EXPORT_DATA = 'EXPORT_DATA';

    /**
     * Return all available permissions as strings.
     */
    public static function values(): array
    {
        return [
            // Request Management
            self::CREATE_REQUESTS,
            self::VIEW_OWN_REQUESTS,
            self::REVIEW_REQUESTS,
            self::APPROVE_REQUESTS,
            self::EDIT_REQUEST_COORDINATES,
            self::EDIT_REQUEST_CHEMISTRY,
            self::DELETE_REQUESTS,
            
            // User Management
            self::MANAGE_USERS,
            self::VIEW_USERS,
            self::ASSIGN_ROLES,
            
            // Infrastructure/System
            self::VIEW_INFRASTRUCTURE,
            self::VIEW_SYSTEM_LOGS,
            
            // Export/Data
            self::EXPORT_PDF,
            self::EXPORT_DATA,
        ];
    }

    /**
     * Check if a permission string is valid.
     */
    public static function isValid(string $permission): bool
    {
        return in_array($permission, self::values(), true);
    }
}
