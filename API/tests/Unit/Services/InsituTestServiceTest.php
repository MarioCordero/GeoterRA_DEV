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

	private function authenticateAs(string $role): array
	{
		$user = $this->createTestUser(['role' => $role]);
		Request::setUser($user);
		$_SERVER['HTTP_X_CLIENT_ID'] = 'web-secret-key-789';
		return $user;
	}

	private function createTestGeomanifestation(array $overrides = []): array
	{
		$id = $overrides['geomanifestation_id'] ?? UlidGenerator::generate();
		$name = $overrides['geomanifestation_name'] ?? ('Manifestation ' . substr($id, -6));
		$latitude = $overrides['latitude'] ?? 9.9333;
		$longitude = $overrides['longitude'] ?? -84.0833;
		$visibility = $overrides['visibility'] ?? 1;
		$createdBy = $overrides['created_by'] ?? $this->getOrCreateDefaultUser()['user_id'];

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
		$name = $overrides['insitu_test_name'] ?? 'Prueba In-Situ Test';
		$temperature = $overrides['temperature'] ?? 65.5;
		$conductivity = $overrides['conductivity'] ?? 320.25;
		$ph = $overrides['ph'] ?? 7.2;
		$description = $overrides['description'] ?? 'Test in-situ measurement';
		$createdBy = $overrides['created_by'] ?? $this->getOrCreateDefaultUser()['user_id'];

		$stmt = $this->pdo->prepare(
			'INSERT INTO insitu_tests (
                insitu_test_id, geomanifestation_id, insitu_test_name, temperature, conductivity,
                ph, description, created_by, created_at
            ) VALUES (
                :id, :gm_id, :name, :temp, :cond, :ph, :desc, :created_by, NOW()
            )'
		);
		$stmt->execute([
			':id' => $id,
			':gm_id' => $manifestation['geomanifestation_id'],
			':name' => $name,
			':temp' => $temperature,
			':cond' => $conductivity,
			':ph' => $ph,
			':desc' => $description,
			':created_by' => $createdBy,
		]);

		return [
			'insitu_test_id' => $id,
			'geomanifestation_id' => $manifestation['geomanifestation_id'],
			'insitu_test_name' => $name,
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

	public function testCreate(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation();

		$dto = RegisterInsituTestDTO::fromArray([
			'geomanifestation_id' => $manifestation['geomanifestation_id'],
			'insitu_test_name' => 'Fumarole Test',
			'temperature' => 72.5,
			'conductivity' => 410.0,
			'ph' => 6.8,
			'description' => 'Fumarole measurement',
		]);

		$result = $this->service->create($dto);

		$this->assertEquals($manifestation['geomanifestation_id'], $result['geomanifestation_id']);
		$this->assertEquals('Fumarole Test', $result['insitu_test_name']);
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
			'insitu_test_name' => 'Test',
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
			'insitu_test_name' => 'Test',
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
			'insitu_test_name' => 'Test',
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

	public function testGetById(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$test = $this->createTestInsituTest();

		$result = $this->service->getById($test['insitu_test_id']);

		$this->assertEquals($test['insitu_test_id'], $result['insitu_test_id']);
		$this->assertEquals($test['insitu_test_name'], $result['insitu_test_name']);
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

	public function testGetByManifestationVisiblePublic(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation(['visibility' => 1]);
		$test = $this->createTestInsituTest(['manifestation' => $manifestation]);

		$result = $this->service->getByManifestation($manifestation['geomanifestation_id']);

		$this->assertArrayHasKey('data', $result);
		$this->assertCount(1, $result['data']);
		$this->assertEquals($test['insitu_test_id'], $result['data'][0]['insitu_test_id']);
	}

	public function testUpdate(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$test = $this->createTestInsituTest();

		$dto = UpdateInsituTestDTO::fromArray([
			'insitu_test_name' => 'Updated Name',
			'temperature' => 88.4,
			'description' => 'Updated'
		]);

		$result = $this->service->update($test['insitu_test_id'], $dto);

		$this->assertEquals('Updated Name', $result['insitu_test_name']);
		$this->assertEquals(88.4, $result['temperature']);
		$this->assertEquals('Updated', $result['description']);
	}

	public function testDelete(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$test = $this->createTestInsituTest();

		$this->service->delete($test['insitu_test_id']);

		$this->assertNull($this->findInsituTestRow($test['insitu_test_id']));
	}
}