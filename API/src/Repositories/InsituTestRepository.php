<?php
declare(strict_types=1);

namespace Repositories;

use DTO\RegisterInsituTestDTO;
use DTO\UpdateInsituTestDTO;
use PDO;

/**
 * Repository for in-situ tests (insitu_tests table).
 */
final class InsituTestRepository extends Repository
{
  /**
   * Finds an in-situ test by its ULID, including creator user info.
   *
   * @param string $id
   * @return array|null Associative array or null if not found
   */
  public function findById(string $id): ?array
  {
    $sql = "SELECT t.*,
                       u.first_name AS created_by_first_name,
                       u.last_name AS created_by_last_name
                FROM insitu_tests t
                LEFT JOIN users u ON t.created_by = u.user_id
                WHERE t.insitu_test_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  /**
   * Returns all in-situ tests for a given geomanifestation, including creator user info.
   *
   * @param string $geomanifestationId
   * @return array[]
   */
  public function getByManifestation(string $geomanifestationId): array
  {
    $sql = "SELECT t.*,
                       u.first_name AS created_by_first_name,
                       u.last_name AS created_by_last_name
                FROM insitu_tests t
                LEFT JOIN users u ON t.created_by = u.user_id
                WHERE t.geomanifestation_id = :gm_id
                ORDER BY t.created_at DESC";
    return $this->execute($sql, [':gm_id' => $geomanifestationId])->fetchAll(
      PDO::FETCH_ASSOC
    );
  }

  /**
   * Creates a new in-situ test.
   *
   * @param RegisterInsituTestDTO $dto
   * @param string $createdBy User ULID
   * @return array The result row.
   */
  public function create(RegisterInsituTestDTO $dto, string $createdBy): array
  {
    $id = $this->generateUlid();
    $sql = "INSERT INTO insitu_tests (
                    insitu_test_id, geomanifestation_id, temperature, conductivity,
                    ph, description, created_by, created_at
                ) VALUES (
                    :id, :gm_id, :temp, :cond, :ph, :desc, :created_by, NOW()
                )";
    $this->execute(
      $sql, [
        ':id' => $id,
        ':gm_id' => $dto->geomanifestationId,
        ':temp' => $dto->temperature,
        ':cond' => $dto->conductivity,
        ':ph' => $dto->ph,
        ':desc' => $dto->description,
        ':created_by' => $createdBy
      ]
    );

    return $this->findById($id);
  }

  /**
   * Updates an existing in-situ test using only provided fields.
   *
   * @param string $id
   * @param UpdateInsituTestDTO $dto
   * @return array|null Not null if at least one row was affected
   */
  public function update(string $id, UpdateInsituTestDTO $dto): ?array
  {
    $updateData = $dto->toArray();
    if (empty($updateData)) {
      return null;
    }

    $sql = "UPDATE insitu_tests SET ";
    $params = [];
    $setParts = [];
    foreach ($updateData as $field => $value) {
      $setParts[] = "$field = :$field";
      $params[":$field"] = $value;
    }
    $sql .= implode(', ', $setParts);
    $sql .= " WHERE insitu_test_id = :id";
    $params[':id'] = $id;

    $this->execute($sql, $params);

    return $this->findById($id);
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