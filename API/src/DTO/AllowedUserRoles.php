<?php
declare(strict_types=1);

namespace DTO;

/**
 * Allowed user roles list compatible with PHP 8.0
 */
final class AllowedUserRoles
{   
    public const ADMIN = 'admin'; 
    public const MODERATOR = 'moderator';
    public const USER = 'user';

    /**
     * Return all allowed user roles as strings.
     */
    public static function values(): array
    {
        return [
            self::ADMIN,
            self::MODERATOR,
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