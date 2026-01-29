<?php
// src/Services/RegisteredManifestationService.php
declare(strict_types=1);

namespace Services;

use AllowDynamicProperties;
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
  public function create(RegisteredManifestationDTO $dto, int $userId): void
  {
    // Domain validation
    $dto->validate();

    // Prevent duplicate primary key violations (409 Conflict)
    if ($this->repository->existsById($dto->id)) {
      throw new ApiException(
        ErrorType::conflict("Registered manifestation id '{$dto->id}' already exists"),
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
