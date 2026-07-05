<?php
declare(strict_types=1);

namespace Repositories;

use Core\UlidGenerator;
use DTO\RegisterUserDTO;
use DTO\UpdateUserDTO;
use PDO;

final class UserRepository
{
  public function __construct(private PDO $db) {}

  /**
   * Creates a new user (active, not deleted).
   *
   * @param RegisterUserDTO $dto
   * @param string $passwordHash
   * @return string
   */
  public function create(RegisterUserDTO $dto, string $passwordHash): string
  {
    $stmt = $this->db->prepare(
      'INSERT INTO users 
            (user_id, first_name, last_name, email, phone_number, password_hash, role, created_at)
            VALUES (:id, :fn, :ln, :email, :phone, :hash, :role, NOW())'
    );
    $userId = UlidGenerator::generate();
    $stmt->execute(
      [
        ':id' => $userId,
        ':fn' => $dto->firstName,
        ':ln' => $dto->lastName,
        ':email' => $dto->email,
        ':phone' => $dto->phoneNumber,
        ':hash' => $passwordHash,
        ':role' => 'user'
      ]
    );
    return $userId;
  }

  /**
   * Updates user profile, optionally including password.
   *
   * @param UpdateUserDTO $dto
   * @return bool
   */
  public function update(UpdateUserDTO $dto): bool
  {
    if ($dto->password) {
      $stmt = $this->db->prepare(
        'UPDATE users SET
                first_name = :first_name,
                last_name = :last_name,
                email = :email,
                phone_number = :phone_number,
                password_hash = :password_hash
                WHERE user_id = :user_id
                AND deleted_at IS NULL
                AND is_deleted = 0'
      );
      return $stmt->execute(
        [
          ':first_name' => $dto->firstName,
          ':last_name' => $dto->lastName,
          ':email' => $dto->email,
          ':phone_number' => $dto->phoneNumber,
          ':password_hash' => $dto->password,
          ':user_id' => $dto->userId
        ]
      );
    }

    $stmt = $this->db->prepare(
      'UPDATE users SET
            first_name = :first_name,
            last_name = :last_name,
            email = :email,
            phone_number = :phone_number
            WHERE user_id = :user_id
            AND deleted_at IS NULL
            AND is_deleted = 0'
    );
    return $stmt->execute(
      [
        ':first_name' => $dto->firstName,
        ':last_name' => $dto->lastName,
        ':email' => $dto->email,
        ':phone_number' => $dto->phoneNumber,
        ':user_id' => $dto->userId
      ]
    );
  }

  /**
   * Updates a user's role.
   *
   * @param string $userId
   * @param string $role
   * @return bool
   */
  public function updateRole(string $userId, string $role): bool
  {
    $stmt = $this->db->prepare(
      'UPDATE users SET role = :role
            WHERE user_id = :user_id AND deleted_at IS NULL AND is_deleted = 0'
    );
    return $stmt->execute([':role' => $role, ':user_id' => $userId]);
  }

  /**
   * Soft‑deletes a user: marks as inactive and sets deletion timestamp.
   *
   * @param string $userId
   * @return bool
   */
  public function deleteUser(string $userId): bool
  {
    $sql = '
            UPDATE users
            SET deleted_at = NOW(),
                is_deleted = 1
            WHERE user_id = :user_id
              AND deleted_at IS NULL
              AND is_deleted = 0
        ';
    return $this->db->prepare($sql)->execute(
      [
        'user_id' => $userId
      ]
    );
  }

  /**
   * Restores a soft‑deleted user, making them active again.
   *
   * @param string $userId
   * @return bool
   */
  public function restoreUser(string $userId): bool
  {
    $sql = '
            UPDATE users
            SET deleted_at = NULL,
                is_deleted = 0
            WHERE user_id = :user_id
              AND deleted_at IS NOT NULL
              AND is_deleted = 1
        ';
    $stmt = $this->db->prepare($sql);
    return $stmt->execute([':user_id' => $userId]);
  }

  /**
   * Checks if an email already exists (active or soft‑deleted).
   *
   * @param string $email
   * @return bool
   */
  public function emailExists(string $email): bool
  {
    $stmt = $this->db->prepare(
      'SELECT 1 FROM users WHERE email = :email LIMIT 1'
    );
    $stmt->execute(['email' => $email]);
    return (bool)$stmt->fetch();
  }

  /**
   * Checks if an email belongs to an active (not deleted) user.
   *
   * @param string $email
   * @return bool
   */
  public function emailExistsActive(string $email): bool
  {
    $stmt = $this->db->prepare(
      'SELECT 1 FROM users WHERE email = :email AND deleted_at IS NULL AND is_deleted = 0 LIMIT 1'
    );
    $stmt->execute(['email' => $email]);
    return (bool)$stmt->fetch();
  }

  /**
   * Finds a user by email (including soft‑deleted).
   *
   * @param string $email
   * @return array|null
   */
  public function findByEmail(string $email): ?array
  {
    $stmt = $this->db->prepare(
      'SELECT user_id, role, first_name, last_name, email, phone_number, password_hash, deleted_at, is_deleted
        FROM users WHERE email = :email LIMIT 1'
    );
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user ?: null;
  }

  /**
   * Finds a user by ID, excluding soft‑deleted.
   *
   * @param string $userId
   * @return array|null
   */
  public function findById(string $userId): ?array
  {
    $stmt = $this->db->prepare(
      'SELECT
                user_id,
                role, first_name, last_name, email, phone_number, is_verified, created_at, password_hash
            FROM users WHERE user_id = :uid AND deleted_at IS NULL AND is_deleted = 0'
    );
    $stmt->execute(['uid' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user ?: null;
  }

  /**
   * Finds an active user by ID (not deleted, active flag = 1).
   *
   * @param string $userId
   * @return array|null
   */
  public function findActiveUserById(string $userId): ?array
  {
    $stmt = $this->db->prepare(
      'SELECT user_id, role, first_name, last_name, email, phone_number, is_verified, created_at
            FROM users WHERE user_id = :uid AND deleted_at IS NULL AND is_deleted = 0 LIMIT 1'
    );
    $stmt->execute(['uid' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user ?: null;
  }

  /**
   * Finds a user by ID even if soft‑deleted (used for restoration).
   *
   * @param string $userId
   * @return array|null
   */
  public function findUserByIdIncludingDeleted(string $userId): ?array
  {
    $stmt = $this->db->prepare(
      'SELECT * FROM users WHERE user_id = :uid LIMIT 1'
    );
    $stmt->execute(['uid' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user ?: null;
  }

  /**
   * Counts active users.
   *
   * @return int
   */
  public function getActiveUsersCount(): int
  {
    $stmt = $this->db->prepare(
      'SELECT COUNT(*) as count FROM users WHERE is_deleted = 0 AND deleted_at IS NULL'
    );
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return (int)($result['count'] ?? 0);
  }

  /**
   * Returns all active users with basic information.
   *
   * @return array
   */
  public function getAllUsers(): array
  {
    $stmt = $this->db->query(
      'SELECT user_id, first_name, last_name, email, phone_number, role, is_deleted, created_at
            FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC'
    );
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }
}