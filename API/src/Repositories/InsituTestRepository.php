<?php
declare(strict_types=1);

namespace Repositories;

use PDO;
use DTO\InsituTestDTO;

/**
 * Repository for in-situ tests (insitu_tests table).
 */
final class InsituTestRepository extends Repository
{
  /**
   * Finds an in-situ test by its ULID.
   *
   * @param string $id
   * @return InsituTestDTO|null
   */
  public function findById(string $id): ?InsituTestDTO
  {
    $sql = "SELECT insitu_test_id, geomanifestation_id, temperature, conductivity,
                       ph, description, created_at, created_by
                FROM insitu_tests
                WHERE insitu_test_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? InsituTestDTO::fromDatabase($row) : null;
  }

  /**
   * Returns all in-situ tests for a given geomanifestation.
   *
   * @param string $geomanifestationId
   * @return InsituTestDTO[]
   */
  public function getByManifestation(string $geomanifestationId): array
  {
    $sql = "SELECT insitu_test_id, geomanifestation_id, temperature, conductivity,
                       ph, description, created_at, created_by
                FROM insitu_tests
                WHERE geomanifestation_id = :gm_id
                ORDER BY created_at DESC";
    $stmt = $this->execute($sql, [':gm_id' => $geomanifestationId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return array_map([InsituTestDTO::class, 'fromDatabase'], $rows);
  }

  /**
   * Creates a new in-situ test.
   *
   * @param InsituTestDTO $dto
   * @param string $createdBy
   * @return string The generated ULID
   */
  public function create(InsituTestDTO $dto, string $createdBy): string
  {
    $id = $this->generateUlid();
    $sql = "INSERT INTO insitu_tests (
                    insitu_test_id, geomanifestation_id, temperature, conductivity,
                    ph, description, created_by, created_at
                ) VALUES (
                    :id, :gm_id, :temp, :cond, :ph, :desc, :created_by, NOW()
                )";
    $this->execute($sql, [
      ':id' => $id,
      ':gm_id' => $dto->geomanifestationId,
      ':temp' => $dto->temperature,
      ':cond' => $dto->conductivity,
      ':ph' => $dto->ph,
      ':desc' => $dto->description,
      ':created_by' => $createdBy
    ]);
    return $id;
  }

  /**
   * Updates an existing in-situ test.
   *
   * @param string $id
   * @param InsituTestDTO $dto
   * @return bool
   */
  public function update(string $id, InsituTestDTO $dto): bool
  {
    $sql = "UPDATE insitu_tests SET
                    geomanifestation_id = :gm_id,
                    temperature = :temp,
                    conductivity = :cond,
                    ph = :ph,
                    description = :desc
                WHERE insitu_test_id = :id";
    $stmt = $this->execute($sql, [
      ':gm_id' => $dto->geomanifestationId,
      ':temp' => $dto->temperature,
      ':cond' => $dto->conductivity,
      ':ph' => $dto->ph,
      ':desc' => $dto->description,
      ':id' => $id
    ]);
    return $stmt->rowCount() > 0;
  }

  /**
   * Deletes an in-situ test.
   *
   * @param string $id
   * @return bool
   */
  public function delete(string $id): bool
  {
    $sql = "DELETE FROM insitu_tests WHERE insitu_test_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    return $stmt->rowCount() > 0;
  }
}