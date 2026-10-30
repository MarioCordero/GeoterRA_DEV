<?php
declare(strict_types=1);

namespace Services;

use DateTimeImmutable;
use DTO\AllowedUserRoles;
use DTO\RegisterFieldTripDTO;
use DTO\UpdateFieldTripDTO;
use Exception;
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
use Services\Utils\PaginationBuilder;

/**
 * Business logic for field trips (giras de campo).
 */
final class FieldTripService
{
  use PaginationBuilder;
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
      AllowedUserRoles::INVESTIGATOR,
    ]);

    $dto->validate();
    $this->validateSnitHierarchy(
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
   * @param int|null $provinceSnitCode
   * @param int|null $cantonSnitCode
   * @param int|null $districtSnitCode
   * @return array{data: array[], total: int, page: int, limit: int}
   */
  public function getAll(
    int $page = 1,
    int $limit = 20,
    ?bool $isActive = null,
    ?int $provinceSnitCode = null,
    ?int $cantonSnitCode = null,
    ?int $districtSnitCode = null
  ): array {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
      AllowedUserRoles::MAINTENANCE,
    ]);

    $this->validateSnitHierarchy($provinceSnitCode, $cantonSnitCode, $districtSnitCode);

    $result = $this->repository->getAllPaginated($page, $limit, $isActive, $provinceSnitCode, $cantonSnitCode, $districtSnitCode);
    $data = array_map(fn($row) => $this->formatFieldTrip($row, true), $result['data']);

    return $this->buildPaginationResponse(
      $data, $result['total'], $page, $limit
    );
  }

  /**
   * Returns paginated field trips assigned to or created by the authenticated user.
   *
   * @param int $page
   * @param int $limit
   * @param int|null $provinceSnitCode
   * @param int|null $cantonSnitCode
   * @param int|null $districtSnitCode
   * @return array{data: array[], total: int, page: int, limit: int}
   */
  public function getMyFieldTrips(
    int $page = 1,
    int $limit = 20,
    ?int $provinceSnitCode = null,
    ?int $cantonSnitCode = null,
    ?int $districtSnitCode = null
  ): array {
    $auth = Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
      AllowedUserRoles::MAINTENANCE,
    ]);

    $this->validateSnitHierarchy($provinceSnitCode, $cantonSnitCode, $districtSnitCode);

    $result = $this->repository->getByParticipant($auth['user_id'], $page, $limit, $provinceSnitCode, $cantonSnitCode, $districtSnitCode);
    $data = array_map(fn($row) => $this->formatFieldTrip($row, true), $result['data']);

    return $this->buildPaginationResponse(
      $data, $result['total'], $page, $limit
    );
  }

  /**
   * Updates an existing field trip.
   *
   * @param string $id
   * @param UpdateFieldTripDTO $dto
   * @return array
   * @throws ApiException|Exception
   */
  public function update(string $id, UpdateFieldTripDTO $dto): array
  {
    $existing = $this->validateFieldTripAccess($id, false, true);

    $dto->validate();

    $finalStart = $dto->fieldTripStartDate ?? $existing['field_trip_start_date'];
    $finalFinish = $dto->fieldTripFinishDate ?? $existing['field_trip_finish_date'];

    if ($finalStart && $finalFinish
      && new DateTimeImmutable($finalStart) > new DateTimeImmutable($finalFinish)) {
      throw new ApiException(
        ErrorType::invalidField(
          'field_trip_start_date must be less than or equal to field_trip_finish_date'
        ),
        422
      );
    }

    $targetProvince = $dto->hasField('province_snit_code')
      ? $dto->provinceSnitCode
      : (isset($existing['province_snit_code']) ? (int)$existing['province_snit_code'] : null);
    $targetCanton = $dto->hasField('canton_snit_code')
      ? $dto->cantonSnitCode
      : (isset($existing['canton_snit_code']) ? (int)$existing['canton_snit_code'] : null);
    $targetDistrict = $dto->hasField('district_snit_code')
      ? $dto->districtSnitCode
      : (isset($existing['district_snit_code']) ? (int)$existing['district_snit_code'] : null);

    $this->validateSnitHierarchy($targetProvince, $targetCanton, $targetDistrict);

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
   * Adds a participant to a field trip.
   *
   * @param string $fieldTripId
   * @param string $userId
   * @return array List of participants
   * @throws ApiException|Exception
   */
  public function addParticipant(string $fieldTripId, string $userId): array
  {
    $this->validateFieldTripAccess($fieldTripId, false, true);

    $user = $this->userRepository->findById($userId);
    if (!$user) {
      throw new ApiException(ErrorType::notFound('User'), 404);
    }

    $this->participantRepository->addParticipant($fieldTripId, $userId);

    $fresh = $this->repository->findById($fieldTripId);

    return $this->formatFieldTrip($fresh, true);
  }

  /**
   * Removes a participant from a field trip.
   *
   * @param string $fieldTripId
   * @param string $userId
   * @return array List of participants
   * @throws ApiException|Exception
   */
  public function removeParticipant(string $fieldTripId, string $userId): array
  {
    $this->validateFieldTripAccess($fieldTripId, false, true);

    $this->participantRepository->removeParticipant($fieldTripId, $userId);

    $fresh = $this->repository->findById($fieldTripId);
    return $this->formatFieldTrip($fresh, true);
  }

  /**
   * Links a geomanifestation to a field trip.
   *
   * @param string $fieldTripId
   * @param string $geomanifestationId
   * @return array List of linked manifestations
   * @throws ApiException|Exception
   */
  public function linkManifestation(string $fieldTripId, string $geomanifestationId): array
  {
    $this->validateFieldTripAccess($fieldTripId, true, false);

    $gm = $this->manifestationRepository->findById($geomanifestationId);
    if (!$gm) {
      throw new ApiException(ErrorType::notFound('Geothermal manifestation'), 404);
    }

    $this->repository->linkManifestation($fieldTripId, $geomanifestationId);

    $fresh = $this->repository->findById($fieldTripId);
    return $this->formatFieldTrip($fresh, true);
  }

  /**
   * Unlinks a geomanifestation from a field trip.
   *
   * @param string $fieldTripId
   * @param string $geomanifestationId
   * @return array List of remaining linked manifestations
   * @throws ApiException
   * @throws Exception
   */
  public function unlinkManifestation(string $fieldTripId, string $geomanifestationId): array
  {
    $this->validateFieldTripAccess($fieldTripId, true, false);

    $gm = $this->manifestationRepository->findById($geomanifestationId);
    if (!$gm) {
      throw new ApiException(ErrorType::notFound('Geothermal manifestation'), 404);
    }

    $this->repository->unlinkManifestation($geomanifestationId);

    $fresh = $this->repository->findById($fieldTripId);
    return $this->formatFieldTrip($fresh, true);
  }

  /**
   * Permanently deletes a field trip.
   * Admins can delete any field trip; investigators can only delete field trips they created.
   *
   * @param string $id
   * @return void
   * @throws ApiException|Exception
   */
  public function delete(string $id): void
  {
    $this->validateFieldTripAccess($id, false, true);
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
   * Validates SNIT hierarchical consistency.
   *
   * @param int|null $provinceSnitCode
   * @param int|null $cantonSnitCode
   * @param int|null $districtSnitCode
   * @throws ApiException
   */
  private function validateSnitHierarchy(
    ?int $provinceSnitCode,
    ?int $cantonSnitCode,
    ?int $districtSnitCode
  ): void {
    if ($districtSnitCode !== null && ($cantonSnitCode === null || $provinceSnitCode === null)) {
      throw new ApiException(
        ErrorType::invalidField(
          'District filter requires Canton and Province SNIT codes'
        ),
        422
      );
    }

    if ($cantonSnitCode !== null && $provinceSnitCode === null) {
      throw new ApiException(
        ErrorType::invalidField('Canton filter requires Province SNIT code'),
        422
      );
    }

    $this->validateLocationReferences(
      $provinceSnitCode, $cantonSnitCode, $districtSnitCode
    );

    if ($cantonSnitCode !== null && $provinceSnitCode !== null && !str_starts_with(
        (string)$cantonSnitCode, (string)$provinceSnitCode
      )) {
      throw new ApiException(
        ErrorType::invalidField(
          'canton_snit_code does not belong to the given province'
        ),
        422
      );
    }

    if ($districtSnitCode !== null && $cantonSnitCode !== null && !str_starts_with(
        (string)$districtSnitCode, (string)$cantonSnitCode
      )) {
      throw new ApiException(
        ErrorType::invalidField(
          'district_snit_code does not belong to the given canton'
        ),
        422
      );
    }
  }

  /**
   * Formats a raw database row into an API response structure.
   */
  private function formatFieldTrip(array $row, bool $includeRelations = false): array
  {
    $now = new DateTimeImmutable();
    $startDate = !empty($row['field_trip_start_date']) ? new DateTimeImmutable($row['field_trip_start_date']) : null;
    $finishDate = !empty($row['field_trip_finish_date']) ? new DateTimeImmutable($row['field_trip_finish_date']) : null;

    $isActive = false;
    if ($startDate !== null && $finishDate !== null) {
      $isActive = ($now >= $startDate && $now <= $finishDate);
    }

    $formatted = [
      'field_trip_id' => $row['field_trip_id'],
      'field_trip_name' => $row['field_trip_name'],
      'field_trip_start_date' => $row['field_trip_start_date'] ?? null,
      'field_trip_finish_date' => $row['field_trip_finish_date'] ?? null,
      'field_trip_is_active' => $isActive,
      'province_snit_code' => isset($row['province_snit_code']) ? (int)$row['province_snit_code'] : null,
      'canton_snit_code' => isset($row['canton_snit_code']) ? (int)$row['canton_snit_code'] : null,
      'district_snit_code' => isset($row['district_snit_code']) ? (int)$row['district_snit_code'] : null,
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
      $rawManifestations = $this->repository->getManifestations($row['field_trip_id']);

      $formatted['geomanifestations'] = array_map(
        fn($manifestationRow) => $this->formatManifestation($manifestationRow),
        $rawManifestations
      );
    }

    return $formatted;
  }

  /**
   * Formats a view row into the API response structure.
   *
   * @param array<string,mixed> $row
   * @return array<string, mixed>
   */
  private function formatManifestation(array $row): array {
    $response = [
      'geomanifestation_id' => $row['geomanifestation_id'],
      'geomanifestation_name' => $row['geomanifestation_name'],
      'description' => $row['description'],
      'field_trip_id' => $row['field_trip_id'] ?? null,
      'field_trip_name' => $row['field_trip_name'] ?? null,
      'created_at' => $row['created_at'],
      'location' => [
        'province' => $row['province_name'],
        'province_snit_code' => $row['province_snit_code'],
        'canton' => $row['canton_name'],
        'canton_snit_code' => $row['canton_snit_code'],
        'district' => $row['district_name'],
        'district_snit_code' => $row['district_snit_code'],
        'latitude' => (float)$row['latitude'],
        'longitude' => (float)$row['longitude'],
      ]
    ];

    $response['visibility'] = isset($row['visibility']) && $row['visibility'];

    $response['request'] = (isset($row['request_id'])) ? [
      'request_id' => $row['request_id'],
      'request_name' => $row['request_name'],
    ] : null;

    return $response;
  }

  /**
   * Validates field trip access and date window restrictions.
   *
   * @param string $fieldTripId
   * @param bool $includeFieldInvestigator
   * @param bool $requireBeforeFinish
   * @return array Raw field trip row
   * @throws ApiException
   * @throws \Exception
   */
  private function validateFieldTripAccess(
    string $fieldTripId,
    bool $includeFieldInvestigator = false,
    bool $requireBeforeFinish = false
  ): array
  {
    if (!$includeFieldInvestigator) {
      $session = Request::requireRole([
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::INVESTIGATOR
      ]);
    } else {
      $session = Request::requireRole([
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::INVESTIGATOR,
        AllowedUserRoles::FIELD_INVESTIGATOR,
      ]);
    }

    $existing = $this->repository->findById($fieldTripId);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('Field trip'), 404);
    }

    $userRole = $session['role'];
    $userId = $session['user_id'];

    $participants = $this->participantRepository->getParticipants($fieldTripId);
    $isMember = false;
    foreach ($participants as $participant) {
      if ($participant['user_id'] === $userId) {
        $isMember = true;
        break;
      }
    }

    if ($userRole !== AllowedUserRoles::ADMIN && !$isMember) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }

    $now = new DateTimeImmutable();
    $startDate = !empty($existing['field_trip_start_date']) ?
      new DateTimeImmutable($existing['field_trip_start_date']) : null;
    $finishDate = !empty($existing['field_trip_finish_date']) ?
      new DateTimeImmutable($existing['field_trip_finish_date']) : null;

    if ($requireBeforeFinish) {
      if ($userRole !== AllowedUserRoles::ADMIN
        && $finishDate !== null && $now > $finishDate) {
        throw new ApiException(
          ErrorType::forbidden(
            'This field trip has already finished and cannot be modified.'
          ),
          403
        );
      }
    } else if ($startDate === null || $finishDate === null
      || $now < $startDate || $now > $finishDate) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }

    return $existing;
  }
}