<?php
declare(strict_types=1);

namespace Http;

final class Request
{
  private static ?array $user = null;
  private static array $body = [];

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
}