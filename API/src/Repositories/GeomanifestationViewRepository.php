<?php
declare(strict_types=1);

namespace Repositories;

use PDO;
use DTO\GeomanifestationViewDTO;

/**
 * Repository for the enriched view `view_geomanifestations`.
 */
final class GeomanifestationViewRepository extends Repository
{
  /**
   * Finds a single manifestation view by ID.
   * Returns DTO because it's a detail view.
   *
   * @param string $id
   * @return GeomanifestationViewDTO|null
   */
  public function findById(string $id): ?GeomanifestationViewDTO
  {
    $sql = "SELECT * FROM view_geomanifestations WHERE geomanifestation_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? GeomanifestationViewDTO::fromDatabase($row) : null;
  }

  /**
   * Returns paginated list from the view with optional filters.
   * Returns raw arrays for performance.
   *
   * @param int $page
   * @param int $limit
   * @param int|null $provinceSnitCode
   * @param float|null $temperatureMin
   * @param float|null $temperatureMax
   * @param bool $onlyVisible
   * @return array{data: array[], total: int}
   */
  public function getAllPaginated(
    int $page = 1,
    int $limit = 20,
    ?int $provinceSnitCode = null,
    ?float $temperatureMin = null,
    ?float $temperatureMax = null,
    bool $onlyVisible = false
  ): array {
    $offset = ($page - 1) * $limit;

    $conditions = [];
    $params = [];

    if ($onlyVisible) {
      $conditions[] = "visibility = 1";
    }
    if ($provinceSnitCode !== null) {
      $conditions[] = "province_snit_code = :province_snit";
      $params[':province_snit'] = $provinceSnitCode;
    }
    if ($temperatureMin !== null) {
      $conditions[] = "temperature >= :temp_min";
      $params[':temp_min'] = $temperatureMin;
    }
    if ($temperatureMax !== null) {
      $conditions[] = "temperature <= :temp_max";
      $params[':temp_max'] = $temperatureMax;
    }

    $whereClause = empty($conditions) ? "" : "WHERE " . implode(" AND ", $conditions);

    // Count total
    $countSql = "SELECT COUNT(*) FROM view_geomanifestations $whereClause";
    $countStmt = $this->execute($countSql, $params);
    $total = (int) $countStmt->fetchColumn();

    // Get paginated data
    $sql = "SELECT * FROM view_geomanifestations 
                $whereClause 
                ORDER BY manifestation_created_at DESC
                LIMIT :limit OFFSET :offset";

    $params[':limit'] = $limit;
    $params[':offset'] = $offset;

    $stmt = $this->execute($sql, $params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return ['data' => $data, 'total' => $total];
  }
}