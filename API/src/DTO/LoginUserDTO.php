<?php
declare(strict_types=1);

namespace DTO;

use Http\ErrorType;
use Http\ApiException;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *   schema="LoginUserDTO",
 *   type="object",
 *   description="Credenciales de usuario para autenticación",
 *   required={"email", "password"},
 *   @OA\Property(
 *     property="email",
 *     type="string",
 *     format="email",
 *     description="Correo electrónico del usuario",
 *     example="user@example.com"
 *   ),
 *   @OA\Property(
 *     property="password",
 *     type="string",
 *     format="password",
 *     description="Contraseña del usuario (mínimo 8 caracteres)",
 *     example="SecurePassword123"
 *   )
 * )
 */
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
      throw new ApiException(ErrorType::missingField('email'));
    }
    if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
      throw new ApiException(ErrorType::invalidEmail());
    }
    if ($this->password === '') {
      throw new ApiException(ErrorType::missingField('password'));
    }
    if (strlen($this->password) < 8) {
      throw new ApiException(ErrorType::weakPassword());
    }
  }
}
?>