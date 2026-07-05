<?php
declare(strict_types=1);

namespace Repositories;

use DTO\RegisterGeoreportDTO;
use DTO\UpdateGeoreportDTO;
use PDO;

/**
 * Repository for geothermal reports (georeports table).
 */
final class GeoreportRepository extends Repository
{
  /**
   * Returns all georeports for a given geomanifestation, including creator user info.
   *
   * @param string $geomanifestationId
   * @return array[]
   */
  public function getByManifestation(string $geomanifestationId): array
  {
    $sql = "SELECT g.*,
                       u.first_name AS created_by_first_name,
                       u.last_name AS created_by_last_name
                FROM georeports g
                LEFT JOIN users u ON g.created_by = u.user_id
                WHERE g.geomanifestation_id = :gm_id
                ORDER BY g.created_at DESC";
    $stmt = $this->execute($sql, [':gm_id' => $geomanifestationId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
   * Returns the current (latest) georeport for a geomanifestation.
   *
   * @param string $geomanifestationId
   * @return array|null
   */
  public function getCurrentByManifestation(string $geomanifestationId): ?array
  {
    $sql = "SELECT g.*,
                       u.first_name AS created_by_first_name,
                       u.last_name AS created_by_last_name
                FROM georeports g
                INNER JOIN geomanifestations gm ON gm.current_georeport_id = g.georeport_id
                LEFT JOIN users u ON g.created_by = u.user_id
                WHERE gm.geomanifestation_id = :gm_id
                LIMIT 1";
    $stmt = $this->execute($sql, [':gm_id' => $geomanifestationId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  /**
   * Creates a new georeport.
   *
   * @param RegisterGeoreportDTO $dto
   * @param string $createdBy User ULID
   * @return array|null The created record with creator info, or null on failure
   */
  public function create(RegisterGeoreportDTO $dto, string $createdBy): ?array
  {
    $id = $this->generateUlid();
    $sql = "INSERT INTO georeports (
                    georeport_id, geomanifestation_id, insitu_test_id, inlab_test_id,
                    details, created_by, created_at
                ) VALUES (
                    :id, :gm_id, :insitu_id, :inlab_id, :details, :created_by, NOW()
                )";
    $this->execute(
      $sql, [
      ':id' => $id,
      ':gm_id' => $dto->geomanifestationId,
      ':insitu_id' => $dto->insituTestId,
      ':inlab_id' => $dto->inlabTestId,
      ':details' => $dto->details,
      ':created_by' => $createdBy
    ]
    );

    return $this->findById($id);
  }

  /**
   * Finds a georeport by its ULID, including creator user info.
   *
   * @param string $id
   * @return array|null Associative array or null if not found
   */
  public function findById(string $id): ?array
  {
    $sql = "SELECT g.*,
                       u.first_name AS created_by_first_name,
                       u.last_name AS created_by_last_name
                FROM georeports g
                LEFT JOIN users u ON g.created_by = u.user_id
                WHERE g.georeport_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  /**
   * Updates an existing georeport using only provided fields.
   *
   * @param string $id
   * @param UpdateGeoreportDTO $dto
   * @return array|null The updated record with creator info, or null if no changes
   */
  public function update(string $id, UpdateGeoreportDTO $dto): ?array
  {
    $updateData = $dto->toArray();
    if (empty($updateData)) {
      return $this->findById($id);
    }

    $sql = "UPDATE georeports SET ";
    $params = [];
    $setParts = [];
    foreach ($updateData as $field => $value) {
      $setParts[] = "$field = :$field";
      $params[":$field"] = $value;
    }
    $sql .= implode(', ', $setParts);
    $sql .= " WHERE georeport_id = :id";
    $params[':id'] = $id;

    $this->execute($sql, $params);

    return $this->findById($id);
  }

  /**
   * Deletes a georeport.
   *
   * @param string $id
   * @return bool
   */
  public function delete(string $id): bool
  {
    $sql = "DELETE FROM georeports WHERE georeport_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    return $stmt->rowCount() > 0;
  }

  /**
   * Updates the current_georeport_id in the associated geomanifestation.
   *
   * @param string $geomanifestationId
   * @param string|null $georeportId
   * @return bool
   */
  public function setAsCurrentForManifestation(
    string $geomanifestationId,
    ?string $georeportId
  ): bool {
    $sql = "UPDATE geomanifestations
                SET current_georeport_id = :georeport_id
                WHERE geomanifestation_id = :gm_id";
    $stmt = $this->execute(
      $sql, [
      ':georeport_id' => $georeportId,
      ':gm_id' => $geomanifestationId
    ]
    );
    return $stmt->rowCount() > 0;
  }
}