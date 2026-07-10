<?php
declare(strict_types=1);

namespace Repositories;

use Core\UlidGenerator;
use DTO\RegisterInvestigationRequestDTO;
use DTO\UpdateInvestigationRequestDTO;
use PDO;

/**
 * Repository handling database operations for geothermal investigation requests,
 * including spatial hierarchies (provinces, cantons, districts) and workflow states.
 */
final class InvestigationRequestRepository
{
	public function __construct(private PDO $pdo) {}

	/**
	 * Creates a new investigation request and initializes its state to 'Pendiente'.
	 * If relation_with_owner is 'Titular', owner details are resolved from the creator user profile.
	 *
	 * @param RegisterInvestigationRequestDTO $dto Data transfer object containing request details.
	 * @param string $userId The identifier of the user creating the request.
	 * @return array The created request enriched with location and state details.
	 */
	public function create(RegisterInvestigationRequestDTO $dto, string $userId): array
	{
		$requestId = UlidGenerator::generate();
		$timePart = substr($requestId, 0, 10);
		$generatedName = 'SOLI-' . $dto->districtSnitCode . '-' . $timePart;
		// Initialize owner details with DTO defaults
		$ownerName = $dto->ownerName;
		$ownerPhone = $dto->ownerPhoneNumber;
		$ownerEmail = $dto->ownerEmail;

		// Resolve owner information automatically if the applicant is the legal owner
		if ($dto->relationWithOwner === 'Titular') {
			$userSql = "SELECT first_name, last_name, email, phone_number 
                  FROM users 
                  WHERE user_id = :user_id AND is_deleted = 0 
                  LIMIT 1";
			$userStmt = $this->pdo->prepare($userSql);
			$userStmt->execute([':user_id' => $userId]);
			$user = $userStmt->fetch(PDO::FETCH_ASSOC);

			if ($user) {
				$ownerName = trim($user['first_name'] . ' ' . $user['last_name']);
				$ownerPhone = $user['phone_number'];
				$ownerEmail = $user['email'];
			}
		}

		$sql = "INSERT INTO requests (
                      request_id, province_snit_code, canton_snit_code, district_snit_code,
                      user_id, request_name, owner_name, owner_phone_number, owner_email,
                      current_usage, temperature_sensation, bubbles, details,
                      exact_address, latitude, longitude, relation_with_owner, created_at
                  ) VALUES (
                      :id, :province_snit, :canton_snit, :district_snit,
                      :user_id, :name, :owner_name, :owner_phone, :owner_email,
                      :current_usage, :temp_sensation, :bubbles, :details,
                      :exact_address, :lat, :lng, :relation, NOW()
                  )";
		$stmt = $this->pdo->prepare($sql);
		$stmt->execute(
			[
				':id' => $requestId,
				':province_snit' => $dto->provinceSnitCode,
				':canton_snit' => $dto->cantonSnitCode,
				':district_snit' => $dto->districtSnitCode,
				':user_id' => $userId,
				':name' => $generatedName,
				':owner_name' => $ownerName,
				':owner_phone' => $ownerPhone,
				':owner_email' => $ownerEmail,
				':current_usage' => $dto->currentUsage,
				':temp_sensation' => $dto->temperatureSensation,
				':bubbles' => $dto->bubbles ? 1 : 0,
				':details' => $dto->details,
				':exact_address' => $dto->exactAddress,
				':lat' => $dto->latitude,
				':lng' => $dto->longitude,
				':relation' => $dto->relationWithOwner
			]
		);

