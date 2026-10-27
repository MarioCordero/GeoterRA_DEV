<?php
declare(strict_types=1);

namespace Repositories;

use DTO\RegisterFieldTripDTO;
use DTO\UpdateFieldTripDTO;
use PDO;

/**
 * Repository for field trips (field_trips table).
 */
final class FieldTripRepository extends Repository
{
  /**
   * Finds a field trip by its ULID with creator and location names.
   *
   * @param string $id
   * @return array|null
   */
  public function findById(string $id): ?array
  {
    $sql = "SELECT ft.field_trip_id, 
                   ft.field_trip_name, 
                   ft.field_trip_start_date, 
                   ft.field_trip_finish_date, 
                   ft.province_snit_code, 
                   ft.canton_snit_code, 
                   ft.district_snit_code, 
                   ft.field_trip_creator_id, 
                   ft.created_at,
                   u.first_name AS creator_first_name,
                   u.last_name AS creator_last_name,
                   u.email AS creator_email,
                   p.province_name,
                   c.canton_name,
                   d.district_name
            FROM field_trips ft
            LEFT JOIN users u ON ft.field_trip_creator_id = u.user_id
            LEFT JOIN provinces p ON ft.province_snit_code = p.province_snit_code
            LEFT JOIN cantons c ON ft.canton_snit_code = c.canton_snit_code
            LEFT JOIN districts d ON ft.district_snit_code = d.district_snit_code
            WHERE ft.field_trip_id = :id";
    $stmt =$this->execute($sql, [':id' =>$id]);
    $row =$stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  /**
   * Returns a paginated list of field trips with optional active status and SNIT filters.
   *
   * @param int $page
   * @param int $limit
   * @param bool|null $isActive
   * @param int|null $provinceSnitCode
   * @param int|null $cantonSnitCode
   * @param int|null $districtSnitCode
   * @return array{data: array[], total: int}
   */
  public function getAllPaginated(
    int $page = 1,
    int $limit = 20,
    ?bool $isActive = null,
    ?int $provinceSnitCode = null,
    ?int $cantonSnitCode = null,
    ?int $districtSnitCode = null
  ): array {
    $offset = ($page - 1) *$limit;
    $conditions = [];$params = [];

    if ($isActive !== null) {
      if ($isActive) {$conditions[] = "(NOW() BETWEEN ft.field_trip_start_date AND ft.field_trip_finish_date)";
      } else {
        $conditions[] = "(NOW() < ft.field_trip_start_date OR NOW() > ft.field_trip_finish_date)";
      }
    }

    if ($provinceSnitCode !== null) {$conditions[] = "ft.province_snit_code = :province_snit_code";
      $params[':province_snit_code'] =$provinceSnitCode;
    }

    if ($cantonSnitCode !== null) {$conditions[] = "ft.canton_snit_code = :canton_snit_code";
      $params[':canton_snit_code'] =$cantonSnitCode;
    }

    if ($districtSnitCode !== null) {$conditions[] = "ft.district_snit_code = :district_snit_code";
      $params[':district_snit_code'] =$districtSnitCode;
    }

    $whereClause = empty($conditions) ? "" : "WHERE " . implode(" AND ", $conditions);

    $countSql = "SELECT COUNT(*) FROM field_trips ft $whereClause";
    $countStmt =$this->execute($countSql,$params);
    $total = (int)$countStmt->fetchColumn();

    $limitInt =$limit;
    $offsetInt = (int)$offset;

    $sql = "SELECT ft.field_trip_id, 
                   ft.field_trip_name, 
                   ft.field_trip_start_date, 
                   ft.field_trip_finish_date, 
                   ft.province_snit_code, 
                   ft.canton_snit_code, 
                   ft.district_snit_code, 
                   ft.field_trip_creator_id, 
                   ft.created_at,
                   u.first_name AS creator_first_name,
                   u.last_name AS creator_last_name,
                   u.email AS creator_email,
                   p.province_name,
                   c.canton_name,
                   d.district_name
            FROM field_trips ft
            LEFT JOIN users u ON ft.field_trip_creator_id = u.user_id
            LEFT JOIN provinces p ON ft.province_snit_code = p.province_snit_code
            LEFT JOIN cantons c ON ft.canton_snit_code = c.canton_snit_code
            LEFT JOIN districts d ON ft.district_snit_code = d.district_snit_code
            $whereClause
            ORDER BY ft.field_trip_start_date DESC
            LIMIT {$limitInt} OFFSET {$offsetInt}";

    $stmt =$this->execute($sql,$params);
    $data =$stmt->fetchAll(PDO::FETCH_ASSOC);

    return ['data' => $data, 'total' =>$total];
  }

  /**
   * Returns paginated field trips assigned to or created by a specific user with optional SNIT filters.
   *
   * @param string $userId
   * @param int $page
   * @param int $limit
   * @param int|null $provinceSnitCode
   * @param int|null $cantonSnitCode
   * @param int|null $districtSnitCode
   * @return array{data: array[], total: int}
   */
  public function getByParticipant(
    string $userId,
    int $page = 1,
    int $limit = 20,
    ?int $provinceSnitCode = null,
    ?int $cantonSnitCode = null,
    ?int $districtSnitCode = null
  ): array {
    $offset = ($page - 1) *$limit;

    $conditions = ["(ftp.user_id = :user_id OR ft.field_trip_creator_id = :creator_id)"];
    $params = [':user_id' => $userId, ':creator_id' =>$userId];

    if ($provinceSnitCode !== null) {$conditions[] = "ft.province_snit_code = :province_snit_code";
      $params[':province_snit_code'] =$provinceSnitCode;
    }

    if ($cantonSnitCode !== null) {$conditions[] = "ft.canton_snit_code = :canton_snit_code";
      $params[':canton_snit_code'] =$cantonSnitCode;
    }

    if ($districtSnitCode !== null) {$conditions[] = "ft.district_snit_code = :district_snit_code";
      $params[':district_snit_code'] =$districtSnitCode;
    }

    $whereClause = "WHERE " . implode(" AND ", $conditions);

    $countSql = "SELECT COUNT(DISTINCT ft.field_trip_id)
                 FROM field_trips ft
                 LEFT JOIN field_trip_participants ftp ON ft.field_trip_id = ftp.field_trip_id
                 $whereClause";
    $countStmt =$this->execute($countSql,$params);
    $total = (int)$countStmt->fetchColumn();

    $limitInt =$limit;
    $offsetInt = (int)$offset;

    $sql = "SELECT ft.field_trip_id, 
                   ft.field_trip_name, 
                   ft.field_trip_start_date, 
                   ft.field_trip_finish_date, 
                   ft.province_snit_code, 
                   ft.canton_snit_code, 
                   ft.district_snit_code, 
                   ft.field_trip_creator_id, 
                   ft.created_at,
                   u.first_name AS creator_first_name,
                   u.last_name AS creator_last_name,
                   u.email AS creator_email,
                   p.province_name,
                   c.canton_name,
                   d.district_name
            FROM field_trips ft
            LEFT JOIN users u ON ft.field_trip_creator_id = u.user_id
            LEFT JOIN provinces p ON ft.province_snit_code = p.province_snit_code
            LEFT JOIN cantons c ON ft.canton_snit_code = c.canton_snit_code
            LEFT JOIN districts d ON ft.district_snit_code = d.district_snit_code
            LEFT JOIN field_trip_participants ftp ON ft.field_trip_id = ftp.field_trip_id
            $whereClause
            GROUP BY ft.field_trip_id
            ORDER BY ft.field_trip_start_date DESC
            LIMIT {$limitInt} OFFSET {$offsetInt}";

    $stmt =$this->execute($sql,$params);
    $data =$stmt->fetchAll(PDO::FETCH_ASSOC);

    return ['data' => $data, 'total' =>$total];
  }

  /**
   * Creates a new field trip.
   *
   * @param RegisterFieldTripDTO $dto
   * @param string $creatorId
   * @return array
   */
  public function create(RegisterFieldTripDTO $dto, string$creatorId): array
  {
    $id = $this->generateUlid();$sql = "INSERT INTO field_trips (
              field_trip_id, field_trip_name,
              field_trip_start_date, field_trip_finish_date, field_trip_creator_id,
              province_snit_code, canton_snit_code, district_snit_code,
              created_at
            ) VALUES (
              :id, :name,
              :start_date, :finish_date, :creator_id,
              :province_snit, :canton_snit, :district_snit,
              NOW()
            )";

    $this->execute($sql, [
      ':id' => $id,
      ':name' => $dto->fieldTripName,
      ':start_date' => $dto->fieldTripStartDate,
      ':finish_date' => $dto->fieldTripFinishDate,
      ':creator_id' => $creatorId,
      ':province_snit' => $dto->provinceSnitCode,
      ':canton_snit' => $dto->cantonSnitCode,
      ':district_snit' => $dto->districtSnitCode,
    ]);

    return $this->findById($id);
  }

