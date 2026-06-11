<?php

declare(strict_types=1);

namespace DTO;

/**
 * Data Transfer Object for access token persistence operations.
 *
 * Encapsulates the required data to create or update an access token record:
 * the owning user, the hashed token value, and its lifetime in seconds.
 *
 * @package DTO
 */
final class AccessTokenDTO
{
  /**
   * Constructs a new AccessTokenDTO.
   *
   * @param string $userId     The unique identifier (ULID CHAR(26)) of the user owning the token.
   * @param string $tokenHash  SHA‑256 hash of the raw access token.
   * @param int    $ttlSeconds Time‑to‑live in seconds from the moment of creation/update.
   */
  public function __construct(
    public string $userId,
    public string $tokenHash,
    public int $ttlSeconds
  ) {
  }
}