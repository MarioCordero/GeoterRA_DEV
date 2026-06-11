<?php
declare(strict_types=1);

namespace Services;

use PDO;
use Http\ApiException;
use Http\ErrorType;
use DTO\RegisterGeomanifestationDTO;
use DTO\UpdateGeomanifestationDTO;
use DTO\AllowedUserRoles;
use Repositories\GeomanifestationRepository;
use Repositories\GeomanifestationViewRepository;
use Repositories\ProvinceRepository;
use Repositories\CantonRepository;
use Repositories\DistrictRepository;

/**
 * Business logic for geothermal manifestations.
 */
final class GeomanifestationService
{
  private GeomanifestationRepository $repository;
  private GeomanifestationViewRepository $viewRepository;
  private ProvinceRepository $provinceRepository;
  private CantonRepository $cantonRepository;
  private DistrictRepository $districtRepository;
  private AuthService $authService;

  public function __construct(private PDO $pdo)
  {
    $this->repository = new GeomanifestationRepository($pdo);
    $this->viewRepository = new GeomanifestationViewRepository($pdo);
    $this->provinceRepository = new ProvinceRepository($pdo);
    $this->cantonRepository = new CantonRepository($pdo);
    $this->districtRepository = new DistrictRepository($pdo);
    $this->authService = new AuthService($pdo);
  }

