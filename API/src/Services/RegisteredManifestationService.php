<?php
// src/Services/RegisteredManifestationService.php
declare(strict_types=1);

namespace Services;

use DTO\AllowedRegions;
use DTO\RegisteredManifestationDTO;
use DTO\AllowedUserRoles;
use Http\ApiException;
use Http\ErrorType;
use Http\Response;
use Http\Request;
use Services\AuthService;
use Services\UserService;
use Repositories\RegisteredManifestationRepository;
use Repositories\RegionRepository;

/**
 * Business logic for registered geothermal manifestations
 */
final class RegisteredManifestationService
{
  private AuthService $authService;
  private UserService $userService;
  private RegionRepository $regionRepository; // TODO: move region validation to a separate service? Or is it fine here since it's only used for manifestations?
  private RegisteredManifestationRepository $repository;
  public function __construct(private \PDO $pdo)
  {
    $this->authService = new AuthService($this->pdo);
    $this->userService = new UserService($this->pdo);
    $this->repository = new RegisteredManifestationRepository($pdo);
    $this->regionRepository = new RegionRepository($pdo);
  }

  /**
   * Asserts the authenticated user has the ADMIN role.
   */
  private function requireAdmin(string $userId): void
  {
    $user = $this->userService->findById($userId);
    if ((string) $user['role'] !== AllowedUserRoles::ADMIN) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }
  }

  /**
   * Asserts the region exists in the DB.
   */
  private function requireValidRegion(int $region_id): void
  { 
    if (!$this->regionRepository->existsById($region_id)) {
      throw new ApiException(
        ErrorType::invalidRegion(region: $region_id),
        422
      );
    }
  }

  /**
   * Create a new manifestation
   */
  public function create(RegisteredManifestationDTO $dto): void
  {
    $auth = $this->authService->requireAuth();
    $userId = (string) $auth['user_id'];
    $this->requireAdmin($userId);
    $dto->validate();
    $this->requireValidRegion($dto->region_id);

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
  public function update(RegisteredManifestationDTO $dto, string $id): void
  {
    $auth = $this->authService->requireAuth();
    $userId = (string) $auth['user_id'];
    $this->requireAdmin($userId);

    $dto->validate();

    if (!$this->repository->existsById($id)) {
      throw new ApiException(
        ErrorType::notFound('Registered manifestation'),
        404
      );
    }

    $updated = $this->repository->update($dto, $id, $userId);

    if (!$updated) {
      throw new ApiException(
        ErrorType::manifestationUpdateFailed()
      );
    }
  }

  /**
   * Soft delete a manifestation
   */
  public function delete(string $id): void
  {
    $auth = $this->authService->requireAuth();
    $userId = (string) $auth['user_id'];
    $this->requireAdmin($userId);

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
    if (!is_numeric($region)) {
      throw new ApiException(
        ErrorType::invalidRegion(region: $region),
        422
      );
    }
    $this->requireValidRegion((int) $region);
    return $this->repository->getAllByRegion((int) $region);
  }
}