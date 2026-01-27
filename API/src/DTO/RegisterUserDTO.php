<?php
declare(strict_types=1);

namespace DTO;

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
   *
   * @param RegisterUserDTO $dto Registration data to validate
   *
   * @throws RuntimeException If any validation rule fails
   */
  public function validate(RegisterUserDTO $dto): void
  {
    if (empty($dto->firstName)) {
      throw new RuntimeException('First name is required');
    }
    if (empty($dto->lastName)) {
      throw new RuntimeException('Last name is required');
    }
    if (empty($dto->email)) {
      throw new RuntimeException('Email is required');
    }
    if (!filter_var($dto->email, FILTER_VALIDATE_EMAIL)) {
      throw new RuntimeException('Email is invalid');
    }
    if (empty($dto->password)) {
      throw new RuntimeException('Password is required');
    }
    if (strlen($dto->password) < 8) {
      throw new RuntimeException('Password must be at least 8 characters long');
    }
    if ($dto->phoneNumber !== null && !preg_match('/^\d{8,15}$/', $dto->phoneNumber)) {
      throw new RuntimeException('Phone number is invalid');
    }
  }
}
