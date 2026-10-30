<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Core\UlidGenerator;
use DTO\AllowedUserRoles;
use Http\Request;
use Services\FieldTripService;
use Tests\TestCase;

class FieldTripServiceTest extends TestCase
{
  private FieldTripService $service;

  protected function setUp(): void
  {
    parent::setUp();
    $this->service = new FieldTripService($this->pdo);
    $this->pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
    $this->pdo->exec('DELETE FROM districts');
    $this->pdo->exec('DELETE FROM cantons');
    $this->pdo->exec('DELETE FROM provinces');
    $this->pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
    Request::setUser(null);
  }

  protected function tearDown(): void
  {
    Request::setUser(null);
    parent::tearDown();
  }

  public function testServiceCanBeInstantiated(): void
  {
    $this->assertInstanceOf(FieldTripService::class, $this->service);
  }

  public function testGetAllReturnsPaginationTotal(): void
  {
    $this->authenticateUser(['role' => AllowedUserRoles::ADMIN]);
    $this->createTestFieldTrip();
    $this->createTestFieldTrip();

    $result = $this->service->getAll();

    $this->assertArrayHasKey('pagination', $result);
    $this->assertEquals(2, $result['pagination']['total']);
    $this->assertArrayNotHasKey('total', $result);
  }

  public function testGetMyFieldTripsReturnsPaginationTotal(): void
  {
    $user = $this->authenticateUser(['role' => AllowedUserRoles::FIELD_INVESTIGATOR]);
    $ownTrip = $this->createTestFieldTrip(['creator_id' => $user['user_id']]);
    $participantTrip = $this->createTestFieldTrip();
    $this->addFieldTripParticipant($participantTrip['field_trip_id'], $user['user_id']);
    $this->createTestFieldTrip();

    $result = $this->service->getMyFieldTrips();

    $this->assertCount(2, $result['data']);
    $ids = array_column($result['data'], 'field_trip_id');
    $this->assertContains($ownTrip['field_trip_id'], $ids);
    $this->assertContains($participantTrip['field_trip_id'], $ids);
    $this->assertArrayHasKey('pagination', $result);
    $this->assertEquals(2, $result['pagination']['total']);
    $this->assertArrayNotHasKey('total', $result);
  }

  private function authenticateUser(array $overrides = []): array
  {
    $user = $this->createTestUser($overrides);
    Request::setUser($user);
    return $user;
  }

  private function createTestFieldTrip(array $overrides = []): array
  {
    $creatorId = $overrides['creator_id'] ?? $this->getOrCreateDefaultUser()['user_id'];
    $id = $overrides['field_trip_id'] ?? UlidGenerator::generate();

    $this->pdo->prepare(
      'INSERT INTO field_trips (
        field_trip_id,
        field_trip_name,
        field_trip_start_date,
        field_trip_finish_date,
        field_trip_creator_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())'
    )->execute([
      $id,
      $overrides['field_trip_name'] ?? ('Field Trip ' . substr($id, -6)),
      $overrides['field_trip_start_date'] ?? '2026-01-01 08:00:00',
      $overrides['field_trip_finish_date'] ?? '2026-01-01 12:00:00',
      $creatorId,
    ]);

    return [
      'field_trip_id' => $id,
      'field_trip_creator_id' => $creatorId,
    ];
  }

  private function addFieldTripParticipant(string $fieldTripId, string $userId): void
  {
    $this->pdo->prepare(
      'INSERT INTO field_trip_participants (field_trip_id, user_id, created_at) VALUES (?, ?, NOW())'
    )->execute([$fieldTripId, $userId]);
  }
}
