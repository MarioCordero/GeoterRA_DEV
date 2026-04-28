<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;

/**
 * DTO for updating a user's role.
 * Restricted to maintenance administrators.
 */
final class UpdateUserRoleDTO
{
  public function __construct(
    public string $userId,
    public string $role,
  ) {}

  public static function fromArray(array $data, string $userId = ''): self
  {
    return new self(
      $userId,
      trim($data['role'] ?? '')
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
   * Validates role update payload.
   *
   * @throws ApiException
   */
  public function validate(): void
  {
    if (empty($this->userId)) {
      throw new ApiException(
        ErrorType::missingField('userId'),
        422
      );
    }

    if (empty($this->role)) {
      throw new ApiException(
        ErrorType::missingField('role'),
        422
      );
    }

    if (!AllowedUserRoles::isValid($this->role)) {
      throw new ApiException(
        ErrorType::validationError('Invalid role. Allowed values: ' . implode(', ', AllowedUserRoles::values())),
        422
      );
    }
  }
}