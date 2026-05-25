<?php
declare(strict_types=1);

namespace Services;

use PDO;
use Http\ApiException;
use Http\ErrorType;
use DTO\GeoreportDTO;
use DTO\AllowedUserRoles;
use Repositories\GeoreportRepository;
use Repositories\GeomanifestationRepository;
use Repositories\InsituTestRepository;
use Repositories\InlabTestRepository;

/**
 * Business logic for geothermal reports (georeports table).
 */
final class GeoreportService
{
  private GeoreportRepository $repository;
  private GeomanifestationRepository $geomanifestationRepository;
  private InsituTestRepository $insituTestRepository;
  private InlabTestRepository $inlabTestRepository;
  private AuthService $authService;

  public function __construct(private PDO $pdo)
  {
    $this->repository = new GeoreportRepository($pdo);
    $this->geomanifestationRepository = new GeomanifestationRepository($pdo);
    $this->insituTestRepository = new InsituTestRepository($pdo);
    $this->inlabTestRepository = new InlabTestRepository($pdo);
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
   * Validates that the referenced in-situ and in-lab tests exist.
   *
   * @param string $insituTestId
   * @param string $inlabTestId
   * @throws ApiException
   */
  private function validateTestsExist(string $insituTestId, string $inlabTestId): void
  {
    $insitu = $this->insituTestRepository->findById($insituTestId);
    if (!$insitu) {
      throw new ApiException(ErrorType::invalidField('insitu_test_id'), 422);
    }
    $inlab = $this->inlabTestRepository->findById($inlabTestId);
    if (!$inlab) {
      throw new ApiException(ErrorType::invalidField('inlab_test_id'), 422);
    }
  }

  /**
   * Creates a new georeport and optionally sets it as the current report for the manifestation.
   *
   * @param GeoreportDTO $dto
   * @param bool $setAsCurrent If true, updates the manifestation's current_georeport_id.
   * @throws ApiException
   */
  public function create(GeoreportDTO $dto, bool $setAsCurrent = true): void
  {
    $auth = $this->authService->requireAuth();
    $this->requireAdmin($auth['role'] ?? '');

    $dto->validate();
    $this->validateGeomanifestationExists($dto->geomanifestationId);
    $this->validateTestsExist($dto->insituTestId, $dto->inlabTestId);

    $georeportId = $this->repository->create($dto, $auth['user_id']);

    if ($setAsCurrent) {
      $updated = $this->repository->setAsCurrentForManifestation($dto->geomanifestationId, $georeportId);
      if (!$updated) {
        // Not critical, but we can log or ignore; report already created.
        // Throw exception if required.
        throw new ApiException(ErrorType::internal('Failed to set as current georeport'), 500);
      }
    }
  }

  /**
   * Retrieves a georeport by its ID (public access, with visibility check).
   *
   * @param string $id
   * @return array
   * @throws ApiException
   */
  public function getById(string $id): array
  {
    $georeport = $this->repository->findById($id);
    if (!$georeport) {
      throw new ApiException(ErrorType::notFound('Georeport'), 404);
    }

    // Check manifestation visibility
    $manifestation = $this->geomanifestationRepository->findById($georeport->geomanifestationId);
    if ($manifestation && !$manifestation->visibility) {
      try {
        $auth = $this->authService->requireAuth();
        $isAdmin = ($auth['role'] ?? '') === AllowedUserRoles::ADMIN;
      } catch (\Exception $e) {
        $isAdmin = false;
      }
      if (!$isAdmin) {
        throw new ApiException(ErrorType::notFound('Georeport'), 404);
      }
    }

    return [
      'georeport_id' => $georeport->georeportId,
      'geomanifestation_id' => $georeport->geomanifestationId,
      'insitu_test_id' => $georeport->insituTestId,
      'inlab_test_id' => $georeport->inlabTestId,
      'details' => $georeport->details,
      'created_at' => $georeport->createdAt,
      'created_by' => $georeport->createdBy,
    ];
  }

  /**
   * Returns all georeports for a given geomanifestation (with visibility check).
   *
   * @param string $geomanifestationId
   * @return array
   * @throws ApiException
   */
  public function getByManifestation(string $geomanifestationId): array
  {
    $manifestation = $this->geomanifestationRepository->findById($geomanifestationId);
    if (!$manifestation) {
      throw new ApiException(ErrorType::notFound('Geothermal manifestation'), 404);
    }

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

    $georeports = $this->repository->getByManifestation($geomanifestationId);
    return array_map(fn($dto) => [
      'georeport_id' => $dto->georeportId,
      'insitu_test_id' => $dto->insituTestId,
      'inlab_test_id' => $dto->inlabTestId,
      'details' => $dto->details,
      'created_at' => $dto->createdAt,
    ], $georeports);
  }

  /**
   * Returns the current (latest) georeport for a geomanifestation.
   *
   * @param string $geomanifestationId
   * @return array|null
   * @throws ApiException
   */
  public function getCurrentByManifestation(string $geomanifestationId): ?array
  {
    $manifestation = $this->geomanifestationRepository->findById($geomanifestationId);
    if (!$manifestation) {
      throw new ApiException(ErrorType::notFound('Geothermal manifestation'), 404);
    }

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

    $georeport = $this->repository->getCurrentByManifestation($geomanifestationId);
    if (!$georeport) {
      return null;
    }

    return [
      'georeport_id' => $georeport->georeportId,
      'insitu_test_id' => $georeport->insituTestId,
      'inlab_test_id' => $georeport->inlabTestId,
      'details' => $georeport->details,
      'created_at' => $georeport->createdAt,
    ];
  }

  /**
   * Updates an existing georeport (admin only). Note: does not automatically update current_georeport_id.
   *
   * @param string $id
   * @param GeoreportDTO $dto
   * @param bool $setAsCurrent Optionally set this report as current after update.
   * @throws ApiException
   */
  public function update(string $id, GeoreportDTO $dto, bool $setAsCurrent = false): void
  {
    $auth = $this->authService->requireAuth();
    $this->requireAdmin($auth['role'] ?? '');

    $dto->validate();
    $this->validateGeomanifestationExists($dto->geomanifestationId);
    $this->validateTestsExist($dto->insituTestId, $dto->inlabTestId);

    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('Georeport'), 404);
    }

    $updated = $this->repository->update($id, $dto);
    if (!$updated) {
      throw new ApiException(ErrorType::internal('Failed to update georeport'), 500);
    }

    if ($setAsCurrent) {
      $this->repository->setAsCurrentForManifestation($dto->geomanifestationId, $id);
    }
  }

  /**
   * Deletes a georeport (admin only). Also resets current_georeport_id if it was the current one.
   *
   * @param string $id
   * @throws ApiException
   */
  public function delete(string $id): void
  {
    $auth = $this->authService->requireAuth();
    $this->requireAdmin($auth['role'] ?? '');

    $georeport = $this->repository->findById($id);
    if (!$georeport) {
      throw new ApiException(ErrorType::notFound('Georeport'), 404);
    }

    // If this georeport is the current one for its manifestation, clear the reference.
    $current = $this->repository->getCurrentByManifestation($georeport->geomanifestationId);
    if ($current && $current->georeportId === $id) {
      $this->repository->setAsCurrentForManifestation($georeport->geomanifestationId, null);
    }

    $deleted = $this->repository->delete($id);
    if (!$deleted) {
      throw new ApiException(ErrorType::internal('Failed to delete georeport'), 500);
    }
  }
}