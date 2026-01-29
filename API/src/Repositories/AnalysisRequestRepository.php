<?php
// src/Repositories/AnalysisRequestRepository.php
declare(strict_types=1);

namespace Repositories;

use PDO;
use DTO\AnalysisRequestDTO;

final class AnalysisRequestRepository
{
	public function __construct(private PDO $pdo)
	{
	}

	/**
	 * Creates a new analysis request and returns its generated ID.
	 */
	public function create(AnalysisRequestDTO $dto, int $userId): int
	{    // Generate business-readable name AFTER insert
    $sql = "
      INSERT INTO analysis_requests (
        name,
        region,
        email,
        owner_contact_number,
        owner_name,
        temperature_sensation,
        bubbles,
        details,
        current_usage,
        latitude,
        longitude,
        created_by
      ) VALUES (
        :name,
        :region,
        :email,
        :owner_contact_number,
        :owner_name,
        :temperature_sensation,
        :bubbles,
        :details,
        :current_usage,
        :latitude,
        :longitude,
        :created_by
      )
    ";

    $stmt = $this->pdo->prepare($sql);
    $stmt->execute([
      ':name' => null, // Temporary, updated after ID generation
      ':region' => $dto->region,
      ':email' => $dto->email,
      ':owner_contact_number' => $dto->owner_contact_number,
      ':owner_name' => $dto->owner_name,
      ':temperature_sensation' => $dto->temperature_sensation,
      ':bubbles' => $dto->bubbles ? 1 : 0,
      ':details' => $dto->details,
      ':current_usage' => $dto->current_usage,
      ':latitude' => $dto->latitude,
      ':longitude' => $dto->longitude,
      ':created_by' => $userId
    ]);

    // Get AUTO_INCREMENT value safely
    $id = (int) $this->pdo->lastInsertId();

    // Generate business identifier using the real ID
    $generatedName = 'SOLI-' . $id;

    // Update name once ID exists
    $this->updateName($id, $generatedName);

    return $id;
	}

	/**
	 * Finds an analysis request by ID and creator.
	 */
	public function findByIdAndUser(int $id, int $userId): ?array
	{
		$stmt = $this->pdo->prepare(
			'SELECT id FROM analysis_requests WHERE id = :id AND created_by = :user_id'
		);

		$stmt->execute([
			':id' => $id,
			':user_id' => $userId
		]);

		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		return $result ?: null;
	}

	/**
	 * Updates an analysis request owned by a user.
	 */
	public function update(
		int $id,
		int $userId,
		AnalysisRequestDTO $dto
	): void {
		$sql = '
			UPDATE analysis_requests SET
				region = :region,
				email = :email,
				owner_contact_number = :owner_contact_number,
				owner_name = :owner_name,
				temperature_sensation = :temperature_sensation,
				bubbles = :bubbles,
				details = :details,
				current_usage = :current_usage,
				latitude = :latitude,
				longitude = :longitude,
				updated_at = NOW()
			WHERE id = :id AND created_by = :user_id
		';

		$stmt = $this->pdo->prepare($sql);
		$stmt->execute([
			':region' => $dto->region,
			':email' => $dto->email,
			':owner_contact_number' => $dto->owner_contact_number,
			':owner_name' => $dto->owner_name,
			':temperature_sensation' => $dto->temperature_sensation,
			':bubbles' => $dto->bubbles ? 1 : 0,
			':details' => $dto->details,
			':current_usage' => $dto->current_usage,
			':latitude' => $dto->latitude,
			':longitude' => $dto->longitude,
			':id' => $id,
			':user_id' => $userId
		]);
	}

	/**
	 * Deletes an analysis request owned by a user.
	 */
	public function delete(int $id, int $userId): void
	{
		$stmt = $this->pdo->prepare(
			'DELETE FROM analysis_requests WHERE id = :id AND created_by = :user_id'
		);

		$stmt->execute([
			':id' => $id,
			':user_id' => $userId
		]);
	}

	/**
	 * Returns all analysis requests created by a specific user.
	 * Excludes sensitive/internal columns.
	 *
	 * @param int $userId
	 * @return array
	 */
	public function findAllByUser(int $userId): array
	{
		$sql = "
			SELECT
					name,
					region,
					email,
					owner_name,
					owner_contact_number,
					current_usage,
					temperature_sensation,
					bubbles,
					details,
					latitude,
					longitude,
					state,
					created_at
			FROM analysis_requests
			WHERE created_by = :user_id
			ORDER BY created_at DESC
			";

		$stmt = $this->pdo->prepare($sql);
		$stmt->execute([
			':user_id' => $userId
		]);

		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	/**
	 * Updates the generated name for the request.
	 */
	public function updateName(int $id, string $name): void
	{
		$stmt = $this->pdo->prepare(
			"UPDATE analysis_requests SET name = :name WHERE id = :id"
		);

		$stmt->execute([
			':name' => $name,
			':id' => $id
		]);
	}

}
