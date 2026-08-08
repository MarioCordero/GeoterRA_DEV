<?php
declare(strict_types=1);

namespace DTO;

use Http\ApiException;
use Http\ErrorType;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *   schema="UpdateUserRoleDTO",
 *   type="object",
 *   description="Datos para actualizar el rol de un usuario (solo administradores)",
 *   required={"role"},
 *   @OA\Property(
 *     property="role",
 *     type="string",
 *     enum={"admin", "maintenance", "user"},
 *     description="Nuevo rol del usuario",
 *     example="maintenance"
 *   )
 * )
 */
final class UpdateUserRoleDTO
{
  public function __construct(
    public string $role,
  ) {
  }

  public static function fromArray(array $data): self
  {
    return new self(
      trim($data['role'] ?? '')
    );
  }

  /**
   * Validates role update payload.
   *
   * @throws ApiException
   */
  public function validate(): void
  {
    if (empty($this->role)) {
      throw new ApiException(
        ErrorType::missingField('role'),
        422
      );
    }

    if (!AllowedUserRoles::isValid($this->role)) {
      throw new ApiException(
        ErrorType::validationError(
          'Invalid role. Allowed values: ' . implode(
            ', ', AllowedUserRoles::values()
          )
        ),
        422
      );
    }
  }
}