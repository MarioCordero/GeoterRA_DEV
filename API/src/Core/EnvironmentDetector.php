<?php
declare(strict_types=1);

namespace Core;

/**
 * Detects server environment and protocol at runtime.
 * Does not rely on .env files - uses $_SERVER inspection.
 */
final class EnvironmentDetector
{
  /**
   * Check if the current request is using HTTPS/TLS.
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
   * Get the current server host.
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
   * Check if running on localhost/127.0.0.1 (development).
   */
  public static function isLocalhost(): bool
  {
    $host = self::getHost();
    return str_contains($host, 'localhost') ||
           str_starts_with($host, '127.') ||
           $host === '[::1]';  // IPv6 loopback
  }

  /**
   * Determine if secure cookie flag should be set.
   * 
   * Returns true if:
   * - Running HTTPS (production or secured staging)
   * Returns false if:
   * - Running plain HTTP (development or unencrypted IP)
   */
  public static function shouldUseSecureCookie(): bool
  {
    return self::isHttps();
  }

  /**
   * Get appropriate SameSite attribute value.
   * 
   * - For HTTP: 'Lax' (allows cookies in top-level navigation)
   * - For HTTPS: 'None' (requires Secure flag, allows cross-site cookies)
   */
  public static function getSameSiteValue(): string
  {
    return self::isHttps() ? 'None' : 'Lax';
  }
}