  /**
   * Updates an existing field trip.
   *
   * @param string $id
   * @param UpdateFieldTripDTO $dto
   * @return array|null
   */
  public function update(string $id, UpdateFieldTripDTO$dto): ?array
  {
    $updateData =$dto->toArray();
    if (empty($updateData)) {
      return $this->findById($id);
    }

    $setParts = [];
    $params = [':id' =>$id];
    foreach ($updateData as$field => $value) {$setParts[] = "$field = :$field";
      $params[":$field"] = $value;
    }

    $sql = "UPDATE field_trips SET " . implode(', ', $setParts) . " WHERE field_trip_id = :id";
    $this->execute($sql,$params);

    return $this->findById($id);
  }

  /**
   * Deletes a field trip.
   *
   * @param string $id
   * @return bool
   */
  public function delete(string $id): bool
  {
    $sql = "DELETE FROM field_trips WHERE field_trip_id = :id";
    $stmt =$this->execute($sql, [':id' =>$id]);
    return $stmt->rowCount() > 0;
  }

  /**
   * Links a geomanifestation to this field trip.
   *
   * @param string $fieldTripId
   * @param string $geomanifestationId
   * @return bool
   */
  public function linkManifestation(string $fieldTripId, string$geomanifestationId): bool
  {
    $sql = "UPDATE geomanifestations SET field_trip_id = :ft_id WHERE geomanifestation_id = :gm_id";
    $stmt = $this->execute($sql, [':ft_id' => $fieldTripId, ':gm_id' =>$geomanifestationId]);
    return $stmt->rowCount() > 0;
  }

