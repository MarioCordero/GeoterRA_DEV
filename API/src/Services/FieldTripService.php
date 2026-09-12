<?php
declare(strict_types=1);

namespace Services;

use DTO\AllowedUserRoles;
use DTO\RegisterFieldTripDTO;
use DTO\UpdateFieldTripDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use PDO;
use Repositories\CantonRepository;
use Repositories\DistrictRepository;
use Repositories\FieldTripParticipantRepository;
use Repositories\FieldTripRepository;
use Repositories\GeomanifestationRepository;
use Repositories\ProvinceRepository;
use Repositories\UserRepository;

/**
 * Business logic for field trips (giras de campo).
 */
final class FieldTripService
{
  private FieldTripRepository $repository;
  private FieldTripParticipantRepository $participantRepository;
  private GeomanifestationRepository $manifestationRepository;
  private ProvinceRepository $provinceRepository;
  private CantonRepository $cantonRepository;
  private DistrictRepository $districtRepository;
  private UserRepository $userRepository;
  private AuthService $authService;

  public function __construct(private readonly PDO $pdo)
  {
    $this->repository = new FieldTripRepository($this->pdo);
    $this->participantRepository = new FieldTripParticipantRepository($this->pdo);
    $this->manifestationRepository = new GeomanifestationRepository($this->pdo);
    $this->provinceRepository = new ProvinceRepository($this->pdo);
    $this->cantonRepository = new CantonRepository($this->pdo);
    $this->districtRepository = new DistrictRepository($this->pdo);
    $this->userRepository = new UserRepository($this->pdo);
    $this->authService = new AuthService($this->pdo);
  }

