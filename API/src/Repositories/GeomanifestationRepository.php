<?php
declare(strict_types=1);

namespace Repositories;

use PDO;

/**
 * Repository for geothermal manifestations table.
 * All methods return raw associative arrays, no DTOs.
 */
final class GeomanifestationRepository extends Repository
{
  /**
   * Finds a manifestation by its name (case-insensitive).
   *
   * @param string $name
   * @return array<string,mixed>|null
   */
  public function findByName(string $name): ?array
  {
    $sql = "SELECT g.geomanifestation_id, g.province_snit_code, g.canton_snit_code, g.district_snit_code,
                       g.current_georeport_id, r.request_id, r.request_name, g.geomanifestation_name,
                       g.latitude, g.longitude, g.description, g.visibility, g.created_at, g.created_by
                FROM geomanifestations g
                LEFT JOIN requests r on g.request_id = r.request_id
                WHERE LOWER(geomanifestation_name) = LOWER(:name)
                LIMIT 1";
    $stmt = $this->execute($sql, [':name' => $name]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  /**
   * Returns all manifestations (including hidden) with pagination.
   *
   * @param int $page
   * @param int $limit
   * @return array{data: array[], total: int}
   */
  public function getAll(int $page = 1, int $limit = 20): array
  {
    $offset = ($page - 1) * $limit;

    $countSql = "SELECT COUNT(*) FROM geomanifestations";
    $countStmt = $this->execute($countSql);
    $total = (int)$countStmt->fetchColumn();

    $sql = "SELECT g.geomanifestation_id, g.province_snit_code, g.canton_snit_code, g.district_snit_code,
                       g.current_georeport_id, r.request_id, r.request_name, g.geomanifestation_name,
                       g.latitude, g.longitude, g.description, g.visibility, g.created_at, g.created_by
                FROM geomanifestations g
                LEFT JOIN requests r on g.request_id = r.request_id
                ORDER BY g.created_at DESC
                LIMIT :limit OFFSET :offset";
    $stmt = $this->execute($sql, [':limit' => $limit, ':offset' => $offset]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return ['data' => $data, 'total' => $total];
  }

  /**
   * Returns paginated list of manifestations with optional filters.
   * This unifies and replaces the old getAll() and getByProvince() methods.
   *
   * @param int $page
   * @param int $limit
   * @param int|null $provinceSnitCode
   * @param int|null $cantonSnitCode
   * @param int|null $districtSnitCode
   * @param bool $onlyVisible
   * @return array{data: array[], total: int}
   */
  public function getAllPaginated(
    int  $page = 1,
    int  $limit = 20,
    ?int $provinceSnitCode = null,
    ?int $cantonSnitCode = null,
    ?int $districtSnitCode = null,
    bool $onlyVisible = true
  ): array {
    $offset = ($page - 1) * $limit;

    $conditions = [];
    $params = [];

    if ($onlyVisible) {
      $conditions[] = "g.visibility = 1";
    }
    if ($provinceSnitCode !== null) {
      $conditions[] = "g.province_snit_code = :province_snit";
      $params[':province_snit'] = $provinceSnitCode;
    }
    if ($cantonSnitCode !== null) {
      $conditions[] = "g.canton_snit_code = :canton_snit";
      $params[':canton_snit'] = $cantonSnitCode;
    }
    if ($districtSnitCode !== null) {
      $conditions[] = "g.district_snit_code = :district_snit";
      $params[':district_snit'] = $districtSnitCode;
    }

    $whereClause = empty($conditions) ? "" : "WHERE " . implode(" AND ", $conditions);

    $countSql = "SELECT COUNT(*) FROM geomanifestations g $whereClause";
    $countStmt = $this->execute($countSql, $params);
    $total = (int)$countStmt->fetchColumn();

    $limitInt = $limit;
    $offsetInt = (int)$offset;

    $sql = "SELECT g.geomanifestation_id, g.province_snit_code, g.canton_snit_code, g.district_snit_code,
                   g.current_georeport_id, r.request_id, r.request_name, g.geomanifestation_name,
                   g.latitude, g.longitude, g.description, g.visibility, g.created_at, g.created_by
            FROM geomanifestations g
            LEFT JOIN requests r on g.request_id = r.request_id
            $whereClause
            ORDER BY g.created_at DESC
            LIMIT {$limitInt} OFFSET {$offsetInt}";

    $stmt = $this->execute($sql, $params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return ['data' => $data, 'total' => $total];
  }

  /**
   * Returns visible manifestations by province SNIT code with pagination.
   *
   * @param int $provinceSnitCode
   * @param int $page
   * @param int $limit
   * @return array{data: array[], total: int}
   */
  public function getByProvince(
    int $provinceSnitCode, int $page = 1, int $limit = 20
  ): array {
    $offset = ($page - 1) * $limit;

    $countSql = "SELECT COUNT(*) FROM geomanifestations WHERE province_snit_code = :province_snit AND visibility = 1";
    $countStmt = $this->execute(
      $countSql, [':province_snit' => $provinceSnitCode]
    );
    $total = (int)$countStmt->fetchColumn();

    $sql = "SELECT g.geomanifestation_id, g.province_snit_code, g.canton_snit_code, g.district_snit_code,
                       g.current_georeport_id, r.request_id, r.request_name, g.geomanifestation_name,
                       g.latitude, g.longitude, g.description, g.visibility, g.created_at, g.created_by
                FROM geomanifestations g
                LEFT JOIN requests r on g.request_id = r.request_id
                WHERE g.province_snit_code = :province_snit
                ORDER BY created_at DESC
                LIMIT :limit OFFSET :offset";
    $stmt = $this->execute(
      $sql, [
      ':province_snit' => $provinceSnitCode,
      ':limit' => $limit,
      ':offset' => $offset
    ]
    );
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return ['data' => $data, 'total' => $total];
  }

  /**
   * Creates a new manifestation.
   *
   * @param array<string,mixed> $data Associative array with keys: name, latitude, longitude,
   *        province_snit_code, canton_snit_code, district_snit_code, current_georeport_id,
   *        description, visibility (0/1), request_id
   * @param string $userId
   * @return array The generated row
   */
  public function create(array $data, string $userId): array
  {
    $id = $this->generateUlid();

    $sql = "INSERT INTO geomanifestations (
                    geomanifestation_id, province_snit_code, canton_snit_code, district_snit_code,
                    current_georeport_id, geomanifestation_name, request_id, latitude, longitude, description,
                    visibility, created_by, created_at
                ) VALUES (
                    :id, :province_snit, :canton_snit, :district_snit,
                    :current_georeport, :name, :request_id, :lat, :lng, :desc,
                    :visibility, :created_by, NOW()
                )";

    $this->execute(
      $sql, [
        ':id' => $id,
        ':province_snit' => $data['province_snit_code'] ?? null,
        ':canton_snit' => $data['canton_snit_code'] ?? null,
        ':district_snit' => $data['district_snit_code'] ?? null,
        ':current_georeport' => $data['current_georeport_id'] ?? null,
        ':request_id' => $data['request_id'] ?? null,
        ':name' => $data['geomanifestation_name'],
        ':lat' => $data['latitude'],
        ':lng' => $data['longitude'],
        ':desc' => $data['description'] ?? null,
        ':visibility' => $data['visibility'] ?? 0,
        ':created_by' => $userId
      ]
    );

    return $this->findById($id);
  }

  /**
   * Finds a manifestation by its ULID.
   *
   * @param string $id
   * @return array<string,mixed>|null
   */
  public function findById(string $id): ?array
  {
    $sql = "SELECT g.geomanifestation_id, g.province_snit_code, g.canton_snit_code, g.district_snit_code,
                       g.current_georeport_id, r.request_id, r.request_name, g.geomanifestation_name,
                       g.latitude, g.longitude, g.description, g.visibility,
                       g.created_at, g.created_by
                FROM geomanifestations g
                LEFT JOIN requests r on g.request_id = r.request_id
                WHERE geomanifestation_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  /**
   * Changes only the visibility of a manifestation.
   *
   * @param string $id
   * @param bool $visibility
   * @return array|null
   */
  public function updateVisibility(string $id, bool $visibility): ?array
  {
    return $this->update($id, ['visibility' => $visibility ? 1 : 0]);
  }

  /**
   * Updates only the fields provided in the $fields array.
   *
   * @param string $id
   * @param array<string,mixed> $fields Associative array of column => value
   * @return array|null Not null array if row updated.
   */
  public function update(string $id, array $fields): ?array
  {
    if (empty($fields)) {
      return null;
    }

    $sets = [];
    $params = [':id' => $id];
    foreach ($fields as $column => $value) {
      $sets[] = "$column = :$column";
      $params[":$column"] = $value;
    }

    $sql = "UPDATE geomanifestations SET " . implode(
        ', ', $sets
      ) . " WHERE geomanifestation_id = :id";
    $this->execute($sql, $params);
    $row = $this->findById($id);
    return $row ?: null;
  }

  /**
   * Permanently deletes a manifestation.
   *
   * @param string $id
   * @return bool
   */
  public function delete(string $id): bool
  {
    $sql = "DELETE FROM geomanifestations WHERE geomanifestation_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    return $stmt->rowCount() > 0;
  }
}