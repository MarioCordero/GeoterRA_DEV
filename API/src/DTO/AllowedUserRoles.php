<?php
declare(strict_types=1);

namespace DTO;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *   schema="AllowedUserRoles",
 *   type="string",
 *   enum={"admin", "maintenance", "investigator", "user"},
 *   description="Roles permitidos en el sistema GeoterRA"
 * )
 *
 * Allowed user roles list compatible with PHP 8.0
 */
final class AllowedUserRoles
{
  public const ADMIN = 'admin';
  public const MAINTENANCE = 'maintenance';
  public const INVESTIGATOR = 'investigator';
  public const USER = 'user';

  /**
   * Return all allowed user roles as strings.
   */
  public static function values(): array
  {
    return [
      self::ADMIN,
      self::MAINTENANCE,
      self::INVESTIGATOR,
      self::USER,
    ];
  }

  /**
   * Check if a user role string is allowed.
   */
  public static function isValid(string $role): bool
  {
    return in_array($role, self::values(), true);
  }
}