		$stateId = UlidGenerator::generate();
		$sqlState = "INSERT INTO requests_state (
                          request_status_id, request_id, value, description, created_at, created_by
                       ) VALUES (
                          :state_id, :request_id, 'Pendiente', :desc, NOW(), :created_by
                       )";
		$stmtState = $this->pdo->prepare($sqlState);
		$stmtState->execute(
			[
				':state_id' => $stateId,
				':request_id' => $requestId,
				':desc' => 'Solicitud creada',
				':created_by' => $userId
			]
		);

		return $this->findByIdAndUser($requestId, $userId);
	}

	/**
	 * Finds a request by ID and creator user ID (owner scope).
	 *
	 * @param string $id Unique request identifier.
	 * @param string $userId Identifier of the creator user.
	 * @return array|null The found request dataset or null if not matched.
	 */
	public function findByIdAndUser(string $id, string $userId): ?array
	{
		$sql = "SELECT r.*, 
                   p.province_name,
                   c.canton_name,
                   d.district_name,
                   rs.value AS current_state, 
                   rs.description AS state_description,
                   rs.created_at AS state_created_at
            FROM requests r
            LEFT JOIN provinces p ON r.province_snit_code = p.province_snit_code
            LEFT JOIN cantons c ON r.canton_snit_code = c.canton_snit_code
            LEFT JOIN districts d ON r.district_snit_code = d.district_snit_code
            LEFT JOIN (
                SELECT request_id, value, description, created_at,
                       ROW_NUMBER() OVER (PARTITION BY request_id ORDER BY created_at DESC) as rn
                FROM requests_state
            ) rs ON r.request_id = rs.request_id AND rs.rn = 1
            WHERE r.request_id = :id AND r.user_id = :user_id";
		$stmt = $this->pdo->prepare($sql);
		$stmt->execute([':id' => $id, ':user_id' => $userId]);
		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		return $result ?: null;
	}

	/**
	 * Updates an existing investigation request for a specific user.
	 *
	 * @param string $id Unique request identifier.
	 * @param string $userId Identifier of the creator user.
	 * @param UpdateInvestigationRequestDTO $dto Data transfer object containing fields to update.
	 * @return array|null The updated request record or null if payload is empty.
	 */
	public function update(string $id, string $userId, UpdateInvestigationRequestDTO $dto): ?array
	{
		$updateData = $dto->toArray();
		if (empty($updateData)) {
			return null;
		}

		$sql = "UPDATE requests SET ";
		$params = [];
		$setParts = [];
		foreach ($updateData as $field => $value) {
			$setParts[] = "$field = :$field";
			$params[":$field"] = $value;
		}
		$sql .= implode(', ', $setParts);
		$sql .= " WHERE request_id = :id AND user_id = :user_id";
		$params[':id'] = $id;
		$params[':user_id'] = $userId;

		$stmt = $this->pdo->prepare($sql);
		$stmt->execute($params);
		return $this->findByIdAndUser($id, $userId);
	}

	/**
	 * Appends a new tracking workflow status to an investigation request.
	 *
	 * @param string $requestId Unique request identifier.
	 * @param string $stateValue The new status label (e.g., 'Aprobado', 'Rechazado').
	 * @param string $description Explanatory audit note for the status modification.
	 * @param string $createdBy Identifier of the user or admin triggering the update.
	 * @return array The updated request details under administrative scope.
	 */
	public function addState(string $requestId, string $stateValue, string $description, string $createdBy): array
	{
		$stateId = UlidGenerator::generate();
		$sql = "INSERT INTO requests_state (request_status_id, request_id, value, description, created_at, created_by)
            VALUES (:state_id, :request_id, :value, :desc, NOW(), :created_by)";
		$stmt = $this->pdo->prepare($sql);
		$stmt->execute(
			[
				':state_id' => $stateId,
				':request_id' => $requestId,
				':value' => $stateValue,
				':desc' => $description,
				':created_by' => $createdBy
			]
		);
		return $this->findById($requestId);
	}

	/**
	 * Finds a request by ID (admin only, includes user creator metadata).
	 *
	 * @param string $id Unique request identifier.
	 * @return array|null The matching request dataset or null if not found.
	 */
	public function findById(string $id): ?array
	{
		$sql = "SELECT r.*,
                   p.province_name,
                   c.canton_name,
                   d.district_name,
                   rs.value AS current_state, 
                   rs.description AS state_description,
                   rs.created_at AS state_created_at
            FROM requests r
            LEFT JOIN provinces p ON r.province_snit_code = p.province_snit_code
            LEFT JOIN cantons c ON r.canton_snit_code = c.canton_snit_code
            LEFT JOIN districts d ON r.district_snit_code = d.district_snit_code
            LEFT JOIN users u ON r.user_id = u.user_id
            LEFT JOIN (
                SELECT request_id, value, description, created_at,
                       ROW_NUMBER() OVER (PARTITION BY request_id ORDER BY created_at DESC) as rn
                FROM requests_state
            ) rs ON r.request_id = rs.request_id AND rs.rn = 1
            WHERE r.request_id = :id";
		$stmt = $this->pdo->prepare($sql);
		$stmt->execute([':id' => $id]);
		$result = $stmt->fetch(PDO::FETCH_ASSOC);
		return $result ?: null;
	}

	/**
	 * Retrieves the historical state changes tracking for a given request.
	 *
	 * @param string $requestId Unique request identifier.
	 * @return array Collection of historical state records ordered chronologically.
	 */
	public function getStatesByRequestId(string $requestId): array
	{
		$sql = "SELECT request_status_id, value, description, created_at, created_by
            FROM requests_state
            WHERE request_id = :request_id
            ORDER BY created_at ASC";
		$stmt = $this->pdo->prepare($sql);
		$stmt->execute([':request_id' => $requestId]);
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	/**
	 * Performs a hard delete on a specific request restricted to its owner.
	 *
	 * @param string $id Unique request identifier.
	 * @param string $userId Identifier of the validating user owner.
	 */
	public function delete(string $id, string $userId): void
	{
		$stmt = $this->pdo->prepare(
			"DELETE FROM requests WHERE request_id = :id AND user_id = :user_id"
		);
		$stmt->execute([':id' => $id, ':user_id' => $userId]);
	}

	/**
	 * Performs an administrative hard delete on any request by ID.
	 *
	 * @param string $id Unique request identifier.
	 */
	public function adminDelete(string $id): void
	{
		$stmt = $this->pdo->prepare("DELETE FROM requests WHERE request_id = :id");
		$stmt->execute([':id' => $id]);
	}

	/**
	 * Retrieves all requests submitted by a specific user.
	 *
	 * @param string $userId Identifier of the user owner.
	 * @return array Collection of requests matching the user criteria.
	 */
	public function findAllByUser(string $userId): array
	{
		$sql = "SELECT r.*, 
                   p.province_name,
                   c.canton_name,
                   d.district_name,
                   rs.value AS current_state, 
                   rs.description AS state_description,
                   rs.created_at AS state_created_at
            FROM requests r
            LEFT JOIN provinces p ON r.province_snit_code = p.province_snit_code
            LEFT JOIN cantons c ON r.canton_snit_code = c.canton_snit_code
            LEFT JOIN districts d ON r.district_snit_code = d.district_snit_code
            LEFT JOIN (
                SELECT request_id, value, description, created_at,
                       ROW_NUMBER() OVER (PARTITION BY request_id ORDER BY created_at DESC) as rn
                FROM requests_state
            ) rs ON r.request_id = rs.request_id AND rs.rn = 1
            WHERE r.user_id = :user_id
            ORDER BY r.created_at DESC";
		$stmt = $this->pdo->prepare($sql);
		$stmt->execute([':user_id' => $userId]);
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	/**
	 * Returns all global system requests (global administrative scope).
	 *
	 * @return array Collection containing all requests across the application.
	 */
	public function getAll(): array
	{
		$sql = "SELECT r.*, 
                   p.province_name,
                   c.canton_name,
                   d.district_name,
                   rs.value AS current_state, 
                   rs.description AS state_description,
                   rs.created_at AS state_created_at
            FROM requests r
            LEFT JOIN provinces p ON r.province_snit_code = p.province_snit_code
            LEFT JOIN cantons c ON r.canton_snit_code = c.canton_snit_code
            LEFT JOIN districts d ON r.district_snit_code = d.district_snit_code
            LEFT JOIN users u ON r.user_id = u.user_id
            LEFT JOIN (
                SELECT request_id, value, description, created_at,
                       ROW_NUMBER() OVER (PARTITION BY request_id ORDER BY created_at DESC) as rn
                FROM requests_state
            ) rs ON r.request_id = rs.request_id AND rs.rn = 1
            ORDER BY r.created_at DESC";
		$stmt = $this->pdo->prepare($sql);
		$stmt->execute();
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}
}