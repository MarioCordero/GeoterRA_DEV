<?php
declare(strict_types=1);

namespace Core;

/**
 * Detects server environment and protocol at runtime.
 * Does not rely on .env files - uses $_SERVER inspection and hostname detection.
 * 
 * Production: http://163.178.171.105 (public IPv4)
 * Local/Dev:  http://localhost or http://127.0.0.1
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
   * Check if running on production server (163.178.171.105 or geoterra.com).
   */
  public static function isProduction(): bool
  {
    $host = self::getHost();
    return str_contains($host, '163.178.171.105') ||
           str_contains($host, 'geoterra.com');
  }

  /**
   * Determine if secure cookie flag should be set.
   * Cookie security is ONLY determined by protocol, not environment.
   * 
   * Returns true:  Only if running HTTPS
   * Returns false: All HTTP environments (dev, staging, production IPs)
   */
  public static function shouldUseSecureCookie(): bool
  {
    return self::isHttps();
  }

  /**
   * Get appropriate SameSite attribute value.
   * SameSite policy depends on protocol, not environment.
   * 
   * For HTTP: 'Lax' (allows cookies in top-level navigation)
   * For HTTPS: 'None' (requires Secure flag, allows cross-site cookies)
   */
  public static function getSameSiteValue(): string
  {
    return self::isHttps() ? 'None' : 'Lax';
  }
}