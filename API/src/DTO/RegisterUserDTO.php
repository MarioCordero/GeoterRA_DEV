<?php
declare(strict_types=1);

namespace DTO;
use Http\ErrorType;
use Http\ApiException;


final class RegisterUserDTO
{
  public function __construct(
    public string $firstName,
    public string $lastName,
    public string $email,
    public ?string $phoneNumber,
    public string $password
  ) {}

  public static function fromArray(array $data): self
  {
    return new self(
      trim($data['name'] ?? ''),
      trim($data['lastname'] ?? ''),
      strtolower(trim($data['email'] ?? '')),
      $data['phone_number'] ?? null,
      $data['password'] ?? ''
    );
  }

  /**
   * Validates the registration data.
   */
  public function validate(): void
  {
    if ($this->firstName === '') {
      throw new ApiException(ErrorType::missingField('name'), 422);
    }

    if ($this->lastName === '') {
      throw new ApiException(ErrorType::missingField('lastname'), 422);
    }

    if ($this->email === '') {
      throw new ApiException(ErrorType::missingField('email'), 422);
    }

    if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
      throw new ApiException(ErrorType::invalidEmail(), 422);
    }

    if ($this->password === '') {
      throw new ApiException(ErrorType::missingField('password'), 422);
    }

    if (strlen($this->password) < 8) {
      throw new ApiException(ErrorType::weakPassword(), 422);
    }

    if ($this->phoneNumber !== null && !preg_match('/^\d{8,15}$/', $this->phoneNumber)) {
      throw new ApiException(
        ErrorType::invalidField('phone_number'),
        422
      );
    }
  }
}
?>