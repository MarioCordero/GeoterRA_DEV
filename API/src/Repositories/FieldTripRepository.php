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
    $sql = "SELECT ft.*,
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
    $stmt = $this->execute($sql, [':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  /**
   * Returns paginated list of field trips with optional active status filter.
   *
   * @param int $page
   * @param int $limit
   * @param bool|null $isActive
   * @return array{data: array[], total: int}
   */
  public function getAllPaginated(
    int $page = 1,
    int $limit = 20,
    ?bool $isActive = null
  ): array {
    $offset = ($page - 1) * $limit;
    $conditions = [];
    $params = [];

    if ($isActive !== null) {
      $conditions[] = "ft.field_trip_is_active = :is_active";
      $params[':is_active'] = $isActive ? 1 : 0;
    }

    $whereClause = empty($conditions) ? "" : "WHERE " . implode(" AND ", $conditions);

    $countSql = "SELECT COUNT(*) FROM field_trips ft $whereClause";
    $countStmt = $this->execute($countSql, $params);
    $total = (int)$countStmt->fetchColumn();

    $limitInt = $limit;
    $offsetInt = (int)$offset;

    $sql = "SELECT ft.*,
                   u.first_name AS creator_first_name,
                   u.last_name AS creator_last_name,
                   p.province_name,
                   c.canton_name,
                   d.district_name
            FROM field_trips ft
            LEFT JOIN users u ON ft.field_trip_creator_id = u.user_id
            LEFT JOIN provinces p ON ft.province_snit_code = p.province_snit_code
            LEFT JOIN cantons c ON ft.canton_snit_code = c.canton_snit_code
            LEFT JOIN districts d ON ft.district_snit_code = d.district_snit_code
            $whereClause
            ORDER BY ft.field_trip_scheduled_date DESC
            LIMIT {$limitInt} OFFSET {$offsetInt}";

    $stmt = $this->execute($sql, $params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return ['data' => $data, 'total' => $total];
  }

  /**
   * Returns paginated field trips assigned to or created by a specific user.
   *
   * @param string $userId
   * @param int $page
   * @param int $limit
   * @return array{data: array[], total: int}
   */
  public function getByParticipant(string $userId, int $page = 1, int $limit = 20): array
  {
    $offset = ($page - 1) * $limit;

    $countSql = "SELECT COUNT(DISTINCT ft.field_trip_id)
                 FROM field_trips ft
                 LEFT JOIN field_trip_participants ftp ON ft.field_trip_id = ftp.field_trip_id
                 WHERE ftp.user_id = :user_id OR ft.field_trip_creator_id = :creator_id";
    $countStmt = $this->execute($countSql, [':user_id' => $userId, ':creator_id' => $userId]);
    $total = (int)$countStmt->fetchColumn();

    $limitInt = $limit;
    $offsetInt = (int)$offset;

    $sql = "SELECT DISTINCT ft.*,
                   u.first_name AS creator_first_name,
                   u.last_name AS creator_last_name,
                   p.province_name,
                   c.canton_name,
                   d.district_name
            FROM field_trips ft
            LEFT JOIN users u ON ft.field_trip_creator_id = u.user_id
            LEFT JOIN provinces p ON ft.province_snit_code = p.province_snit_code
            LEFT JOIN cantons c ON ft.canton_snit_code = c.canton_snit_code
            LEFT JOIN districts d ON ft.district_snit_code = d.district_snit_code
            LEFT JOIN field_trip_participants ftp ON ft.field_trip_id = ftp.field_trip_id
            WHERE ftp.user_id = :user_id OR ft.field_trip_creator_id = :creator_id
            ORDER BY ft.field_trip_scheduled_date DESC
            LIMIT {$limitInt} OFFSET {$offsetInt}";

    $stmt = $this->execute($sql, [':user_id' => $userId, ':creator_id' => $userId]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return ['data' => $data, 'total' => $total];
  }

  /**
   * Creates a new field trip.
   *
   * @param RegisterFieldTripDTO $dto
   * @param string $creatorId
   * @return array
   */
  public function create(RegisterFieldTripDTO $dto, string $creatorId): array
  {
    $id = $this->generateUlid();
    $sql = "INSERT INTO field_trips (
              field_trip_id, field_trip_name, field_trip_scheduled_date,
              field_trip_start_date, field_trip_finish_date, field_trip_creator_id,
              field_trip_is_active, province_snit_code, canton_snit_code, district_snit_code,
              created_at
            ) VALUES (
              :id, :name, :scheduled_date,
              :start_date, :finish_date, :creator_id,
              :is_active, :province_snit, :canton_snit, :district_snit,
              NOW()
            )";

    $this->execute($sql, [
      ':id' => $id,
      ':name' => $dto->fieldTripName,
      ':scheduled_date' => $dto->fieldTripScheduledDate,
      ':start_date' => $dto->fieldTripStartDate,
      ':finish_date' => $dto->fieldTripFinishDate,
      ':creator_id' => $creatorId,
      ':is_active' => $dto->fieldTripIsActive ? 1 : 0,
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
  public function update(string $id, UpdateFieldTripDTO $dto): ?array
  {
    $updateData = $dto->toArray();
    if (empty($updateData)) {
      return $this->findById($id);
    }

    $setParts = [];
    $params = [':id' => $id];
    foreach ($updateData as $field => $value) {
      $setParts[] = "$field = :$field";
      $params[":$field"] = $value;
    }

    $sql = "UPDATE field_trips SET " . implode(', ', $setParts) . " WHERE field_trip_id = :id";
    $this->execute($sql, $params);

    return $this->findById($id);
  }

  /**
   * Toggles the active status of a field trip.
   *
   * @param string $id
   * @param bool $isActive
   * @return array|null
   */
  public function toggleActive(string $id, bool $isActive): ?array
  {
    $sql = "UPDATE field_trips SET field_trip_is_active = :is_active WHERE field_trip_id = :id";
    $this->execute($sql, [':id' => $id, ':is_active' => $isActive ? 1 : 0]);
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
    $stmt = $this->execute($sql, [':id' => $id]);
    return $stmt->rowCount() > 0;
  }

  /**
   * Links a geomanifestation to this field trip.
   *
   * @param string $fieldTripId
   * @param string $geomanifestationId
   * @return bool
   */
  public function linkManifestation(string $fieldTripId, string $geomanifestationId): bool
  {
    $sql = "UPDATE geomanifestations SET field_trip_id = :ft_id WHERE geomanifestation_id = :gm_id";
    $stmt = $this->execute($sql, [':ft_id' => $fieldTripId, ':gm_id' => $geomanifestationId]);
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
    $stmt = $this->execute($sql, [':gm_id' => $geomanifestationId]);
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
                   g.created_at, g.created_by
            FROM geomanifestations g
            LEFT JOIN requests r ON g.request_id = r.request_id
            WHERE g.field_trip_id = :ft_id
            ORDER BY g.geomanifestation_name ASC";
    return $this->execute($sql, [':ft_id' => $fieldTripId])->fetchAll(PDO::FETCH_ASSOC);
  }
}
