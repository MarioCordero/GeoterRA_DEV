<?php
declare(strict_types=1);

namespace Http;

use Core\EnvironmentDetector;
use RuntimeException;

/**
 * Class Request
 *
 * Handles incoming HTTP request data, including headers, body parsing,
 * routing information, and authenticated user context.
 *
 * @package Http
 */
final class Request
{
  /** @var array<mixed>|null Stores the authenticated user data for the current request. */
  private static ?array $user = null;

  /** @var string|null Cached raw body content */
  private static ?string $rawBody = null;

  /** @var array<mixed>|null Cached parsed JSON body */
  private static ?array $jsonBody = null;

  private static ?string $platform = null;
  private static ?string $apiKey = null;

  public static function init(): void
  {

    if (session_status() !== PHP_SESSION_ACTIVE && !headers_sent()) {
      // Configure session cookie parameters early
      session_set_cookie_params([
        'lifetime' => 5400, // 1.5 hours
        'path' => '/',
        'domain' => '', // Empty domain = request host (works with IPs)
        'secure' => EnvironmentDetector::shouldUseSecureCookie(),
        'httponly' => true,
        'samesite' => EnvironmentDetector::getSameSiteValue()
      ]);
    }

    self::$apiKey = $headers['-x-api-key'] ?? $_SERVER['HTTP_X_API_KEY'] ?? null;

    // Load API keys from environment-aware location
    // Production: JOB/api-keys.php (outside project, on 163.178.171.105 or geoterra.com)
    // Local: API/config/api-keys.php (on localhost or 127.0.0.1)
    $productionKeysPath = dirname(__DIR__, 4) . '/api-keys.php';
    $localKeysPath = dirname(__DIR__, 2) . '/config/api-keys.php';

    // Detect by hostname/IP, not protocol (production is HTTP, not HTTPS)
    $apiKeysPath = (EnvironmentDetector::isProduction() && file_exists($productionKeysPath))
      ? $productionKeysPath
      : $localKeysPath;

    if (!file_exists($apiKeysPath)) {
      throw new RuntimeException('API keys configuration file not found at: ' . $apiKeysPath);
    }

    $apiKeys = require $apiKeysPath;
    $allowedClients = $apiKeys;

    if (self::$apiKey && isset($allowedClients[self::$apiKey])) {
      self::$platform = $allowedClients[self::$apiKey];
    } else {
      self::$platform = 'unknown';
    }
  }

  /**
   * Retrieves the raw, unparsed request body.
   *
   * @return string|null The raw input string or null if empty.
   */
  public static function getBody(): ?string
  {
    if (self::$rawBody === null) {
      $raw = fopen('php://input', 'r');
      if ($raw === false) {
        self::$rawBody = null;
      } else {
        self::$rawBody = stream_get_contents($raw);
        fclose($raw);
      }
    }
    return self::$rawBody === '' ? null : self::$rawBody;
  }

  /**
   * Decodes the raw body into a JSON array and caches the result.
   *
   * @return array<mixed>|null Associative array or null if invalid.
   */
  private static function json(): ?array
  {
    if (self::$jsonBody !== null) {
      return self::$jsonBody;
    }

    $raw = self::getBody();
    if (!$raw) {
      return null;
    }

    $data = json_decode($raw, true);
    self::$jsonBody = is_array($data) ? $data : null;

    return self::$jsonBody;
  }

  /**
   * Parses the JSON request body and terminates the execution with a 400 error if invalid.
   *
   * @return array<string, mixed> The validated associative array of the request body.
   * @throws \Exception via Response::error if the JSON payload is malformed or missing.
   */
  public static function parseJsonRequest(): array
  {
    $data = self::json();

    if ($data === null) {
      throw new ApiException(ErrorType::invalidJson());
    }

    return $data;
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
   * Sets the authenticated user context for the current request.
   *
   * @param array<mixed>|null $user Associative array containing user details.
   * @return void
   */
  public static function setUser(?array $user): void
  {
    self::$user = $user;
  }

  /**
   * Retrieves the authenticated user data.
   *
   * @return array<mixed>|null The user details or null if the request is
   * unauthenticated.
   */
  public static function getUser(): ?array
  {
    if (!self::$user === null) {
      throw new ApiException(ErrorType::unauthorized());
    }
    return self::$user;
  }

  public static function requireRole(array $allowedRoles): array
  {
    $user = self::getUser();
    if ($user === null || !isset($user['role'])
      || !in_array($user['role'], $allowedRoles, true)) {
      throw new ApiException(ErrorType::forbidden());
    }
    return $user;
  }

  /**
   * Determines whether the current request has an associated authenticated user.
   *
   * @return bool True if a user is set, false otherwise.
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
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

    if (empty($authHeader) && function_exists('apache_request_headers')) {
      $headers = apache_request_headers();
      $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (empty($authHeader)) return null;

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

  /**
   * Extracts and cleans the request URI path, stripping the base API prefix.
   *
   * @return string Request Path.
   */
  public static function getPath(): string
  {
    $uri = $_SERVER['REQUEST_URI'] ?? '/';
    $path = parse_url($uri, PHP_URL_PATH);
    if ($path === false || $path === null) {
      $path = '/';
    }
    $basePath = '/API/public';
    if (stripos($path, $basePath) === 0) {
      $path = substr($path, strlen($basePath));
    }
    return $path ?: '/';
  }

  /**
   * Retrieves the HTTP request method.
   *
   * @return string The uppercase method name (e.g., "GET", "POST", "PUT", "DELETE").
   */
  public static function getMethod(): string
  {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    return strtoupper($method);
  }

  /**
   * Retrieves all HTTP headers from the current request.
   *
   * @return array<string, string> An associative array of headers.
   */
  public static function getHeaders(): array
  {
    return getallheaders();
  }
}