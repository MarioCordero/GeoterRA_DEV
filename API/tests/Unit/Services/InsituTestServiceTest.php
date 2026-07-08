<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\InsituTestService;
use DTO\RegisterInsituTestDTO;
use DTO\UpdateInsituTestDTO;
use DTO\AllowedUserRoles;
use Http\ApiException;
use Http\Request;
use Core\UlidGenerator;

class InsituTestServiceTest extends TestCase
{
	private InsituTestService $service;

	protected function setUp(): void
	{
		parent::setUp();
		$this->service = new InsituTestService($this->pdo);
		$this->pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
		$this->pdo->exec('DELETE FROM insitu_tests');
		$this->pdo->exec('DELETE FROM geomanifestations');
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

	private function authenticateAs(string $role): array
	{
		$user = ['user_id' => UlidGenerator::generate(), 'role' => $role];
		Request::setUser($user);
		return $user;
	}

	private function createTestGeomanifestation(array $overrides = []): array
	{
		$id = $overrides['geomanifestation_id'] ?? UlidGenerator::generate();
		$name = $overrides['geomanifestation_name'] ?? ('Manifestation ' . substr($id, -6));
		$latitude = $overrides['latitude'] ?? 9.9333;
		$longitude = $overrides['longitude'] ?? -84.0833;
		$visibility = $overrides['visibility'] ?? 1;
		$createdBy = $overrides['created_by'] ?? UlidGenerator::generate();

		$stmt = $this->pdo->prepare(
			'INSERT INTO geomanifestations (
                geomanifestation_id, province_snit_code, canton_snit_code, district_snit_code,
                current_georeport_id, geomanifestation_name, latitude, longitude, description,
                visibility, created_by, created_at
            ) VALUES (
                :id, NULL, NULL, NULL,
                NULL, :name, :lat, :lng, :desc,
                :visibility, :created_by, NOW()
            )'
		);
		$stmt->execute([
			':id' => $id,
			':name' => $name,
			':lat' => $latitude,
			':lng' => $longitude,
			':desc' => $overrides['description'] ?? 'Test manifestation',
			':visibility' => $visibility,
			':created_by' => $createdBy,
		]);

		return [
			'geomanifestation_id' => $id,
			'geomanifestation_name' => $name,
			'latitude' => $latitude,
			'longitude' => $longitude,
			'visibility' => $visibility,
			'created_by' => $createdBy,
		];
	}

	private function createTestInsituTest(array $overrides = []): array
	{
		$manifestation = $overrides['manifestation'] ?? $this->createTestGeomanifestation();
		$id = $overrides['insitu_test_id'] ?? UlidGenerator::generate();
		$temperature = $overrides['temperature'] ?? 65.5;
		$conductivity = $overrides['conductivity'] ?? 320.25;
		$ph = $overrides['ph'] ?? 7.2;
		$description = $overrides['description'] ?? 'Test in-situ measurement';
		$createdBy = $overrides['created_by'] ?? UlidGenerator::generate();

		$stmt = $this->pdo->prepare(
			'INSERT INTO insitu_tests (
                insitu_test_id, geomanifestation_id, temperature, conductivity,
                ph, description, created_by, created_at
            ) VALUES (
                :id, :gm_id, :temp, :cond, :ph, :desc, :created_by, NOW()
            )'
		);
		$stmt->execute([
			':id' => $id,
			':gm_id' => $manifestation['geomanifestation_id'],
			':temp' => $temperature,
			':cond' => $conductivity,
			':ph' => $ph,
			':desc' => $description,
			':created_by' => $createdBy,
		]);

