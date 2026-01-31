<?php
declare(strict_types=1);

namespace Http;

use RuntimeException;

/**
 * Exception that wraps an ErrorType
 * so it can propagate through layers safely.
 */
final class ApiException extends RuntimeException
{
  public function __construct(
    private ErrorType $error,
    int $httpStatus = 400
  ) {
    parent::__construct($error->jsonSerialize()['message'], $httpStatus);
  }

  public function getError(): ErrorType
  {
    return $this->error;
  }

  public function getHttpStatus(): int
  {
    return $this->getCode();
  }
}
