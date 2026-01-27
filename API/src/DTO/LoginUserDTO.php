<?php
declare(strict_types=1);

namespace DTO;

/**
 * DTO for login requests
 */
final class LoginUserDTO
{
  public function __construct(
    public string $email,
    public string $password
  ) {}

  /**
   * Creates DTO from request array
   */
  public static function fromArray(array $data): self
  {
    return new self(
      trim((string) ($data['email'] ?? '')),
      (string) ($data['password'] ?? '')
    );
  }

  /**
   * Validates the login request.
   *
   * @throws \RuntimeException if any validation rule fails
   */
  public function validate(): void
  {
    if ($this->email === '') {
      throw new \RuntimeException('Email is required');
    }
    if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
      throw new \RuntimeException('Email is invalid');
    }
    if ($this->password === '') {
      throw new \RuntimeException('Password is required');
    }
    if (strlen($this->password) < 8) {
      throw new \RuntimeException('Password must be at least 8 characters long');
    }
  }
}
