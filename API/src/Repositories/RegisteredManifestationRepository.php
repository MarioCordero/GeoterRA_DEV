<?php
// src/Repositories/RegisteredManifestationRepository.php
declare(strict_types=1);

namespace Repositories;

use PDO;
use DTO\RegisteredManifestationDTO;
use DTO\Ulid;

/**
 * Persistence layer for registered geothermal manifestations
 */
final class RegisteredManifestationRepository
{
  public function __construct(private PDO $db) {}

  /**
   * Check if a manifestation with the given ID already exists.
   */
  public function existsById(string $id): bool
  {
    $stmt = $this->db->prepare(
      'SELECT 1 
      FROM registered_geothermal_manifestations 
      WHERE id = :id 
        AND deleted_at IS NULL
      LIMIT 1'
    );
    $stmt->execute([':id' => $id]);
    return (bool) $stmt->fetchColumn();
  }


    /**
   * Check if a manifestation with the given name already exists.
   */
  public function existsByName(string $name): bool
  {
    $stmt = $this->db->prepare(
      'SELECT 1 
      FROM registered_geothermal_manifestations 
      WHERE name = :name 
        AND deleted_at IS NULL
      LIMIT 1'
    );
    $stmt->execute([':name' => $name]);
    return (bool) $stmt->fetchColumn();
  }

  /**
   * Insert manifestation
   */
  public function create(RegisteredManifestationDTO $dto, string $userId): bool
  {
    $sql = <<<SQL
    INSERT INTO registered_geothermal_manifestations (
      id, name, region, latitude, longitude, description,
      temperature, field_pH, field_conductivity,
      lab_pH, lab_conductivity,
      cl, ca, hco3, so4, fe, si, b, li, f, na, k, mg,
      created_by
    ) VALUES (
      :id, :name, :region, :latitude, :longitude, :description,
      :temperature, :field_pH, :field_conductivity,
      :lab_pH, :lab_conductivity,
      :cl, :ca, :hco3, :so4, :fe, :si, :b, :li, :f, :na, :k, :mg,
      :created_by
    )
    SQL;

    $stmt = $this->db->prepare($sql);

    return $stmt->execute([
      ':id' => Ulid::generate(),
      ':name' => $dto->name,
      ':region' => $dto->region,
      ':latitude' => $dto->latitude,
      ':longitude' => $dto->longitude,
      ':description' => $dto->description,
      ':temperature' => $dto->temperature,
      ':field_pH' => $dto->field_pH,
      ':field_conductivity' => $dto->field_conductivity,
      ':lab_pH' => $dto->lab_pH,
      ':lab_conductivity' => $dto->lab_conductivity,
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
      ':created_by' => $userId
    ]);
  }

  public function update(RegisteredManifestationDTO $dto, string $id, string $userId): bool
  {
    $sql = <<<SQL
    UPDATE registered_geothermal_manifestations
    SET
      name = :name,
      region = :region,
      latitude = :latitude,
      longitude = :longitude,
      description = :description,
      temperature = :temperature,
      field_pH = :field_pH,
      field_conductivity = :field_conductivity,
      lab_pH = :lab_pH,
      lab_conductivity = :lab_conductivity,
      cl = :cl,
      ca = :ca,
      hco3 = :hco3,
      so4 = :so4,
      fe = :fe,
      si = :si,
      b = :b,
      li = :li,
      f = :f,
      na = :na,
      k = :k,
      mg = :mg,
      modified_at = NOW(),
      modified_by = :modified_by
    WHERE id = :id
      AND deleted_at IS NULL
    SQL;

    $stmt = $this->db->prepare($sql);

    return $stmt->execute([
      'id'=> $id,
      'name' => $dto->name,
      'region' => $dto->region,
      'latitude' => $dto->latitude,
      'longitude' => $dto->longitude,
      'description' => $dto->description,
      'temperature' => $dto->temperature,
      'field_pH' => $dto->field_pH,
      'field_conductivity' => $dto->field_conductivity,
      'lab_pH' => $dto->lab_pH,
      'lab_conductivity' => $dto->lab_conductivity,
      'cl' => $dto->cl,
      'ca' => $dto->ca,
      'hco3' => $dto->hco3,
      'so4' => $dto->so4,
      'fe' => $dto->fe,
      'si' => $dto->si,
      'b' => $dto->b,
      'li' => $dto->li,
      'f' => $dto->f,
      'na' => $dto->na,
      'k' => $dto->k,
      'mg' => $dto->mg,
      'modified_by' => $userId
    ]);

  }

  public function softDelete(string $id, string $userId): bool
  {
    $sql = '
      UPDATE registered_geothermal_manifestations
      SET
        deleted_at = NOW(),
        deleted_by = :deleted_by
      WHERE id = :id
        AND deleted_at IS NULL
    ';

    $stmt = $this->db->prepare($sql);

    $stmt->execute([
      'id' => $id,
      'deleted_by' => $userId
    ]);

    return $stmt->rowCount() === 1;
  }


  /**
   * Fetch all active manifestations (excluding soft-deleted ones)
   */
  public function getAll(): array
  {
    $sql = <<<SQL
    SELECT
      id,
      name,
      region,
      latitude,
      longitude,
      description,
      temperature,
      field_pH,
      field_conductivity,
      lab_pH,
      lab_conductivity,
      cl,
      ca,
      hco3,
      so4,
      fe,
      si,
      b,
      li,
      f,
      na,
      k,
      mg,
      created_at,
      created_by,
      modified_at,
      modified_by
    FROM registered_geothermal_manifestations
    WHERE deleted_at IS NULL
    SQL;

    $stmt = $this->db->query($sql);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
   * Fetch all registered geothermal manifestations by region
   *
   * @param string $region Geographical region identifier
   * @return array List of manifestations matching the given region
   */
  public function getAllByRegion(string $region): array
  {
    // SQL query using a named parameter to prevent SQL injection
      $sql = <<<SQL
    SELECT
      id,
      region,
      latitude,
      longitude,
      description,
      temperature,
      field_pH,
      field_conductivity,
      lab_pH,
      lab_conductivity,
      cl,
      ca,
      hco3,
      so4,
      fe,
      si,
      b,
      li,
      f,
      na,
      k,
      mg,
      created_at,
      created_by,
      modified_at,
      modified_by
    FROM registered_geothermal_manifestations
    WHERE region = :region
      AND deleted_at IS NULL
    SQL;

    // Prepare the statement to enable safe parameter binding
    $stmt = $this->db->prepare($sql);

    // Execute the query with the bound parameter
    $stmt->execute([
      ':region' => $region
    ]);

    // Fetch all matching rows as associative arrays
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

}
