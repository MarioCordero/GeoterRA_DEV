<?php
// src/Repositories/AnalysisRequestRepository.php
declare(strict_types=1);

namespace Repositories;

use Exception;
use PDO;
use DTO\AnalysisRequestDTO;
use DTO\Ulid;


final class AnalysisRequestRepository
{
	public function __construct(private PDO $pdo)
	{
	}

	/**
	 * Creates a new analysis request and returns its generated ID.
	 */
	public function create(AnalysisRequestDTO $dto, string $userId): string
	{    // Generate business-readable name AFTER insert
 		$maxAttempts = 5;
    $attempts = 0;
    $requestId = Ulid::generate();

    while ($attempts < $maxAttempts) {
			try {
				$suffix = strtoupper(substr($requestId, -5));
				$generatedName = 'SOLI-' . $suffix;

				$sql = "
						INSERT INTO analysis_requests (
								id, name, region_id, email, owner_contact_number, owner_name,
								temperature_sensation, bubbles, details, current_usage,
								latitude, longitude, created_by
						) VALUES (
								:id, :name, :region_id, :email, :owner_contact_number, :owner_name,
								:temperature_sensation, :bubbles, :details, :current_usage,
								:latitude, :longitude, :created_by
						)
				";

				$stmt = $this->pdo->prepare($sql);
				$stmt->execute([
						':id' => $requestId,
						':name' => $generatedName,
						':region_id' => $dto->region,
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

				return $requestId;

			} catch (\PDOException $e) {
				if ($e->getCode() == '23000' || str_contains($e->getMessage(), 'Duplicate entry')) {
					$attempts++;
					// newUlid 
					$requestId = Ulid::generate();
					continue; 
				}
				
				throw $e;
			}
    }

    throw new \Exception("No se pudo generar un nombre único tras $maxAttempts intentos.");
	}

	/**
	 * Finds an analysis request by ID and creator.
	 */
	public function findByIdAndUser(string $id, string $userId): ?array
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
	 * Finds an analysis request by ID.
	 */
	public function findById(string $id): ?array
	{
		$stmt = $this->pdo->prepare(
			'SELECT id FROM analysis_requests WHERE id = :id'
		);

		$stmt->execute([
			':id' => $id
		]);

		$result = $stmt->fetch(PDO::FETCH_ASSOC);

		return $result ?: null;
	}

	/**
	 * Updates an analysis request owned by a user.
	 * 
	 * @param string $id
	 * @param string $userId
	 * @param AnalysisRequestDTO $dto
	 * 
	 * @throws Exception
	 */
	public function update(string $id, string $userId, AnalysisRequestDTO $dto): void
	{
		$sql = '
				UPDATE analysis_requests SET
						region_id               = :region_id,
						email                   = :email,
						owner_contact_number    = :owner_contact_number,
						owner_name              = :owner_name,
						temperature_sensation   = :temperature_sensation,
						bubbles                 = :bubbles,
						details                 = :details,
						current_usage           = :current_usage,
						latitude                = :latitude,
						longitude               = :longitude
				WHERE id = :id AND created_by = :user_id
		';

		$stmt = $this->pdo->prepare($sql);
		$stmt->execute([
				':region_id'             => $dto->region,
				':email'                 => $dto->email,
				':owner_contact_number'  => $dto->owner_contact_number,
				':owner_name'            => $dto->owner_name,
				':temperature_sensation' => $dto->temperature_sensation,
				':bubbles'               => $dto->bubbles ? 1 : 0,
				':details'               => $dto->details,
				':current_usage'         => $dto->current_usage,
				':latitude'              => $dto->latitude,
				':longitude'             => $dto->longitude,
				':id'                    => $id,
				':user_id'               => $userId
		]);
	}

	/**
	 * Updates any analysis request on the system.
	 * 
	 * @param string $id
	 * @param AnalysisRequestDTO $dto
	 * 
	 * @throws Exception
	 */
	public function adminUpdate(string $id, AnalysisRequestDTO $dto): void
	{
		$sql = '
				UPDATE analysis_requests SET
						region_id               = :region_id,
						email                   = :email,
						owner_contact_number    = :owner_contact_number,
						owner_name              = :owner_name,
						temperature_sensation   = :temperature_sensation,
						bubbles                 = :bubbles,
						details                 = :details,
						current_usage           = :current_usage,
						latitude                = :latitude,
						longitude               = :longitude
		';

		$stmt = $this->pdo->prepare($sql);
		$stmt->execute([
				':region_id'             => $dto->region,
				':email'                 => $dto->email,
				':owner_contact_number'  => $dto->owner_contact_number,
				':owner_name'            => $dto->owner_name,
				':temperature_sensation' => $dto->temperature_sensation,
				':bubbles'               => $dto->bubbles ? 1 : 0,
				':details'               => $dto->details,
				':current_usage'         => $dto->current_usage,
				':latitude'              => $dto->latitude,
				':longitude'             => $dto->longitude,
				':id'                    => $id,
		]);
	}

	/**
	 * Deletes an analysis request owned by a user.
	 */
	public function delete(string $id, string $userId): void
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
	 * Deletes any analysis request on the system.
	 * 
	 * @param string $id
	 * @throws Exception
	 */
	public function adminDelete(string $id): void
	{
		$stmt = $this->pdo->prepare(
			'DELETE FROM analysis_requests WHERE id = :id'
		);

		$stmt->execute([
			':id' => $id
		]);
	}

	/**
	 * Returns all analysis requests created by a specific user.
	 * Excludes sensitive/internal columns.
	 *
	 * @param string $userId
	 * @return array
	 */
	public function findAllByUser(string $userId): array
	{
		$sql = "
			SELECT
					id,
					name,
					region_id,
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
					created_at,
					created_by
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
	 * Returns all analysis requests regardless of creator. Only for admin use.
	 *
	 * @return array
	 */
	public function getAll(): array
	{
		$sql = "
			SELECT
					id,
					name,
					region_id,
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
					created_at,
					created_by
			FROM analysis_requests
			ORDER BY created_at DESC
			";

		$stmt = $this->pdo->prepare($sql);
		$stmt->execute();

		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	/**
	 * Updates the generated name for the request.
	 */
	public function updateName(string $id, string $name): void
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