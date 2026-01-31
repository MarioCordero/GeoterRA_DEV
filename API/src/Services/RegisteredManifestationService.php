<?php
// src/Services/RegisteredManifestationService.php
declare(strict_types=1);

namespace Services;

use DTO\AllowedRegions;
use DTO\RegisteredManifestationDTO;
use Repositories\RegisteredManifestationRepository;
use Http\ApiException;
use Http\ErrorType;

/**
 * Business logic for registered geothermal manifestations
 */
final class RegisteredManifestationService
{
  public function __construct(
    private RegisteredManifestationRepository $repository
  ) {}

  /**
   * Create a new manifestation
   */
  public function create(RegisteredManifestationDTO $dto,  string $userId): void
  {
    // Domain validation
    $dto->validate();

    // Prevent duplicate primary key violations (409 Conflict)
    if ($this->repository->existsByName($dto->name)) {
      throw new ApiException(
        ErrorType::conflict("Registered manifestation name '{$dto->name}' already exists"),
        409
      );
    }

    $created = $this->repository->create($dto, $userId);
    if (!$created) {
      throw new ApiException(
        ErrorType::manifestationCreateFailed()
      );
    }
  }

  /**
   * Update an existing manifestation
   */
  public function update(RegisteredManifestationDTO $dto, string $id, string $userId): void
  {
    $dto->validate();

    if (!$this->repository->existsById($id)) {
      throw new ApiException(
        ErrorType::notFound('Registered manifestation'),
        404
      );
    }

    $updated = $this->repository->update($dto, $id,   $userId);

    if (!$updated) {
      throw new ApiException(
        ErrorType::manifestationUpdateFailed()
      );
    }
  }

  /**
   * Soft delete a manifestation
   */
  public function delete(string $id, string $userId): void
  {
    if (!$this->repository->existsById($id)) {
      throw new ApiException(
        ErrorType::notFound('Registered manifestation'),
        404
      );
    }

    $deleted = $this->repository->softDelete($id, $userId);

    if (!$deleted) {
      throw new ApiException(
        ErrorType::manifestationDeleteFailed()
      );
    }
  }

  /**
   * Fetch all manifestations by region
   */
  public function getAllByRegion(string $region): array
  {
    if ($region === 'all') {
      return $this->repository->getAll();
    }
    return $this->repository->getAllByRegion($region);
  }
}
