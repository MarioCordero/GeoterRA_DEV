<?php
declare(strict_types=1);

namespace Repositories;

use PDO;
use DTO\Ulid;

final class AuthRepository
{
  public function __construct(private PDO $db) {}

  public function beginTransaction(): void
  {
    $this->db->beginTransaction();
  }

  public function commit(): void
  {
    $this->db->commit();
  }

  public function rollBack(): void
  {
    if ($this->db->inTransaction()) {
      $this->db->rollBack();
    }
  }

  public function rotateTokens(
    string $userId,
    string $accessToken,
    int $accessTtlSeconds,
    string $newRefreshToken,
    int $refreshTtlSeconds
  ): void {
    try {
      $this->db->beginTransaction();
      // Revoke ONLY the used refresh token
      $this->deleteUserTokens($userId);

      // Persist new tokens
      $this->upsertAccessToken($userId, $accessToken, $accessTtlSeconds);
      $this->upsertRefreshToken($userId, $newRefreshToken, $refreshTtlSeconds);

      $this->db->commit();
    } catch (\Throwable $e) {
      $this->db->rollBack();
      throw $e;
    }
  }

  /**
   * Insert or replace the user's access token.
   */
  public function upsertAccessToken(
    string $userId,
    string $token,
    int $ttlSeconds
  ): array {
    $hash = hash('sha256', $token);

    $stmt = $this->db->prepare(
      '
      INSERT INTO access_tokens (user_id, token_hash, expires_at, updated_at)
      VALUES (
        :user_id,
        :token_hash,
        DATE_ADD(NOW(), INTERVAL :ttl SECOND),
        NOW()
      )
      ON DUPLICATE KEY UPDATE
        token_hash = VALUES(token_hash),
        expires_at = VALUES(expires_at),
        updated_at = NOW()
      '
    );

    $stmt->execute([
      'user_id' => $userId,
      'token_hash' => $hash,
      'ttl' => $ttlSeconds
    ]);

    $select = $this->db->prepare(
      '
      SELECT expires_at
      FROM access_tokens
      WHERE user_id = :user_id
      LIMIT 1
      '
    );

    $select->execute(['user_id' => $userId]);

    return $select->fetch(PDO::FETCH_ASSOC);
  }

  /**
   * Insert or replace the user's refresh token.
   */
  public function upsertRefreshToken(
    string $userId,
    string $token,
    int $ttlSeconds
  ): array {
    $hash = hash('sha256', $token);

    $stmt = $this->db->prepare(
      '
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, updated_at)
      VALUES (
        :user_id,
        :token_hash,
        DATE_ADD(NOW(), INTERVAL :ttl SECOND),
        NOW()
      )
      ON DUPLICATE KEY UPDATE
        token_hash = VALUES(token_hash),
        expires_at = VALUES(expires_at),
        updated_at = NOW()
      '
    );

    $stmt->execute([
      'user_id' => $userId,
      'token_hash' => $hash,
      'ttl' => $ttlSeconds
    ]);

    $select = $this->db->prepare(
      '
      SELECT expires_at
      FROM access_tokens
      WHERE user_id = :user_id
      LIMIT 1
      '
    );

    $select->execute(['user_id' => $userId]);

    return $select->fetch(PDO::FETCH_ASSOC);
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

  public function revokeRefreshToken(string $hash): void {
    $this->db->prepare(
      'DELETE FROM refresh_tokens WHERE token_hash = :hash'
    )->execute(['hash' => $hash]);
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
