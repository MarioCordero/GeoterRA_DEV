<?php
declare(strict_types=1);

namespace Core;

use Http\Response;
use Http\ErrorType;
use Http\ApiException;
use ErrorException;
use Throwable;

/**
 * Class GlobalErrorHandler
 * 
 * Responsible for capturing all unhandled errors and exceptions within the application.
 * It standardizes the error output by utilizing the centralized Response component,
 * ensuring that even critical failures follow the API's JSON specification.
 * 
 * @package Core
 */
class GlobalErrorHandler
{
  /**
   * Registers the custom error and exception handlers.
   * Should be called as early as possible during the application bootstrap.
   * 
   * @return void
   */
  public static function register(): void
  {
    set_error_handler([self::class, 'handleError']);
    set_exception_handler([self::class, 'handleException']);
  }

  /**
   * Converts PHP native errors into ErrorExceptions.
   * This allows all issues to be funneled through the handleException logic.
   * 
   * @param int $severity The level of the error raised.
   * @param string $message The error message.
   * @param string $file The filename where the error was raised.
   * @param int $line The line number where the error was raised.
   * @throws ErrorException
   */
  public static function handleError(
    int $severity, string $message,
    string $file, int $line): bool
  {
    if (!(error_reporting() & $severity)) {
      return false;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
  }

  /**
   * Catches all unhandled exceptions and generates a standardized JSON response.
   * 
   * If the exception is an instance of ApiException, it uses the specific 
   * ErrorType and HTTP status defined within. Otherwise, it defaults to a 500 Internal Error.
   * 
   * @param Throwable $e The caught exception or error.
   * @return void
   */
  public static function handleException(Throwable $e): void
  {
    $logEntry = sprintf(
      "[%s] %s: %s in %s:%d\n",
      date('Y-m-d H:i:s'),
      get_class($e),
      $e->getMessage(),
      $e->getFile(),
      $e->getLine()
    );

    Logger::error($logEntry);

    if ($e instanceof ApiException) {
      Response::error(
        $e->getError(),
        $e->getHttpStatus()
      );
      return;
    }

    Response::error(
      ErrorType::internal($e->getMessage()),
      500
    );
  }
}