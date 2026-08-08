<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *   schema="UpdateUserDTO",
 *   type="object",
 *   description="Datos para actualizar perfil de usuario",
 *   required={"firstName", "lastName", "email"},
 *   @OA\Property(
 *     property="firstName",
 *     type="string",
 *     description="Nombre del usuario",
 *     example="Juan"
 *   ),
 *   @OA\Property(
 *     property="lastName",
 *     type="string",
 *     description="Apellido del usuario",
 *     example="Pérez"
 *   ),
 *   @OA\Property(
 *     property="email",
 *     type="string",
 *     format="email",
 *     description="Correo electrónico",
 *     example="juan.perez@example.com"
 *   ),
 *   @OA\Property(
 *     property="phoneNumber",
 *     type="string",
 *     nullable=true,
 *     description="Número telefónico (8-15 dígitos)",
 *     example="87654321"
 *   )
 * )
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
      trim($data['first_name'] ?? ''),
      trim($data['last_name'] ?? ''),
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
    if ($this->email && !filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
      throw new ApiException(
        ErrorType::invalidEmail(),
        422
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