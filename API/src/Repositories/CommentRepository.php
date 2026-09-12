<?php
declare(strict_types=1);

namespace Repositories;

use PDO;

/**
 * Repository for polymorphic comments (comments table).
 */
final class CommentRepository extends Repository
{
  /**
   * Finds a comment by its ULID with author info.
   *
   * @param string $id
   * @return array|null
   */
  public function findById(string $id): ?array
  {
    $sql = "SELECT c.*,
                   u.first_name,
                   u.last_name,
                   u.email,
                   u.role
            FROM comments c
            INNER JOIN users u ON c.user_id = u.user_id
            WHERE c.comment_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
  }

  /**
   * Creates a new comment.
   *
   * @param string $entityType ('field_trip', 'request', 'geomanifestation')
   * @param string $entityId
   * @param string $userId
   * @param string $commentText
   * @return array
   */
  public function create(
    string $entityType,
    string $entityId,
    string $userId,
    string $commentText
  ): array {
    $id = $this->generateUlid();
    $sql = "INSERT INTO comments (comment_id, entity_type, entity_id, user_id, comment_text, created_at)
            VALUES (:id, :entity_type, :entity_id, :user_id, :comment_text, NOW())";
    $this->execute($sql, [
      ':id' => $id,
      ':entity_type' => $entityType,
      ':entity_id' => $entityId,
      ':user_id' => $userId,
      ':comment_text' => $commentText,
    ]);

    return $this->findById($id);
  }

  /**
   * Returns all comments for a specific entity ordered chronologically.
   *
   * @param string $entityType
   * @param string $entityId
   * @return array[]
   */
  public function getByEntity(string $entityType, string $entityId): array
  {
    $sql = "SELECT c.*,
                   u.first_name,
                   u.last_name,
                   u.email,
                   u.role
            FROM comments c
            INNER JOIN users u ON c.user_id = u.user_id
            WHERE c.entity_type = :entity_type AND c.entity_id = :entity_id
            ORDER BY c.created_at ASC";
    return $this->execute($sql, [
      ':entity_type' => $entityType,
      ':entity_id' => $entityId,
    ])->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
   * Updates an existing comment text.
   *
   * @param string $id
   * @param string $commentText
   * @return array|null
   */
  public function update(string $id, string $commentText): ?array
  {
    $sql = "UPDATE comments SET comment_text = :comment_text WHERE comment_id = :id";
    $this->execute($sql, [
      ':id' => $id,
      ':comment_text' => $commentText,
    ]);

    return $this->findById($id);
  }

  /**
   * Deletes a comment.
   *
   * @param string $id
   * @return bool
   */
  public function delete(string $id): bool
  {
    $sql = "DELETE FROM comments WHERE comment_id = :id";
    $stmt = $this->execute($sql, [':id' => $id]);
    return $stmt->rowCount() > 0;
  }
}
