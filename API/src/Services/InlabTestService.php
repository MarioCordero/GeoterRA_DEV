<?php
declare(strict_types=1);

namespace Services;

use DTO\AllowedUserRoles;
use DTO\RegisterInlabTestDTO;
use DTO\UpdateInlabTestDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use PDO;
use Repositories\GeomanifestationRepository;
use Repositories\InlabTestRepository;

/**
 * Business logic for in-lab tests (inlab_tests table).
 */
final class InlabTestService
{
  private InlabTestRepository $repository;
  private GeomanifestationRepository $geomanifestationRepository;
  private AuthService $authService;

  public function __construct(private PDO $pdo)
  {
    $this->repository = new InlabTestRepository($pdo);
    $this->geomanifestationRepository = new GeomanifestationRepository($pdo);
    $this->authService = new AuthService($pdo);
  }

  /**
   * Creates a new in-lab test (admin/investigator only).
   *
   * @param RegisterInlabTestDTO $dto
   * @throws ApiException
   */
  public function create(RegisterInlabTestDTO $dto): array
  {
    $auth = Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::INVESTIGATOR
      ]
    );

    $dto->validate();
    $this->validateGeomanifestationExists($dto->geomanifestationId);

    return $this->formatTest($this->repository->create($dto, $auth['user_id']));
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
   * Formats a raw database row into the API response structure.
   * - Removes created_by (ULID)
   * - Includes created_by_first_name and created_by_last_name
   * - Rounds numeric values to 2 decimal places
   *
   * @param array<string,mixed> $row
   * @return array<string,mixed>
   */
  private function formatTest(array $row): array
  {
    // Round numeric fields
    $numericFields = ['ph', 'conductivity', 'cl', 'ca', 'hco3', 'so4', 'fe', 'si', 'b', 'li', 'f', 'na', 'k', 'mg'];
    foreach ($numericFields as $field) {
      if (isset($row[$field]) && is_numeric($row[$field])) {
        $row[$field] = round((float)$row[$field], 2);
      }
    }

    // Build response without created_by
    $result = [
      'inlab_test_id' => $row['inlab_test_id'],
      'geomanifestation_id' => $row['geomanifestation_id'],
      'ph' => $row['ph'] ?? null,
      'conductivity' => $row['conductivity'] ?? null,
      'cl' => $row['cl'] ?? null,
      'ca' => $row['ca'] ?? null,
      'hco3' => $row['hco3'] ?? null,
      'so4' => $row['so4'] ?? null,
      'fe' => $row['fe'] ?? null,
      'si' => $row['si'] ?? null,
      'b' => $row['b'] ?? null,
      'li' => $row['li'] ?? null,
      'f' => $row['f'] ?? null,
      'na' => $row['na'] ?? null,
      'k' => $row['k'] ?? null,
      'mg' => $row['mg'] ?? null,
      'description' => $row['description'],
      'created_at' => $row['created_at'],
      'created_by_first_name' => $row['created_by_first_name'] ?? null,
      'created_by_last_name' => $row['created_by_last_name'] ?? null,
    ];

    return $result;
  }

  /**
   * Retrieves an in-lab test by its ID.
   * Requires authentication; visibility is handled via the manifestation check.
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

    $test = $this->repository->findById($id);
    if (!$test) {
      throw new ApiException(ErrorType::notFound('In-lab test'), 404);
    }

    // Check manifestation visibility (if hidden, only admin can see it)
    $manifestation = $this->geomanifestationRepository->findById(
      $test['geomanifestation_id']
    );
    if ($manifestation && !$manifestation['visibility']) {
      $isAdmin = ($user['role'] ?? '') === AllowedUserRoles::ADMIN;
      if (!$isAdmin) {
        throw new ApiException(ErrorType::notFound('In-lab test'), 404);
      }
    }

    return $this->formatTest($test);
  }

  /**
   * Returns all in-lab tests for a given geomanifestation.
   * Checks manifestation visibility: if hidden, only allowed roles can access.
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

    $tests = $this->repository->getByManifestation($geomanifestationId);
    return array_map([$this, 'formatTest'], $tests);
  }

  /**
   * Updates an existing in-lab test (admin/investigator only).
   *
   * @param string $id
   * @param UpdateInlabTestDTO $dto
   * @throws ApiException
   */
  public function update(string $id, UpdateInlabTestDTO $dto): array
  {
    $user = Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::INVESTIGATOR
      ]
    );

    $dto->validate();

    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('In-lab test'), 404);
    }

    $updated = $this->repository->update($id, $dto);
    if (!$updated) {
      throw new ApiException(
        ErrorType::internal('Failed to update in-lab test'), 500
      );
    }

    return $this->formatTest($updated);
  }

  /**
   * Deletes an in-lab test (admin/investigator only).
   *
   * @param string $id
   * @throws ApiException
   */
  public function delete(string $id): void
  {
    Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::INVESTIGATOR
      ]
    );

    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('In-lab test'), 404);
    }

    $deleted = $this->repository->delete($id);
    if (!$deleted) {
      throw new ApiException(
        ErrorType::internal('Failed to delete in-lab test'), 500
      );
    }
  }
}