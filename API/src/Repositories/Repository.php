<?php
declare(strict_types=1);

namespace Repositories;

use Core\UlidGenerator;
use PDO;
use PDOStatement;
use PDOException;

/**
 * Abstract base repository providing common database operations.
 */
abstract class Repository
{
  protected PDO $db;

  /**
   * @param PDO $db PDO database connection
   */
  public function __construct(PDO $db)
  {
    $this->db = $db;
  }

  /**
   * Begins a database transaction.
   */
  public function beginTransaction(): void
  {
    $this->db->beginTransaction();
  }

  /**
   * Commits the current transaction.
   */
  public function commit(): void
  {
    $this->db->commit();
  }

  /**
   * Rolls back the current transaction if one is active.
   */
  public function rollBack(): void
  {
    if ($this->db->inTransaction()) {
      $this->db->rollBack();
    }
  }

  /**
   * Executes a prepared statement with optional transaction control.
   *
   * @param string $sql      SQL query with named placeholders
   * @param array  $params   Associative array of parameters
   * @param bool   $useTransaction Whether to wrap in a transaction
   * @return PDOStatement
   * @throws PDOException
   */
  protected function execute(
    string $sql,
    array $params = [],
    bool $useTransaction = false
  ): PDOStatement
  {
    if ($useTransaction) {
      $this->beginTransaction();
    }
    try {
      $stmt = $this->db->prepare($sql);
      $stmt->execute($params);
      if ($useTransaction) {
        $this->commit();
      }
      return $stmt;
    } catch (PDOException $e) {
      if ($useTransaction) {
        $this->rollBack();
      }
      throw $e;
    }
  }

  /**
   * Generates a new ULID for primary keys.
   *
   * @return string
   */
  protected function generateUlid(): string
  {
    return UlidGenerator::generate();
  }

  /**
   * Escapes special characters for use in LIKE clauses.
   *
   * @param string $value
   * @return string
   */
  protected function escapeLike(string $value): string
  {
    return addcslashes($value, '%_\\');
  }
}