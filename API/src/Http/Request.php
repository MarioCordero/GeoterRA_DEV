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
  private static ?array $user = null;
  private static ?string $rawBody = null;
  private static ?array $jsonBody = null;
  private static ?string $platform = null;
  private static ?string $apiKey = null;

  public static function init(): void
  {
    if (session_status() !== PHP_SESSION_ACTIVE && !headers_sent()) {
      session_set_cookie_params([
        'lifetime' => 5400,
        'path' => '/',
        'domain' => '',
        'secure' => EnvironmentDetector::shouldUseSecureCookie(),
        'httponly' => true,
        'samesite' => EnvironmentDetector::getSameSiteValue()
      ]);
    }

    $headers = self::getHeaders();
    $lowerHeaders = array_change_key_case($headers, CASE_LOWER);

    $apiKey = $lowerHeaders['x-api-key']
      ?? $_SERVER['HTTP_X_API_KEY']
      ?? $_SERVER['REDIRECT_HTTP_X_API_KEY']
      ?? $_SERVER['X_API_KEY']
      ?? $lowerHeaders['x_api_key']
      ?? null;

    self::$apiKey = is_string($apiKey) ? trim($apiKey) : null;

    // Search for api-keys.php in candidate paths
    $productionKeysPath = dirname(__DIR__, 4) . '/api-keys.php';
    $localKeysPath = dirname(__DIR__, 2) . '/config/api-keys.php';

    $candidatePaths = [];
    if (EnvironmentDetector::isProduction()) {
      $candidatePaths[] = $productionKeysPath;
      if (getenv('HOME')) {
        $candidatePaths[] = rtrim(getenv('HOME'), '/') . '/api-keys.php';
      }
      $candidatePaths[] = dirname(__DIR__, 3) . '/api-keys.php';
      $candidatePaths[] = $localKeysPath;
    } else {
      $candidatePaths[] = $localKeysPath;
      $candidatePaths[] = $productionKeysPath;
      $candidatePaths[] = dirname(__DIR__, 3) . '/api-keys.php';
      if (getenv('HOME')) {
        $candidatePaths[] = rtrim(getenv('HOME'), '/') . '/api-keys.php';
      }
    }

    if (!empty($_SERVER['DOCUMENT_ROOT'])) {
      $candidatePaths[] = rtrim(dirname($_SERVER['DOCUMENT_ROOT'], 2), '/') . '/api-keys.php';
      $candidatePaths[] = rtrim(dirname($_SERVER['DOCUMENT_ROOT'], 3), '/') . '/api-keys.php';
      $candidatePaths[] = rtrim(dirname($_SERVER['DOCUMENT_ROOT'], 4), '/') . '/api-keys.php';
    }

    $candidatePaths = array_values(array_unique(array_filter($candidatePaths)));

    $apiKeysPath = null;
    foreach ($candidatePaths as $candidate) {
      if (file_exists($candidate)) {
        $apiKeysPath = $candidate;
        break;
      }
    }

    if ($apiKeysPath === null) {
      throw new RuntimeException(
        'API keys configuration file not found. Looked in: ' . implode(', ', $candidatePaths)
      );
    }

    $apiKeys = require $apiKeysPath;
    $allowedClients = is_array($apiKeys) ? $apiKeys : [];

    if (self::$apiKey !== null && isset($allowedClients[self::$apiKey])) {
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
      $raw = fopen('php://input', 'rb');
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
   * @return array|null Associative array or null if invalid.
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
   * @throws \Exception via Response::error if the JSON payload is malformed
   * or missing.
   */
  public static function parseJsonRequest(): array
  {
    $data = self::json();

    if ($data === null) {
      throw new ApiException(ErrorType::invalidJson(), 400);
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

  public static function getUser(): ?array
  {
    if (self::$user === null) {
      throw new ApiException(ErrorType::unauthorized(), 401);
    }
    return self::$user;
  }

  public static function requireRole(array $allowedRoles): array
  {
    $user = self::getUser();
    if ($user === null || !isset($user['role'])
      || !in_array($user['role'], $allowedRoles, true)) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }
    return $user;
  }

  public static function isAuthenticated(): bool
  {
    return self::$user !== null;
  }

  /**
   * Determines whether the current request has an associated authenticated user.
   *
   * @return string|null The user's authentication token, if available'.
   */
  public static function getToken(): ?string
  {
    if (self::isWeb()) {
      return $_COOKIE['geoterra_session_token'] ?? null;
    }
    return self::getBearerToken();
  }

  /**
   * Extract Bearer token from the Authorization header.
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

    $basePath = '/api';
    $pos = stripos($path, $basePath);

    if ($pos === 0) {
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
    $headers = [];
    if (function_exists('getallheaders')) {
      $all = getallheaders();
      if (is_array($all)) {
        $headers = $all;
      }
    } elseif (function_exists('apache_request_headers')) {
      $all = apache_request_headers();
      if (is_array($all)) {
        $headers = $all;
      }
    }

    // Fallback: extract headers from $_SERVER (HTTP_* and REDIRECT_HTTP_*)
    foreach ($_SERVER as $key => $value) {
      if (is_string($value)) {
        if (str_starts_with($key, 'HTTP_')) {
          $headerName = str_replace('_', '-', strtolower(substr($key, 5)));
          if (!isset($headers[$headerName])) {
            $headers[$headerName] = $value;
          }
        } elseif (str_starts_with($key, 'REDIRECT_HTTP_')) {
          $headerName = str_replace('_', '-', strtolower(substr($key, 14)));
          if (!isset($headers[$headerName])) {
            $headers[$headerName] = $value;
          }
        } elseif (in_array($key, ['CONTENT_TYPE', 'CONTENT_LENGTH', 'X_API_KEY'], true)) {
          $headerName = str_replace('_', '-', strtolower($key));
          if (!isset($headers[$headerName])) {
            $headers[$headerName] = $value;
          }
        }
      }
    }

    return $headers;
  }

  /**
   * Retrieves the client IP address from the request.
   * Evaluates standard and proxy headers to determine the real IP.
   *
   * @return string The client IP address.
   */
  public static function getIpAddress(): string
  {
    $keys = [
      'HTTP_CLIENT_IP',
      'HTTP_X_FORWARDED_FOR',
      'HTTP_X_FORWARDED',
      'HTTP_X_CLUSTER_CLIENT_IP',
      'HTTP_FORWARDED_FOR',
      'HTTP_FORWARDED',
      'REMOTE_ADDR'
    ];

    foreach ($keys as $key) {
      if (array_key_exists($key, $_SERVER)) {
        foreach (explode(',', $_SERVER[$key]) as $ip) {
          $ip = trim($ip);
          if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return $ip;
          }
        }
      }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
  }

  /**
   * Retrieves the User-Agent header from the request.
   *
   * @return string The raw User-Agent string.
   */
  public static function getUserAgent(): string
  {
    return $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown Device';
  }
}