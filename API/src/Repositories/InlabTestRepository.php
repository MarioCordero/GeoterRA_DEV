<?php
declare(strict_types=1);

namespace Repositories;

use DTO\RegisterInlabTestDTO;
use DTO\UpdateInlabTestDTO;
use PDO;

/**
 * Repository for in-lab tests (inlab_tests table).
 */
final class InlabTestRepository extends Repository
{
	/**
	 * Finds an in-lab test by its ULID, including creator user info.
	 *
	 * @param string $id
	 * @return array|null Associative array or null if not found
	 */
	public function findById(string $id): ?array
	{
		$sql = "SELECT t.*,
                       u.first_name AS created_by_first_name,
                       u.last_name AS created_by_last_name
                FROM inlab_tests t
                LEFT JOIN users u ON t.created_by = u.user_id
                WHERE t.inlab_test_id = :id";
		$stmt = $this->execute($sql, [':id' => $id]);
		$row = $stmt->fetch(PDO::FETCH_ASSOC);
		return $row ?: null;
	}

	/**
	 * Returns all in-lab tests for a given geomanifestation, with optional name filtering and pagination.
	 *
	 * @param string $geomanifestationId
	 * @param string|null $inlabTestName
	 * @param int $limit
	 * @param int $offset
	 * @return array[]
	 */
	public function getByManifestation(
		string $geomanifestationId,
		?string $inlabTestName = null,
		int $limit = 10,
		int $offset = 0
	): array {
		$sql = "SELECT t.*,
                   u.first_name AS created_by_first_name,
                   u.last_name AS created_by_last_name
            FROM inlab_tests t
            LEFT JOIN users u ON t.created_by = u.user_id
            WHERE t.geomanifestation_id = :gm_id";

		$params = [':gm_id' => $geomanifestationId];

		if ($inlabTestName !== null && trim($inlabTestName) !== '') {
			$sql .= " AND t.inlab_test_name LIKE :inlab_test_name";
			$params[':inlab_test_name'] = '%' . trim($inlabTestName) . '%';
		}

    $sql .= " ORDER BY t.created_at DESC LIMIT " . (int)$limit . " OFFSET " . (int)$offset;
    $stmt = $this->execute($sql, $params);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	/**
	 * Counts in-lab tests for a given geomanifestation with optional name filtering.
	 *
	 * @param string $geomanifestationId
	 * @param string|null $inlabTestName
	 * @return int
	 */
	public function countByManifestation(string $geomanifestationId, ?string $inlabTestName = null): int
	{
		$sql = "SELECT COUNT(*) FROM inlab_tests t WHERE t.geomanifestation_id = :gm_id";
		$params = [':gm_id' => $geomanifestationId];

		if ($inlabTestName !== null && trim($inlabTestName) !== '') {
			$sql .= " AND t.inlab_test_name LIKE :inlab_test_name";
			$params[':inlab_test_name'] = '%' . trim($inlabTestName) . '%';
		}

		$stmt = $this->execute($sql, $params);
		return (int)$stmt->fetchColumn();
	}

	/**
	 * Searches in-lab tests globally by name with pagination.
	 *
	 * @param string $inlabTestName
	 * @param int $limit
	 * @param int $offset
	 * @return array[]
	 */
	public function searchByName(string $inlabTestName, int $limit = 10, int $offset = 0): array
	{
		$sql = "SELECT t.*,
                   u.first_name AS created_by_first_name,
                   u.last_name AS created_by_last_name
            FROM inlab_tests t
            LEFT JOIN users u ON t.created_by = u.user_id
            WHERE t.inlab_test_name LIKE :inlab_test_name
            ORDER BY t.created_at DESC LIMIT :limit OFFSET :offset";

		$stmt = $this->pdo->prepare($sql);
		$stmt->bindValue(':inlab_test_name', '%' . trim($inlabTestName) . '%', PDO::PARAM_STR);
		$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
		$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
		$stmt->execute();

		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	/**
	 * Creates a new in-lab test.
	 *
	 * @param RegisterInlabTestDTO $dto
	 * @param string $createdBy User ULID
	 * @return array|null The created record or null on failure
	 */
	public function create(RegisterInlabTestDTO $dto, string $createdBy): ?array
	{
		$id = $this->generateUlid();
		$sql = "INSERT INTO inlab_tests (
                    inlab_test_id, geomanifestation_id, inlab_test_name,
                    ph, conductivity, cl, ca, hco3, so4, fe, si, b, li, f, na, k, mg,
                    description, created_by, created_at
                ) VALUES (
                    :id, :gm_id, :name,
                    :ph, :cond, :cl, :ca, :hco3, :so4, :fe, :si, :b, :li, :f, :na, :k, :mg,
                    :desc, :created_by, NOW()
                )";
		$this->execute(
			$sql, [
				':id' => $id,
				':gm_id' => $dto->geomanifestationId,
				':name' => $dto->inlabTestName,
				':ph' => $dto->ph,
				':cond' => $dto->conductivity,
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
				':desc' => $dto->description,
				':created_by' => $createdBy
			]
		);

		$row = $this->findById($id);
		return $row ?: null;
	}

	/**
	 * Updates an existing in-lab test using only provided fields.
	 *
	 * @param string $id
	 * @param UpdateInlabTestDTO $dto
	 * @return array|null Not null if updated successfully
	 */
	public function update(string $id, UpdateInlabTestDTO $dto): ?array
	{
		$updateData = $dto->toArray();
		if (empty($updateData)) {
			return $this->findById($id);
		}

		$sql = "UPDATE inlab_tests SET ";
		$params = [];
		$setParts = [];
		foreach ($updateData as $field => $value) {
			$setParts[] = "$field = :$field";
			$params[":$field"] = $value;
		}
		$sql .= implode(', ', $setParts);
		$sql .= " WHERE inlab_test_id = :id";
		$params[':id'] = $id;

		$this->execute($sql, $params);
		$row = $this->findById($id);
		return $row ?: null;
	}

	/**
	 * Deletes an in-lab test.
	 *
	 * @param string $id
	 * @return bool
	 */
	public function delete(string $id): bool
	{
		$sql = "DELETE FROM inlab_tests WHERE inlab_test_id = :id";
		$stmt = $this->execute($sql, [':id' => $id]);
		return $stmt->rowCount() > 0;
	}

	/**
	 * Resets visibility to 0 for all in-lab tests belonging to a geomanifestation.
	 *
	 * @param string $geomanifestationId
	 * @return void
	 */
	public function resetVisibilityForManifestation(string $geomanifestationId): void
	{
		$sql = "UPDATE inlab_tests SET visibility = 0 WHERE geomanifestation_id = :gm_id";
		$this->execute($sql, [':gm_id' => $geomanifestationId]);
	}

	/**
	 * Sets visibility to 1 for a specific in-lab test and 0 for all other tests
	 * of the same geomanifestation.
	 *
	 * @param string $id
	 * @param string $geomanifestationId
	 * @return void
	 */
	public function promoteVisibility(string $id, string $geomanifestationId): void
	{
		$this->resetVisibilityForManifestation($geomanifestationId);
		$sql = "UPDATE inlab_tests SET visibility = 1 WHERE inlab_test_id = :id AND geomanifestation_id = :gm_id";
		$this->execute($sql, [':id' => $id, ':gm_id' => $geomanifestationId]);
	}

  public function countByName(string $inlabTestName) {
    $sql = "SELECT COUNT(*) FROM inlab_tests WHERE inlab_test_name LIKE :inlab_test_name";
    $stmt = $this->execute($sql, [':inlab_test_name' => '%' . trim($inlabTestName) . '%']);
    return (int)$stmt->fetchColumn();
  }
}