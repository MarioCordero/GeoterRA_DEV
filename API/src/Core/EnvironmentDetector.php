<?php
declare(strict_types=1);

namespace Core;

/**
 * Detects server environment and protocol at runtime.
 * Does not rely on .env files - uses $_SERVER inspection and hostname detection.
 *
 * Production: https://geoterra.inii.ucr.ac.cr (UCR Institutional Domain)
 * Local/Dev:  http://localhost or http://127.0.0.1
 */
final class EnvironmentDetector
{
    /**
     * Check if the current request is using HTTPS/TLS.
     * Properly intercepts SSL termination from reverse proxies.
     */
    public static function isHttps(): bool
    {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
            (!empty($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) ||
            (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    }

    /**
     * Get the current server scheme (http or https).
     */
    public static function getScheme(): string
    {
        return self::isHttps() ? 'https' : 'http';
    }

    /**
     * Get the current server host (without port).
     */
    public static function getHost(): string
    {
        return $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
    }

    /**
     * Get the full request origin (scheme + host).
     */
    public static function getCurrentOrigin(): string
    {
        return self::getScheme() . '://' . self::getHost();
    }

    /**
     * Check if running on localhost/127.0.0.1 (development/local).
     */
    public static function isLocalhost(): bool
    {
        $host = self::getHost();
        return str_contains($host, 'localhost') ||
            str_starts_with($host, '127.') ||
            $host === '[::1]';  // IPv6 loopback
    }

    /**
     * Check if running on production server.
     * Prioritizes the APP_ENV environment variable, falling back to hostname/IP check.
     */
    public static function isProduction(): bool
    {
        $env = $_ENV['APP_ENV'] ?? getenv('APP_ENV') ?: null;
        if ($env !== null) {
            return $env === 'production';
        }

        $host = self::getHost();
        return str_contains($host, '163.178.171.105') ||
            str_contains($host, 'geoterra.inii.ucr.ac.cr');
    }

    /**
     * Determine if secure cookie flag should be set.
     * Cookie security is ONLY determined by protocol, not environment.
     */
    public static function shouldUseSecureCookie(): bool
    {
        return self::isHttps();
    }

    /**
     * Get appropriate SameSite attribute value.
     * SameSite policy depends on protocol, not environment.
     */
    public static function getSameSiteValue(): string
    {
        return self::isHttps() ? 'None' : 'Lax';
    }

    /**
     * Get the appropriate domain for setting cookies.
     * Detects the current host and returns the correct domain for cookie storage.
     */
    public static function getCookieDomain(): string
    {
        $host = self::getHost();

        // Remove port if present (e.g., 'host:5173' -> 'host')
        $domain = explode(':', $host)[0];

        // For UCR subdomain, use the exact domain name
        if ($domain === 'geoterra.inii.ucr.ac.cr') {
            return 'geoterra.inii.ucr.ac.cr';
        }

        // For production IP address
        if ($domain === '163.178.171.105') {
            return '163.178.171.105';
        }

        // For localhost/127.0.0.1 - no domain restriction
        return '';
    }
}