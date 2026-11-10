<?php
declare(strict_types=1);

namespace Http;

/**
 * Class Response
 * 
 * Standardizes the API output format. Ensures every response contains
 * a consistent structure: 'data', 'meta', and 'errors'.
 * 
 * @package Http
 */
final class Response
{
  /**
   * Sends a successful JSON response and terminates execution.
   *
   * @param array<mixed>|null $data The primary resource or payload to return.
   * @param array<mixed>|null $meta Optional pagination, versioning, or additional context.
   * @param int $status HTTP response status code (defaults to 200 OK).
   * @return void This method terminates the script execution.
   */
  public static function success(
    ?array $data = null,
    ?array $meta = null,
    int $status = 200
  ): void
  {
    self::send([
      'data' => $data,
      'meta' => $meta,
      'errors' => []
    ], $status);
  }

  /**
   * Streams a binary file download with appropriate HTTP headers and terminates execution.
   *
   * @param string $filePath Full filesystem path to the file.
   * @param string $fileName Suggested download file name.
   * @param string $mimeType Content-Type (defaults to application/octet-stream).
   * @return void Terminates execution via exit.
   */
  public static function download(
    string $filePath,
    string $fileName = '',
    string $mimeType = 'application/octet-stream'
  ): void
  {
    if (!file_exists($filePath) || !is_readable($filePath)) {
      self::error(ErrorType::notFound('Archivo'), 404);
      return;
    }

    $fileName = $fileName ?: basename($filePath);
    $fileSize = filesize($filePath);

    if (ob_get_level()) {
      ob_end_clean();
    }

    http_response_code(200);
    header('Content-Description: File Transfer');
    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . str_replace('"', '', $fileName) . '"');
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');
    if ($fileSize !== false) {
      header('Content-Length: ' . (string) $fileSize);
    }

    flush();

    // Stream file chunk by chunk (safe for large files without hitting memory limits)
    $handle = fopen($filePath, 'rb');
    if ($handle !== false) {
      while (!feof($handle)) {
        echo fread($handle, 1024 * 64);
        flush();
      }
      fclose($handle);
    } else {
      readfile($filePath);
    }

    exit;
  }

  /**
   * Sends a formatted error JSON response and terminates execution.
   * 
   * Handles multiple input formats: a single ErrorType instance, an array of ErrorTypes/strings,
   * or a single legacy string.
   *
   * @param ErrorType|array<mixed>|string $errors Single error object, list of errors, or error message.
   * @param int $status HTTP status code (defaults to 401 Unauthorized).
   * @param array<mixed>|null $meta Optional additional metadata.
   * @return void This method terminates the script execution.
   */
  public static function error(
    ErrorType|array|string $errors,
    int $status = 401,
    ?array $meta = null
  ): void
  {
    $list = [];

    if ($errors instanceof ErrorType) {
      $list = [$errors];
    } elseif (is_array($errors)) {
      foreach ($errors as $err) {
        if ($err instanceof ErrorType) {
          $list[] = $err;
        } elseif (is_string($err)) {
          // Fallback for raw strings within an array.
          $list[] = ErrorType::from('BAD_REQUEST', $err);
        }
      }
    } elseif (is_string($errors)) {
      // Fallback for direct raw string input.
      $list = [ErrorType::from('BAD_REQUEST', $errors)];
    }

    self::send([
      'data' => null,
      'meta' => $meta,
      'errors' => $list,
    ], $status);
  }

  /**
   * Finalizes the HTTP response, sets headers, and outputs the JSON payload.
   * 
   * Applies JSON_UNESCAPED_UNICODE for proper character encoding (UTF-8) 
   *
   * @param array<mixed> $payload The structured response body.
   * @param int $status The HTTP status code to be sent.
   * @return void Terminates execution via exit.
   */
  private static function send(array $payload, int $status): void
  {
    $status = ($status >= 100 && $status < 600) ? $status : 500;
    http_response_code($status);

    header('Content-Type: application/json; charset=UTF-8');
    header('X-Content-Type-Options: nosniff');

    $options = JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_HEX_APOS;
    $output = json_encode($payload, $options);

    if ($output === false) {
      http_response_code(500);
      echo '{"data":null,"meta":null,"errors":[{"code":"INTERNAL_ERROR","message":"JSON encoding failed"}]}';
    } else {
      http_response_code($status);
      echo $output;
    }
    
    exit;
  }
}