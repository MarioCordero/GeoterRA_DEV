<?php
declare(strict_types=1);

namespace Http;

final class Request
{
  private static function json(): ?array
  {
    $raw = file_get_contents('php://input');
    if (!$raw)
      return null;

    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
  }

  /**
   * Parses and validates JSON request body.
   *
   * @return array<string, mixed>s
   */
  public static function parseJsonRequest(): array
  {
    $data = Request::json();

    if ($data === null) {
      Response::error(
        ErrorType::invalidJson(),
        400
      );
    }

    return $data;
  }
}
?>