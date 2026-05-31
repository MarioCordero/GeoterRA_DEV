<?php

declare(strict_types=1);

namespace DTO;

use DTO\AccessTokenDTO;
use DTO\RefreshTokenDTO;

/**
 * Data Transfer Object for atomic token rotation operations.
 *
 * Groups a new access token DTO and a new refresh token DTO together.
 * Used by the AuthRepository to replace both tokens for a user inside a single transaction.
 *
 * @package DTO
 */
final class TokensRotationDTO
{
  /**
   * Constructs a new TokensRotationDTO.
   *
   * @param AccessTokenDTO  $accessToken  DTO containing the new access token data.
   * @param RefreshTokenDTO $refreshToken DTO containing the new refresh token data.
   */
  public function __construct(
    public AccessTokenDTO $accessToken,
    public RefreshTokenDTO $refreshToken
  ) {
  }
}