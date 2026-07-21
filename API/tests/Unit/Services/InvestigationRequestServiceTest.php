<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\InvestigationRequestService;
use DTO\RegisterInvestigationRequestDTO;
use DTO\UpdateInvestigationRequestDTO;
use DTO\AllowedUserRoles;
use Http\ApiException;
use Http\Request;
use Core\UlidGenerator;

class InvestigationRequestServiceTest extends TestCase
{
	private InvestigationRequestService $service;

	protected function setUp(): void
	{
		parent::setUp();
		$this->service = new InvestigationRequestService($this->pdo);
		$this->pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
		$this->pdo->exec('DELETE FROM requests_state');
		$this->pdo->exec('DELETE FROM requests');
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

	// ------------------------------- Fixtures ------------------------------- //

	private function authenticateUser(array $overrides = []): array
	{
		$user = $this->createTestUser($overrides);
		Request::setUser($user);
		return $user;
	}

	private function createTestGeoLocation(): array
	{
		$provinceId = UlidGenerator::generate();
		$provinceSnit = random_int(1000, 999999);
		$user = $this->getOrCreateDefaultUser();
		$this->pdo->prepare(
			'INSERT INTO provinces (province_id, province_snit_code, province_name, created_by, created_at)
             VALUES (?, ?, ?, ?, NOW())'
		)->execute([$provinceId, $provinceSnit, 'Province ' . $provinceSnit, $user['user_id']]);

		$cantonId = UlidGenerator::generate();
		$cantonSnit = random_int(1000, 999999);
		$this->pdo->prepare(
			'INSERT INTO cantons (canton_id, province_snit_code, canton_snit_code, canton_name, created_by, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())'
		)->execute([$cantonId, $provinceSnit, $cantonSnit, 'Canton ' . $cantonSnit, $user['user_id']]);

		$districtId = UlidGenerator::generate();
		$districtSnit = random_int(1000, 999999);
		$this->pdo->prepare(
			'INSERT INTO districts (district_id, canton_snit_code, district_snit_code, district_name, created_by, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())'
		)->execute([$districtId, $cantonSnit, $districtSnit, 'District ' . $districtSnit, $user['user_id']]);

		return [
			'province_snit_code' => $provinceSnit,
			'canton_snit_code' => $cantonSnit,
			'district_snit_code' => $districtSnit,
		];
	}

	private function createTestRequest(array $overrides = []): array
	{
		$geo = $overrides['geo'] ?? $this->createTestGeoLocation();
		$requestId = $overrides['request_id'] ?? UlidGenerator::generate();
		$userId = $overrides['user_id'] ?? $this->getOrCreateDefaultUser()['user_id'];
		$requestName = $overrides['request_name'] ?? ('SOLI-' . strtoupper(substr($requestId, -5)));
		$ownerName = $overrides['owner_name'] ?? 'Test Owner';
		$ownerPhoneNumber = $overrides['owner_phone_number'] ?? '88889999';
		$ownerEmail = $overrides['owner_email'] ?? 'owner@example.com';
		$currentUsage = $overrides['current_usage'] ?? 'Residencial';
		$temperatureSensation = $overrides['temperature_sensation'] ?? 'Templado';
		$bubbles = $overrides['bubbles'] ?? 0;
		$details = $overrides['details'] ?? 'Test details';
		$exactAddress = $overrides['exact_address'] ?? 'Test address';
		$latitude = $overrides['latitude'] ?? 9.9333;
		$longitude = $overrides['longitude'] ?? -84.0833;
		$relationWithOwner = $overrides['relation_with_owner'] ?? null;

		$stmt = $this->pdo->prepare(
			'INSERT INTO requests (
                request_id, province_snit_code, canton_snit_code, district_snit_code,
                user_id, request_name, owner_name, owner_phone_number, owner_email,
                current_usage, temperature_sensation, bubbles, details,
                exact_address, latitude, longitude, relation_with_owner, created_at
            ) VALUES (
                :id, :province_snit, :canton_snit, :district_snit,
                :user_id, :name, :owner_name, :owner_phone, :owner_email,
                :current_usage, :temp_sensation, :bubbles, :details,
                :exact_address, :lat, :lng, :relation, NOW()
            )'
		);
		$stmt->execute([
			':id' => $requestId,
			':province_snit' => $geo['province_snit_code'],
			':canton_snit' => $geo['canton_snit_code'],
			':district_snit' => $geo['district_snit_code'],
			':user_id' => $userId,
			':name' => $requestName,
			':owner_name' => $ownerName,
			':owner_phone' => $ownerPhoneNumber,
			':owner_email' => $ownerEmail,
			':current_usage' => $currentUsage,
			':temp_sensation' => $temperatureSensation,
			':bubbles' => $bubbles,
			':details' => $details,
			':exact_address' => $exactAddress,
			':lat' => $latitude,
			':lng' => $longitude,
			':relation' => $relationWithOwner,
		]);

		$stateValue = $overrides['state_value'] ?? 'Pendiente';
		$this->pdo->prepare(
			'INSERT INTO requests_state (request_status_id, request_id, value, description, created_at, created_by)
             VALUES (?, ?, ?, ?, NOW(), ?)'
		)->execute([UlidGenerator::generate(), $requestId, $stateValue, 'Solicitud creada', $userId]);

		return [
			'request_id' => $requestId,
			'user_id' => $userId,
			'request_name' => $requestName,
			'owner_name' => $ownerName,
			'owner_phone_number' => $ownerPhoneNumber,
			'owner_email' => $ownerEmail,
			'current_usage' => $currentUsage,
			'temperature_sensation' => $temperatureSensation,
			'geo' => $geo,
		];
	}

