<?php
declare(strict_types=1);

namespace Http;

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
   * @return array<mixed>|null The user details or null if the request is unauthenticated.
   */
  public static function getUser(): ?array
  {
    return self::$user;
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
    $basePath = '/api/public';
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