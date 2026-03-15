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
      'errors' => []
    ], $status);
  }

  /**
   * Send an error JSON response.
   *
   * @param ErrorType|array|string $errors One error, many errors, or legacy string
   * @param int $status HTTP status code (used for legacy string or fallback)
   * @param array|null $meta Additional metadata (optional)
   */
  public static function error(ErrorType|array|string $errors, int $status = 401, ?array $meta = null): void
  {
    $list = [];

    if ($errors instanceof ErrorType) {
      $list = [$errors];
    } elseif (is_array($errors)) {
      foreach ($errors as $err) {
        if ($err instanceof ErrorType) {
          $list[] = $err;
        } elseif (is_string($err)) {
          $list[] = ErrorType::from('BAD_REQUEST', $err);
        }
      }
    } elseif (is_string($errors)) {
      $list = [ErrorType::from('BAD_REQUEST', $errors)];
    }

    self::send([
      'data' => null,
      'meta' => $meta,
      'errors' => $list,
    ], $status);
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
?>