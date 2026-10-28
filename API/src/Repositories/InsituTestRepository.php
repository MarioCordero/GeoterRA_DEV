<?php
declare(strict_types=1);

namespace Repositories;

use DTO\RegisterInsituTestDTO;
use DTO\UpdateInsituTestDTO;
use PDO;

/**
 * Repository for in-situ tests (insitu_tests table).
 */
final class InsituTestRepository extends Repository
{
  /**
   * Finds an in-situ test by its ULID, including creator user info.
   *
   * @param string $id
   * @return array|null Associative array or null if not found
   */
  public function findById(string $id): ?array
  {
    $sql = "SELECT t.*,
                       u.first_name AS created_by_first_name,
                       u.last_name AS created_by_last_name
                FROM insitu_tests t
                LEFT JOIN users u ON t.created_by = u.user_id
                WHERE t.insitu_test_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

	/**
	 * Returns all in-situ tests for a given geomanifestation, with optional name filtering and pagination.
	 *
	 * @param string $geomanifestationId
	 * @param string|null $insituTestName
	 * @param int $limit
	 * @param int $offset
	 * @return array[]
	 */
	public function getByManifestation(
		string $geomanifestationId,
		?string $insituTestName = null,
		int $limit = 10,
		int $offset = 0
	): array {
		$sql = "SELECT t.*,
                 u.first_name AS created_by_first_name,
                 u.last_name AS created_by_last_name
          FROM insitu_tests t
          LEFT JOIN users u ON t.created_by = u.user_id
          WHERE t.geomanifestation_id = :gm_id";

		$params = [':gm_id' => $geomanifestationId];

		if ($insituTestName !== null && trim($insituTestName) !== '') {
			$sql .= " AND t.insitu_test_name LIKE :insitu_test_name";
			$params[':insitu_test_name'] = '%' . trim($insituTestName) . '%';
		}

		$sql .= " ORDER BY t.created_at DESC LIMIT :limit OFFSET :offset";

		$stmt = $this->pdo->prepare($sql);
		foreach ($params as $key => $val) {
			$stmt->bindValue($key, $val, PDO::PARAM_STR);
		}
		$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
		$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
		$stmt->execute();

		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	/**
	 * Counts in-situ tests for a given geomanifestation with optional name filtering.
	 *
	 * @param string $geomanifestationId
	 * @param string|null $insituTestName
	 * @return int
	 */
	public function countByManifestation(string $geomanifestationId, ?string $insituTestName = null): int
	{
		$sql = "SELECT COUNT(*) FROM insitu_tests t WHERE t.geomanifestation_id = :gm_id";
		$params = [':gm_id' => $geomanifestationId];

		if ($insituTestName !== null && trim($insituTestName) !== '') {
			$sql .= " AND t.insitu_test_name LIKE :insitu_test_name";
			$params[':insitu_test_name'] = '%' . trim($insituTestName) . '%';
		}

		$stmt = $this->execute($sql, $params);
		return (int)$stmt->fetchColumn();
	}

	/**
	 * Searches in-situ tests globally by name with pagination.
	 *
	 * @param string $insituTestName
	 * @param int $limit
	 * @param int $offset
	 * @return array[]
	 */
	public function searchByName(string $insituTestName, int $limit = 10, int $offset = 0): array
	{
		$sql = "SELECT t.*,
                 u.first_name AS created_by_first_name,
                 u.last_name AS created_by_last_name
          FROM insitu_tests t
          LEFT JOIN users u ON t.created_by = u.user_id
          WHERE t.insitu_test_name LIKE :insitu_test_name
          ORDER BY t.created_at DESC LIMIT :limit OFFSET :offset";

		$stmt = $this->pdo->prepare($sql);
		$stmt->bindValue(':insitu_test_name', '%' . trim($insituTestName) . '%', PDO::PARAM_STR);
		$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
		$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
		$stmt->execute();

		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	/**
	 * Creates a new in-situ test.
	 *
	 * @param RegisterInsituTestDTO $dto
	 * @param string $createdBy User ULID
	 * @return array The result row.
	 */
	public function create(RegisterInsituTestDTO $dto, string $createdBy): array
	{
		$id = $this->generateUlid();
		$sql = "INSERT INTO insitu_tests (
                  insitu_test_id, geomanifestation_id, insitu_test_name, temperature, conductivity,
                  ph, description, created_by, created_at
              ) VALUES (
                  :id, :gm_id, :name, :temp, :cond, :ph, :desc, :created_by, NOW()
              )";
		$this->execute(
			$sql, [
				':id' => $id,
				':gm_id' => $dto->geomanifestationId,
				':name' => $dto->insituTestName,
				':temp' => $dto->temperature,
				':cond' => $dto->conductivity,
				':ph' => $dto->ph,
				':desc' => $dto->description,
				':created_by' => $createdBy
			]
		);

		return $this->findById($id);
	}

  /**
   * Updates an existing in-situ test using only provided fields.
   *
   * @param string $id
   * @param UpdateInsituTestDTO $dto
   * @return array|null Not null if at least one row was affected
   */
  public function update(string $id, UpdateInsituTestDTO $dto): ?array
  {
    $updateData = $dto->toArray();
    if (empty($updateData)) {
      return null;
    }

    $sql = "UPDATE insitu_tests SET ";
    $params = [];
    $setParts = [];
    foreach ($updateData as $field => $value) {
      $setParts[] = "$field = :$field";
      $params[":$field"] = $value;
    }
    $sql .= implode(', ', $setParts);
    $sql .= " WHERE insitu_test_id = :id";
    $params[':id'] = $id;

    $this->execute($sql, $params);

    return $this->findById($id);
  }

  /**
   * Deletes an in-situ test.
   *
   * @param string $id
   * @return bool
   */
  public function delete(string $id): bool
  {
    $sql = "DELETE FROM insitu_tests WHERE insitu_test_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    return $stmt->rowCount() > 0;
  }

  /**
   * Resets visibility to 0 for all in-situ tests belonging to a geomanifestation.
   *
   * @param string $geomanifestationId
   * @return void
   */
  public function resetVisibilityForManifestation(string $geomanifestationId): void
  {
    $sql = "UPDATE insitu_tests SET visibility = 0 WHERE geomanifestation_id = :gm_id";
    $this->execute($sql, [':gm_id' => $geomanifestationId]);
  }

  /**
   * Sets visibility to 1 for a specific in-situ test and 0 for all other tests
   * of the same geomanifestation.
   *
   * @param string $id
   * @param string $geomanifestationId
   * @return void
   */
  public function promoteVisibility(string $id, string $geomanifestationId): void
  {
    $this->resetVisibilityForManifestation($geomanifestationId);
    $sql = "UPDATE insitu_tests SET visibility = 1 WHERE insitu_test_id = :id AND geomanifestation_id = :gm_id";
    $this->execute($sql, [':id' => $id, ':gm_id' => $geomanifestationId]);
  }
}