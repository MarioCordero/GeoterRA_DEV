<?php
declare(strict_types=1);

namespace Repositories;

use DTO\RegisterInlabTestDTO;
use DTO\UpdateInlabTestDTO;
use PDO;

/**
 * Repository for in-lab tests (inlab_tests table).
 */
final class InlabTestRepository extends Repository
{
  /**
   * Finds an in-lab test by its ULID, including creator user info.
   *
   * @param string $id
   * @return array|null Associative array or null if not found
   */
  public function findById(string $id): ?array
  {
    $sql = "SELECT t.*,
                       u.first_name AS created_by_first_name,
                       u.last_name AS created_by_last_name
                FROM inlab_tests t
                LEFT JOIN users u ON t.created_by = u.user_id
                WHERE t.inlab_test_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  /**
   * Returns all in-lab tests for a given geomanifestation, including creator user info.
   *
   * @param string $geomanifestationId
   * @return array[]
   */
  public function getByManifestation(string $geomanifestationId): array
  {
    $sql = "SELECT t.*,
                       u.first_name AS created_by_first_name,
                       u.last_name AS created_by_last_name
                FROM inlab_tests t
                LEFT JOIN users u ON t.created_by = u.user_id
                WHERE t.geomanifestation_id = :gm_id
                ORDER BY t.created_at DESC";
    return $this->execute($sql, [':gm_id' => $geomanifestationId])->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
   * Creates a new in-lab test.
   *
   * @param RegisterInlabTestDTO $dto
   * @param string $createdBy User ULID
   * @return string The generated ULID
   */
  public function create(RegisterInlabTestDTO $dto, string $createdBy): ?array
  {
    $id = $this->generateUlid();
    $sql = "INSERT INTO inlab_tests (
                    inlab_test_id, geomanifestation_id,
                    ph, conductivity, cl, ca, hco3, so4, fe, si, b, li, f, na, k, mg,
                    description, created_by, created_at
                ) VALUES (
                    :id, :gm_id,
                    :ph, :cond, :cl, :ca, :hco3, :so4, :fe, :si, :b, :li, :f, :na, :k, :mg,
                    :desc, :created_by, NOW()
                )";
    $this->execute(
      $sql, [
      ':id' => $id,
      ':gm_id' => $dto->geomanifestationId,
      ':ph' => $dto->ph,
      ':cond' => $dto->conductivity,
      ':cl' => $dto->cl,
      ':ca' => $dto->ca,
      ':hco3' => $dto->hco3,
      ':so4' => $dto->so4,
      ':fe' => $dto->fe,
      ':si' => $dto->si,
      ':b' => $dto->b,
      ':li' => $dto->li,
      ':f' => $dto->f,
      ':na' => $dto->na,
      ':k' => $dto->k,
      ':mg' => $dto->mg,
      ':desc' => $dto->description,
      ':created_by' => $createdBy
    ]
    );

    $row = $this->findById($id);
    return $row ?: null;
  }

  /**
   * Updates an existing in-lab test using only provided fields.
   *
   * @param string $id
   * @param UpdateInlabTestDTO $dto
   * @return array|null Not null if at least one row was affected
   */
  public function update(string $id, UpdateInlabTestDTO $dto): ?array
  {
    $updateData = $dto->toArray();
    if (empty($updateData)) {
      return null;
    }

    $sql = "UPDATE inlab_tests SET ";
    $params = [];
    $setParts = [];
    foreach ($updateData as $field => $value) {
      $setParts[] = "$field = :$field";
      $params[":$field"] = $value;
    }
    $sql .= implode(', ', $setParts);
    $sql .= " WHERE inlab_test_id = :id";
    $params[':id'] = $id;

    $this->execute($sql, $params);
    $row = $this->findById($id);
    return $row ?: null;
  }

  /**
   * Deletes an in-lab test.
   *
   * @param string $id
   * @return bool
   */
  public function delete(string $id): bool
  {
    $sql = "DELETE FROM inlab_tests WHERE inlab_test_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    return $stmt->rowCount() > 0;
  }
}