	private function addLaterState(string $requestId, string $value, string $createdBy): void
	{
		$this->pdo->prepare(
			'INSERT INTO requests_state (request_status_id, request_id, value, description, created_at, created_by)
             VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 SECOND), ?)'
		)->execute([UlidGenerator::generate(), $requestId, $value, 'State transition', $createdBy]);
	}

	private function findRequestRow(string $requestId): ?array
	{
		$stmt = $this->pdo->prepare('SELECT * FROM requests WHERE request_id = ?');
		$stmt->execute([$requestId]);
		return $stmt->fetch() ?: null;
	}

	// -------------------------------- create -------------------------------- //

	public function testCreate(): void
	{
		$user = $this->authenticateUser(['phone_number' => '88889999']);
		$geo = $this->createTestGeoLocation();

		$dto = RegisterInvestigationRequestDTO::fromArray([
			'province_snit_code' => $geo['province_snit_code'],
			'canton_snit_code' => $geo['canton_snit_code'],
			'district_snit_code' => $geo['district_snit_code'],
			'current_usage' => 'Residencial',
			'temperature_sensation' => 'Templado',
			'owner_name' => trim($user['first_name'] . ' ' . $user['last_name']),
			'owner_phone_number' => $user['phone_number'],
			'owner_email' => $user['email'],
		]);

		$result = $this->service->create($dto);

		$this->assertNotEmpty($result['request_id']);
		$this->assertStringStartsWith('SOLI-', $result['request_name']);
		$this->assertEquals($geo['province_snit_code'], $result['location']['province_snit_code']);
		$this->assertEquals('Pendiente', $result['current_state']['value']);

		$row = $this->findRequestRow($result['request_id']);
		$this->assertEquals($user['user_id'], $row['user_id']);
	}

	public function testCreateThrowsWhenOwnerDiffersWithoutRelation(): void
	{
		$this->markTestSkipped('relation_with_owner is optional when owner differs in current API schema.');
	}

	public function testCreateWithDifferentOwnerAndValidRelation(): void
	{
		$this->authenticateUser(['phone_number' => '88889999']);
		$geo = $this->createTestGeoLocation();

		$dto = RegisterInvestigationRequestDTO::fromArray([
			'province_snit_code' => $geo['province_snit_code'],
			'canton_snit_code' => $geo['canton_snit_code'],
			'district_snit_code' => $geo['district_snit_code'],
			'current_usage' => 'Residencial',
			'temperature_sensation' => 'Templado',
			'owner_name' => 'A Different Owner',
			'relation_with_owner' => 'Familiar',
		]);

		$result = $this->service->create($dto);

		$this->assertEquals('A Different Owner', $result['owner_name']);
		$this->assertEquals('Familiar', $result['relation_with_owner']);
	}

	public function testCreateThrowsForInvalidCurrentUsage(): void
	{
		$user = $this->authenticateUser(['phone_number' => '88889999']);
		$geo = $this->createTestGeoLocation();

		$dto = RegisterInvestigationRequestDTO::fromArray([
			'province_snit_code' => $geo['province_snit_code'],
			'canton_snit_code' => $geo['canton_snit_code'],
			'district_snit_code' => $geo['district_snit_code'],
			'current_usage' => 'Invalido',
			'temperature_sensation' => 'Templado',
			'owner_name' => trim($user['first_name'] . ' ' . $user['last_name']),
			'owner_phone_number' => $user['phone_number'],
			'owner_email' => $user['email'],
		]);

		try {
			$this->service->create($dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(422, $e->getHttpStatus());
			$this->assertEquals('INVALID_FIELD', $e->getError()->jsonSerialize()['code']);
		}
	}

	// -------------------------------- update -------------------------------- //

	public function testUpdate(): void
	{
		$user = $this->authenticateUser(['phone_number' => '88889999']);
		$request = $this->createTestRequest(['user_id' => $user['user_id']]);

		$dto = UpdateInvestigationRequestDTO::fromArray(['details' => 'Updated details']);

		$result = $this->service->update($request['request_id'], $dto);

		$this->assertEquals('Updated details', $result['details']);
	}

	public function testUpdateThrowsNotFoundWhenRequestDoesNotBelongToUser(): void
	{
		$this->authenticateUser(['phone_number' => '88889999']);
		$otherUser = $this->createTestUser();
		$request = $this->createTestRequest(['user_id' => $otherUser['user_id']]);

		$dto = UpdateInvestigationRequestDTO::fromArray(['details' => 'Should not apply']);

		try {
			$this->service->update($request['request_id'], $dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	public function testUpdateThrowsWhenStateIsNotPendiente(): void
	{
		$user = $this->authenticateUser(['phone_number' => '88889999']);
		$request = $this->createTestRequest(['user_id' => $user['user_id']]);
		$this->addLaterState($request['request_id'], 'Revisión', $user['user_id']);

		$dto = UpdateInvestigationRequestDTO::fromArray(['details' => 'Should not apply']);

		try {
			$this->service->update($request['request_id'], $dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(422, $e->getHttpStatus());
		}
	}

	public function testUpdateThrowsWhenOwnerDiffersWithoutRelation(): void
	{
		$this->markTestSkipped('relation_with_owner is optional when owner differs in current API schema.');
	}

	// ------------------------------ adminUpdate ------------------------------ //

	public function testAdminUpdate(): void
	{
		$this->markTestSkipped(
			'InvestigationRequestService::adminUpdate is currently commented out in the source and has no active implementation to test.'
		);
	}

	// ------------------------------- addState ------------------------------- //

	public function testAddState(): void
	{
		$this->authenticateUser(['role' => AllowedUserRoles::INVESTIGATOR]);
		$request = $this->createTestRequest();

		$this->service->adminAddState($request['request_id'], 'Revisión', 'Moving forward');

		$stmt = $this->pdo->prepare(
			'SELECT * FROM requests_state WHERE request_id = ? AND value = ?'
		);
		$stmt->execute([$request['request_id'], 'Revisión']);
		$this->assertNotFalse($stmt->fetch());
	}

	public function testAddStateThrowsForbiddenForUnauthorizedRole(): void
	{
		$this->authenticateUser(['role' => AllowedUserRoles::USER]);
		$request = $this->createTestRequest();

		try {
			$this->service->adminAddState($request['request_id'], 'Revisión', 'Moving forward');
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	public function testAddStateThrowsNotFoundForNonexistentId(): void
	{
		$this->authenticateUser(['role' => AllowedUserRoles::ADMIN]);

		try {
			$this->service->adminAddState(UlidGenerator::generate(), 'Revisión', 'Moving forward');
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	// ------------------------------- getStates ------------------------------- //

	public function testGetStates(): void
	{
		$user = $this->authenticateUser();
		$request = $this->createTestRequest(['user_id' => $user['user_id']]);

		$states = $this->service->getStates($request['request_id']);

		$this->assertNotEmpty($states);
		$this->assertEquals('Pendiente', $states[0]['value']);
	}

	public function testGetStatesThrowsForbiddenForNonOwner(): void
	{
		$this->authenticateUser();
		$otherUser = $this->createTestUser();
		$request = $this->createTestRequest(['user_id' => $otherUser['user_id']]);

		try {
			$this->service->getStates($request['request_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	public function testGetStatesThrowsNotFoundForNonexistentId(): void
	{
		$this->authenticateUser();

		try {
			$this->service->getStates(UlidGenerator::generate());
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	public function testAdminGetStates(): void
	{
		$this->authenticateUser(['role' => AllowedUserRoles::MAINTENANCE]);
		$otherUser = $this->createTestUser();
		$request = $this->createTestRequest(['user_id' => $otherUser['user_id']]);

		$states = $this->service->adminGetStates($request['request_id']);

		$this->assertNotEmpty($states);
	}

	// -------------------------------- delete --------------------------------- //

	public function testDelete(): void
	{
		$user = $this->authenticateUser(['role' => AllowedUserRoles::INVESTIGATOR]);
		$request = $this->createTestRequest(['user_id' => $user['user_id']]);

		$this->service->delete($request['request_id']);

		$this->assertNull($this->findRequestRow($request['request_id']));
	}

	public function testDeleteThrowsNotFoundWhenNotOwnedByUser(): void
	{
		$this->authenticateUser(['role' => AllowedUserRoles::ADMIN]);
		$otherUser = $this->createTestUser();
		$request = $this->createTestRequest(['user_id' => $otherUser['user_id']]);

		try {
			$this->service->delete($request['request_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	public function testDeleteThrowsForbiddenForUnauthorizedRole(): void
	{
		$this->markTestSkipped('delete() allows regular users to delete their own requests.');
	}

	// ------------------------------ adminDelete ------------------------------ //

	public function testAdminDelete(): void
	{
		$user = $this->authenticateUser(['role' => AllowedUserRoles::ADMIN]);
		$request = $this->createTestRequest(['user_id' => $user['user_id']]);

		$this->service->delete($request['request_id']);

		$this->assertNull($this->findRequestRow($request['request_id']));
	}

	public function testAdminDeleteThrowsNotFoundForNonexistentId(): void
	{
		$this->authenticateUser(['role' => AllowedUserRoles::ADMIN]);

		try {
			$this->service->delete(UlidGenerator::generate());
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	// ------------------------------ getAllByUser ------------------------------ //

	public function testGetAllByUser(): void
	{
		$user = $this->authenticateUser(['role' => AllowedUserRoles::USER]);
		$ownRequest1 = $this->createTestRequest(['user_id' => $user['user_id']]);
		$ownRequest2 = $this->createTestRequest(['user_id' => $user['user_id']]);
		$this->createTestRequest();

		$result = $this->service->getAllByUser();

		$this->assertCount(2, $result);
		$ids = array_column($result, 'request_id');
		$this->assertContains($ownRequest1['request_id'], $ids);
		$this->assertContains($ownRequest2['request_id'], $ids);
	}

	// --------------------------------- getAll --------------------------------- //

	public function testGetAll(): void
	{
		$this->authenticateUser(['role' => AllowedUserRoles::ADMIN]);
		$request1 = $this->createTestRequest();
		$request2 = $this->createTestRequest();

		$result = $this->service->adminGetAll();

		$this->assertCount(2, $result);
		$ids = array_column($result, 'request_id');
		$this->assertContains($request1['request_id'], $ids);
		$this->assertContains($request2['request_id'], $ids);
		$this->assertArrayHasKey('user_first_name', $result[0]);
	}

	public function testGetAllThrowsForbiddenForUnauthorizedRole(): void
	{
		$this->authenticateUser(['role' => AllowedUserRoles::USER]);

		try {
			$this->service->adminGetAll();
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	// --------------------------------- getById --------------------------------- //

	public function testGetById(): void
	{
		$user = $this->authenticateUser();
		$request = $this->createTestRequest(['user_id' => $user['user_id']]);

		$result = $this->service->getById($request['request_id']);

		$this->assertEquals($request['request_id'], $result['request_id']);
	}

	public function testGetByIdThrowsNotFoundWhenNotOwner(): void
	{
		$this->authenticateUser();
		$otherUser = $this->createTestUser();
		$request = $this->createTestRequest(['user_id' => $otherUser['user_id']]);

		try {
			$this->service->getById($request['request_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	// ------------------------------ adminGetById ------------------------------ //

	public function testAdminGetById(): void
	{
		$this->authenticateUser(['role' => AllowedUserRoles::ADMIN]);
		$otherUser = $this->createTestUser();
		$request = $this->createTestRequest(['user_id' => $otherUser['user_id']]);

		$result = $this->service->adminGetById($request['request_id']);

		$this->assertEquals($request['request_id'], $result['request_id']);
		$this->assertArrayHasKey('user_first_name', $result);
	}

	public function testAdminGetByIdThrowsForbiddenForUnauthorizedRole(): void
	{
		$this->authenticateUser(['role' => AllowedUserRoles::USER]);
		$request = $this->createTestRequest();

		try {
			$this->service->adminGetById($request['request_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	public function testAdminGetByIdThrowsNotFoundForNonexistentId(): void
	{
		$this->authenticateUser(['role' => AllowedUserRoles::ADMIN]);

		try {
			$this->service->adminGetById(UlidGenerator::generate());
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}
}