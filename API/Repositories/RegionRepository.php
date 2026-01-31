<?php
declare(strict_types=1);

namespace Repositories;

use PDO;

final class RegionRepository
{
  public function __construct(private PDO $db) {}

  /**
   * Returns all region IDs from the DB
   */
  public function getAllIds(): array
  {
    $stmt = $this->db->query('SELECT id FROM regions');
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
  }

  /**
   * Check if a region ID exists
   */
  public function existsById(int $id): bool
  {
    $stmt = $this->db->prepare(
      'SELECT 1 FROM regions WHERE id = :id LIMIT 1'
    );
    $stmt->execute([':id' => $id]);
    return (bool) $stmt->fetchColumn();
  }
}