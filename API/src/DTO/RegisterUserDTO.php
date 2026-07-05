<?php
declare(strict_types=1);

namespace DTO;
use Http\ErrorType;
use Http\ApiException;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *   schema="RegisterUserDTO",
 *   type="object",
 *   description="Datos de registro de nuevo usuario",
 *   required={"first_name", "last_name", "email", "password"},
 *   @OA\Property(
 *     property="first_name",
 *     type="string",
 *     description="Nombre del usuario",
 *     example="Juan"
 *   ),
 *   @OA\Property(
 *     property="last_name",
 *     type="string",
 *     description="Apellido del usuario",
 *     example="Pérez"
 *   ),
 *   @OA\Property(
 *     property="email",
 *     type="string",
 *     format="email",
 *     description="Correo electrónico único",
 *     example="juan@example.com"
 *   ),
 *   @OA\Property(
 *     property="phone_number",
 *     type="string",
 *     nullable=true,
 *     description="Número telefónico (8-15 dígitos)",
 *     example="87654321"
 *   ),
 *   @OA\Property(
 *     property="password",
 *     type="string",
 *     format="password",
 *     description="Contraseña (mínimo 8 caracteres)",
 *     example="SecurePass123"
 *   )
 * )
 */
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
      trim($data['first_name'] ?? ''),
      trim($data['last_name'] ?? ''),
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
      throw new ApiException(ErrorType::missingField('first_name'), 422);
    }

    if ($this->lastName === '') {
      throw new ApiException(ErrorType::missingField('last_name'), 422);
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

    // Validate minimum password length.
    if (strlen($this->password) < 8) {
      throw new ApiException(ErrorType::weakPassword(), 422);
    }

    
    // Password complexity validation. 
    $passwordPattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,64}$/';

    if (!preg_match($passwordPattern, $this->password)) {
      throw new ApiException(ErrorType::weakPassword(), 422);
    }

    // Prevent the password from containing the email address for better security.
    if (stripos($this->password, $this->email) !== false) {
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