  /**
   * Creates a new field trip with optional participants and manifestations.
   *
   * @param RegisterFieldTripDTO $dto
   * @return array
   * @throws ApiException
   */
  public function create(RegisterFieldTripDTO $dto): array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
    ]);

    $dto->validate();
    $this->validateLocationReferences(
      $dto->provinceSnitCode,
      $dto->cantonSnitCode,
      $dto->districtSnitCode
    );

    $auth = $this->authService->requireAuth();
    $creatorId = $auth['user_id'];

    try {
      $this->pdo->beginTransaction();

      $created = $this->repository->create($dto, $creatorId);
      $fieldTripId = $created['field_trip_id'];

      // Add creator as participant automatically if not already
      $participants = array_unique(array_merge([$creatorId], $dto->participants));
      foreach ($participants as $userId) {
        $this->participantRepository->addParticipant($fieldTripId, $userId);
      }

      // Link geomanifestations
      foreach ($dto->geomanifestations as $gmId) {
        $this->repository->linkManifestation($fieldTripId, $gmId);
      }

      $this->pdo->commit();
    } catch (\Throwable $e) {
      if ($this->pdo->inTransaction()) {
        $this->pdo->rollBack();
      }
      if ($e instanceof ApiException) {
        throw $e;
      }
      throw new ApiException(ErrorType::internal('Failed to create field trip: ' . $e->getMessage()), 500);
    }

    $fresh = $this->repository->findById($fieldTripId);
    return $this->formatFieldTrip($fresh, true);
  }

  /**
   * Retrieves a single field trip by ID including participants and linked manifestations.
   *
   * @param string $id
   * @return array
   * @throws ApiException
   */
  public function getById(string $id): array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
      AllowedUserRoles::MAINTENANCE,
    ]);

    $fieldTrip = $this->repository->findById($id);
    if (!$fieldTrip) {
      throw new ApiException(ErrorType::notFound('Field trip'), 404);
    }

    return $this->formatFieldTrip($fieldTrip, true);
  }

  /**
   * Returns a paginated list of all field trips.
   *
   * @param int $page
   * @param int $limit
   * @param bool|null $isActive
   * @return array{data: array[], total: int, page: int, limit: int}
   */
  public function getAll(int $page = 1, int $limit = 20, ?bool $isActive = null): array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
      AllowedUserRoles::MAINTENANCE,
    ]);

    $result = $this->repository->getAllPaginated($page, $limit, $isActive);
    $data = array_map(fn($row) => $this->formatFieldTrip($row, false), $result['data']);

    return [
      'data' => $data,
      'total' => $result['total'],
      'page' => $page,
      'limit' => $limit,
    ];
  }

  /**
   * Returns paginated field trips assigned to or created by the authenticated user.
   *
   * @param int $page
   * @param int $limit
   * @return array{data: array[], total: int, page: int, limit: int}
   */
  public function getMyFieldTrips(int $page = 1, int $limit = 20): array
  {
    $auth = Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
      AllowedUserRoles::MAINTENANCE,
    ]);

    $result = $this->repository->getByParticipant($auth['user_id'], $page, $limit);
    $data = array_map(fn($row) => $this->formatFieldTrip($row, false), $result['data']);

    return [
      'data' => $data,
      'total' => $result['total'],
      'page' => $page,
      'limit' => $limit,
    ];
  }

  /**
   * Updates an existing field trip.
   *
   * @param string $id
   * @param UpdateFieldTripDTO $dto
   * @return array
   * @throws ApiException
   */
  public function update(string $id, UpdateFieldTripDTO $dto): array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
    ]);

    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('Field trip'), 404);
    }

    $dto->validate();
    $this->validateLocationReferences(
      $dto->provinceSnitCode ?? $existing['province_snit_code'],
      $dto->cantonSnitCode ?? $existing['canton_snit_code'],
      $dto->districtSnitCode ?? $existing['district_snit_code']
    );

    try {
      $this->pdo->beginTransaction();

      $this->repository->update($id, $dto);

      if ($dto->participants !== null) {
        $this->participantRepository->syncParticipants($id, $dto->participants);
      }

      if ($dto->geomanifestations !== null) {
        // Unlink old manifestations
        $currentGms = $this->repository->getManifestations($id);
        foreach ($currentGms as $gm) {
          $this->repository->unlinkManifestation($gm['geomanifestation_id']);
        }
        // Link new ones
        foreach ($dto->geomanifestations as $gmId) {
          $this->repository->linkManifestation($id, $gmId);
        }
      }

      $this->pdo->commit();
    } catch (\Throwable $e) {
      if ($this->pdo->inTransaction()) {
        $this->pdo->rollBack();
      }
      if ($e instanceof ApiException) {
        throw $e;
      }
      throw new ApiException(ErrorType::internal('Update failed: ' . $e->getMessage()), 500);
    }

    $fresh = $this->repository->findById($id);
    return $this->formatFieldTrip($fresh, true);
  }

  /**
   * Toggles active state of a field trip.
   *
   * @param string $id
   * @param bool $isActive
   * @return array
   * @throws ApiException
   */
  public function toggleActive(string $id, bool $isActive): array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
    ]);

    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('Field trip'), 404);
    }

    $updated = $this->repository->toggleActive($id, $isActive);
    return $this->formatFieldTrip($updated, true);
  }

  /**
   * Adds a participant to a field trip.
   *
   * @param string $fieldTripId
   * @param string $userId
   * @return array List of participants
   * @throws ApiException
   */
  public function addParticipant(string $fieldTripId, string $userId): array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
    ]);

    $fieldTrip = $this->repository->findById($fieldTripId);
    if (!$fieldTrip) {
      throw new ApiException(ErrorType::notFound('Field trip'), 404);
    }

    $user = $this->userRepository->findById($userId);
    if (!$user) {
      throw new ApiException(ErrorType::notFound('User'), 404);
    }

    $this->participantRepository->addParticipant($fieldTripId, $userId);
    return $this->participantRepository->getParticipants($fieldTripId);
  }

  /**
   * Removes a participant from a field trip.
   *
   * @param string $fieldTripId
   * @param string $userId
   * @return array List of participants
   * @throws ApiException
   */
  public function removeParticipant(string $fieldTripId, string $userId): array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
    ]);

    $fieldTrip = $this->repository->findById($fieldTripId);
    if (!$fieldTrip) {
      throw new ApiException(ErrorType::notFound('Field trip'), 404);
    }

    $this->participantRepository->removeParticipant($fieldTripId, $userId);
    return $this->participantRepository->getParticipants($fieldTripId);
  }

  /**
   * Links a geomanifestation to a field trip.
   *
   * @param string $fieldTripId
   * @param string $geomanifestationId
   * @return array List of linked manifestations
   * @throws ApiException
   */
  public function linkManifestation(string $fieldTripId, string $geomanifestationId): array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
    ]);

    $fieldTrip = $this->repository->findById($fieldTripId);
    if (!$fieldTrip) {
      throw new ApiException(ErrorType::notFound('Field trip'), 404);
    }

    $gm = $this->manifestationRepository->findById($geomanifestationId);
    if (!$gm) {
      throw new ApiException(ErrorType::notFound('Geothermal manifestation'), 404);
    }

    $this->repository->linkManifestation($fieldTripId, $geomanifestationId);
    return $this->repository->getManifestations($fieldTripId);
  }

  /**
   * Unlinks a geomanifestation from a field trip.
   *
   * @param string $fieldTripId
   * @param string $geomanifestationId
   * @return array List of remaining linked manifestations
   * @throws ApiException
   */
  public function unlinkManifestation(string $fieldTripId, string $geomanifestationId): array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
    ]);

    $fieldTrip = $this->repository->findById($fieldTripId);
    if (!$fieldTrip) {
      throw new ApiException(ErrorType::notFound('Field trip'), 404);
    }

    $this->repository->unlinkManifestation($geomanifestationId);
    return $this->repository->getManifestations($fieldTripId);
  }

  /**
   * Permanently deletes a field trip.
   * Admins can delete any field trip; investigators can only delete field trips they created.
   *
   * @param string $id
   * @return void
   * @throws ApiException
   */
  public function delete(string $id): void
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
    ]);

    $fieldTrip = $this->repository->findById($id);
    if (!$fieldTrip) {
      throw new ApiException(ErrorType::notFound('Field trip'), 404);
    }

    $auth = $this->authService->requireAuth();
    if ($auth['role'] !== AllowedUserRoles::ADMIN && $fieldTrip['field_trip_creator_id'] !== $auth['user_id']) {
      throw new ApiException(ErrorType::forbidden('You can only delete field trips you created'), 403);
    }

    if (!$this->repository->delete($id)) {
      throw new ApiException(ErrorType::internal('Failed to delete field trip'), 500);
    }
  }

  /**
   * Validates location SNIT codes.
   */
  private function validateLocationReferences(
    ?int $provinceSnitCode,
    ?int $cantonSnitCode,
    ?int $districtSnitCode
  ): void {
    if ($provinceSnitCode !== null && !$this->provinceRepository->existsBySnitCode($provinceSnitCode)) {
      throw new ApiException(ErrorType::invalidField('province_snit_code'), 422);
    }
    if ($cantonSnitCode !== null && !$this->cantonRepository->existsBySnitCode($cantonSnitCode)) {
      throw new ApiException(ErrorType::invalidField('canton_snit_code'), 422);
    }
    if ($districtSnitCode !== null && !$this->districtRepository->existsBySnitCode($districtSnitCode)) {
      throw new ApiException(ErrorType::invalidField('district_snit_code'), 422);
    }
  }

  /**
   * Formats a raw database row into API response structure.
   */
  private function formatFieldTrip(array $row, bool $includeRelations = false): array
  {
    $formatted = [
      'field_trip_id' => $row['field_trip_id'],
      'field_trip_name' => $row['field_trip_name'],
      'field_trip_scheduled_date' => $row['field_trip_scheduled_date'],
      'field_trip_start_date' => $row['field_trip_start_date'] ?? null,
      'field_trip_finish_date' => $row['field_trip_finish_date'] ?? null,
      'field_trip_is_active' => (bool)$row['field_trip_is_active'],
      'location' => [
        'province' => $row['province_name'] ?? null,
        'province_snit_code' => isset($row['province_snit_code']) ? (int)$row['province_snit_code'] : null,
        'canton' => $row['canton_name'] ?? null,
        'canton_snit_code' => isset($row['canton_snit_code']) ? (int)$row['canton_snit_code'] : null,
        'district' => $row['district_name'] ?? null,
        'district_snit_code' => isset($row['district_snit_code']) ? (int)$row['district_snit_code'] : null,
      ],
      'creator' => [
        'user_id' => $row['field_trip_creator_id'],
        'first_name' => $row['creator_first_name'] ?? null,
        'last_name' => $row['creator_last_name'] ?? null,
        'email' => $row['creator_email'] ?? null,
      ],
      'created_at' => $row['created_at'],
    ];

    if ($includeRelations) {
      $formatted['participants'] = $this->participantRepository->getParticipants($row['field_trip_id']);
      $formatted['geomanifestations'] = $this->repository->getManifestations($row['field_trip_id']);
    }

    return $formatted;
  }
}
