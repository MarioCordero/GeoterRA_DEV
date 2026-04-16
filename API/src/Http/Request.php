<?php
declare(strict_types=1);

namespace Http;

final class Request
{
  private static ?array $user = null;
  private static array $body = [];

  private static ?string $platform = null;
  private static ?string $apiKey = null;

  public static function init(): void
  {
    $headers = array_change_key_case(getallheaders(), CASE_LOWER);
    self::$apiKey = $headers['-x-api-key'] ?? null;

    $apiKeys = require __DIR__ . '../../../config/apiKeys.php';

    // API keys mapped to platforms. In a real app, this would come from a secure config or database.
    $allowedClients = $apiKeys;

    if (self::$apiKey && isset($allowedClients[self::$apiKey])) {
      self::$platform = $allowedClients[self::$apiKey];
    } else {
      self::$platform = 'unknown';
    }
  }

  public static function getPlatform(): string 
  {
    if (self::$platform === null) self::init();
    return self::$platform;
  }

  public static function isValidClient(): bool 
  {
    return self::getPlatform() !== 'unknown';
  }

  public static function isWeb(): bool { return self::getPlatform() === 'web'; }

  public static function isMobile(): bool { return self::getPlatform() === 'mobile'; }

  /**
   * Get raw JSON from request body.
   */
  private static function json(): ?array
  {
    $raw = file_get_contents('php://input');
    if (!$raw) {
      return null;
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
  }

  /**
   * Parses and validates JSON request body.
   *
   * @return array<string, mixed>
   */
  public static function parseJsonRequest(): array
  {
    $data = self::json();

    if ($data === null) {
      Response::error(
        ErrorType::invalidJson(),
        400
      );
    }

    return $data;
  }

  /**
   * Set the authenticated user for this request.
   * Called by session.php after validating the token.
   */
  public static function setUser(?array $user): void
  {
    self::$user = $user;
  }

  /**
   * Get the authenticated user from this request (or null if not authenticated).
   * Controllers call this to check who is making the request.
   */
  public static function getUser(): ?array
  {
    return self::$user;
  }

  /**
   * Check if user is authenticated.
   */
  public static function isAuthenticated(): bool
  {
    return self::$user !== null;
  }

  public static function getToken(): ?string
  {
    if (self::isWeb()) {
      return $_COOKIE['geoterra_session_token'] ?? null;
    }
    return self::getBearerToken();
  }

  /**
   * Extract Bearer token from Authorization header.
   * Format: "Bearer <token>"
   *
   * @return string|null The token if present, null otherwise
   */
  public static function getBearerToken(): ?string
  {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    
    if (empty($authHeader)) {
      return null;
    }

    // Parse "Bearer <token>" format
    if (!preg_match('/Bearer\s+([a-f0-9]+)$/i', $authHeader, $matches)) {
      return null;
    }

    return $matches[1];
  }

  /**
   * Check if request has a valid Bearer token in Authorization header.
   */
  public static function hasBearerToken(): bool
  {
    return self::getBearerToken() !== null;
  }
}