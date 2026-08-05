<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *   schema="ResetPasswordDTO",
 *   type="object",
 *   description="Data Transfer Object containing the necessary information to complete a password reset.",
 *   required={"token", "new_password"},
 *   @OA\Property(
 *     property="token",
 *     type="string",
 *     description="The OTP recovery token provided to the user via email",
 *     example="749204"
 *   ),
 *   @OA\Property(
 *     property="new_password",
 *     type="string",
 *     format="password",
 *     description="The new password to be assigned to the user account (minimum 8 characters)",
 *     example="SecurePass123!"
 *   )
 * )
 */
final class ResetPasswordDTO
{
  /**
   * Constructs the ResetPasswordDTO.
   *
   * @param string $token The verification token (OTP).
   * @param string $newPassword The new password requested by the user.
   */
  public function __construct(
    public string $token,
    public string $newPassword,
  ) {}

  /**
   * Instantiates a ResetPasswordDTO from a raw associative array.
   *
   * @param array $data The input data, typically from the HTTP request body.
   * @return self A populated instance of the DTO.
   */
  public static function fromArray(array $data): self
  {
    return new self(
      trim($data['token'] ?? ''),
      trim($data['new_password'] ?? '')
    );
  }

  /**
   * Validates the password reset data.
   * Ensures that neither the token nor the new password fields are empty.
   *
   * @throws ApiException If any required field is missing or invalid.
   */
  public function validate(): void
  {
    if (empty($this->token)) {
      throw new ApiException(
        ErrorType::invalidField('token'),
        400
      );
    }

    if (empty($this->newPassword)) {
      throw new ApiException(
        ErrorType::invalidField('new_password'),
        400
      );
    }

    if (strlen($this->newPassword) < 8) {
      throw new ApiException(ErrorType::weakPassword(), 422);
    }

    $passwordPattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,64}$/';
    if (!preg_match($passwordPattern, $this->newPassword)) {
      throw new ApiException(ErrorType::weakPassword(), 422);
    }
  }
}