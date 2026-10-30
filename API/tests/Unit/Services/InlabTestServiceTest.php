<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\InlabTestService;
use DTO\RegisterInlabTestDTO;
use DTO\UpdateInlabTestDTO;
use DTO\AllowedUserRoles;
use Http\ApiException;
use Http\Request;
use Core\UlidGenerator;

class InlabTestServiceTest extends TestCase
{
	private InlabTestService $service;

	protected function setUp(): void
	{
		parent::setUp();
		$this->service = new InlabTestService($this->pdo);
		$this->pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
		$this->pdo->exec('DELETE FROM inlab_tests');
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

	private function createTestInlabTest(array $overrides = []): array
	{
		$manifestation = $overrides['manifestation'] ?? $this->createTestGeomanifestation();
		$id = $overrides['inlab_test_id'] ?? UlidGenerator::generate();
		$name = $overrides['inlab_test_name'] ?? 'Prueba Lab Test';
		$ph = $overrides['ph'] ?? 7.0;
		$conductivity = $overrides['conductivity'] ?? 150.0;
		$description = $overrides['description'] ?? 'Test in-lab measurement';
		$createdBy = $overrides['created_by'] ?? $this->getOrCreateDefaultUser()['user_id'];

		$stmt = $this->pdo->prepare(
			'INSERT INTO inlab_tests (
                inlab_test_id, geomanifestation_id, inlab_test_name, ph, conductivity,
                description, created_by, created_at
            ) VALUES (
                :id, :gm_id, :name, :ph, :cond, :desc, :created_by, NOW()
            )'
		);
		$stmt->execute([
			':id' => $id,
			':gm_id' => $manifestation['geomanifestation_id'],
			':name' => $name,
			':ph' => $ph,
			':cond' => $conductivity,
			':desc' => $description,
			':created_by' => $createdBy,
		]);

		return [
			'inlab_test_id' => $id,
			'geomanifestation_id' => $manifestation['geomanifestation_id'],
			'inlab_test_name' => $name,
			'ph' => $ph,
			'conductivity' => $conductivity,
			'description' => $description,
			'created_by' => $createdBy,
			'manifestation' => $manifestation,
		];
	}

	private function findInlabTestRow(string $id): ?array
	{
		$stmt = $this->pdo->prepare('SELECT * FROM inlab_tests WHERE inlab_test_id = ?');
		$stmt->execute([$id]);
		return $stmt->fetch() ?: null;
	}

	public function testCreate(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation();

		$dto = RegisterInlabTestDTO::fromArray([
			'geomanifestation_id' => $manifestation['geomanifestation_id'],
			'inlab_test_name' => 'Lab Test Alpha',
			'ph' => 7.5,
			'conductivity' => 200.0,
			'description' => 'Water sample analysis',
		]);

		$result = $this->service->create($dto);

		$this->assertEquals($manifestation['geomanifestation_id'], $result['geomanifestation_id']);
		$this->assertEquals('Lab Test Alpha', $result['inlab_test_name']);
		$this->assertEquals(7.5, $result['ph']);

		$row = $this->findInlabTestRow($result['inlab_test_id']);
		$this->assertNotNull($row);
	}

	public function testGetById(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$test = $this->createTestInlabTest();

		$result = $this->service->getById($test['inlab_test_id']);

		$this->assertEquals($test['inlab_test_id'], $result['inlab_test_id']);
		$this->assertEquals($test['inlab_test_name'], $result['inlab_test_name']);
	}

	public function testGetByManifestation(): void
	{
		Request::setUser(null);
		$manifestation = $this->createTestGeomanifestation(['visibility' => 1]);
		$test = $this->createTestInlabTest(['manifestation' => $manifestation]);

		$result = $this->service->getByManifestation($manifestation['geomanifestation_id']);

		$this->assertArrayHasKey('data', $result);
		$this->assertCount(1, $result['data']);
		$this->assertEquals($test['inlab_test_id'], $result['data'][0]['inlab_test_id']);
	}

	public function testUpdate(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$test = $this->createTestInlabTest();

		$dto = UpdateInlabTestDTO::fromArray([
			'inlab_test_name' => 'Updated Lab Name',
			'ph' => 8.1
		]);

		$result = $this->service->update($test['inlab_test_id'], $dto);

		$this->assertEquals('Updated Lab Name', $result['inlab_test_name']);
		$this->assertEquals(8.1, $result['ph']);
	}

	public function testDelete(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$test = $this->createTestInlabTest();

		$this->service->delete($test['inlab_test_id']);

		$this->assertNull($this->findInlabTestRow($test['inlab_test_id']));
	}
}