<?php
declare(strict_types=1);

namespace Services;

use DTO\AllowedUserRoles;
use DTO\RegisterGeomanifestationDTO;
use DTO\UpdateGeomanifestationDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use PDO;
use Repositories\CantonRepository;
use Repositories\DistrictRepository;
use Repositories\GeomanifestationRepository;
use Repositories\GeomanifestationViewRepository;
use Repositories\ProvinceRepository;

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

  public function __construct(private readonly PDO $pdo)
  {
    $this->repository = new GeomanifestationRepository($this->pdo);
    $this->viewRepository = new GeomanifestationViewRepository($this->pdo);
    $this->provinceRepository = new ProvinceRepository($pdo);
    $this->cantonRepository = new CantonRepository($pdo);
    $this->districtRepository = new DistrictRepository($pdo);
    $this->authService = new AuthService($pdo);
  }

  /**
   * Creates a new geothermal manifestation.
   *
   * @param RegisterGeomanifestationDTO $dto
   * @return array
   * @throws ApiException
   */
  public function create(RegisterGeomanifestationDTO $dto): array
  {
    Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR
      ]
    );

    $dto->validate();
    // Validate location references (only if provided)
    $this->validateLocationReferences(
      $dto->provinceSnitCode,
      $dto->cantonSnitCode,
      $dto->districtSnitCode
    );

    $auth = $this->authService->requireAuth();
    $created = $this->repository->create($dto->toArray(), $auth['user_id']);

    // Fetch the created record from the view (include hidden because it's admin operation)
    $viewRow = $this->viewRepository->findById(
      $created['geomanifestation_id'], true
    );
    if (!$viewRow) {
      throw new ApiException(
        ErrorType::internal('Failed to retrieve created manifestation'), 500
      );
    }

    return $this->formatManifestationView($viewRow, true);
  }

  /**
   * Validates that the provided province/canton/district SNIT codes exist (if given).
   *
   * @param int|null $provinceSnitCode
   * @param int|null $cantonSnitCode
   * @param int|null $districtSnitCode
   * @throws ApiException
   */
  private function validateLocationReferences(
    ?int $provinceSnitCode,
    ?int $cantonSnitCode,
    ?int $districtSnitCode
  ): void {
    if (
      $provinceSnitCode !== null
      && !$this->provinceRepository->existsBySnitCode($provinceSnitCode)
    ) {
      throw new ApiException(
        ErrorType::invalidField('province_snit_code'), 422
      );
    }
    if (
      $cantonSnitCode !== null
      && !$this->cantonRepository->existsBySnitCode($cantonSnitCode)
    ) {
      throw new ApiException(ErrorType::invalidField('canton_snit_code'), 422);
    }
    if (
      $districtSnitCode !== null
      && !$this->districtRepository->existsBySnitCode($districtSnitCode)
    ) {
      throw new ApiException(
        ErrorType::invalidField('district_snit_code'), 422
      );
    }
  }

  /**
   * Formats a view row into the API response structure.
   *
   * @param array<string,mixed> $row
   * @param bool $isAdmin If true, excludes insitu/inlab test data
   * @return array<string,mixed>
   */
  private function formatManifestationView(array $row, bool $isAdmin = false
  ): array {
    $response = [
      'geomanifestation_id' => $row['geomanifestation_id'],
      'name' => $row['geomanifestation_name'],
      'description' => $row['manifestation_description'],
      'created_at' => $row['manifestation_created_at'],
      'location' => [
        'province' => $row['province_name'],
        'province_snit_code' => $row['province_snit_code'],
        'canton' => $row['canton_name'],
        'canton_snit_code' => $row['canton_snit_code'],
        'district' => $row['district_name'],
        'district_snit_code' => $row['district_snit_code'],
				'latitude' => round((float)$row['latitude'], 7),
				'longitude' => round((float)$row['longitude'], 7),
      ],
      'current_georeport' => $row['georeport_id'] ? [
        'georeport_id' => $row['georeport_id'],
        'details' => $row['report_details'],
        'created_at' => $row['report_created_at'],
      ] : null,
    ];

    if (!$isAdmin) {
      $response['insitu_test'] = $row['insitu_test_id'] ? [
        'insitu_test_id' => $row['insitu_test_id'],
        'temperature' => isset($row['temperature']) ? (float)$row['temperature'] : null,
        'conductivity' => isset($row['insitu_conductivity']) ? (float)$row['insitu_conductivity'] : null,
        'ph' => isset($row['insitu_ph']) ? (float)$row['insitu_ph'] : null,
        'description' => $row['insitu_description'],
        'created_at' => $row['insitu_created_at'],
      ] : null;

      $response['inlab_test'] = $row['inlab_test_id'] ? [
        'inlab_test_id' => $row['inlab_test_id'],
        'ph' => isset($row['lab_ph']) ? (float)$row['lab_ph'] : null,
        'conductivity' => isset($row['lab_conductivity']) ? (float)$row['lab_conductivity'] : null,
        'cl' => isset($row['cl']) ? (float)$row['cl'] : null,
        'ca' => isset($row['ca']) ? (float)$row['ca'] : null,
        'hco3' => isset($row['hco3']) ? (float)$row['hco3'] : null,
        'so4' => isset($row['so4']) ? (float)$row['so4'] : null,
        'fe' => isset($row['fe']) ? (float)$row['fe'] : null,
        'si' => isset($row['si']) ? (float)$row['si'] : null,
        'b' => isset($row['b']) ? (float)$row['b'] : null,
        'li' => isset($row['li']) ? (float)$row['li'] : null,
        'f' => isset($row['f']) ? (float)$row['f'] : null,
        'na' => isset($row['na']) ? (float)$row['na'] : null,
        'k' => isset($row['k']) ? (float)$row['k'] : null,
        'mg' => isset($row['mg']) ? (float)$row['mg'] : null,
        'description' => $row['lab_description'],
        'created_at' => $row['lab_created_at'],
      ] : null;
    }

    if ($isAdmin) {
      $response['visibility'] = (bool)$row['visibility'];
    }

    return $response;
  }

  /**
   * Updates an existing manifestation.
   *
   * @param string $id
   * @param UpdateGeomanifestationDTO $dto
   * @return array The updated record
   * @throws ApiException
   */
  public function update(string $id, UpdateGeomanifestationDTO $dto): array
  {
    Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR
      ]
    );

    // Check existence via base repository
    $existing = $this->repository->findById($id);
    if (!$existing) {
      throw new ApiException(
        ErrorType::notFound('Geothermal manifestation'), 404
      );
    }

    $dto->validate();

    // Validate location references if any are being updated
    if (
      $dto->provinceSnitCode !== null ||
      $dto->cantonSnitCode !== null ||
      $dto->districtSnitCode !== null
    ) {
      $this->validateLocationReferences(
        $dto->provinceSnitCode ?? $existing['province_snit_code'],
        $dto->cantonSnitCode ?? $existing['canton_snit_code'],
        $dto->districtSnitCode ?? $existing['district_snit_code']
      );
    }

    $updateFields = $dto->toArray();
    if (!empty($updateFields)) {
      $updated = $this->repository->update($id, $updateFields);
      if (!$updated) {
        throw new ApiException(ErrorType::manifestationUpdateFailed(), 500);
      }
    }

    // Fetch the updated record from the view (admin context)
    $viewRow = $this->viewRepository->findById($id, true);
    if (!$viewRow) {
      throw new ApiException(
        ErrorType::internal('Failed to retrieve updated manifestation'), 500
      );
    }

    return $this->formatManifestationView($viewRow, true);
  }

  // ---------- Public API methods ----------

  /**
   * Permanently deletes a manifestation.
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

    if (!$this->repository->findById($id)) {
      throw new ApiException(
        ErrorType::notFound('Geothermal manifestation'), 404
      );
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
   * @return array The updated record
   * @throws ApiException
   */
  public function setVisibility(string $id, bool $visible): array
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
      throw new ApiException(
        ErrorType::notFound('Geothermal manifestation'), 404
      );
    }

    if ((bool)$existing['visibility'] === $visible) {
      // No change needed, but we still return the current record from view
      $viewRow = $this->viewRepository->findById($id, true);
      if (!$viewRow) {
        throw new ApiException(
          ErrorType::internal('Failed to retrieve manifestation'), 500
        );
      }
      return $this->formatManifestationView($viewRow, true);
    }

    $updated = $this->repository->updateVisibility($id, $visible);
    if (!$updated) {
      throw new ApiException(
        ErrorType::internal('Failed to update visibility'), 500
      );
    }

    $viewRow = $this->viewRepository->findById($id, true);
    if (!$viewRow) {
      throw new ApiException(
        ErrorType::internal('Failed to retrieve updated manifestation'), 500
      );
    }

    return $this->formatManifestationView($viewRow, true);
  }

  /**
   * Returns a paginated list of all manifestations (admin only).
   *
   * @param int $page
   * @param int $limit
   * @return array
   * @throws ApiException
   */
  public function getAll(int $page = 1, int $limit = 20): array
  {
    Request::requireRole(
      [
        AllowedUserRoles::ADMIN,
        AllowedUserRoles::FIELD_INVESTIGATOR,
        AllowedUserRoles::INVESTIGATOR,
        AllowedUserRoles::MAINTENANCE
      ]
    );

    return $this->getFiltered(false, null, null, null, $page, $limit);
  }

  /**
   * Internal method to fetch and format a filtered list.
   *
   * @param bool $onlyVisible
   * @param int|null $provinceSnitCode
   * @param int|null $cantonSnitCode
   * @param int|null $districtSnitCode
   * @param int $page
   * @param int $limit
   * @return array
   * @throws ApiException
   */
  private function getFiltered(
    bool $onlyVisible,
    ?int $provinceSnitCode,
    ?int $cantonSnitCode,
    ?int $districtSnitCode,
    int $page,
    int $limit
  ): array {
    // If filters are provided, validate hierarchy
    if ($provinceSnitCode !== null || $cantonSnitCode !== null || $districtSnitCode !== null) {
      $this->validateSnitHierarchy(
        $provinceSnitCode, $cantonSnitCode, $districtSnitCode
      );
    }

    $result = $this->viewRepository->getAllPaginated(
      $page,
      $limit,
      $provinceSnitCode,
      $cantonSnitCode,
      $districtSnitCode,
      null,
      null,
      $onlyVisible
    );

    $data = array_map(
      fn($row) => $this->formatManifestationView($row, !$onlyVisible),
      $result['data']
    );

    return $this->buildPaginationResponse(
      $data, $result['total'], $page, $limit
    );
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
   * Builds paginated response structure.
   *
   * @param array $data
   * @param int $total
   * @param int $page
   * @param int $limit
   * @return array{data: array, pagination: array}
   */
  private function buildPaginationResponse(
    array $data,
    int $total,
    int $page,
    int $limit
  ): array {
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

  /**
   * Returns a paginated list of visible manifestations filtered by province
   * (public).
   *
   * @param int $provinceSnitCode
   * @param int $page
   * @param int $limit
   * @return array
   * @throws ApiException
   */
  public function getByProvince(
    int $provinceSnitCode, int $page = 1, int $limit = 20
  ): array {
    // Validate province exists
    if (!$this->provinceRepository->existsBySnitCode($provinceSnitCode)) {
      throw new ApiException(
        ErrorType::invalidField('province_snit_code'), 422
      );
    }

    return $this->getFiltered(
      true, $provinceSnitCode, null, null, $page, $limit
    );
  }

  /**
   * Returns a paginated list of visible manifestations (public).
   *
   * @param int $page
   * @param int $limit
   * @return array
   * @throws ApiException
   */
  public function getAllVisible(int $page = 1, int $limit = 20): array
  {
    return $this->getFiltered(true, null, null, null, $page, $limit);
  }

  /**
   * Returns a single enriched manifestation from the view (public).
   *
   * @param string $id
   * @return array
   * @throws ApiException
   */
  public function getViewById(string $id): array
  {
    return $this->getById($id, false);
  }

  /**
   * Retrieves a single manifestation by ID.
   *
   * @param string $id
   * @param bool $includeHidden If true, allows retrieval of hidden records (admin only)
   * @return array
   * @throws ApiException
   */
  public function getById(string $id, bool $includeHidden = false): array
  {
    // Enforce role if trying to view hidden
    if ($includeHidden) {
      Request::requireRole(
        [
          AllowedUserRoles::ADMIN,
          AllowedUserRoles::FIELD_INVESTIGATOR,
          AllowedUserRoles::INVESTIGATOR,
          AllowedUserRoles::MAINTENANCE
        ]
      );
    }

    $viewRow = $this->viewRepository->findById($id, $includeHidden);
    if (!$viewRow) {
      throw new ApiException(
        ErrorType::notFound('Geothermal manifestation'), 404
      );
    }

    return $this->formatManifestationView($viewRow, $includeHidden);
  }

  // ---------- Helper validations (kept from original) ----------

  /**
   * Returns paginated enriched data from the view with optional filters.
   * This method is used by both public and admin endpoints.
   *
   * @param int $page
   * @param int $limit
   * @param int|null $provinceSnitCode
   * @param int|null $cantonSnitCode
   * @param int|null $districtSnitCode
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
    ?int $cantonSnitCode = null,
    ?int $districtSnitCode = null,
    ?float $temperatureMin = null,
    ?float $temperatureMax = null,
    bool $onlyVisible = true
  ): array {
    // If not onlyVisible, require admin role
    if (!$onlyVisible) {
      Request::requireRole(
        [
          AllowedUserRoles::ADMIN,
          AllowedUserRoles::FIELD_INVESTIGATOR,
          AllowedUserRoles::INVESTIGATOR,
          AllowedUserRoles::MAINTENANCE
        ]
      );
    }

    // If any SNIT filter is provided, validate hierarchy
    if ($provinceSnitCode !== null || $cantonSnitCode !== null || $districtSnitCode !== null) {
      $this->validateSnitHierarchy(
        $provinceSnitCode, $cantonSnitCode, $districtSnitCode
      );
    }

    $result = $this->viewRepository->getAllPaginated(
      $page,
      $limit,
      $provinceSnitCode,
      $cantonSnitCode,
      $districtSnitCode,
      $temperatureMin,
      $temperatureMax,
      $onlyVisible
    );

    $data = array_map(
      fn($row) => $this->formatManifestationView($row, !$onlyVisible),
      $result['data']
    );

    return $this->buildPaginationResponse(
      $data, $result['total'], $page, $limit
    );
  }
}