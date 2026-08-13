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
use Repositories\UserRepository;

/**
 * Business logic for in-situ tests (insitu_tests table).
 */
final class InsituTestService
{
  private InsituTestRepository $repository;
  private GeomanifestationRepository $geomanifestationRepository;
  private UserRepository $userRepository;
  private NotificationService $notificationService;

  public function __construct(private readonly PDO $pdo)
  {
    $this->repository = new InsituTestRepository($this->pdo);
    $this->geomanifestationRepository = new GeomanifestationRepository(
      $this->pdo
    );
    $this->userRepository = new UserRepository($this->pdo);
    $this->notificationService = new NotificationService(
      new SmtpEmailService()
    );
  }

  /**
   * Creates a new in-situ test (admin/investigator only).
   *
   * @param RegisterInsituTestDTO $dto
   * @return array
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

    $user = $this->userRepository->findById($auth['user_id']);
    if ($user) {
      $manifestation = $this->geomanifestationRepository->findById(
        $dto->geomanifestationId
      );
      $mName = $manifestation['geomanifestation_name'] ?? 'Desconocida';

      $this->notificationService->notifyInsituTestCreated(
        $user['email'],
        $user['first_name'],
        $mName,
        $dto->temperature,
        $dto->conductivity,
        $dto->ph,
        $dto->description,
        date('Y-m-d H:i:s')
      );
    }

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
   * @return array|null
   */
  public function update(string $id, UpdateInsituTestDTO $dto): ?array
  {
    $auth = Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR
      ]
    );

    $dto->validate();

    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(
        ErrorType::notFound('In-situ test'), 404
      );
    }

    $updated = $this->repository->update($id, $dto);
    if (!$updated) {
      throw new ApiException(
        ErrorType::internal('Failed to update in-situ test'), 500
      );
    }

    $user = $this->userRepository->findById($auth['user_id']);
    if ($user) {
      $manifestation = $this->geomanifestationRepository->findById(
        $id
      );
      $mName = $manifestation['geomanifestation_name'] ?? 'Desconocida';
      $temp = $dto->temperature ?? ($existing['temperature'] !== null
        ? (float)$existing['temperature'] : null);
      $cond = $dto->conductivity ?? ($existing['conductivity'] !== null
        ? (float)$existing['conductivity'] : null);
      $phVal = $dto->ph ?? ($existing['ph'] !== null
        ? (float)$existing['ph'] : null);
      $desc = $dto->description ?? $existing['description'];
      $this->notificationService->notifyInsituTestUpdated(
        $user['email'],
        $user['first_name'],
        $mName,
        $temp,
        $cond,
        $phVal,
        $desc,
        date('Y-m-d H:i:s')
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
    $auth = Request::requireRole(
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

    $user = $this->userRepository->findById($auth['user_id']);
    if ($user) {
      $manifestation = $this->geomanifestationRepository->findById(
        $existing['geomanifestation_id']
      );
      $mName = $manifestation['geomanifestation_name'] ?? 'Desconocida';
      $temp = $existing['temperature'] !== null
        ? (float)$existing['temperature'] : null;
      $cond = $existing['conductivity'] !== null
        ? (float)$existing['conductivity'] : null;
      $phVal = $existing['ph'] !== null ? (float)$existing['ph'] : null;
      $desc = $existing['description'];

      $this->notificationService->notifyInsituTestDeleted(
        $user['email'],
        $user['first_name'],
        $mName,
        $temp,
        $cond,
        $phVal,
        $desc,
        date('Y-m-d H:i:s')
      );
    }
  }
}