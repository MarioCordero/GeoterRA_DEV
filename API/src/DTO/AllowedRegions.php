<?php
declare(strict_types=1);

namespace DTO;

/**
 * Allowed regions list compatible with PHP 8.0 (no enums).
 */
final class AllowedRegions
{
    /**
     * Return all allowed regions as strings.
     */
    public static function values(): array
    {
        return [
            'Guanacaste',
            'Alajuela',
            'San_José',
            'Puntarenas',
            'Cartago',
            'Heredia',
            'Limón',
            'all',
        ];
    }

    /**
     * Check if a region string is allowed.
     */
    public static function isValid(string $region): bool
    {
        return in_array($region, self::values(), true);
    }
}