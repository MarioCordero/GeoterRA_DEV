<?php
declare(strict_types=1);

namespace Repositories;

use PDO;

/**
 * Repository for the enriched view of geomanifestations using an inline raw SQL query.
 */
final class GeomanifestationViewRepository extends Repository
{
	/**
	 * Returns the base SQL query with all necessary JOINs.
	 * This replaces the non-existent database view.
	 *
	 * @return string
	 */
	private function getBaseSql(): string
	{
		return "SELECT 
              gm.geomanifestation_id AS geomanifestation_id,
              gm.geomanifestation_name AS geomanifestation_name,
              gm.latitude AS latitude,
              gm.longitude AS longitude,
              gm.description AS manifestation_description,
              gm.visibility AS visibility,
              gm.created_at AS manifestation_created_at,
              gm_creator.first_name AS manifestation_creator_first_name,
              gm_creator.last_name AS manifestation_creator_last_name,
              p.province_name AS province_name,
              p.province_snit_code AS province_snit_code,
              c.canton_name AS canton_name,
              c.canton_snit_code AS canton_snit_code,
              d.district_name AS district_name,
              d.district_snit_code AS district_snit_code,
              gr.georeport_id AS georeport_id,
              gr.details AS report_details,
              gr.created_at AS report_created_at,
              report_creator.first_name AS report_creator_first_name,
              report_creator.last_name AS report_creator_last_name,
              ist.insitu_test_id AS insitu_test_id,
              ist.temperature AS temperature,
              ist.conductivity AS insitu_conductivity,
              ist.ph AS insitu_ph,
              ist.description AS insitu_description,
              ist.created_at AS insitu_created_at,
              ilt.inlab_test_id AS inlab_test_id,
              ilt.ph AS lab_ph,
              ilt.conductivity AS lab_conductivity,
              ilt.cl AS cl,
              ilt.ca AS ca,
              ilt.hco3 AS hco3,
              ilt.so4 AS so4,
              ilt.fe AS fe,
              ilt.si AS si,
              ilt.b AS b,
              ilt.li AS li,
              ilt.f AS f,
              ilt.na AS na,
              ilt.k AS k,
              ilt.mg AS mg,
              ilt.description AS lab_description,
              ilt.created_at AS lab_created_at 
            FROM ((((((((geomanifestations gm 
            LEFT JOIN users gm_creator ON (gm.created_by = gm_creator.user_id)) 
            LEFT JOIN provinces p ON (gm.province_snit_code = p.province_snit_code)) 
            LEFT JOIN cantons c ON (gm.canton_snit_code = c.canton_snit_code)) 
            LEFT JOIN districts d ON (gm.district_snit_code = d.district_snit_code)) 
            LEFT JOIN georeports gr ON (gm.current_georeport_id = gr.georeport_id)) 
            LEFT JOIN users report_creator ON (gr.created_by = report_creator.user_id)) 
            LEFT JOIN insitu_tests ist ON (gr.insitu_test_id = ist.insitu_test_id)) 
            LEFT JOIN inlab_tests ilt ON (gr.inlab_test_id = ilt.inlab_test_id))";
	}

	/**
	 * Finds a single manifestation view by ID.
	 *
	 * @param string $id
	 * @param bool $includeHidden If true, does not filter by visibility
	 * @return array|null Associative array or null if not found
	 */
	public function findById(string $id, bool $includeHidden = false): ?array
	{
		$baseSql = $this->getBaseSql();
		$sql = "SELECT * FROM ($baseSql) AS view_geomanifestations WHERE geomanifestation_id = :id";

		if (!$includeHidden) {
			$sql .= " AND visibility = 1";
		}

		$stmt = $this->execute($sql, [':id' => $id]);
		$row = $stmt->fetch(PDO::FETCH_ASSOC);
		return $row ?: null;
	}

	/**
	 * Returns paginated list from the view with optional filters.
	 *
	 * @param int $page
	 * @param int $limit
	 * @param int|null $provinceSnitCode
	 * @param int|null $cantonSnitCode
	 * @param int|null $districtSnitCode
	 * @param float|null $temperatureMin
	 * @param float|null $temperatureMax
	 * @param bool $onlyVisible
	 * @return array{data: array[], total: int}
	 */
	public function getAllPaginated(
		int    $page = 1,
		int    $limit = 20,
		?int   $provinceSnitCode = null,
		?int   $cantonSnitCode = null,
		?int   $districtSnitCode = null,
		?float $temperatureMin = null,
		?float $temperatureMax = null,
		bool   $onlyVisible = true
	): array
	{
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
		if ($cantonSnitCode !== null) {
			$conditions[] = "canton_snit_code = :canton_snit";
			$params[':canton_snit'] = $cantonSnitCode;
		}
		if ($districtSnitCode !== null) {
			$conditions[] = "district_snit_code = :district_snit";
			$params[':district_snit'] = $districtSnitCode;
		}
		if ($temperatureMin !== null) {
			$conditions[] = "temperature >= :temp_min";
			$params[':temp_min'] = $temperatureMin;
		}
		if ($temperatureMax !== null) {
			$conditions[] = "temperature <= :temp_max";
			$params[':temp_max'] = $temperatureMax;
		}

		$whereClause = empty($conditions) ? "" : "WHERE " . implode(
				" AND ", $conditions
			);

		$baseSql = $this->getBaseSql();

		// Count total
		$countSql = "SELECT COUNT(*) FROM ($baseSql) AS view_geomanifestations $whereClause";
		$countStmt = $this->execute($countSql, $params);
		$total = (int)$countStmt->fetchColumn();

		// Get paginated data
		$sql = "SELECT * FROM ($baseSql) AS view_geomanifestations 
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