  /**
   * Ensures the authenticated user has admin role.
   *
   * @throws ApiException
   */
  private function ensureAdmin(): void
  {
    $auth = $this->authService->requireAuth();
    if (($auth['role'] ?? '') !== AllowedUserRoles::ADMIN) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }
  }

  /**
   * Validates that the provided province/canton/district SNIT codes exist (if given).
   *
   * @param int|null $provinceSnitCode
   * @param int|null $cantonSnitCode
   * @param int|null $districtSnitCode
   * @throws ApiException
   */
  private function validateLocationReferences(?int $provinceSnitCode, ?int $cantonSnitCode, ?int $districtSnitCode): void
  {
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
   * Formats a database row into the API response structure.
   *
   * @param array<string,mixed> $row
   * @return array<string,mixed>
   */
  private function formatManifestation(array $row): array
  {
    return [
      'geomanifestation_id' => $row['geomanifestation_id'],
      'name' => $row['geomanifestation_name'],
      'province_snit_code' => $row['province_snit_code'],
      'canton_snit_code' => $row['canton_snit_code'],
      'district_snit_code' => $row['district_snit_code'],
      'latitude' => $row['latitude'] !== null ? round((float)$row['latitude'], 7) : null,
      'longitude' => $row['longitude'] !== null ? round((float)$row['longitude'], 7) : null,
      'description' => $row['description'],
      'visibility' => (bool)$row['visibility'],
      'created_at' => $row['created_at'],
      'created_by' => $row['created_by'],
    ];
  }

  /**
   * Builds paginated response structure.
   *
   * @param array $data
   * @param int $total
   * @param int $page
   * @param int $limit
   * @return array{data: array, pagination: array}
   */
  private function buildPaginationResponse(array $data, int $total, int $page, int $limit): array
  {
    return [
      'data' => $data,
      'pagination' => [
        'current_page' => $page,
        'per_page' => $limit,
        'total' => $total,
        'last_page' => (int)ceil($total / $limit),
      ],
    ];
  }

  // ==================== CRUD operations ====================

  /**
   * Creates a new geothermal manifestation.
   *
   * @param RegisterGeomanifestationDTO $dto
   * @throws ApiException
   */
  public function create(RegisterGeomanifestationDTO $dto): void
  {
    $this->ensureAdmin();
    $dto->validate();
    $this->validateLocationReferences($dto->provinceSnitCode, $dto->cantonSnitCode, $dto->districtSnitCode);
    $auth = $this->authService->requireAuth();
    $this->repository->create($dto->toDatabaseArray(), $auth['user_id']);
  }

  /**
   * Retrieves a single manifestation by ID.
   *
   * @param string $id
   * @param bool $includeHidden Whether to return hidden manifestations (admin only)
   * @return array
   * @throws ApiException
   */
  public function getById(string $id, bool $includeHidden = false): array
  {
    $manifestation = $this->repository->findById($id);
    if (!$manifestation) {
      throw new ApiException(ErrorType::notFound('Geothermal manifestation'), 404);
    }

    if (!$manifestation['visibility'] && !$includeHidden) {
      $this->ensureAdmin(); // will throw 403 if not admin
    }

    return $this->formatManifestation($manifestation);
  }

  /**
   * Updates an existing manifestation using UpdateGeomanifestationDTO.
   * Only fields that are explicitly provided in the DTO will be updated.
   *
   * @param string $id
   * @param UpdateGeomanifestationDTO $dto
   * @throws ApiException
   */
  public function update(string $id, UpdateGeomanifestationDTO $dto): void
  {
    $this->ensureAdmin();

    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('Geothermal manifestation'), 404);
    }

    $dto->validate();

    // Validate location references only if they are being updated
    if ($dto->provinceSnitCode !== null || $dto->cantonSnitCode !== null || $dto->districtSnitCode !== null) {
      $this->validateLocationReferences(
        $dto->provinceSnitCode ?? $existing['province_snit_code'],
        $dto->cantonSnitCode ?? $existing['canton_snit_code'],
        $dto->districtSnitCode ?? $existing['district_snit_code']
      );
    }

    $updateFields = $dto->toUpdateArray();
    if (empty($updateFields)) {
      return;
    }

    $success = $this->repository->update($id, $updateFields);
    if (!$success) {
      throw new ApiException(ErrorType::manifestationUpdateFailed(), 500);
    }
  }

  /**
   * Permanently deletes a manifestation.
   *
   * @param string $id
   * @throws ApiException
   */
  public function delete(string $id): void
  {
    $this->ensureAdmin();

    if (!$this->repository->findById($id)) {
      throw new ApiException(ErrorType::notFound('Geothermal manifestation'), 404);
    }

    if (!$this->repository->delete($id)) {
      throw new ApiException(ErrorType::manifestationDeleteFailed(), 500);
    }
  }

  /**
   * Updates only the visibility flag.
   *
   * @param string $id
   * @param bool $visible
   * @throws ApiException
   */
  public function setVisibility(string $id, bool $visible): void
  {
    $this->ensureAdmin();

    if (!$this->repository->findById($id)) {
      throw new ApiException(ErrorType::notFound('Geothermal manifestation'), 404);
    }

    if (!$this->repository->updateVisibility($id, $visible)) {
      throw new ApiException(ErrorType::internal('Failed to update visibility'), 500);
    }
  }

  // ==================== List methods with pagination ====================

  /**
   * Returns paginated list of visible manifestations (public).
   *
   * @param int $page
   * @param int $limit
   * @return array
   * @throws ApiException
   */
  public function getAllVisible(int $page = 1, int $limit = 20): array
  {
    $result = $this->repository->getAllVisible($page, $limit);
    $data = array_map([$this, 'formatManifestation'], $result['data']);
    return $this->buildPaginationResponse($data, $result['total'], $page, $limit);
  }

  /**
   * Returns paginated list of all manifestations (admin only).
   *
   * @param int $page
   * @param int $limit
   * @return array
   * @throws ApiException
   */
  public function getAll(int $page = 1, int $limit = 20): array
  {
    $this->ensureAdmin();
    $result = $this->repository->getAll($page, $limit);
    $data = array_map([$this, 'formatManifestation'], $result['data']);
    return $this->buildPaginationResponse($data, $result['total'], $page, $limit);
  }

  /**
   * Returns paginated list of visible manifestations filtered by province.
   *
   * @param int $provinceSnitCode
   * @param int $page
   * @param int $limit
   * @return array
   * @throws ApiException
   */
  public function getByProvince(int $provinceSnitCode, int $page = 1, int $limit = 20): array
  {
    if (!$this->provinceRepository->existsBySnitCode($provinceSnitCode)) {
      throw new ApiException(ErrorType::invalidField('province_snit_code'), 422);
    }

    $result = $this->repository->getByProvince($provinceSnitCode, $page, $limit);
    $data = array_map([$this, 'formatManifestation'], $result['data']);
    return $this->buildPaginationResponse($data, $result['total'], $page, $limit);
  }

  // ==================== View (enriched) methods ====================

  /**
   * Returns a single enriched manifestation from the view.
   *
   * @param string $id
   * @return array
   * @throws ApiException
   */
  public function getViewById(string $id): array
  {
    $viewData = $this->viewRepository->findById($id);
    if (!$viewData) {
      throw new ApiException(ErrorType::notFound('Geothermal manifestation'), 404);
    }

    if (!$viewData->visibility) {
      $this->ensureAdmin(); // throws if not admin
    }

    return $viewData->toArray();
  }

  /**
   * Returns paginated enriched data from the view, with optional filters.
   *
   * @param int $page
   * @param int $limit
   * @param int|null $provinceSnitCode
   * @param float|null $temperatureMin
   * @param float|null $temperatureMax
   * @param bool $onlyVisible
   * @return array
   * @throws ApiException
   */
  public function getViewAllPaginated(
    int $page = 1,
    int $limit = 20,
    ?int $provinceSnitCode = null,
    ?float $temperatureMin = null,
    ?float $temperatureMax = null,
    bool $onlyVisible = true
  ): array {
    if (!$onlyVisible) {
      $this->ensureAdmin();
    }

    $result = $this->viewRepository->getAllPaginated(
      $page, $limit, $provinceSnitCode, $temperatureMin, $temperatureMax, $onlyVisible
    );

    $data = array_map(
      fn($row) => \DTO\GeomanifestationViewDTO::fromDatabase($row)->toArray(),
      $result['data']
    );

    return $this->buildPaginationResponse($data, $result['total'], $page, $limit);
  }
}