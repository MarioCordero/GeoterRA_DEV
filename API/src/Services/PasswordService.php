<?php
declare(strict_types=1);

namespace Services;

final class PasswordService
{
  public static function hash(string $password): string
  {
    return password_hash($password, PASSWORD_DEFAULT);
  }

    /**
   * Verify a plaintext password against a stored hash.
   */
  public static function verify(string $password, string $hash): bool
  {
    return password_verify($password, $hash);
  }
}
?>