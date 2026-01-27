<?php
declare(strict_types=1);

namespace Http;

final class Response
{
  /**
   * Send a successful JSON response.
   *
   * @param array|null $data The main payload
   * @param array|null $meta Additional metadata (optional)
   * @param int $status HTTP status code
   */
  public static function success(?array $data = null, ?array $meta = null, int $status = 200): void
  {
    self::send([
      'data' => $data,
      'meta' => $meta,
      'error' => null
    ], $status);
  }

  /**
   * Send an error JSON response.
   *
   * @param string $message Human-readable error message
   * @param int $code Internal error code or HTTP status
   * @param array|null $meta Additional metadata (optional)
   */
  public static function error(string $message, int $code = 400, ?array $meta = null): void
  {
    self::send([
      'data' => null,
      'meta' => $meta,
      'error' => [
        'code' => $code,
        'message' => $message
      ],
    ], $code);
  }

  /**
   * Send the final JSON response.
   *
   * @param array $payload
   * @param int $status
   */
  private static function send(array $payload, int $status): void
  {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
  }
}
