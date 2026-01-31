<?php
declare(strict_types=1);

namespace Repositories;

use PDO;
use DTO\Ulid;

final class AuthRepository
{
  public function __construct(private PDO $db) {}

  /**
   * Insert or replace the user's access token.
   */
  public function upsertAccessToken(
    string $userId,
    string $tokenHash,
    string $expiresAt
  ): void {
    $stmt = $this->db->prepare(
      '
      INSERT INTO access_tokens (user_id, token_hash, expires_at, updated_at)
      VALUES (:user_id, :token_hash, :expires_at, NOW())
      ON DUPLICATE KEY UPDATE
        token_hash = VALUES(token_hash),
        expires_at = VALUES(expires_at),
        updated_at = NOW()
      '
    );

    $stmt->execute([
      'user_id' => $userId,
      'token_hash' => $tokenHash,
      'expires_at' => $expiresAt
    ]);
  }

  /**
   * Insert or replace the user's refresh token.
   */
  public function upsertRefreshToken(
    string $userId,
    string $tokenHash,
    string $expiresAt
  ): void {
    $stmt = $this->db->prepare(
      '
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, updated_at)
      VALUES (:user_id, :token_hash, :expires_at, NOW())
      ON DUPLICATE KEY UPDATE
        token_hash = VALUES(token_hash),
        expires_at = VALUES(expires_at),
        updated_at = NOW()
      '
    );

    $stmt->execute([
      'user_id' => $userId,
      'token_hash' => $tokenHash,
      'expires_at' => $expiresAt
    ]);
  }

  /**
   * Find a valid refresh token.
   */
  public function findValidRefreshToken(string $rawToken): ?array
  {
    $hash = hash('sha256', $rawToken);

    $stmt = $this->db->prepare(
      '
      SELECT *
      FROM refresh_tokens
      WHERE token_hash = :hash
        AND expires_at > NOW()
      LIMIT 1
      '
    );

    $stmt->execute(['hash' => $hash]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
  }

    /**
   * Find a valid refresh token.
   */
  public function findValidAccessToken(string $rawToken): ?array
  {
    $hash = hash('sha256', $rawToken);

    $stmt = $this->db->prepare(
      '
      SELECT *
      FROM access_tokens
      WHERE token_hash = :hash
        AND expires_at > NOW()
      LIMIT 1
      '
    );

    $stmt->execute(['hash' => $hash]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
  }

  /**
   * Remove all tokens for a user (logout).
   */
  public function deleteUserTokens(string $userId): void
  {
    $this->db->prepare(
      'DELETE FROM access_tokens WHERE user_id = :uid'
    )->execute(['uid' => $userId]);

    $this->db->prepare(
      'DELETE FROM refresh_tokens WHERE user_id = :uid'
    )->execute(['uid' => $userId]);
  }
}
