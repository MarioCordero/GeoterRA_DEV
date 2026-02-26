<?php
declare(strict_types=1);

namespace Repositories;

use PDO;

final class HealthRepository
{
  public function __construct(private PDO $db) {}

  public function ping(): bool
  {
    $stmt = $this->db->query('SELECT 1');
    return (bool) $stmt->fetchColumn();
  }
}