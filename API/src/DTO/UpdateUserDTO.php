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
    public string $userId,
    public string $firstName,
    public string $lastName,
    public string $email,
    public ?string $phoneNumber,
    public ?string $currentPassword,
    public ?string $password,  
  ) {}

  public static function fromArray(array $data, string $userId = ''): self
  {
    return new self(
      $userId,
      trim($data['firstName'] ?? $data['name'] ?? ''),
      trim($data['lastName'] ?? $data['lastname'] ?? ''),
      trim($data['email'] ?? ''),
      $data['phoneNumber'] ?? $data['phone_number'] ?? null,
      $data['currentPassword'] ?? $data['current_password'] ?? null,
      $data['password'] ?? $data['password'] ?? null
    );
  }

  /**
   * Set the user ID for the DTO
   */
  public function setUserId(string $userId): void
  {
    $this->userId = $userId;
  }

  /**
   * Validates update payload.
   *
   * @throws ApiException
   */
  public function validate(): void
  {
    if ($this->password && !$this->currentPassword) {
      throw new ApiException(
        ErrorType::validationError('Current password is required to change password'),
        400
      );
    }

    if ($this->email && !filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
      throw new ApiException(
        ErrorType::invalidEmail(),
        422
      );
    }

    if ($this->password && strlen($this->password) < 8) {
      throw new ApiException(
        ErrorType::validationError('Password must be at least 8 characters'),
        400
      );
    }

    if ($this->firstName === '') {
      throw new ApiException(ErrorType::missingField('firstName'), 422);
    }

    if ($this->lastName === '') {
      throw new ApiException(ErrorType::missingField('lastName'), 422);
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
        ErrorType::invalidField('phoneNumber'),
        422
      );
    }
  }
}
