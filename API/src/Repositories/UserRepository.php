<?php
declare(strict_types=1);

namespace Repositories;

use PDO;
use DTO\Ulid;
use DTO\RegisterUserDTO;
use DTO\UpdateUserDTO;

final class UserRepository
{
  public function __construct(private PDO $db) {}

  public function create(RegisterUserDTO $dto, string $passwordHash): string
  {
    $stmt = $this->db->prepare(
      'INSERT INTO users 
      (user_id, first_name, last_name, email, phone_number, password_hash, role,  created_at)
      VALUES (:id, :fn, :ln, :email, :phone, :hash, :role, NOW())'
    );
    $user_id = Ulid::generate();
    $stmt->execute([
      ':id' => $user_id,
      ':fn' => $dto->firstName,
      ':ln' => $dto->lastName,
      ':email' => $dto->email,
      ':phone' => $dto->phoneNumber,
      ':hash' => $passwordHash,
      ':role' => 'user'
    ]);
    return $user_id;
  }

  /**
   * Updates user profile information.
   */
  public function update(UpdateUserDTO $dto): bool
  {
    $stmt = $this->db->prepare(
      'UPDATE users SET
        first_name = :first_name,
        last_name = :last_name,
        email = :email,
        phone_number = :phone_number,
        updated_at = NOW()
      WHERE user_id = :user_id
        AND deleted_at IS NULL
        AND is_active = 1'
    );

    return $stmt->execute([
      ':first_name' => $dto->firstName,
      ':last_name' => $dto->lastName,
      ':email' => $dto->email,
      ':phone_number' => $dto->phoneNumber,
      ':user_id' => $dto->userId
    ]);
  }

  /**
   * Soft deletes a user.
   */
  public function deleteUser(string $userId): bool
  {
    $sql = '
      UPDATE users
      SET
        deleted_at = NOW(),
        deleted_by = :deleted_by,
        is_active = 0
      WHERE user_id = :user_id
        AND deleted_at IS NULL
        AND is_active = 1
    ';

    // Prepare statement to prevent SQL injection
    $stmt = $this->db->prepare($sql);

    // Execute with named parameters
    return $stmt->execute([
      'user_id' => $userId,          // User being deleted
      'deleted_by' => $userId  // Actor performing the deletion
    ]);
  }

  public function emailExists(string $email): bool
  {
    $stmt = $this->db->prepare(
      'SELECT 1 FROM users WHERE email = :email LIMIT 1'
    );
    $stmt->execute(['email' => $email]);
    return (bool) $stmt->fetch();
  }

  public function findByEmail(string $email): ?array
  {
    $stmt = $this->db->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user ?: null;
  }

  /**
   * Find a user by ID
   */
  public function findById(string $userId): ?array
  {
    $stmt = $this->db->prepare('SELECT user_id, first_name, last_name, email, phone_number, role, is_active, is_verified, created_at FROM users WHERE user_id = :uid LIMIT 1');
    $stmt->execute(['uid' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user ?: null;
  }


  /**
   * Find a user by ID
   */
  public function findActiveUserById(string $userId): ?array
  {
    $stmt = $this->db->prepare('SELECT user_id, first_name, last_name, email, phone_number, role, is_active, is_verified, created_at FROM users WHERE user_id = :uid AND deleted_at IS NULL AND is_active = 1 LIMIT 1');
    $stmt->execute(['uid' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user ?: null;
  }
}
?>