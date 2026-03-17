<?php
declare(strict_types=1);

namespace Repositories;

use PDO;

final class RegionRepository
{
  public function __construct(private PDO $db) {}

  /**
   * Find region by name
   *
   * @param string $name
   * @return array|null
   */
  public function findByName(string $name): ?array
  {
    $stmt = $this->db->prepare('SELECT id, name, created_at FROM regions WHERE name = ?');
    $stmt->execute([$name]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result ?: null;
  }

  /**
   * Find region by ID
   *
   * @param int $id
   * @return array|null
   */
  public function findById(int $id): ?array
  {
    $stmt = $this->db->prepare('SELECT id, name, created_at FROM regions WHERE id = ?');
    $stmt->execute([$id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result ?: null;
  }

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

  public function getAll(): array
  {
    $stmt = $this->db->query('SELECT id, name FROM regions');
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
   * Create new region
   *
   * @param string $name
   * @return array
   */
  public function create(string $name): array
  {
    $stmt = $this->db->prepare('INSERT INTO regions (name) VALUES (?)');
    $stmt->execute([$name]);
    
    $id = (int) $this->db->lastInsertId();
    return $this->findById($id) ?? [
      'id' => $id,
      'name' => $name,
      'created_at' => date('Y-m-d H:i:s'),
    ];
  }
  
  /**
   * Update region
   *
   * @param int $id
   * @param string $name
   * @return array|null
   */
  public function update(int $id, string $name): ?array
  {
    $stmt = $this->db->prepare('UPDATE regions SET name = ? WHERE id = ?');
    $stmt->execute([$name, $id]);
    
    if ($stmt->rowCount() === 0) {
      return null;
    }
    
    return $this->findById($id);
  }

  /**
   * Delete region
   *
   * @param int $id
   * @return bool
   */
  public function delete(int $id): bool
  {
    $stmt = $this->db->prepare('DELETE FROM regions WHERE id = ?');
    $stmt->execute([$id]);
    return $stmt->rowCount() > 0;
  }
}