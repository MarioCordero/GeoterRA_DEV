<?php
declare(strict_types=1);

namespace Repositories;

use Core\UlidGenerator;
use DTO\RegisterInvestigationRequestDTO;
use DTO\UpdateInvestigationRequestDTO;
use PDO;

/**
 * Repository handling database operations for geothermal investigation requests,
 * including spatial hierarchies (provinces, cantons, districts), workflow states,
 * pagination, and dynamic filtering.
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
    $generatedName = $dto->districtSnitCode . '-' . $timePart;

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
    $stmt->execute([
      ':id' => $requestId,
      ':province_snit' => $dto->provinceSnitCode,
      ':canton_snit' => $dto->cantonSnitCode,
      ':district_snit' => $dto->districtSnitCode,
      ':user_id' => $userId,
      ':name' => $generatedName,
      ':owner_name' => $dto->ownerName,
      ':owner_phone' => $dto->ownerPhoneNumber,
      ':owner_email' => $dto->ownerEmail,
      ':current_usage' => $dto->currentUsage,
      ':temp_sensation' => $dto->temperatureSensation,
      ':bubbles' => $dto->bubbles ? 1 : 0,
      ':details' => $dto->details,
      ':exact_address' => $dto->exactAddress,
      ':lat' => $dto->latitude,
      ':lng' => $dto->longitude,
      ':relation' => $dto->relationWithOwner
    ]);

    $stateId = UlidGenerator::generate();
    $sqlState = "INSERT INTO requests_state (
                          request_status_id, request_id, value, description, created_at, created_by
                       ) VALUES (
                          :state_id, :request_id, 'Pendiente', :desc, NOW(), :created_by
                       )";

    $stmtState = $this->pdo->prepare($sqlState);
    $stmtState->execute([
      ':state_id' => $stateId,
      ':request_id' => $requestId,
      ':desc' => 'Solicitud creada',
      ':created_by' => $userId
    ]);

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
    $stmt->execute([
      ':id' => $id,
      ':user_id' => $userId
    ]);

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
    $stmt->execute([
      ':state_id' => $stateId,
      ':request_id' => $requestId,
      ':value' => $stateValue,
      ':desc' => $description,
      ':created_by' => $createdBy
    ]);

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
                       u.first_name AS user_first_name,
                       u.last_name AS user_last_name,
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
   * @return void
   */
  public function delete(string $id, string $userId): void
  {
    $stmt = $this->pdo->prepare(
      "DELETE FROM requests WHERE request_id = :id AND user_id = :user_id"
    );
    $stmt->execute([
      ':id' => $id,
      ':user_id' => $userId
    ]);
  }

  /**
   * Performs an administrative hard delete on any request by ID.
   *
   * @param string $id Unique request identifier.
   * @return void
   */
  public function adminDelete(string $id): void
  {
    $stmt = $this->pdo->prepare("DELETE FROM requests WHERE request_id = :id");
    $stmt->execute([':id' => $id]);
  }

  /**
   * Retrieves a paginated list of requests submitted by a specific user with optional filters.
   *
   * @param string $userId Identifier of the user owner.
   * @param int $limit Max records to fetch.
   * @param int $offset Records to skip.
   * @param int|null $provinceSnitCode Filter by province SNIT.
   * @param int|null $cantonSnitCode Filter by canton SNIT.
   * @param int|null $districtSnitCode Filter by district SNIT.
   * @return array Collection of requests matching the criteria.
   */
  public function findAllByUserPaginated(
    string $userId,
    int $limit,
    int $offset,
    ?int $provinceSnitCode = null,
    ?int $cantonSnitCode = null,
    ?int $districtSnitCode = null
  ): array {
    $where = ["r.user_id = :user_id"];
    $params = [':user_id' => $userId];

    if ($provinceSnitCode !== null) {
      $where[] = "r.province_snit_code = :province";
      $params[':province'] = $provinceSnitCode;
    }
    if ($cantonSnitCode !== null) {
      $where[] = "r.canton_snit_code = :canton";
      $params[':canton'] = $cantonSnitCode;
    }
    if ($districtSnitCode !== null) {
      $where[] = "r.district_snit_code = :district";
      $params[':district'] = $districtSnitCode;
    }

    $whereClause = implode(' AND ', $where);

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
                WHERE $whereClause
                ORDER BY r.created_at DESC
                LIMIT :limit OFFSET :offset";

    $stmt = $this->pdo->prepare($sql);

    foreach ($params as $key => $val) {
      $stmt->bindValue($key, $val);
    }

    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
   * Counts the total requests for a specific user based on filters (used for pagination).
   *
   * @param string $userId Identifier of the user owner.
   * @param int|null $provinceSnitCode Filter by province SNIT.
   * @param int|null $cantonSnitCode Filter by canton SNIT.
   * @param int|null $districtSnitCode Filter by district SNIT.
   * @return int Total number of matching records.
   */
  public function countAllByUser(
    string $userId,
    ?int $provinceSnitCode = null,
    ?int $cantonSnitCode = null,
    ?int $districtSnitCode = null
  ): int {
    $where = ["r.user_id = :user_id"];
    $params = [':user_id' => $userId];

    if ($provinceSnitCode !== null) {
      $where[] = "r.province_snit_code = :province";
      $params[':province'] = $provinceSnitCode;
    }
    if ($cantonSnitCode !== null) {
      $where[] = "r.canton_snit_code = :canton";
      $params[':canton'] = $cantonSnitCode;
    }
    if ($districtSnitCode !== null) {
      $where[] = "r.district_snit_code = :district";
      $params[':district'] = $districtSnitCode;
    }

    $whereClause = implode(' AND ', $where);
    $sql = "SELECT COUNT(*) FROM requests r WHERE $whereClause";

    $stmt = $this->pdo->prepare($sql);
    $stmt->execute($params);

    return (int) $stmt->fetchColumn();
  }

  /**
   * Returns paginated global system requests with comprehensive filtering (admin scope).
   *
   * @param int $limit Max records to fetch.
   * @param int $offset Records to skip.
   * @param int|null $provinceSnitCode Filter by province SNIT.
   * @param int|null $cantonSnitCode Filter by canton SNIT.
   * @param int|null $districtSnitCode Filter by district SNIT.
   * @param string|null $requestName Filter by exact or partial request name.
   * @param string|null $userName Filter by user's first or last name.
   * @param string|null $userEmail Filter by user's email.
   * @return array Collection containing matching paginated requests.
   */
  public function getAllPaginated(
    int $limit,
    int $offset,
    ?int $provinceSnitCode = null,
    ?int $cantonSnitCode = null,
    ?int $districtSnitCode = null,
    ?string $requestName = null,
    ?string $userName = null,
    ?string $userEmail = null
  ): array {
    $where = ["1=1"];
    $params = [];

    if ($provinceSnitCode !== null) {
      $where[] = "r.province_snit_code = :province";
      $params[':province'] = $provinceSnitCode;
    }
    if ($cantonSnitCode !== null) {
      $where[] = "r.canton_snit_code = :canton";
      $params[':canton'] = $cantonSnitCode;
    }
    if ($districtSnitCode !== null) {
      $where[] = "r.district_snit_code = :district";
      $params[':district'] = $districtSnitCode;
    }
    if ($requestName !== null) {
      $where[] = "r.request_name LIKE :req_name";
      $params[':req_name'] = '%' . $requestName . '%';
    }
    if ($userName !== null) {
      $where[] = "(u.first_name LIKE :u_name OR u.last_name LIKE :u_name)";
      $params[':u_name'] = '%' . $userName . '%';
    }
    if ($userEmail !== null) {
      $where[] = "u.email LIKE :u_email";
      $params[':u_email'] = '%' . $userEmail . '%';
    }

    $whereClause = implode(' AND ', $where);

    $sql = "SELECT r.*, 
                       p.province_name,
                       c.canton_name,
                       d.district_name,
                       u.first_name AS user_first_name,
                       u.last_name AS user_last_name,
                       u.email AS user_email_fetch,
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
                WHERE $whereClause
                ORDER BY r.created_at DESC
                LIMIT :limit OFFSET :offset";

    $stmt = $this->pdo->prepare($sql);

    foreach ($params as $key => $val) {
      $stmt->bindValue($key, $val);
    }

    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
   * Counts total global requests based on dynamic filters (used for admin pagination).
   *
   * @param int|null $provinceSnitCode Filter by province SNIT.
   * @param int|null $cantonSnitCode Filter by canton SNIT.
   * @param int|null $districtSnitCode Filter by district SNIT.
   * @param string|null $requestName Filter by exact or partial request name.
   * @param string|null $userName Filter by user's first or last name.
   * @param string|null $userEmail Filter by user's email.
   * @return int Total number of matching records.
   */
  public function countAll(
    ?int $provinceSnitCode = null,
    ?int $cantonSnitCode = null,
    ?int $districtSnitCode = null,
    ?string $requestName = null,
    ?string $userName = null,
    ?string $userEmail = null
  ): int {
    $where = ["1=1"];
    $params = [];

    if ($provinceSnitCode !== null) {
      $where[] = "r.province_snit_code = :province";
      $params[':province'] = $provinceSnitCode;
    }
    if ($cantonSnitCode !== null) {
      $where[] = "r.canton_snit_code = :canton";
      $params[':canton'] = $cantonSnitCode;
    }
    if ($districtSnitCode !== null) {
      $where[] = "r.district_snit_code = :district";
      $params[':district'] = $districtSnitCode;
    }
    if ($requestName !== null) {
      $where[] = "r.request_name LIKE :req_name";
      $params[':req_name'] = '%' . $requestName . '%';
    }
    if ($userName !== null) {
      $where[] = "(u.first_name LIKE :u_name OR u.last_name LIKE :u_name)";
      $params[':u_name'] = '%' . $userName . '%';
    }
    if ($userEmail !== null) {
      $where[] = "u.email LIKE :u_email";
      $params[':u_email'] = '%' . $userEmail . '%';
    }

    $whereClause = implode(' AND ', $where);

    $sql = "SELECT COUNT(*) FROM requests r 
                LEFT JOIN users u ON r.user_id = u.user_id
                WHERE $whereClause";

    $stmt = $this->pdo->prepare($sql);
    $stmt->execute($params);

    return (int) $stmt->fetchColumn();
  }
}