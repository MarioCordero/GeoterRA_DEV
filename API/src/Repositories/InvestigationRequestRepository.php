<?php
declare(strict_types=1);

namespace Repositories;

use Core\UlidGenerator;
use DTO\InvestigationRequestDTO;
use PDO;

/**
 * Repository for analysis requests (requests and requests_state tables).
 */
final class InvestigationRequestRepository
{
  public function __construct(private PDO $pdo) {}

  /**
   * Creates a new request and its initial state.
   *
   * @param InvestigationRequestDTO $dto The request data.
   * @param string $userId ID of the authenticated user creating the request.
   * @return string The generated request ULID.
   * @throws \Exception On database error.
   */
  public function create(InvestigationRequestDTO $dto, string $userId): string
  {
    $requestId = UlidGenerator::generate();
    $suffix = strtoupper(substr($requestId, -5));
    $generatedName = 'SOLI-' . $suffix;

    // Insert into requests table
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

    // Insert initial state
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

    return $requestId;
  }

  /**
   * Finds a request by ID (without ownership restriction).
   * Includes the current state (last inserted state by creation date).
   *
   * @param string $id The request ULID.
   * @return array|null Associative array or null if not found.
   */
  public function findById(string $id): ?array
  {
    $sql = "SELECT r.*,
                       r.created_at,
                       rs.value AS current_state, 
                       rs.description AS state_description,
                       rs.created_at AS state_created_at
                FROM requests r
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
   * Finds a request by ID and creator user ID.
   * Includes current state.
   *
   * @param string $id The request ULID.
   * @param string $userId The user ULID.
   * @return array|null Associative array or null.
   */
  public function findByIdAndUser(string $id, string $userId): ?array
  {
    $sql = "SELECT r.*, 
                       r.created_at,
                       rs.value AS current_state, 
                       rs.description AS state_description,
                       rs.created_at AS state_created_at
                FROM requests r
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
   * Updates an existing request (only owner fields, not state).
   * Restricted to the owner user.
   *
   * @param string $id Request ULID.
   * @param string $userId Owner user ULID.
   * @param InvestigationRequestDTO $dto New data.
   */
  public function update(string $id, string $userId, InvestigationRequestDTO $dto): void
  {
    $sql = "UPDATE requests SET
                    province_snit_code = :province_snit,
                    canton_snit_code = :canton_snit,
                    district_snit_code = :district_snit,
                    owner_name = :owner_name,
                    owner_phone_number = :owner_phone,
                    owner_email = :owner_email,
                    current_usage = :current_usage,
                    temperature_sensation = :temp_sensation,
                    bubbles = :bubbles,
                    details = :details,
                    exact_address = :exact_address,
                    latitude = :lat,
                    longitude = :lng,
                    relation_with_owner = :relation
                WHERE request_id = :id AND user_id = :user_id";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute([
      ':province_snit' => $dto->provinceSnitCode,
      ':canton_snit' => $dto->cantonSnitCode,
      ':district_snit' => $dto->districtSnitCode,
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
      ':relation' => $dto->relationWithOwner,
      ':id' => $id,
      ':user_id' => $userId
    ]);
  }

  /**
   * Admin update – updates any request (no user ownership check).
   *
   * @param string $id Request ULID.
   * @param InvestigationRequestDTO $dto New data.
   */
  public function adminUpdate(string $id, InvestigationRequestDTO $dto): void
  {
    $sql = "UPDATE requests SET
                    province_snit_code = :province_snit,
                    canton_snit_code = :canton_snit,
                    district_snit_code = :district_snit,
                    owner_name = :owner_name,
                    owner_phone_number = :owner_phone,
                    owner_email = :owner_email,
                    current_usage = :current_usage,
                    temperature_sensation = :temp_sensation,
                    bubbles = :bubbles,
                    details = :details,
                    exact_address = :exact_address,
                    latitude = :lat,
                    longitude = :lng,
                    relation_with_owner = :relation
                WHERE request_id = :id";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute([
      ':province_snit' => $dto->provinceSnitCode,
      ':canton_snit' => $dto->cantonSnitCode,
      ':district_snit' => $dto->districtSnitCode,
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
      ':relation' => $dto->relationWithOwner,
      ':id' => $id
    ]);
  }

  /**
   * Creates a new state entry for a request (admin only).
   *
   * @param string $requestId Request ULID.
   * @param string $stateValue State value (e.g., 'En revisión', 'Aprobada').
   * @param string $description Optional description.
   * @param string $createdBy Admin user ULID.
   * @return string The new state record ULID.
   */
  public function addState(string $requestId, string $stateValue, string $description, string $createdBy): string
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
    return $stateId;
  }

  /**
   * Retrieves all state records for a given request, ordered by creation date ascending.
   *
   * @param string $requestId Request ULID.
   * @return array List of states (each: request_status_id, value, description, created_at, created_by).
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
   * Deletes a request (and its states due to FK CASCADE).
   * Restricted to the owner user.
   *
   * @param string $id Request ULID.
   * @param string $userId Owner user ULID.
   */
  public function delete(string $id, string $userId): void
  {
    $stmt = $this->pdo->prepare("DELETE FROM requests WHERE request_id = :id AND user_id = :user_id");
    $stmt->execute([':id' => $id, ':user_id' => $userId]);
  }

  /**
   * Admin delete – deletes any request.
   *
   * @param string $id Request ULID.
   */
  public function adminDelete(string $id): void
  {
    $stmt = $this->pdo->prepare("DELETE FROM requests WHERE request_id = :id");
    $stmt->execute([':id' => $id]);
  }

  /**
   * Returns all requests created by a specific user, including current state.
   *
   * @param string $userId User ULID.
   * @return array List of requests with current_state and state_description.
   */
  public function findAllByUser(string $userId): array
  {
    $sql = "SELECT r.*, 
                       r.created_at,
                       rs.value AS current_state, 
                       rs.description AS state_description,
                       rs.created_at AS state_created_at
                FROM requests r
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
   * Returns all requests in the system (admin only), including current state.
   *
   * @return array List of requests.
   */
  public function getAll(): array
  {
    $sql = "SELECT r.*, 
                       r.created_at,
                       rs.value AS current_state, 
                       rs.description AS state_description,
                       rs.created_at AS state_created_at
                FROM requests r
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