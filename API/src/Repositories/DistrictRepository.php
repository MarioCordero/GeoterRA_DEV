<?php
declare(strict_types=1);

namespace Repositories;

use PDO;
use DTO\DistrictDTO;

/**
 * Repository for managing districts.
 */
final class DistrictRepository extends Repository
{
  /**
   * Finds a district by its SNIT code.
   *
   * @param int $snitCode
   * @return DistrictDTO|null
   */
  public function findBySnitCode(int $snitCode): ?DistrictDTO
  {
    $sql = "SELECT district_id, canton_snit_code, district_snit_code, district_name, created_by, created_at
                FROM districts
                WHERE district_snit_code = :snit_code";
    $stmt = $this->execute($sql, [':snit_code' => $snitCode]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? DistrictDTO::fromDatabase($row) : null;
  }

  /**
   * Finds a district by its ULID.
   *
   * @param string $districtId
   * @return DistrictDTO|null
   */
  public function findById(string $districtId): ?DistrictDTO
  {
    $sql = "SELECT district_id, canton_snit_code, district_snit_code, district_name, created_by, created_at
                FROM districts
                WHERE district_id = :id";
    $stmt = $this->execute($sql, [':id' => $districtId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? DistrictDTO::fromDatabase($row) : null;
  }

  /**
   * Finds a district by name within a canton.
   *
   * @param string $name
   * @param int $cantonSnitCode
   * @return DistrictDTO|null
   */
  public function findByName(string $name, int $cantonSnitCode): ?DistrictDTO
  {
    $sql = "SELECT district_id, canton_snit_code, district_snit_code, district_name, created_by, created_at
                FROM districts
                WHERE district_name = :name AND canton_snit_code = :canton_snit";
    $stmt = $this->execute($sql, [':name' => $name, ':canton_snit' => $cantonSnitCode]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? DistrictDTO::fromDatabase($row) : null;
  }

  /**
   * Returns all districts belonging to a canton.
   *
   * @param int $cantonSnitCode
   * @return DistrictDTO[]
   */
  public function getByCantonSnitCode(int $cantonSnitCode): array
  {
    $sql = "SELECT district_id, canton_snit_code, district_snit_code, district_name, created_by, created_at
                FROM districts
                WHERE canton_snit_code = :canton_snit
                ORDER BY district_name";
    $stmt = $this->execute($sql, [':canton_snit' => $cantonSnitCode]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return array_map([DistrictDTO::class, 'fromDatabase'], $rows);
  }

  /**
   * Returns all districts.
   *
   * @return DistrictDTO[]
   */
  public function getAll(): array
  {
    $sql = "SELECT district_id, canton_snit_code, district_snit_code, district_name, created_by, created_at
                FROM districts
                ORDER BY district_name";
    $stmt = $this->execute($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return array_map([DistrictDTO::class, 'fromDatabase'], $rows);
  }

  /**
   * Checks if a district with the given SNIT code exists.
   *
   * @param int $snitCode
   * @return bool
   */
  public function existsBySnitCode(int $snitCode): bool
  {
    $sql = "SELECT 1 FROM districts WHERE district_snit_code = :snit_code LIMIT 1";
    $stmt = $this->execute($sql, [':snit_code' => $snitCode]);
    return (bool) $stmt->fetchColumn();
  }

  /**
   * Creates a new district.
   *
   * @param DistrictDTO $dto
   * @param string $createdBy
   * @return DistrictDTO
   */
  public function create(DistrictDTO $dto, string $createdBy): DistrictDTO
  {
    $districtId = $this->generateUlid();
    $sql = "INSERT INTO districts (district_id, canton_snit_code, district_snit_code, district_name, created_by, created_at)
                VALUES (:id, :canton_snit, :district_snit, :name, :created_by, NOW())";
    $this->execute($sql, [
      ':id' => $districtId,
      ':canton_snit' => $dto->cantonSnitCode,
      ':district_snit' => $dto->districtSnitCode,
      ':name' => $dto->districtName,
      ':created_by' => $createdBy
    ]);
    return $this->findById($districtId);
  }

  /**
   * Updates a district.
   *
   * @param string $districtId
   * @param DistrictDTO $dto
   * @return bool
   */
  public function update(string $districtId, DistrictDTO $dto): bool
  {
    $sql = "UPDATE districts SET district_name = :name, canton_snit_code = :canton_snit,
                district_snit_code = :district_snit
                WHERE district_id = :id";
    $stmt = $this->execute($sql, [
      ':name' => $dto->districtName,
      ':canton_snit' => $dto->cantonSnitCode,
      ':district_snit' => $dto->districtSnitCode,
      ':id' => $districtId
    ]);
    return $stmt->rowCount() > 0;
  }

  /**
   * Deletes a district.
   *
   * @param string $districtId
   * @return bool
   */
  public function delete(string $districtId): bool
  {
    $sql = "DELETE FROM districts WHERE district_id = :id";
    $stmt = $this->execute($sql, [':id' => $districtId]);
    return $stmt->rowCount() > 0;
  }
}