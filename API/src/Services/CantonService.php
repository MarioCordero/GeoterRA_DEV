<?php
declare(strict_types=1);

namespace Services;

use PDO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use DTO\CantonDTO;
use DTO\AllowedUserRoles;
use Repositories\CantonRepository;
use Repositories\ProvinceRepository;

/**
 * Business logic for cantons.
 */
final class CantonService
{
  private CantonRepository $repository;
  private ProvinceRepository $provinceRepository;

  public function __construct(private readonly PDO $pdo)
  {
    $this->repository = new CantonRepository($this->pdo);
    $this->provinceRepository = new ProvinceRepository($this->pdo);
  }

  /**
   * Ensures the referenced province exists.
   *
   * @param int $provinceSnitCode
   * @throws ApiException
   */
  private function requireValidProvince(int $provinceSnitCode): void
  {
    if (!$this->provinceRepository->existsBySnitCode($provinceSnitCode)) {
      throw new ApiException(
        ErrorType::invalidField('province_snit_code'),
        422
      );
    }
  }

  /**
   * Retrieves all cantons, optionally filtered by province SNIT code.
   *
   * @param int|null $provinceSnitCode
   * @return array
   */
  public function getAll(?int $provinceSnitCode = null): array
  {
    $cantons = $this->repository->getAll($provinceSnitCode);
    return array_map(fn($dto) => [
      'canton_id' => $dto->cantonId,
      'province_snit_code' => $dto->provinceSnitCode,
      'canton_snit_code' => $dto->cantonSnitCode,
      'canton_name' => $dto->cantonName,
      'created_at' => $dto->createdAt,
    ], $cantons);
  }

  /**
   * Retrieves a canton by its ULID.
   *
   * @param string $cantonId
   * @return array
   * @throws ApiException
   */
  public function getById(string $cantonId): array
  {

    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
      AllowedUserRoles::MAINTENANCE
    ]);

    $canton = $this->repository->findById($cantonId);
    if (!$canton) {
      throw new ApiException(ErrorType::notFound('Canton'), 404);
    }
    return [
      'canton_id' => $canton->cantonId,
      'province_snit_code' => $canton->provinceSnitCode,
      'canton_snit_code' => $canton->cantonSnitCode,
      'canton_name' => $canton->cantonName,
      'created_at' => $canton->createdAt,
    ];
  }

  /**
   * Retrieves a canton by its SNIT code.
   *
   * @param int $snitCode
   * @return array
   * @throws ApiException
   */
  public function getBySnitCode(int $snitCode): array
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR,
      AllowedUserRoles::MAINTENANCE
    ]);

    $canton = $this->repository->findBySnitCode($snitCode);
    if (!$canton) {
      throw new ApiException(ErrorType::notFound('Canton'), 404);
    }
    return [
      'canton_id' => $canton->cantonId,
      'province_snit_code' => $canton->provinceSnitCode,
      'canton_snit_code' => $canton->cantonSnitCode,
      'canton_name' => $canton->cantonName,
      'created_at' => $canton->createdAt,
    ];
  }

  /**
   * Creates a new canton (admin only).
   *
   * @param CantonDTO $dto
   * @throws ApiException
   */
  public function create(CantonDTO $dto): void
  {
    $auth = Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR
    ]);

    $dto->validate();
    $this->requireValidProvince($dto->provinceSnitCode);

    if ($this->repository->existsBySnitCode($dto->cantonSnitCode)) {
      throw new ApiException(
        ErrorType::conflict(
          "Canton SNIT code {$dto->cantonSnitCode} already exists"
        ),
        409
      );
    }

    $this->repository->create($dto, $auth['user_id']);
  }

  /**
   * Updates an existing canton (admin only).
   *
   * @param string $cantonId
   * @param CantonDTO $dto
   * @throws ApiException
   */
  public function update(string $cantonId, CantonDTO $dto): void
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR
    ]);

    $dto->validate();
    $this->requireValidProvince($dto->provinceSnitCode);

    $existing = $this->repository->findById($cantonId);
    if (!$existing) {
      throw new ApiException(ErrorType::notFound('Canton'), 404);
    }

    // Check SNIT code uniqueness if changed
    if ($existing->cantonSnitCode !== $dto->cantonSnitCode) {
      if ($this->repository->existsBySnitCode($dto->cantonSnitCode)) {
        throw new ApiException(
          ErrorType::conflict(
            "Canton SNIT code {$dto->cantonSnitCode} already exists"
          ),
          409
        );
      }
    }

    $updated = $this->repository->update($cantonId, $dto);
    if (!$updated) {
      throw new ApiException(
        ErrorType::internal('Failed to update canton'),
        500
      );
    }
  }

  /**
   * Deletes a canton (admin only). Cascades to districts.
   *
   * @param string $cantonId
   * @throws ApiException
   */
  public function delete(string $cantonId): void
  {
    Request::requireRole([
      AllowedUserRoles::ADMIN,
      AllowedUserRoles::FIELD_INVESTIGATOR,
      AllowedUserRoles::INVESTIGATOR
    ]);

    $canton = $this->repository->findById($cantonId);
    if (!$canton) {
      throw new ApiException(ErrorType::notFound('Canton'), 404);
    }

    $deleted = $this->repository->delete($cantonId);
    if (!$deleted) {
      throw new ApiException(
        ErrorType::internal('Failed to delete canton'),
        500
      );
    }
  }
}