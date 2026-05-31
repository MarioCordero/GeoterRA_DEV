<?php

declare(strict_types=1);

namespace DTO;

/**
 * Data Transfer Object for refresh token persistence operations.
 *
 * Encapsulates the required data to create or update a refresh token record:
 * the owning user, the hashed token value, its lifetime in seconds, and optionally
 * the family identifier for token chaining.
 *
 * @package DTO
 */
final class RefreshTokenDTO
{
  /**
   * Constructs a new RefreshTokenDTO.
   *
   * @param string      $userId     The unique identifier (ULID CHAR(26)) of the user owning the token.
   * @param string      $tokenHash  SHA‑256 hash of the raw refresh token.
   * @param int         $ttlSeconds Time‑to‑live in seconds from the moment of creation/update.
   * @param string|null $familyId   Optional family identifier for token rotation.
   */
  public function __construct(
    public string $userId,
    public string $tokenHash,
    public int $ttlSeconds,
    public ?string $familyId = null
  ) {
  }
}