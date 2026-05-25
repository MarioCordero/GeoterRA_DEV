<?php
declare(strict_types=1);

namespace DTO;

/**
 * Permission constants for role-based access control
 *
 * Define all available permissions in the system. These are mapped to roles
 * in the PermissionService and used for authorization checks.
 */
final class PermissionsDTO
{
  // Request Management (user)
  public const CREATE_REQUESTS = 'CREATE_REQUESTS';
  public const VIEW_OWN_REQUESTS = 'VIEW_OWN_REQUESTS';

  // Request Management (investigator/admin)
  public const VIEW_ALL_REQUESTS = 'VIEW_ALL_REQUESTS';
  public const MANAGE_ALL_REQUESTS = 'MANAGE_ALL_REQUESTS';
  public const MANAGE_REQUEST_STATES = 'MANAGE_REQUEST_STATES';

  // Geothermal resources
  public const MANAGE_GEOMANIFESTATIONS = 'MANAGE_GEOMANIFESTATIONS';
  public const MANAGE_GEOREPORTS = 'MANAGE_GEOREPORTS';
  public const MANAGE_INLAB_TESTS = 'MANAGE_INLAB_TESTS';
  public const MANAGE_INSITU_TESTS = 'MANAGE_INSITU_TESTS';
  public const MANAGE_TERRITORIES = 'MANAGE_TERRITORIES'; // provinces, cantons, districts

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
      self::VIEW_ALL_REQUESTS,
      self::MANAGE_ALL_REQUESTS,
      self::MANAGE_REQUEST_STATES,

      // Geothermal resources
      self::MANAGE_GEOMANIFESTATIONS,
      self::MANAGE_GEOREPORTS,
      self::MANAGE_INLAB_TESTS,
      self::MANAGE_INSITU_TESTS,
      self::MANAGE_TERRITORIES,

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