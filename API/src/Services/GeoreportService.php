<?php
declare(strict_types=1);

namespace Services;

use DTO\AllowedUserRoles;
use DTO\RegisterGeoreportDTO;
use DTO\UpdateGeoreportDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use PDO;
use Repositories\GeomanifestationRepository;
use Repositories\GeoreportRepository;
use Repositories\InlabTestRepository;
use Repositories\InsituTestRepository;

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
   * Creates a new georeport and optionally sets it as the current report for the manifestation.
   *
   * @param RegisterGeoreportDTO $dto
   * @param bool $setAsCurrent If true, updates the manifestation's current_georeport_id.
   * @return array The created report (formatted)
   * @throws ApiException
   */
  public function create(RegisterGeoreportDTO $dto, bool $setAsCurrent = true
  ): array {
    $auth = Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR
      ]
    );

    $dto->validate();
    $this->validateGeomanifestationExists($dto->geomanifestationId);
    $this->validateTestsExist($dto->insituTestId, $dto->inlabTestId);

    $created = $this->repository->create($dto, $auth['user_id']);
    if (!$created) {
      throw new ApiException(
        ErrorType::internal('Failed to create georeport'), 500
      );
    }

    if ($setAsCurrent) {
      $updated = $this->repository->setAsCurrentForManifestation(
        $dto->geomanifestationId,
        $created['georeport_id']
      );
      if (!$updated) {
        // Log or ignore; report already created.
        // We throw exception to inform the client.
        throw new ApiException(
          ErrorType::internal('Failed to set as current georeport'), 500
        );
      }
    }

    return $this->formatReport($created);
  }

  /**
   * Validates that the referenced geomanifestation exists.
   *
   * @param string $geomanifestationId
   * @throws ApiException
   */
  private function validateGeomanifestationExists(string $geomanifestationId
  ): void {
    $manifestation = $this->geomanifestationRepository->findById(
      $geomanifestationId
    );
    if (!$manifestation) {
      throw new ApiException(
        ErrorType::invalidField('geomanifestation_id'), 422
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
  private function validateTestsExist(string $insituTestId, string $inlabTestId
  ): void {
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
   * Formats a raw database row into the API response structure.
   * - Removes created_by (ULID)
   * - Includes created_by_first_name and created_by_last_name
   *
   * @param array<string,mixed> $row
   * @return array<string,mixed>
   */
  private function formatReport(array $row): array
  {
    unset($row['created_by']);
    return [
      'georeport_id' => $row['georeport_id'],
      'geomanifestation_id' => $row['geomanifestation_id'],
      'insitu_test_id' => $row['insitu_test_id'],
      'inlab_test_id' => $row['inlab_test_id'],
      'details' => $row['details'],
      'created_at' => $row['created_at'],
      'created_by_first_name' => $row['created_by_first_name'] ?? null,
      'created_by_last_name' => $row['created_by_last_name'] ?? null,
    ];
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
    $user = Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR,
        AllowedUserRoles::MAINTENANCE
      ]
    );

    $georeport = $this->repository->findById($id);
    if (!$georeport) {
      throw new ApiException(ErrorType::notFound('Georeport'), 404);
    }

    // Check manifestation visibility
    $manifestation = $this->geomanifestationRepository->findById(
      $georeport['geomanifestation_id']
    );
    if ($manifestation && !$manifestation['visibility']) {
      $isAdmin = ($user['role'] ?? '') === AllowedUserRoles::ADMIN;
      if (!$isAdmin) {
        throw new ApiException(ErrorType::notFound('Georeport'), 404);
      }
    }

    return $this->formatReport($georeport);
  }

  /**
   * Returns all georeports for a given geomanifestation (with visibility check).
   *
   * @param string $geomanifestationId
   * @return array[]
   * @throws ApiException
   */
  public function getByManifestation(string $geomanifestationId): array
  {
    $manifestation = $this->geomanifestationRepository->findById(
      $geomanifestationId
    );
    if (!$manifestation) {
      throw new ApiException(
        ErrorType::notFound('Geothermal manifestation'), 404
      );
    }

    if (!$manifestation['visibility']) {
      Request::requireRole(
        [
          AllowedUserRoles::ADMIN,
          AllowedUserRoles::FIELD_INVESTIGATOR,
          AllowedUserRoles::INVESTIGATOR,
          AllowedUserRoles::MAINTENANCE
        ]
      );
    }

    $georeports = $this->repository->getByManifestation($geomanifestationId);
    return array_map([$this, 'formatReport'], $georeports);
  }

  /**
   * Updates an existing georeport and optionally sets it as current.
   *
   * @param string $id
   * @param UpdateGeoreportDTO $dto
   * @param bool $setAsCurrent Optionally set this report as current after update.
   * @return array The updated report (formatted)
   * @throws ApiException
   */
  public function update(
    string $id, UpdateGeoreportDTO $dto, bool $setAsCurrent = false
  ): array {
    $user = Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR
      ]
    );

    $dto->validate();

    // Check if the georeport exists
    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('Georeport'), 404);
    }

    // Validate references if they are being updated
    $manifestationId = $dto->geomanifestationId ?? $existing['geomanifestation_id'];
    $insituId = $dto->insituTestId ?? $existing['insitu_test_id'];
    $inlabId = $dto->inlabTestId ?? $existing['inlab_test_id'];

    $this->validateGeomanifestationExists($manifestationId);
    $this->validateTestsExist($insituId, $inlabId);

    $updated = $this->repository->update($id, $dto);
    if (!$updated) {
      throw new ApiException(
        ErrorType::internal('Failed to update georeport'), 500
      );
    }

    if ($setAsCurrent) {
      $this->repository->setAsCurrentForManifestation($manifestationId, $id);
    }

    return $this->formatReport($updated);
  }

  /**
   * Deletes a georeport. Also resets current_georeport_id if it was the current one.
   *
   * @param string $id
   * @throws ApiException
   */
  public function delete(string $id): void
  {
    Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR
      ]
    );

    $georeport = $this->repository->findById($id);
    if (!$georeport) {
      throw new ApiException(ErrorType::notFound('Georeport'), 404);
    }

    // If this georeport is the current one for its manifestation, clear the reference.
    $current = $this->repository->getCurrentByManifestation(
      $georeport['geomanifestation_id']
    );
    if ($current && $current['georeport_id'] === $id) {
      $this->repository->setAsCurrentForManifestation(
        $georeport['geomanifestation_id'], null
      );
    }

    $deleted = $this->repository->delete($id);
    if (!$deleted) {
      throw new ApiException(
        ErrorType::internal('Failed to delete georeport'), 500
      );
    }
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
    $manifestation = $this->geomanifestationRepository->findById(
      $geomanifestationId
    );
    if (!$manifestation) {
      throw new ApiException(
        ErrorType::notFound('Geothermal manifestation'), 404
      );
    }

    if (!$manifestation['visibility']) {
      Request::requireRole(
        [
          AllowedUserRoles::ADMIN,
          AllowedUserRoles::FIELD_INVESTIGATOR,
          AllowedUserRoles::INVESTIGATOR,
          AllowedUserRoles::MAINTENANCE
        ]
      );
    }

    $georeport = $this->repository->getCurrentByManifestation(
      $geomanifestationId
    );
    return $georeport ? $this->formatReport($georeport) : null;
  }
}