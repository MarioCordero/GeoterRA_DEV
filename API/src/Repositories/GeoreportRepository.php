<?php
declare(strict_types=1);

namespace Repositories;

use PDO;
use DTO\GeoreportDTO;

/**
 * Repository for geothermal reports (georeports table).
 */
final class GeoreportRepository extends Repository
{
  /**
   * Finds a georeport by its ULID.
   *
   * @param string $id
   * @return GeoreportDTO|null
   */
  public function findById(string $id): ?GeoreportDTO
  {
    $sql = "SELECT georeport_id, geomanifestation_id, insitu_test_id,
                       inlab_test_id, details, created_by, created_at
                FROM georeports
                WHERE georeport_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? GeoreportDTO::fromDatabase($row) : null;
  }

  /**
   * Returns all georeports for a given geomanifestation.
   *
   * @param string $geomanifestationId
   * @return GeoreportDTO[]
   */
  public function getByManifestation(string $geomanifestationId): array
  {
    $sql = "SELECT georeport_id, geomanifestation_id, insitu_test_id,
                       inlab_test_id, details, created_by, created_at
                FROM georeports
                WHERE geomanifestation_id = :gm_id
                ORDER BY created_at DESC";
    $stmt = $this->execute($sql, [':gm_id' => $geomanifestationId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return array_map([GeoreportDTO::class, 'fromDatabase'], $rows);
  }

  /**
   * Returns the current (latest) georeport for a geomanifestation.
   *
   * @param string $geomanifestationId
   * @return GeoreportDTO|null
   */
  public function getCurrentByManifestation(
    string $geomanifestationId
  ): ?GeoreportDTO {
    // The current georeport ID is stored in geomanifestations.current_georeport_id
    $sql = "SELECT gr.*
                FROM georeports gr
                INNER JOIN geomanifestations gm ON gm.current_georeport_id = gr.georeport_id
                WHERE gm.geomanifestation_id = :gm_id
                LIMIT 1";
    $stmt = $this->execute($sql, [':gm_id' => $geomanifestationId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? GeoreportDTO::fromDatabase($row) : null;
  }

  /**
   * Creates a new georeport.
   *
   * @param GeoreportDTO $dto
   * @param string $createdBy
   * @return string The generated ULID
   */
  public function create(GeoreportDTO $dto, string $createdBy): string
  {
    $id = $this->generateUlid();
    $sql = "INSERT INTO georeports (
                    georeport_id, geomanifestation_id, insitu_test_id, inlab_test_id,
                    details, created_by, created_at
                ) VALUES (
                    :id, :gm_id, :insitu_id, :inlab_id, :details, :created_by, NOW()
                )";
    $this->execute($sql, [
      ':id' => $id,
      ':gm_id' => $dto->geomanifestationId,
      ':insitu_id' => $dto->insituTestId,
      ':inlab_id' => $dto->inlabTestId,
      ':details' => $dto->details,
      ':created_by' => $createdBy
    ]);
    return $id;
  }

  /**
   * Updates an existing georeport.
   *
   * @param string $id
   * @param GeoreportDTO $dto
   * @return bool
   */
  public function update(string $id, GeoreportDTO $dto): bool
  {
    $sql = "UPDATE georeports SET
                    geomanifestation_id = :gm_id,
                    insitu_test_id = :insitu_id,
                    inlab_test_id = :inlab_id,
                    details = :details
                WHERE georeport_id = :id";
    $stmt = $this->execute($sql, [
      ':gm_id' => $dto->geomanifestationId,
      ':insitu_id' => $dto->insituTestId,
      ':inlab_id' => $dto->inlabTestId,
      ':details' => $dto->details,
      ':id' => $id
    ]);
    return $stmt->rowCount() > 0;
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
    $stmt = $this->execute($sql, [
      ':georeport_id' => $georeportId,
      ':gm_id' => $geomanifestationId
    ]);
    return $stmt->rowCount() > 0;
  }
}