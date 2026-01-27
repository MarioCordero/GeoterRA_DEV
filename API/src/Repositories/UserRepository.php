<?php
declare(strict_types=1);

namespace Repositories;

use PDO;

final class UserRepository
{
  public function __construct(private PDO $db) {}

  public function emailExists(string $email): bool
  {
    $stmt = $this->db->prepare(
      'SELECT 1 FROM users WHERE email = :email LIMIT 1'
    );
    $stmt->execute(['email' => $email]);
    return (bool) $stmt->fetch();
  }

  public function create(
    string $firstName,
    string $lastName,
    string $email,
    ?string $phoneNumber,
    string $passwordHash
  ): int {
    $stmt = $this->db->prepare(
      'INSERT INTO users 
      (first_name, last_name, email, phone_number, password_hash)
      VALUES (:fn, :ln, :email, :phone, :hash)'
    );

    $stmt->execute([
      'fn' => $firstName,
      'ln' => $lastName,
      'email' => $email,
      'phone' => $phoneNumber,
      'hash' => $passwordHash,
    ]);

    return (int) $this->db->lastInsertId();
  }

  public function findByEmail(string $email): ?array
  {
    $stmt = $this->db->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user ?: null;
  }

  public function createSession(int $userId, string $tokenHash, string $expiresAt): void
  {
    $stmt = $this->db->prepare(
      'INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (:uid, :hash, :exp)'
    );
    $stmt->execute([
      'uid' => $userId,
      'hash' => $tokenHash,
      'exp' => $expiresAt
    ]);
  }

  public function findActiveSessionByUserId(int $userId): ?array
  {
    $stmt = $this->db->prepare(
      'SELECT * FROM sessions WHERE user_id = :uid AND expires_at > NOW() AND revoked_at IS NULL LIMIT 1'
    );
    $stmt->execute(['uid' => $userId]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    return $session ?: null;
  }

  public function findSessionByToken(string $token): ?array
  {
    $stmt = $this->db->prepare(
      'SELECT * FROM sessions WHERE token_hash = :token AND expires_at > NOW() AND revoked_at IS NULL LIMIT 1'
    );
    $stmt->execute(['token' => $token]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    return $session ?: null;
  }

  /**
   * Find a user by ID
   */
  public function findById(int $userId): ?array
  {
    $stmt = $this->db->prepare('SELECT user_id, first_name, last_name, email, phone_number, role, is_active, is_verified, created_at FROM users WHERE user_id = :uid LIMIT 1');
    $stmt->execute(['uid' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return $user ?: null;
  }
}
