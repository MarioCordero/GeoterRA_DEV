<?php
declare(strict_types=1);

namespace Repositories;

use DTO\Ulid;
use PDO;


final class UserRepository
{
  public function __construct(private PDO $db) {}

  public function create(
    string $firstName,
    string $lastName,
    string $email,
    ?string $phoneNumber,
    string $passwordHash
  ): string {
    $stmt = $this->db->prepare(
      'INSERT INTO users 
      (user_id, first_name, last_name, email, phone_number, password_hash, role,  created_at)
      VALUES (:id, :fn, :ln, :email, :phone, :hash, :role, NOW())'
    );

    $user_id = Ulid::generate();

    $stmt->execute([
      ':id' => $user_id,
      'fn' => $firstName,
      'ln' => $lastName,
      'email' => $email,
      'phone' => $phoneNumber,
      'hash' => $passwordHash,
      'role' => 'user'
    ]);

    return $user_id;
  }

  /**
   * Updates user profile information.
   */
  public function updateUser(
    string $userId,
    string $firstName,
    string $lastName,
    string $email,
    ?string $phoneNumber
  ): bool {
    $stmt = $this->db->prepare(
      '
      UPDATE users SET
        first_name = :first_name,
        last_name = :last_name,
        email = :email,
        phone_number = :phone_number,
        updated_at = NOW()
      WHERE user_id = :user_id
        AND deleted_at IS NULL
        AND is_active = 1
      '
    );

    return $stmt->execute([
      ':first_name' => $firstName,
      ':last_name' => $lastName,
      ':email' => $email,
      ':phone_number' => $phoneNumber,
      ':user_id' => $userId
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
        deleted_by = :deleted_by
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
}
?>