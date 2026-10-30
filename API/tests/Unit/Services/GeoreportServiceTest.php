<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\GeoreportService;
use DTO\RegisterGeoreportDTO;
use DTO\UpdateGeoreportDTO;
use DTO\AllowedUserRoles;
use Http\ApiException;
use Http\Request;
use Core\UlidGenerator;

class GeoreportServiceTest extends TestCase
{
	private GeoreportService $service;

	protected function setUp(): void
	{
		parent::setUp();
		$this->service = new GeoreportService($this->pdo);
		$this->pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
		$this->pdo->exec('DELETE FROM georeports');
		$this->pdo->exec('DELETE FROM insitu_tests');
		$this->pdo->exec('DELETE FROM inlab_tests');
		$this->pdo->exec('DELETE FROM geomanifestations');
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
		$createdBy = $overrides['created_by'] ?? $this->getOrCreateDefaultUser()['user_id'];

		$stmt = $this->pdo->prepare(
			'INSERT INTO geomanifestations (
                geomanifestation_id, province_snit_code, canton_snit_code, district_snit_code,
                current_georeport_id, geomanifestation_name, latitude, longitude, description,
                visibility, created_by, created_at
            ) VALUES (
                :id, NULL, NULL, NULL,
                NULL, :name, 9.9333, -84.0833, "Test",
                1, :created_by, NOW()
            )'
		);
		$stmt->execute([':id' => $id, ':name' => $name, ':created_by' => $createdBy]);

		return ['geomanifestation_id' => $id, 'geomanifestation_name' => $name];
	}

	private function createTestInsituTest(string $manifestationId): string
	{
		$id = UlidGenerator::generate();
		$stmt = $this->pdo->prepare(
			'INSERT INTO insitu_tests (insitu_test_id, geomanifestation_id, insitu_test_name, temperature, conductivity, ph, created_by, created_at)
             VALUES (?, ?, "Test In-Situ", 25.0, 100.0, 7.0, ?, NOW())'
		);
		$stmt->execute([$id, $manifestationId, $this->getOrCreateDefaultUser()['user_id']]);
		return $id;
	}

	private function createTestInlabTest(string $manifestationId): string
	{
		$id = UlidGenerator::generate();
		$stmt = $this->pdo->prepare(
			'INSERT INTO inlab_tests (inlab_test_id, geomanifestation_id, inlab_test_name, ph, conductivity, created_by, created_at)
             VALUES (?, ?, "Test In-Lab", 7.0, 100.0, ?, NOW())'
		);
		$stmt->execute([$id, $manifestationId, $this->getOrCreateDefaultUser()['user_id']]);
		return $id;
	}

	public function testCreate(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation();
		$insituId = $this->createTestInsituTest($manifestation['geomanifestation_id']);
		$inlabId = $this->createTestInlabTest($manifestation['geomanifestation_id']);

		$dto = RegisterGeoreportDTO::fromArray([
			'geomanifestation_id' => $manifestation['geomanifestation_id'],
			'insitu_test_id' => $insituId,
			'inlab_test_id' => $inlabId,
			'georeport_name' => 'Reporte Oficial 1',
			'details' => 'Initial report'
		]);

		$result = $this->service->create($dto, true);

		$this->assertEquals($manifestation['geomanifestation_id'], $result['geomanifestation_id']);
		$this->assertEquals('Reporte Oficial 1', $result['georeport_name']);
		$this->assertEquals('Initial report', $result['details']);
	}

	public function testGetById(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation();
		$insituId = $this->createTestInsituTest($manifestation['geomanifestation_id']);
		$inlabId = $this->createTestInlabTest($manifestation['geomanifestation_id']);

		$dto = RegisterGeoreportDTO::fromArray([
			'geomanifestation_id' => $manifestation['geomanifestation_id'],
			'insitu_test_id' => $insituId,
			'inlab_test_id' => $inlabId,
			'georeport_name' => 'Reporte Find'
		]);
		$created = $this->service->create($dto);

		$result = $this->service->getById($created['georeport_id']);

		$this->assertEquals($created['georeport_id'], $result['georeport_id']);
		$this->assertEquals('Reporte Find', $result['georeport_name']);
	}

	public function testGetByManifestation(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation();
		$insituId = $this->createTestInsituTest($manifestation['geomanifestation_id']);
		$inlabId = $this->createTestInlabTest($manifestation['geomanifestation_id']);

		$dto = RegisterGeoreportDTO::fromArray([
			'geomanifestation_id' => $manifestation['geomanifestation_id'],
			'insitu_test_id' => $insituId,
			'inlab_test_id' => $inlabId,
			'georeport_name' => 'Reporte List'
		]);
		$this->service->create($dto);

		$result = $this->service->getByManifestation($manifestation['geomanifestation_id']);

		$this->assertArrayHasKey('data', $result);
		$this->assertCount(1, $result['data']);
		$this->assertEquals('Reporte List', $result['data'][0]['georeport_name']);
	}

	public function testGetCurrentByManifestation(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation();
		$insituId = $this->createTestInsituTest($manifestation['geomanifestation_id']);
		$inlabId = $this->createTestInlabTest($manifestation['geomanifestation_id']);

		$dto = RegisterGeoreportDTO::fromArray([
			'geomanifestation_id' => $manifestation['geomanifestation_id'],
			'insitu_test_id' => $insituId,
			'inlab_test_id' => $inlabId,
			'georeport_name' => 'Current Report'
		]);
		$created = $this->service->create($dto, true);

		$result = $this->service->getCurrentByManifestation($manifestation['geomanifestation_id']);

		$this->assertNotNull($result);
		$this->assertEquals($created['georeport_id'], $result['georeport_id']);
		$this->assertEquals('Current Report', $result['georeport_name']);
	}

	public function testUpdate(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation();
		$insituId = $this->createTestInsituTest($manifestation['geomanifestation_id']);
		$inlabId = $this->createTestInlabTest($manifestation['geomanifestation_id']);

		$dto = RegisterGeoreportDTO::fromArray([
			'geomanifestation_id' => $manifestation['geomanifestation_id'],
			'insitu_test_id' => $insituId,
			'inlab_test_id' => $inlabId,
			'georeport_name' => 'Old Name'
		]);
		$created = $this->service->create($dto);

		$updateDto = UpdateGeoreportDTO::fromArray([
			'georeport_name' => 'Updated Name',
			'details' => 'New details'
		]);

		$result = $this->service->update($created['georeport_id'], $updateDto);

		$this->assertEquals('Updated Name', $result['georeport_name']);
		$this->assertEquals('New details', $result['details']);
	}

	public function testDelete(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation();
		$insituId = $this->createTestInsituTest($manifestation['geomanifestation_id']);
		$inlabId = $this->createTestInlabTest($manifestation['geomanifestation_id']);

		$dto = RegisterGeoreportDTO::fromArray([
			'geomanifestation_id' => $manifestation['geomanifestation_id'],
			'insitu_test_id' => $insituId,
			'inlab_test_id' => $inlabId,
			'georeport_name' => 'To Delete'
		]);
		$created = $this->service->create($dto);

		$this->service->delete($created['georeport_id']);

		$this->expectException(ApiException::class);
		$this->service->getById($created['georeport_id']);
	}
}