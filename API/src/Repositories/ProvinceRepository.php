<?php
declare(strict_types=1);

namespace Repositories;

use PDO;
use DTO\ProvinceDTO;

/**
 * Repository for managing provinces.
 */
final class ProvinceRepository extends Repository
{
  /**
   * Finds a province by its SNIT code.
   *
   * @param int $snitCode
   * @return ProvinceDTO|null
   */
  public function findBySnitCode(int $snitCode): ?ProvinceDTO
  {
    $sql = "SELECT province_id, province_snit_code, province_name, created_by, created_at
                FROM provinces
                WHERE province_snit_code = :snit_code";
    $stmt = $this->execute($sql, [':snit_code' => $snitCode]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? ProvinceDTO::fromDatabase($row) : null;
  }

  /**
   * Finds a province by its ULID.
   *
   * @param string $provinceId
   * @return ProvinceDTO|null
   */
  public function findById(string $provinceId): ?ProvinceDTO
  {
    $sql = "SELECT province_id, province_snit_code, province_name, created_by, created_at
                FROM provinces
                WHERE province_id = :id";
    $stmt = $this->execute($sql, [':id' => $provinceId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? ProvinceDTO::fromDatabase($row) : null;
  }

  /**
   * Finds a province by name.
   *
   * @param string $name
   * @return ProvinceDTO|null
   */
  public function findByName(string $name): ?ProvinceDTO
  {
    $sql = "SELECT province_id, province_snit_code, province_name, created_by, created_at
                FROM provinces
                WHERE province_name = :name";
    $stmt = $this->execute($sql, [':name' => $name]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? ProvinceDTO::fromDatabase($row) : null;
  }

  /**
   * Returns all provinces.
   *
   * @return ProvinceDTO[]
   */
  public function getAll(): array
  {
    $sql = "SELECT province_id, province_snit_code, province_name, created_by, created_at
                FROM provinces
                ORDER BY province_name";
    $stmt = $this->execute($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return array_map([ProvinceDTO::class, 'fromDatabase'], $rows);
  }

  /**
   * Checks if a province with the given SNIT code exists.
   *
   * @param int $snitCode
   * @return bool
   */
  public function existsBySnitCode(int $snitCode): bool
  {
    $sql = "SELECT 1 FROM provinces WHERE province_snit_code = :snit_code LIMIT 1";
    $stmt = $this->execute($sql, [':snit_code' => $snitCode]);
    return (bool) $stmt->fetchColumn();
  }

  /**
   * Creates a new province.
   *
   * @param ProvinceDTO $dto
   * @param string $createdBy
   * @return ProvinceDTO
   */
  public function create(ProvinceDTO $dto, string $createdBy): ProvinceDTO
  {
    $provinceId = $this->generateUlid();
    $sql = "INSERT INTO provinces (province_id, province_snit_code, province_name, created_by, created_at)
                VALUES (:id, :snit, :name, :created_by, NOW())";
    $this->execute($sql, [
      ':id' => $provinceId,
      ':snit' => $dto->provinceSnitCode,
      ':name' => $dto->provinceName,
      ':created_by' => $createdBy
    ]);
    return $this->findById($provinceId);
  }

  /**
   * Updates an existing province.
   *
   * @param string $provinceId
   * @param ProvinceDTO $dto
   * @return bool
   */
  public function update(string $provinceId, ProvinceDTO $dto): bool
  {
    $sql = "UPDATE provinces SET province_name = :name, province_snit_code = :snit
                WHERE province_id = :id";
    $stmt = $this->execute($sql, [
      ':name' => $dto->provinceName,
      ':snit' => $dto->provinceSnitCode,
      ':id' => $provinceId
    ]);
    return $stmt->rowCount() > 0;
  }

  /**
   * Deletes a province (cascade is handled by foreign keys).
   *
   * @param string $provinceId
   * @return bool
   */
  public function delete(string $provinceId): bool
  {
    $sql = "DELETE FROM provinces WHERE province_id = :id";
    $stmt = $this->execute($sql, [':id' => $provinceId]);
    return $stmt->rowCount() > 0;
  }
}