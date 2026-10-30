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
	 * Returns all georeports for a given geomanifestation, with optional name filtering and pagination.
	 *
	 * @param string $geomanifestationId
	 * @param string|null $georeportName
	 * @param int $limit
	 * @param int $offset
	 * @return array[]
	 */
	public function getByManifestation(
		string $geomanifestationId,
		?string $georeportName = null,
		int $limit = 10,
		int $offset = 0
	): array {
		$sql = "SELECT g.*,
                   u.first_name AS created_by_first_name,
                   u.last_name AS created_by_last_name
            FROM georeports g
            LEFT JOIN users u ON g.created_by = u.user_id
            WHERE g.geomanifestation_id = :gm_id";

		$params = [':gm_id' => $geomanifestationId];

		if ($georeportName !== null && trim($georeportName) !== '') {
			$sql .= " AND g.georeport_name LIKE :georeport_name";
			$params[':georeport_name'] = '%' . trim($georeportName) . '%';
		}

    $sql .= " ORDER BY g.created_at DESC LIMIT " . (int)$limit . " OFFSET " .
      (int)$offset;
    return $this->execute($sql, $params)->fetchAll(PDO::FETCH_ASSOC);
	}

	/**
	 * Counts georeports for a given geomanifestation with optional name filtering.
	 *
	 * @param string $geomanifestationId
	 * @param string|null $georeportName
	 * @return int
	 */
	public function countByManifestation(string $geomanifestationId, ?string $georeportName = null): int
	{
		$sql = "SELECT COUNT(*) FROM georeports g WHERE g.geomanifestation_id = :gm_id";
		$params = [':gm_id' => $geomanifestationId];

		if ($georeportName !== null && trim($georeportName) !== '') {
			$sql .= " AND g.georeport_name LIKE :georeport_name";
			$params[':georeport_name'] = '%' . trim($georeportName) . '%';
		}

		$stmt = $this->execute($sql, $params);
		return (int)$stmt->fetchColumn();
	}

	/**
	 * Searches georeports globally by name with pagination.
	 *
	 * @param string $georeportName
	 * @param int $limit
	 * @param int $offset
	 * @return array[]
	 */
	public function searchByName(string $georeportName, int $limit = 10, int $offset = 0): array
	{
		$sql = "SELECT g.*,
                   u.first_name AS created_by_first_name,
                   u.last_name AS created_by_last_name
            FROM georeports g
            LEFT JOIN users u ON g.created_by = u.user_id
            WHERE g.georeport_name LIKE :georeport_name
            ORDER BY g.created_at DESC LIMIT :limit OFFSET :offset";

		$stmt = $this->pdo->prepare($sql);
		$stmt->bindValue(':georeport_name', '%' . trim($georeportName) . '%', PDO::PARAM_STR);
		$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
		$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
		$stmt->execute();

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
                    georeport_name, details, created_by, created_at
                ) VALUES (
                    :id, :gm_id, :insitu_id, :inlab_id, :name, :details, :created_by, NOW()
                )";
		$this->execute(
			$sql, [
				':id' => $id,
				':gm_id' => $dto->geomanifestationId,
				':insitu_id' => $dto->insituTestId,
				':inlab_id' => $dto->inlabTestId,
				':name' => $dto->georeportName,
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

	/**
	 * Resets visibility to 0 for all georeports belonging to a geomanifestation.
	 *
	 * @param string $geomanifestationId
	 * @return void
	 */
	public function resetVisibilityForManifestation(string $geomanifestationId): void
	{
		$sql = "UPDATE georeports SET visibility = 0 WHERE geomanifestation_id = :gm_id";
		$this->execute($sql, [':gm_id' => $geomanifestationId]);
	}

	/**
	 * Sets visibility to 1 for a specific georeport and 0 for all other georeports
	 * of the same geomanifestation.
	 *
	 * @param string $id
	 * @param string $geomanifestationId
	 * @return void
	 */
	public function promoteVisibility(string $id, string $geomanifestationId): void
	{
		$this->resetVisibilityForManifestation($geomanifestationId);
		$sql = "UPDATE georeports SET visibility = 1 WHERE georeport_id = :id AND geomanifestation_id = :gm_id";
		$this->execute($sql, [':id' => $id, ':gm_id' => $geomanifestationId]);
	}

  public function countByName(string $georeportName) {
    $sql = "SELECT COUNT(*) FROM georeports WHERE georeport_name LIKE :georeport_name";
    $stmt = $this->execute($sql, [':georeport_name' => '%' . trim($georeportName) . '%']);
    return (int)$stmt->fetchColumn();
  }
}