<?php

namespace Core;

use Symfony\Component\Uid\Ulid;

/**
 * Class UlidGenerator
 * 
 * Provides centralized logic for generating and validating Universally Unique 
 * Lexicographically Sortable Identifiers (ULIDs).
 * 
 * @package DTO
 */
final class UlidGenerator
{
  /**
   * Generates a new ULID string.
   *
   * @return string A 26-character Crockford's Base32 encoded string.
   */
  public static function generate(): string
  {
    return (new Ulid())->toBase32();
  }

  /**
   * Validates whether a given string is a syntactically correct ULID.
   *
   * @param string $ulid The identifier string to validate.
   * @return bool True if the string is a valid ULID, false otherwise.
   */
  public static function isValid(string $ulid): bool
  {
    return Ulid::isValid($ulid);
  }
}