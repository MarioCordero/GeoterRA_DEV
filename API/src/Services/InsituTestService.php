<?php
declare(strict_types=1);

namespace Services;

use PDO;
use Http\ApiException;
use Http\ErrorType;
use DTO\InsituTestDTO;
use DTO\AllowedUserRoles;
use Repositories\InsituTestRepository;
use Repositories\GeomanifestationRepository;

/**
 * Business logic for in-situ tests (insitu_tests table).
 */
final class InsituTestService
{
  private InsituTestRepository $repository;
  private GeomanifestationRepository $geomanifestationRepository;
  private AuthService $authService;

  public function __construct(private PDO $pdo)
  {
    $this->repository = new InsituTestRepository($pdo);
    $this->geomanifestationRepository = new GeomanifestationRepository($pdo);
    $this->authService = new AuthService($pdo);
  }

  /**
   * Ensures the authenticated user has admin role.
   *
   * @param string $role
   * @throws ApiException
   */
  private function requireAdmin(string $role): void
  {
    if ($role !== AllowedUserRoles::ADMIN) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }
  }

  /**
   * Validates that the referenced geomanifestation exists.
   *
   * @param string $geomanifestationId
   * @throws ApiException
   */
  private function validateGeomanifestationExists(string $geomanifestationId): void
  {
    $manifestation = $this->geomanifestationRepository->findById($geomanifestationId);
    if (!$manifestation) {
      throw new ApiException(
        ErrorType::invalidField('geomanifestation_id'),
        422
      );
    }
  }

  /**
   * Creates a new in-situ test (admin only).
   *
   * @param InsituTestDTO $dto
   * @throws ApiException
   */
  public function create(InsituTestDTO $dto): void
  {
    $auth = $this->authService->requireAuth();
    $this->requireAdmin($auth['role'] ?? '');

    $dto->validate();
    $this->validateGeomanifestationExists($dto->geomanifestationId);

    $this->repository->create($dto, $auth['user_id']);
  }

  /**
   * Retrieves an in-situ test by its ID (public access, but only if the manifestation is visible? Actually tests are linked to manifestations; visibility handled by manifestation service).
   *
   * @param string $id
   * @return array
   * @throws ApiException
   */
  public function getById(string $id): array
  {
    $test = $this->repository->findById($id);
    if (!$test) {
      throw new ApiException(ErrorType::notFound('In-situ test'), 404);
    }

    return [
      'insitu_test_id' => $test->insituTestId,
      'geomanifestation_id' => $test->geomanifestationId,
      'temperature' => $test->temperature,
      'conductivity' => $test->conductivity,
      'ph' => $test->ph,
      'description' => $test->description,
      'created_at' => $test->createdAt,
      'created_by' => $test->createdBy,
    ];
  }

  /**
   * Returns all in-situ tests for a given geomanifestation (public, but may need to check visibility).
   *
   * @param string $geomanifestationId
   * @return array
   * @throws ApiException
   */
  public function getByManifestation(string $geomanifestationId): array
  {
    // Optionally check if manifestation exists and is visible (or admin)
    $manifestation = $this->geomanifestationRepository->findById($geomanifestationId);
    if (!$manifestation) {
      throw new ApiException(ErrorType::notFound('Geothermal manifestation'), 404);
    }

    // If manifestation is hidden, only admin can see its tests
    if (!$manifestation->visibility) {
      try {
        $auth = $this->authService->requireAuth();
        $isAdmin = ($auth['role'] ?? '') === AllowedUserRoles::ADMIN;
      } catch (\Exception $e) {
        $isAdmin = false;
      }
      if (!$isAdmin) {
        throw new ApiException(ErrorType::notFound('Geothermal manifestation'), 404);
      }
    }

    $tests = $this->repository->getByManifestation($geomanifestationId);
    return array_map(fn($dto) => [
      'insitu_test_id' => $dto->insituTestId,
      'temperature' => $dto->temperature,
      'conductivity' => $dto->conductivity,
      'ph' => $dto->ph,
      'description' => $dto->description,
      'created_at' => $dto->createdAt,
    ], $tests);
  }

  /**
   * Updates an existing in-situ test (admin only).
   *
   * @param string $id
   * @param InsituTestDTO $dto
   * @throws ApiException
   */
  public function update(string $id, InsituTestDTO $dto): void
  {
    $auth = $this->authService->requireAuth();
    $this->requireAdmin($auth['role'] ?? '');

    $dto->validate();
    $this->validateGeomanifestationExists($dto->geomanifestationId);

    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('In-situ test'), 404);
    }

    $updated = $this->repository->update($id, $dto);
    if (!$updated) {
      throw new ApiException(ErrorType::internal('Failed to update in-situ test'), 500);
    }
  }

  /**
   * Deletes an in-situ test (admin only).
   *
   * @param string $id
   * @throws ApiException
   */
  public function delete(string $id): void
  {
    $auth = $this->authService->requireAuth();
    $this->requireAdmin($auth['role'] ?? '');

    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('In-situ test'), 404);
    }

    $deleted = $this->repository->delete($id);
    if (!$deleted) {
      throw new ApiException(ErrorType::internal('Failed to delete in-situ test'), 500);
    }
  }
}