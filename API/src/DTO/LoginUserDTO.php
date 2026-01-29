<?php
declare(strict_types=1);

namespace DTO;

use Http\ErrorType;
use Http\ApiException;


final class LoginUserDTO
{
  public function __construct(
    public string $email,
    public string $password
  ) {}

  public static function fromArray(array $data): self
  {
    return new self(
      trim((string) ($data['email'] ?? '')),
      (string) ($data['password'] ?? '')
    );
  }

  /**
   * Validates the login request.
   */
  public function validate(): void
  {
    if ($this->email === '') {
      throw new ApiException(ErrorType::missingField('email')->jsonSerialize()['message']);
    }
    if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
      throw new ApiException(ErrorType::invalidEmail()->jsonSerialize()['message']);
    }
    if ($this->password === '') {
      throw new ApiException(ErrorType::missingField('password')->jsonSerialize()['message']);
    }
    if (strlen($this->password) < 8) {
      throw new ApiException(ErrorType::weakPassword()->jsonSerialize()['message']);
    }
  }
}
?>