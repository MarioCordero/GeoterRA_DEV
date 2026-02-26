<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * DTO for updating user profile data.
 */
final class UpdateUserDTO
{
  public function __construct(
    public string $firstName,
    public string $lastName,
    public string $email,
    public ?string $phoneNumber
  ) {}

  public static function fromArray(array $data): self
  {
    return new self(
      trim($data['name'] ?? ''),
      trim($data['lastname'] ?? ''),
      trim($data['email'] ?? ''),
      $data['phone_number'] ?? null
    );
  }

  /**
   * Validates update payload.
   *
   * @throws ApiException
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

    if (
      $this->phoneNumber !== null &&
      !preg_match('/^\d{8,15}$/', $this->phoneNumber)
    ) {
      throw new ApiException(
        ErrorType::invalidField('phone_number'),
        422
      );
    }
  }
}
