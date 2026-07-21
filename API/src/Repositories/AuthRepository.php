<?php
declare(strict_types=1);

namespace Repositories;

use Core\UlidGenerator;
use DTO\AccessTokenDTO;
use DTO\RefreshTokenDTO;
use PDO;
use Throwable;

/**
 * Repository handling persistence operations for authentication tokens.
 *
 * This class manages access and refresh tokens, ensuring atomic operations
 * for token rotation, validation, and revocation. All token hashes are
 * stored and compared, never raw tokens.
 *
 * @package Repositories
 */
final class AuthRepository extends Repository
{
  /**
   * Constructs the AuthRepository with a database connection.
   *
   * @param PDO $db The active PDO database connection.
   */
  public function __construct(PDO $db)
  {
    parent::__construct($db);
  }

  /**
   * Replaces the current access token for a user with a new one.
   *
   * If an access token already exists for the user, it is updated;
   * otherwise a new record is inserted.
   *
   * @param AccessTokenDTO $data Contains user ID, token hash and TTL.
   *
   * @return void
   */
  public function upsertAccessToken(AccessTokenDTO $data): void
  {
    $expiresAt = date('Y-m-d H:i:s', time() + $data->ttlSeconds);
    $now = date('Y-m-d H:i:s');

    $sql = "
            INSERT INTO access_tokens (access_token_id, user_id, access_token_hash, expires_at, created_at)
            VALUES (:id, :user_id, :hash, :expires_at, :created_at)
            ON DUPLICATE KEY UPDATE
                access_token_hash = VALUES(access_token_hash),
                expires_at = VALUES(expires_at),
                revoked_at = NULL
        ";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([
      ':id'         => UlidGenerator::generate(),
      ':user_id'    => $data->userId,
      ':hash'       => $data->tokenHash,
      ':expires_at' => $expiresAt,
      ':created_at' => $now,
    ]);
  }

  /**
   * Creates a new refresh token for a user, marking it as the latest in its family.
   *
   * If this is the first token for the user (no family_id provided), a new family_id is generated.
   * The new token is linked to the previous one via the `replaced_by` field.
   * The previous token is marked as used and rotated.
   *
   * @param RefreshTokenDTO $data      Refresh token data (user ID, hash, TTL, optional family_id).
   * @param string|null     $prevTokenId ID of the refresh token being replaced (null for first).
   *
   * @return string The newly created token's ULID.
   * @throws Throwable
   */
  public function rotateRefreshToken(RefreshTokenDTO $data, ?string $prevTokenId = null): string
  {
      // Determine family_id
      $familyId = $data->familyId ?? UlidGenerator::generate();

      // If there is a previous token, mark it as used and rotated
      if ($prevTokenId !== null) {
        $sqlMarkUsed = "
                    UPDATE refresh_tokens
                    SET used_at = NOW(),
                        is_rotated = 1,
                        replaced_by = :new_id
                    WHERE refresh_token_id = :old_id
                ";
        $stmtMark = $this->db->prepare($sqlMarkUsed);
      }

      // Insert new refresh token
      $newTokenId = UlidGenerator::generate();
      $expiresAt = date('Y-m-d H:i:s', time() + $data->ttlSeconds);
      $now = date('Y-m-d H:i:s');

      $sqlInsert = "
                INSERT INTO refresh_tokens (
                    refresh_token_id, user_id, token_hash, family_id, expires_at, created_at
                ) VALUES (
                    :id, :user_id, :hash, :family_id, :expires_at, :created_at
                )
            ";
      $stmtInsert = $this->db->prepare($sqlInsert);
      $stmtInsert->execute([
        ':id'         => $newTokenId,
        ':user_id'    => $data->userId,
        ':hash'       => $data->tokenHash,
        ':family_id'  => $familyId,
        ':expires_at' => $expiresAt,
        ':created_at' => $now,
      ]);

      // If there was a previous token, update it with the new ID as replaced_by
      if ($prevTokenId !== null) {
        $sqlUpdatePrev = "
                    UPDATE refresh_tokens
                    SET used_at = NOW(),
                        is_rotated = 1,
                        replaced_by = :new_id
                    WHERE refresh_token_id = :old_id
                ";
        $stmtUpdatePrev = $this->db->prepare($sqlUpdatePrev);
        $stmtUpdatePrev->execute([
          ':new_id' => $newTokenId,
          ':old_id' => $prevTokenId,
        ]);
      }

      return $newTokenId;
  }

  /**
   * Creates a brand new refresh token (first in its family).
   *
   * @param RefreshTokenDTO $data Refresh token data (user ID, hash, TTL).
   *
   * @return string The new token ID.
   */
  public function createRefreshToken(RefreshTokenDTO $data): string
  {
    return $this->rotateRefreshToken($data, null);
  }

  /**
   * Revokes an entire family of refresh tokens (e.g., when a reused token is detected).
   *
   * @param string $familyId The family ID of the tokens to revoke.
   *
   * @return void
   */
  public function revokeRefreshTokenFamily(string $familyId): void
  {
    $sql = "UPDATE refresh_tokens SET revoked_at = NOW() WHERE family_id = :family_id AND revoked_at IS NULL";
    $stmt = $this->db->prepare($sql);
    $stmt->execute([':family_id' => $familyId]);
  }

  /**
   * Finds a valid (non‑expired, non‑revoked, not used) refresh token by its hash.
   * Also returns the family_id and token_id for rotation logic.
   *
   * @param string $tokenHash SHA‑256 hash of the raw refresh token.
   *
   * @return array<string, string>|null Returns an associative array with keys:
   *                                    'user_id', 'token_hash', 'expires_at', 'family_id', 'refresh_token_id'
   */
  public function findValidRefreshToken(string $tokenHash): ?array
  {
    $sql = "
            SELECT user_id, token_hash, expires_at, family_id, refresh_token_id
            FROM refresh_tokens
            WHERE token_hash = :hash
              AND expires_at > NOW()
              AND revoked_at IS NULL
              AND used_at IS NULL
              AND is_rotated = 0
        ";
    $stmt = $this->db->prepare($sql);
    $stmt->execute(['hash' => $tokenHash]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  /**
   * Finds a valid (non‑expired, non‑revoked) access token by its hash.
   *
   * @param string $tokenHash SHA‑256 hash of the raw access token.
   *
   * @return array<string, string>|null
   */
  public function findValidAccessToken(string $tokenHash): ?array
  {
    $sql = "
            SELECT user_id, access_token_hash, expires_at
            FROM access_tokens
            WHERE access_token_hash = :hash
              AND expires_at > NOW()
              AND revoked_at IS NULL
        ";
    $stmt = $this->db->prepare($sql);
    $stmt->execute(['hash' => $tokenHash]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  /**
   * Retrieves an access token by its hash regardless of expiry or revocation.
   * Used during logout to identify the user.
   *
   * @param string $tokenHash SHA‑256 hash of the access token.
   *
   * @return array<string, string>|null
   */
  public function findAccessTokenByHash(string $tokenHash): ?array
  {
    $sql = "SELECT user_id FROM access_tokens WHERE access_token_hash = :hash";
    $stmt = $this->db->prepare($sql);
    $stmt->execute(['hash' => $tokenHash]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  /**
   * Finds a refresh token by hash regardless of its state (for replay detection).
   *
   * @param string $tokenHash
   * @return array|null
   */
  public function findRefreshTokenByHash(string $tokenHash): ?array
  {
    $sql = "SELECT user_id, family_id, used_at, revoked_at FROM refresh_tokens WHERE token_hash = :hash";
    $stmt = $this->db->prepare($sql);
    $stmt->execute(['hash' => $tokenHash]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  /**
   * Revokes (soft‑deletes) the current access token by setting its revoked_at timestamp.
   *
   * @param string $tokenHash SHA‑256 hash of the access token.
   *
   * @return void
   */
  public function revokeAccessToken(string $tokenHash): void
  {
    $sql = "UPDATE access_tokens SET revoked_at = NOW() WHERE access_token_hash = :hash AND revoked_at IS NULL";
    $stmt = $this->db->prepare($sql);
    $stmt->execute(['hash' => $tokenHash]);
  }

  /**
   * Removes all access and refresh tokens belonging to a user (hard delete for access tokens,
   * and revokes refresh token families).
   *
   * @param string $userId The ULID (CHAR(26)) of the user.
   *
   * @return void
   */
  public function deleteUserTokens(string $userId): void
  {
    // Delete access tokens (hard delete)
    $sqlAccess = "DELETE FROM access_tokens WHERE user_id = :user_id";
    $stmtAccess = $this->db->prepare($sqlAccess);
    $stmtAccess->execute([':user_id' => $userId]);

    // Revoke all refresh token families for this user (soft revoke)
    $sqlRefresh = "
            UPDATE refresh_tokens
            SET revoked_at = NOW()
            WHERE user_id = :user_id AND revoked_at IS NULL
        ";
    $stmtRefresh = $this->db->prepare($sqlRefresh);
    $stmtRefresh->execute([':user_id' => $userId]);
  }

  /**
   * Permanently deletes all tokens of a user (hard delete, for cleanup).
   *
   * @param string $userId
   * @return void
   */
  public function hardDeleteUserTokens(string $userId): void
  {
    $stmt1 = $this->db->prepare("DELETE FROM access_tokens WHERE user_id = :user_id");
    $stmt1->execute([':user_id' => $userId]);

    $stmt2 = $this->db->prepare("DELETE FROM refresh_tokens WHERE user_id = :user_id");
    $stmt2->execute([':user_id' => $userId]);
  }
}