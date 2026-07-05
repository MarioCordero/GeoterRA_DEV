<?php
declare(strict_types=1);

namespace Services;

use DTO\AllowedUserRoles;
use DTO\RegisterInsituTestDTO;
use DTO\UpdateInsituTestDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use PDO;
use Repositories\GeomanifestationRepository;
use Repositories\InsituTestRepository;

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
   * Creates a new in-situ test (admin/investigator only).
   *
   * @param RegisterInsituTestDTO $dto
   * @throws ApiException
   */
  public function create(RegisterInsituTestDTO $dto): array
  {
    $auth = Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR
      ]
    );

    $dto->validate();
    $this->validateGeomanifestationExists($dto->geomanifestationId);

    $result = $this->repository->create($dto, $auth['user_id']);

    return $this->formatTest($result);
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
   * Retrieves an in-situ test by its ID.
   * Requires authentication; visibility is handled via the manifestation check.
   *
   * @param string $id
   * @return array
   * @throws ApiException
   */
  public function getById(string $id): array
  {
    Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR,
        AllowedUserRoles::MAINTENANCE
      ]
    );

    $test = $this->repository->findById($id);
    if (!$test) {
      throw new ApiException(ErrorType::notFound('In-situ test'), 404);
    }

    return $this->formatTest($test);
  }

  /**
   * Formats a raw database row into the API response structure.
   * - Removes created_by (ULID)
   * - Includes created_by_first_name and created_by_last_name
   * - Rounds numeric values
   *
   * @param array<string,mixed> $row
   * @return array<string,mixed>
   */
  private function formatTest(array $row): array
  {
    // Build response without created_by
    $result = [
      'insitu_test_id' => $row['insitu_test_id'],
      'geomanifestation_id' => $row['geomanifestation_id'],
      'temperature' => isset($row['temperature']) ? round(
        (float)$row['temperature'], 2
      ) : null,
      'conductivity' => isset($row['conductivity']) ? round(
        (float)$row['conductivity'], 2
      ) : null,
      'ph' => isset($row['ph']) ? round((float)$row['ph'], 2) : null,
      'description' => $row['description'],
      'created_at' => $row['created_at'],
      'created_by_first_name' => $row['created_by_first_name'] ?? null,
      'created_by_last_name' => $row['created_by_last_name'] ?? null,
    ];

    return $result;
  }

  /**
   * Returns all in-situ tests for a given geomanifestation.
   * Checks manifestation visibility: if hidden, only allowed roles can access.
   *
   * @param string $geomanifestationId
   * @return array[]
   * @throws ApiException
   */
  public function getByManifestation(string $geomanifestationId): array
  {
    // Check if manifestation exists
    $manifestation = $this->geomanifestationRepository->findById(
      $geomanifestationId
    );
    if (!$manifestation) {
      throw new ApiException(
        ErrorType::notFound('Geothermal manifestation'), 404
      );
    }

    // If manifestation is hidden, only admin/field investigator/investigator/maintenance can see its tests
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

    $tests = $this->repository->getByManifestation($geomanifestationId);
    return array_map([$this, 'formatTest'], $tests);
  }

  /**
   * Updates an existing in-situ test (admin/investigator only).
   *
   * @param string $id
   * @param UpdateInsituTestDTO $dto
   * @throws ApiException
   */
  public function update(string $id, UpdateInsituTestDTO $dto): ?array
  {
    Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR
      ]
    );

    $dto->validate();

    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('In-situ test'), 404);
    }

    $updated = $this->repository->update($id, $dto);
    if (!$updated) {
      throw new ApiException(
        ErrorType::internal('Failed to update in-situ test'), 500
      );
    }
    
    return $this->formatTest($updated);
  }

  /**
   * Deletes an in-situ test (admin/investigator only).
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

    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('In-situ test'), 404);
    }

    $deleted = $this->repository->delete($id);
    if (!$deleted) {
      throw new ApiException(
        ErrorType::internal('Failed to delete in-situ test'), 500
      );
    }
  }
}