		return [
			'insitu_test_id' => $id,
			'geomanifestation_id' => $manifestation['geomanifestation_id'],
			'temperature' => $temperature,
			'conductivity' => $conductivity,
			'ph' => $ph,
			'description' => $description,
			'created_by' => $createdBy,
			'manifestation' => $manifestation,
		];
	}

	private function findInsituTestRow(string $id): ?array
	{
		$stmt = $this->pdo->prepare('SELECT * FROM insitu_tests WHERE insitu_test_id = ?');
		$stmt->execute([$id]);
		return $stmt->fetch() ?: null;
	}

	// -------------------------------- create -------------------------------- //

	public function testCreate(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation();

		$dto = RegisterInsituTestDTO::fromArray([
			'geomanifestation_id' => $manifestation['geomanifestation_id'],
			'temperature' => 72.5,
			'conductivity' => 410.0,
			'ph' => 6.8,
			'description' => 'Fumarole measurement',
		]);

		$result = $this->service->create($dto);

		$this->assertEquals($manifestation['geomanifestation_id'], $result['geomanifestation_id']);
		$this->assertEquals(72.5, $result['temperature']);
		$this->assertEquals(6.8, $result['ph']);

		$row = $this->findInsituTestRow($result['insitu_test_id']);
		$this->assertNotNull($row);
	}

	public function testCreateThrowsInvalidFieldWhenManifestationDoesNotExist(): void
	{
		$this->authenticateAs(AllowedUserRoles::INVESTIGATOR);

		$dto = RegisterInsituTestDTO::fromArray([
			'geomanifestation_id' => UlidGenerator::generate(),
			'temperature' => 50.0,
		]);

		try {
			$this->service->create($dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(422, $e->getHttpStatus());
			$this->assertEquals('INVALID_FIELD', $e->getError()->jsonSerialize()['code']);
		}
	}

	public function testCreateThrowsForbiddenForUnauthorizedRole(): void
	{
		$this->authenticateAs(AllowedUserRoles::MAINTENANCE);
		$manifestation = $this->createTestGeomanifestation();

		$dto = RegisterInsituTestDTO::fromArray([
			'geomanifestation_id' => $manifestation['geomanifestation_id'],
		]);

		try {
			$this->service->create($dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	public function testCreateThrowsForInvalidTemperature(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation();

		$dto = RegisterInsituTestDTO::fromArray([
			'geomanifestation_id' => $manifestation['geomanifestation_id'],
			'temperature' => 250.0,
		]);

		try {
			$this->service->create($dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(422, $e->getHttpStatus());
			$this->assertEquals('INVALID_FIELD', $e->getError()->jsonSerialize()['code']);
		}
	}

	// -------------------------------- getById -------------------------------- //

	public function testGetById(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$test = $this->createTestInsituTest();

		$result = $this->service->getById($test['insitu_test_id']);

		$this->assertEquals($test['insitu_test_id'], $result['insitu_test_id']);
		$this->assertEquals($test['geomanifestation_id'], $result['geomanifestation_id']);
		$this->assertEquals($test['description'], $result['description']);
	}

	public function testGetByIdThrowsNotFoundForNonexistentId(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);

		try {
			$this->service->getById(UlidGenerator::generate());
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
			$this->assertEquals('NOT_FOUND', $e->getError()->jsonSerialize()['code']);
		}
	}

	public function testGetByIdThrowsForbiddenForUnauthorizedRole(): void
	{
		$this->authenticateAs(AllowedUserRoles::USER);
		$test = $this->createTestInsituTest();

		try {
			$this->service->getById($test['insitu_test_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	// --------------------------- getByManifestation --------------------------- //

	public function testGetByManifestationVisiblePublic(): void
	{
		Request::setUser(null);
		$manifestation = $this->createTestGeomanifestation(['visibility' => 1]);
		$test = $this->createTestInsituTest(['manifestation' => $manifestation]);

		$result = $this->service->getByManifestation($manifestation['geomanifestation_id']);

		$this->assertCount(1, $result);
		$this->assertEquals($test['insitu_test_id'], $result[0]['insitu_test_id']);
	}

	public function testGetByManifestationHiddenThrowsForbiddenWithoutRole(): void
	{
		Request::setUser(null);
		$manifestation = $this->createTestGeomanifestation(['visibility' => 0]);
		$this->createTestInsituTest(['manifestation' => $manifestation]);

		try {
			$this->service->getByManifestation($manifestation['geomanifestation_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	public function testGetByManifestationHiddenAllowsAuthorizedRole(): void
	{
		$manifestation = $this->createTestGeomanifestation(['visibility' => 0]);
		$test = $this->createTestInsituTest(['manifestation' => $manifestation]);
		$this->authenticateAs(AllowedUserRoles::INVESTIGATOR);

		$result = $this->service->getByManifestation($manifestation['geomanifestation_id']);

		$this->assertCount(1, $result);
		$this->assertEquals($test['insitu_test_id'], $result[0]['insitu_test_id']);
	}

	public function testGetByManifestationThrowsNotFoundForNonexistentManifestation(): void
	{
		try {
			$this->service->getByManifestation(UlidGenerator::generate());
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	// -------------------------------- update --------------------------------- //

	public function testUpdate(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$test = $this->createTestInsituTest();

		$dto = UpdateInsituTestDTO::fromArray(['temperature' => 88.4, 'description' => 'Updated']);

		$result = $this->service->update($test['insitu_test_id'], $dto);

		$this->assertEquals(88.4, $result['temperature']);
		$this->assertEquals('Updated', $result['description']);
	}

	public function testUpdateThrowsNotFoundForNonexistentId(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$dto = UpdateInsituTestDTO::fromArray(['temperature' => 40.0]);

		try {
			$this->service->update(UlidGenerator::generate(), $dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	public function testUpdateThrowsForbiddenForUnauthorizedRole(): void
	{
		$this->authenticateAs(AllowedUserRoles::MAINTENANCE);
		$test = $this->createTestInsituTest();
		$dto = UpdateInsituTestDTO::fromArray(['temperature' => 40.0]);

		try {
			$this->service->update($test['insitu_test_id'], $dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	public function testUpdateThrowsForInvalidPh(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$test = $this->createTestInsituTest();
		$dto = UpdateInsituTestDTO::fromArray(['ph' => 20.0]);

		try {
			$this->service->update($test['insitu_test_id'], $dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(422, $e->getHttpStatus());
		}
	}

	// -------------------------------- delete --------------------------------- //

	public function testDelete(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$test = $this->createTestInsituTest();

		$this->service->delete($test['insitu_test_id']);

		$this->assertNull($this->findInsituTestRow($test['insitu_test_id']));
	}

	public function testDeleteThrowsNotFoundForNonexistentId(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);

		try {
			$this->service->delete(UlidGenerator::generate());
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	public function testDeleteThrowsForbiddenForUnauthorizedRole(): void
	{
		$this->authenticateAs(AllowedUserRoles::USER);
		$test = $this->createTestInsituTest();

		try {
			$this->service->delete($test['insitu_test_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}
}