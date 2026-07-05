<?php
declare(strict_types=1);

namespace Repositories;

use Core\UlidGenerator;
use DTO\RegisterInvestigationRequestDTO;
use DTO\UpdateInvestigationRequestDTO;
use PDO;

final class InvestigationRequestRepository
{
  public function __construct(private PDO $pdo) {}

  public function create(RegisterInvestigationRequestDTO $dto, string $userId
  ): array {
    $requestId = UlidGenerator::generate();
    $suffix = strtoupper(substr($requestId, -5));
    $generatedName = 'SOLI-' . $suffix;

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
   * Finds a request by ID and creator user ID (owner only, no user info).
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

  public function update(
    string $id, string $userId, UpdateInvestigationRequestDTO $dto
  ): ?array {
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
//
//  public function adminUpdate(string $id, UpdateInvestigationRequestDTO $dto
//  ): void {
//    $updateData = $dto->toArray();
//    if (empty($updateData)) {
//      return;
//    }
//
//    $sql = "UPDATE requests SET ";
//    $params = [];
//    $setParts = [];
//    foreach ($updateData as $field => $value) {
//      $setParts[] = "$field = :$field";
//      $params[":$field"] = $value;
//    }
//    $sql .= implode(', ', $setParts);
//    $sql .= " WHERE request_id = :id";
//    $params[':id'] = $id;
//
//    $stmt = $this->pdo->prepare($sql);
//    $stmt->execute($params);
//  }

  public function addState(
    string $requestId, string $stateValue, string $description,
    string $createdBy
  ): array {
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
   * Finds a request by ID (admin only, includes user creator info).
   */
  public function findById(string $id): ?array
  {
    $sql = "SELECT r.*,
                       r.created_at,
                       rs.value AS current_state, 
                       rs.description AS state_description,
                       rs.created_at AS state_created_at,
                       u.first_name AS user_first_name,
                       u.last_name AS user_last_name
                FROM requests r
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

  public function delete(string $id, string $userId): void
  {
    $stmt = $this->pdo->prepare(
      "DELETE FROM requests WHERE request_id = :id AND user_id = :user_id"
    );
    $stmt->execute([':id' => $id, ':user_id' => $userId]);
  }

  public function adminDelete(string $id): void
  {
    $stmt = $this->pdo->prepare("DELETE FROM requests WHERE request_id = :id");
    $stmt->execute([':id' => $id]);
  }

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
   * Returns all requests (admin only), including user creator info.
   */
  public function getAll(): array
  {
    $sql = "SELECT r.*, 
                       r.created_at,
                       rs.value AS current_state, 
                       rs.description AS state_description,
                       rs.created_at AS state_created_at,
                       u.first_name AS user_first_name,
                       u.last_name AS user_last_name
                FROM requests r
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