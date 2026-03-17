<?php
// src/Services/RegionService.php
declare(strict_types=1);

namespace Services;

use PDO;
use DTO\RegionDTO;
use Http\ApiException;
use Http\ErrorType;
use Repositories\RegionRepository;

/**
 * Business logic for registered geothermal manifestations
 */
final class RegionService
{
  private RegionRepository $regionRepository;
  private AuthService $authService;
  public function __construct(private \PDO $pdo)
  {
    $this->regionRepository = new RegionRepository($this->pdo);
    $this->authService = new AuthService($this->pdo);
  }

  /**
   * Fetch all manifestations by region
   */
  public function getAll(): array
  {
    return $this->regionRepository->getAll();
  }
/**
   * Get region by ID
   *
   * @param int $id
   * @return array
   * @throws ApiException
   */
  public function getById(int $id): array
  {
    $region = $this->regionRepository->findById($id);
    if (!$region) {
      throw new ApiException(ErrorType::notFound('region'), 404);
    }
    return $region;
  }

  /**
   * Create new region
   *
   * @param RegionDTO $dto
   * @return array
   * @throws ApiException
   */
  public function create(RegionDTO $dto): array
  {
    $auth = $this->authService->requireAuth();
    if ($auth['role'] !== 'admin') {
      throw new ApiException(ErrorType::forbidden(), 403);
      }
    $dto->validate();
    $existing = $this->regionRepository->findByName($dto->getName());
    if ($existing) {
      throw new ApiException(ErrorType::validationError('Region already exists'), 409);
    }
    return $this->regionRepository->create($dto->getName());
  }

  /**
   * Update region
   *
   * @param int $id
   * @param RegionDTO $dto
   * @return array
   * @throws ApiException
   */
  public function update(int $id, RegionDTO $dto): array
  {
    $auth = $this->authService->requireAuth();
    if ($auth['role'] !== 'admin') {
      throw new ApiException(ErrorType::forbidden(), 403);
    }
    $dto->validate();
    $region = $this->regionRepository->findById($id);
    if (!$region) {
      throw new ApiException(ErrorType::notFound('region'), 404);
    }
    $existing = $this->regionRepository->findByName($dto->getName());
    if ($existing && $existing['id'] !== $id) {
      throw new ApiException(ErrorType::validationError('Region name already exists'), 409);
    }

    $updated = $this->regionRepository->update($id, $dto->getName());
    if (!$updated) {
      throw new ApiException(ErrorType::internal('Failed to update region'), 500);
    }

    return $updated;
  }

  /**
   * Delete region
   *
   * @param int $id
   * @return void
   * @throws ApiException
   */
  public function delete(int $id): void
  {
    $region = $this->regionRepository->findById($id);
    if (!$region) {
      throw new ApiException(ErrorType::notFound('region'), 404);
    }

    if (!$this->regionRepository->delete($id)) {
      throw new ApiException(ErrorType::internal('Failed to delete region'), 500);
    }
  }
}