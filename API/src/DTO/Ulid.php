<?php

namespace DTO;

final class Ulid
{
  
  /**
   * Generate a ULID (128-bit, lexicographically sortable identifier).
   *
   * @return string ULID (26 chars, Crockford Base32)
   */
  public static function generate(): string
  {
    // Current time in milliseconds (48 bits)
    $timeMs = (int) floor(microtime(true) * 1000);

    // Convert timestamp to 6 bytes
    $timeBytes = '';
    for ($i = 5; $i >= 0; $i--) {
      $timeBytes .= chr(($timeMs >> ($i * 8)) & 0xFF);
    }

    // 80 bits of cryptographically secure randomness
    $randomBytes = random_bytes(10);

    return self::encodeBase32Crockford($timeBytes . $randomBytes);
  }

  /**
   * Encode binary data using Crockford Base32.
   *
   * @param string $data
   * @return string
   */
  private static function encodeBase32Crockford(string $data): string
  {
    $alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    $bits = '';
    $encoded = '';

    foreach (str_split($data) as $char) {
      $bits .= str_pad(decbin(ord($char)), 8, '0', STR_PAD_LEFT);
    }

    for ($i = 0; $i < strlen($bits); $i += 5) {
      $chunk = substr($bits, $i, 5);
      $chunk = str_pad($chunk, 5, '0', STR_PAD_RIGHT);
      $encoded .= $alphabet[bindec($chunk)];
    }

    return substr($encoded, 0, 26);
  }
}

