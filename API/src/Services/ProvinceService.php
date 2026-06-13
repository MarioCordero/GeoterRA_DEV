<?php
declare(strict_types=1);

namespace Services;

use PDO;
use Http\ApiException;
use Http\ErrorType;
use DTO\ProvinceDTO;
use DTO\AllowedUserRoles;
use Repositories\ProvinceRepository;

/**
 * Business logic for provinces.
 */
final class ProvinceService
{
  private ProvinceRepository $repository;
  private AuthService $authService;

  public function __construct(private PDO $pdo)
  {
    $this->repository = new ProvinceRepository($pdo);
    $this->authService = new AuthService($pdo);
  }

  /**
   * Retrieves all provinces.
   *
   * @return array
   */
  public function getAll(): array
  {
    $provinces = $this->repository->getAll();
    return array_map(fn($dto) => [
      'province_id' => $dto->provinceId,
      'province_snit_code' => $dto->provinceSnitCode,
      'province_name' => $dto->provinceName,
      'created_at' => $dto->createdAt,
    ], $provinces);
  }

  /**
   * Retrieves a province by its ULID.
   *
   * @param string $provinceId
   * @return array
   * @throws ApiException
   */
  public function getById(string $provinceId): array
  {
    $province = $this->repository->findById($provinceId);
    if (!$province) {
      throw new ApiException(ErrorType::notFound('Province'), 404);
    }
    return [
      'province_id' => $province->provinceId,
      'province_snit_code' => $province->provinceSnitCode,
      'province_name' => $province->provinceName,
      'created_at' => $province->createdAt,
    ];
  }

  /**
   * Retrieves a province by its SNIT code.
   *
   * @param int $snitCode
   * @return array
   * @throws ApiException
   */
  public function getBySnitCode(int $snitCode): array
  {
    $province = $this->repository->findBySnitCode($snitCode);
    if (!$province) {
      throw new ApiException(ErrorType::notFound('Province'), 404);
    }
    return [
      'province_id' => $province->provinceId,
      'province_snit_code' => $province->provinceSnitCode,
      'province_name' => $province->provinceName,
      'created_at' => $province->createdAt,
    ];
  }

  /**
   * Creates a new province (admin only).
   *
   * @param ProvinceDTO $dto
   * @throws ApiException
   */
  public function create(ProvinceDTO $dto): void
  {
    $auth = $this->authService->requireAuth();
    if (($auth['role'] ?? '') !== AllowedUserRoles::ADMIN) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }

    $dto->validate();

    // Check uniqueness of SNIT code
    if ($this->repository->existsBySnitCode($dto->provinceSnitCode)) {
      throw new ApiException(
        ErrorType::conflict("Province SNIT code {$dto->provinceSnitCode} already exists"),
        409
      );
    }

    $this->repository->create($dto, $auth['user_id']);
  }

  /**
   * Updates an existing province (admin only).
   *
   * @param string $provinceId
   * @param ProvinceDTO $dto
   * @throws ApiException
   */
  public function update(string $provinceId, ProvinceDTO $dto): void
  {
    $auth = $this->authService->requireAuth();
    if (($auth['role'] ?? '') !== AllowedUserRoles::ADMIN) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }

    $dto->validate();

    $existing = $this->repository->findById($provinceId);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('Province'), 404);
    }

    // If SNIT code changed, ensure it's not taken by another province
    if ($existing->provinceSnitCode !== $dto->provinceSnitCode) {
      error_log("Province SNIT code change detected for province ID {$provinceId}: {$existing->provinceSnitCode} -> {$dto->provinceSnitCode}");
      if ($this->repository->existsBySnitCode($dto->provinceSnitCode)) {
        throw new ApiException(
          ErrorType::conflict("Province SNIT code {$dto->provinceSnitCode} already exists"),
          409
        );
      }
    }

    $updated = $this->repository->update($provinceId, $dto);
    if (!$updated) {
      throw new ApiException(ErrorType::internal('Failed to update province'), 500);
    }
  }

  /**
   * Deletes a province (admin only). Cascades to cantons and districts.
   *
   * @param string $provinceId
   * @throws ApiException
   */
  public function delete(string $provinceId): void
  {
    $auth = $this->authService->requireAuth();
    if (($auth['role'] ?? '') !== AllowedUserRoles::ADMIN) {
      throw new ApiException(ErrorType::forbidden(), 403);
    }

    $province = $this->repository->findById($provinceId);
    if (!$province) {
      throw new ApiException(ErrorType::notFound('Province'), 404);
    }

    $deleted = $this->repository->delete($provinceId);
    if (!$deleted) {
      throw new ApiException(ErrorType::internal('Failed to delete province'), 500);
    }
  }
}