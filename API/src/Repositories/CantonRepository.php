<?php
declare(strict_types=1);

namespace Repositories;

use PDO;
use DTO\CantonDTO;

/**
 * Repository for managing cantons.
 */
final class CantonRepository extends Repository
{
  /**
   * Finds a canton by its SNIT code.
   *
   * @param int $snitCode
   * @return CantonDTO|null
   */
  public function findBySnitCode(int $snitCode): ?CantonDTO
  {
    $sql = "SELECT canton_id, province_snit_code, canton_snit_code, canton_name, created_by, created_at
                FROM cantons
                WHERE canton_snit_code = :snit_code";
    $stmt = $this->execute($sql, [':snit_code' => $snitCode]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? CantonDTO::fromDatabase($row) : null;
  }

  /**
   * Finds a canton by its ULID.
   *
   * @param string $cantonId
   * @return CantonDTO|null
   */
  public function findById(string $cantonId): ?CantonDTO
  {
    $sql = "SELECT canton_id, province_snit_code, canton_snit_code, canton_name, created_by, created_at
                FROM cantons
                WHERE canton_id = :id";
    $stmt = $this->execute($sql, [':id' => $cantonId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? CantonDTO::fromDatabase($row) : null;
  }

  /**
   * Finds a canton by name within a province.
   *
   * @param string $name
   * @param int $provinceSnitCode
   * @return CantonDTO|null
   */
  public function findByName(string $name, int $provinceSnitCode): ?CantonDTO
  {
    $sql = "SELECT canton_id, province_snit_code, canton_snit_code, canton_name, created_by, created_at
                FROM cantons
                WHERE canton_name = :name AND province_snit_code = :province_snit";
    $stmt = $this->execute($sql, [':name' => $name, ':province_snit' => $provinceSnitCode]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? CantonDTO::fromDatabase($row) : null;
  }

  /**
   * Returns all cantons belonging to a province.
   *
   * @param int $provinceSnitCode
   * @return CantonDTO[]
   */
  public function getByProvinceSnitCode(int $provinceSnitCode): array
  {
    $sql = "SELECT canton_id, province_snit_code, canton_snit_code, canton_name, created_by, created_at
                FROM cantons
                WHERE province_snit_code = :province_snit
                ORDER BY canton_name";
    $stmt = $this->execute($sql, [':province_snit' => $provinceSnitCode]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return array_map([CantonDTO::class, 'fromDatabase'], $rows);
  }

  /**
   * Returns all cantons (optionally filtered by province SNIT code).
   *
   * @param int|null $provinceSnitCode
   * @return CantonDTO[]
   */
  public function getAll(?int $provinceSnitCode = null): array
  {
    $sql = "SELECT canton_id, province_snit_code, canton_snit_code, canton_name, created_by, created_at
                FROM cantons";
    $params = [];
    if ($provinceSnitCode !== null) {
      $sql .= " WHERE province_snit_code = :province_snit";
      $params[':province_snit'] = $provinceSnitCode;
    }
    $sql .= " ORDER BY canton_name";
    $stmt = $this->execute($sql, $params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return array_map([CantonDTO::class, 'fromDatabase'], $rows);
  }

  /**
   * Checks if a canton with the given SNIT code exists.
   *
   * @param int $snitCode
   * @return bool
   */
  public function existsBySnitCode(int $snitCode): bool
  {
    $sql = "SELECT 1 FROM cantons WHERE canton_snit_code = :snit_code LIMIT 1";
    $stmt = $this->execute($sql, [':snit_code' => $snitCode]);
    return (bool) $stmt->fetchColumn();
  }

  /**
   * Creates a new canton.
   *
   * @param CantonDTO $dto
   * @param string $createdBy
   * @return CantonDTO
   */
  public function create(CantonDTO $dto, string $createdBy): CantonDTO
  {
    $cantonId = $this->generateUlid();
    $sql = "INSERT INTO cantons (canton_id, province_snit_code, canton_snit_code, canton_name, created_by, created_at)
                VALUES (:id, :province_snit, :canton_snit, :name, :created_by, NOW())";
    $this->execute($sql, [
      ':id' => $cantonId,
      ':province_snit' => $dto->provinceSnitCode,
      ':canton_snit' => $dto->cantonSnitCode,
      ':name' => $dto->cantonName,
      ':created_by' => $createdBy
    ]);
    return $this->findById($cantonId);
  }

  /**
   * Updates a canton.
   *
   * @param string $cantonId
   * @param CantonDTO $dto
   * @return bool
   */
  public function update(string $cantonId, CantonDTO $dto): bool
  {
    $sql = "UPDATE cantons SET canton_name = :name, province_snit_code = :province_snit,
                canton_snit_code = :canton_snit
                WHERE canton_id = :id";
    $stmt = $this->execute($sql, [
      ':name' => $dto->cantonName,
      ':province_snit' => $dto->provinceSnitCode,
      ':canton_snit' => $dto->cantonSnitCode,
      ':id' => $cantonId
    ]);
    return $stmt->rowCount() > 0;
  }

  /**
   * Deletes a canton (cascade to districts).
   *
   * @param string $cantonId
   * @return bool
   */
  public function delete(string $cantonId): bool
  {
    $sql = "DELETE FROM cantons WHERE canton_id = :id";
    $stmt = $this->execute($sql, [':id' => $cantonId]);
    return $stmt->rowCount() > 0;
  }
}