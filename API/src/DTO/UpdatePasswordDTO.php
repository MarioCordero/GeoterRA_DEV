<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *   schema="UpdatePasswordDTO",
 *   type="object",
 *   description="Data required to update the user's password",
 *   required={"currentPassword", "newPassword"},
 *   @OA\Property(
 *     property="currentPassword",
 *     type="string",
 *     format="password",
 *     description="The current password of the user",
 *     example="OldPassword123"
 *   ),
 *   @OA\Property(
 *     property="newPassword",
 *     type="string",
 *     format="password",
 *     description="The new password to set (minimum 8 characters)",
 *     example="NewPassword123"
 *   )
 * )
 */
final class UpdatePasswordDTO
{
  public function __construct(
    public string $currentPassword,
    public string $newPassword
  ) {}

  /**
   * Creates a new instance of UpdatePasswordDTO from an array.
   *
   * @param array $data The request data
   * @return self
   */
  public static function fromArray(array $data): self
  {
    return new self(
      $data['current_password'] ?? '',
      $data['new_password'] ?? ''
    );
  }

  /**
   * Validates the password update payload.
   *
   * @throws ApiException
   * @return void
   */
  public function validate(): void
  {
    if ($this->currentPassword === '') {
      throw new ApiException(
        ErrorType::missingField('current_password'),
        422
      );
    }

    if ($this->newPassword === '') {
      throw new ApiException(
        ErrorType::missingField('new_password'),
        422
      );
    }

    if (strlen($this->newPassword) < 8) {
      throw new ApiException(
        ErrorType::validationError('Password must be at least 8 characters'),
        400
      );
    }
  }
}