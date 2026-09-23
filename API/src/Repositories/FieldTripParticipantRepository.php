<?php
declare(strict_types=1);

namespace Repositories;

use PDO;

/**
 * Repository for field trip participants (field_trip_participants table).
 */
final class FieldTripParticipantRepository extends Repository
{
  /**
   * Adds a user as participant to a field trip.
   *
   * @param string $fieldTripId
   * @param string $userId
   * @return bool
   */
  public function addParticipant(string $fieldTripId, string $userId): bool
  {
    $sql = "INSERT IGNORE INTO field_trip_participants (field_trip_id, user_id, created_at)
            VALUES (:ft_id, :user_id, NOW())";
    $stmt = $this->execute($sql, [':ft_id' => $fieldTripId, ':user_id' => $userId]);
    return $stmt->rowCount() > 0;
  }

  /**
   * Removes a user from a field trip's participants.
   *
   * @param string $fieldTripId
   * @param string $userId
   * @return bool
   */
  public function removeParticipant(string $fieldTripId, string $userId): bool
  {
    $sql = "DELETE FROM field_trip_participants WHERE field_trip_id = :ft_id AND user_id = :user_id";
    $stmt = $this->execute($sql, [':ft_id' => $fieldTripId, ':user_id' => $userId]);
    return $stmt->rowCount() > 0;
  }

  /**
   * Returns list of participants for a given field trip.
   *
   * @param string $fieldTripId
   * @return array[]
   */
  public function getParticipants(string $fieldTripId): array
  {
    $sql = "SELECT u.user_id, u.first_name, u.last_name, u.email, u.phone_number, u.role, ftp.created_at AS joined_at
            FROM field_trip_participants ftp
            INNER JOIN users u ON ftp.user_id = u.user_id
            WHERE ftp.field_trip_id = :ft_id
            ORDER BY u.first_name ASC, u.last_name ASC";
    return $this->execute($sql, [':ft_id' => $fieldTripId])->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
   * Checks if a user is a participant of a field trip.
   *
   * @param string $fieldTripId
   * @param string $userId
   * @return bool
   */
  public function isParticipant(string $fieldTripId, string $userId): bool
  {
    $sql = "SELECT 1 FROM field_trip_participants WHERE field_trip_id = :ft_id AND user_id = :user_id LIMIT 1";
    $stmt = $this->execute($sql, [':ft_id' => $fieldTripId, ':user_id' => $userId]);
    return (bool)$stmt->fetchColumn();
  }

  /**
   * Syncs participant list (removes missing, adds new).
   *
   * @param string $fieldTripId
   * @param string[] $userIds
   * @return void
   */
  public function syncParticipants(string $fieldTripId, array $userIds): void
  {
    $sqlDelete = "DELETE FROM field_trip_participants WHERE field_trip_id = :ft_id";
    $this->execute($sqlDelete, [':ft_id' => $fieldTripId]);

    if (!empty($userIds)) {
      $insertSql = "INSERT INTO field_trip_participants (field_trip_id, user_id, created_at) VALUES ";
      $parts = [];
      $params = [':ft_id' => $fieldTripId];
      foreach (array_values($userIds) as $i => $uid) {
        $parts[] = "(:ft_id, :uid_$i, NOW())";
        $params[":uid_$i"] = $uid;
      }
      $insertSql .= implode(', ', $parts);
      $this->execute($insertSql, $params);
    }
  }
}
