<?php
declare(strict_types=1);

namespace Services;

use PDO;
use Http\ApiException;
use Http\ErrorType;
use DTO\DistrictDTO;
use DTO\AllowedUserRoles;
use Repositories\DistrictRepository;
use Repositories\CantonRepository;

/**
 * Business logic for districts.
 */
final class DistrictService
{
  private DistrictRepository $repository;
  private CantonRepository $cantonRepository;
  private AuthService $authService;

  public function __construct(private PDO $pdo)
  {
    $this->repository = new DistrictRepository($pdo);
    $this->cantonRepository = new CantonRepository($pdo);
    $this->authService = new AuthService($pdo);
  }

  /**
   * Ensures the referenced canton exists.
   *
   * @param int $cantonSnitCode
   * @throws ApiException
   */
  private function requireValidCanton(int $cantonSnitCode): void
  {
    if (!$this->cantonRepository->existsBySnitCode($cantonSnitCode)) {
      throw new ApiException(
        ErrorType::invalidField('canton_snit_code'),
        422
      );
    }
  }

  /**
   * Retrieves all districts, optionally filtered by canton SNIT code.
   *
   * @param int|null $cantonSnitCode
   * @return array
   */
  public function getAll(?int $cantonSnitCode = null): array
  {
    if ($cantonSnitCode !== null) {
      $districts = $this->repository->getByCantonSnitCode($cantonSnitCode);
    } else {
      $districts = $this->repository->getAll();
    }
    return array_map(fn($dto) => [
      'district_id' => $dto->districtId,
      'canton_snit_code' => $dto->cantonSnitCode,
      'district_snit_code' => $dto->districtSnitCode,
      'district_name' => $dto->districtName,
      'created_at' => $dto->createdAt,
    ], $districts);
  }

  /**
   * Retrieves a district by its ULID.
   *
   * @param string $districtId
   * @return array
   * @throws ApiException
   */
  public function getById(string $districtId): array
  {
    $district = $this->repository->findById($districtId);
    if (!$district) {
      throw new ApiException(ErrorType::notFound('District'), 404);
    }
    return [
      'district_id' => $district->districtId,
      'canton_snit_code' => $district->cantonSnitCode,
      'district_snit_code' => $district->districtSnitCode,
      'district_name' => $district->districtName,
      'created_at' => $district->createdAt,
    ];
  }

  /**
   * Retrieves a district by its SNIT code.
   *
   * @param int $snitCode
   * @return array
   * @throws ApiException
   */
  public function getBySnitCode(int $snitCode): array
  {
    $district = $this->repository->findBySnitCode($snitCode);
    if (!$district) {
      throw new ApiException(ErrorType::notFound('District'), 404);
    }
    return [
      'district_id' => $district->districtId,
      'canton_snit_code' => $district->cantonSnitCode,
      'district_snit_code' => $district->districtSnitCode,
      'district_name' => $district->districtName,
      'created_at' => $district->createdAt,
    ];
  }

  /**
   * Creates a new district (admin only).
   *
   * @param DistrictDTO $dto
   * @throws ApiException
   */
  public function create(DistrictDTO $dto): void
  {
    $auth = $this->authService->requireAuth();
    if (($auth['role'] ?? '') !== AllowedUserRoles::ADMIN) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }

    $dto->validate();
    $this->requireValidCanton($dto->cantonSnitCode);

    if ($this->repository->existsBySnitCode($dto->districtSnitCode)) {
      throw new ApiException(
        ErrorType::conflict("District SNIT code {$dto->districtSnitCode} already exists"),
        409
      );
    }

    $this->repository->create($dto, $auth['user_id']);
  }

  /**
   * Updates an existing district (admin only).
   *
   * @param string $districtId
   * @param DistrictDTO $dto
   * @throws ApiException
   */
  public function update(string $districtId, DistrictDTO $dto): void
  {
    $auth = $this->authService->requireAuth();
    if (($auth['role'] ?? '') !== AllowedUserRoles::ADMIN) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }

    $dto->validate();
    $this->requireValidCanton($dto->cantonSnitCode);

    $existing = $this->repository->findById($districtId);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('District'), 404);
    }

    if ($existing->districtSnitCode !== $dto->districtSnitCode) {
      if ($this->repository->existsBySnitCode($dto->districtSnitCode)) {
        throw new ApiException(
          ErrorType::conflict("District SNIT code {$dto->districtSnitCode} already exists"),
          409
        );
      }
    }

    $updated = $this->repository->update($districtId, $dto);
    if (!$updated) {
      throw new ApiException(ErrorType::internal('Failed to update district'), 500);
    }
  }

  /**
   * Deletes a district (admin only).
   *
   * @param string $districtId
   * @throws ApiException
   */
  public function delete(string $districtId): void
  {
    $auth = $this->authService->requireAuth();
    if (($auth['role'] ?? '') !== AllowedUserRoles::ADMIN) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }

    $district = $this->repository->findById($districtId);
    if (!$district) {
      throw new ApiException(ErrorType::notFound('District'), 404);
    }

    $deleted = $this->repository->delete($districtId);
    if (!$deleted) {
      throw new ApiException(ErrorType::internal('Failed to delete district'), 500);
    }
  }
}