  /**
   * Unlinks a geomanifestation from its field trip.
   *
   * @param string $geomanifestationId
   * @return bool
   */
  public function unlinkManifestation(string $geomanifestationId): bool
  {
    $sql = "UPDATE geomanifestations SET field_trip_id = NULL WHERE geomanifestation_id = :gm_id";
    $stmt =$this->execute($sql, [':gm_id' =>$geomanifestationId]);
    return $stmt->rowCount() > 0;
  }

  /**
   * Gets all manifestations associated with a field trip.
   *
   * @param string $fieldTripId
   * @return array[]
   */
  public function getManifestations(string $fieldTripId): array
  {
    $sql = "SELECT g.geomanifestation_id, g.province_snit_code, g.canton_snit_code, g.district_snit_code,
                   g.current_georeport_id, r.request_id, r.request_name, g.geomanifestation_name,
                   g.latitude, g.longitude, g.description, g.visibility, g.field_trip_id,
                   g.created_at, g.created_by,
                   ft.field_trip_name,
                   p.province_name, c.canton_name, d.district_name
            FROM geomanifestations g
            LEFT JOIN requests r ON g.request_id = r.request_id
            LEFT JOIN field_trips ft ON g.field_trip_id = ft.field_trip_id
            LEFT JOIN provinces p ON g.province_snit_code = p.province_snit_code
            LEFT JOIN cantons c ON g.canton_snit_code = c.canton_snit_code
            LEFT JOIN districts d ON g.district_snit_code = d.district_snit_code
            WHERE g.field_trip_id = :ft_id
            ORDER BY g.geomanifestation_name ASC";
    return $this->execute($sql, [':ft_id' =>$fieldTripId])->fetchAll(PDO::FETCH_ASSOC);
  }
}