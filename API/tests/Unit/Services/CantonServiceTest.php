<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\CantonService;
use DTO\CantonDTO;
use DTO\AllowedUserRoles;
use Http\ApiException;
use Http\Request;
use Core\UlidGenerator;

class CantonServiceTest extends TestCase
{
	private CantonService $service;

	protected function setUp(): void
	{
		parent::setUp();
		$this->service = new CantonService($this->pdo);
		$this->pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
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

	private function createTestProvince(array $overrides = []): array
	{
		$provinceId = $overrides['province_id'] ?? UlidGenerator::generate();
		$snitCode = $overrides['province_snit_code'] ?? random_int(1000, 999999);
		$name = $overrides['province_name'] ?? ('Test Province ' . $snitCode);
		$createdBy = $overrides['created_by'] ?? $this->getOrCreateDefaultUser()['user_id'];

		$stmt = $this->pdo->prepare(
			'INSERT INTO provinces (province_id, province_snit_code, province_name, created_by, created_at)
             VALUES (?, ?, ?, ?, NOW())'
		);
		$stmt->execute([$provinceId, $snitCode, $name, $createdBy]);

		return [
			'province_id' => $provinceId,
			'province_snit_code' => $snitCode,
			'province_name' => $name,
			'created_by' => $createdBy,
		];
	}

	private function createTestCanton(array $overrides = []): array
	{
		$province = $overrides['province'] ?? $this->createTestProvince();
		$cantonId = $overrides['canton_id'] ?? UlidGenerator::generate();
		$cantonSnitCode = $overrides['canton_snit_code'] ?? random_int(1000, 999999);
		$name = $overrides['canton_name'] ?? ('Test Canton ' . $cantonSnitCode);
		$createdBy = $overrides['created_by'] ?? $this->getOrCreateDefaultUser()['user_id'];

		$stmt = $this->pdo->prepare(
			'INSERT INTO cantons (canton_id, province_snit_code, canton_snit_code, canton_name, created_by, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())'
		);
		$stmt->execute([$cantonId, $province['province_snit_code'], $cantonSnitCode, $name, $createdBy]);

		return [
			'canton_id' => $cantonId,
			'province_snit_code' => $province['province_snit_code'],
			'canton_snit_code' => $cantonSnitCode,
			'canton_name' => $name,
			'created_by' => $createdBy,
			'province' => $province,
		];
	}

	private function findCantonRow(string $cantonId): ?array
	{
		$stmt = $this->pdo->prepare('SELECT * FROM cantons WHERE canton_id = ?');
		$stmt->execute([$cantonId]);
		return $stmt->fetch() ?: null;
	}

	public function testGetAll(): void
	{
		$province = $this->createTestProvince();
		$canton1 = $this->createTestCanton(['province' => $province]);
		$canton2 = $this->createTestCanton(['province' => $province]);
		$otherCanton = $this->createTestCanton();

		$result = $this->service->getAll();

		$this->assertCount(3, $result);
		$ids = array_column($result, 'canton_id');
		$this->assertContains($canton1['canton_id'], $ids);
		$this->assertContains($canton2['canton_id'], $ids);
		$this->assertContains($otherCanton['canton_id'], $ids);
	}

	public function testGetAllFiltersByProvinceSnitCode(): void
	{
		$province = $this->createTestProvince();
		$canton1 = $this->createTestCanton(['province' => $province]);
		$this->createTestCanton();

		$result = $this->service->getAll($province['province_snit_code']);

		$this->assertCount(1, $result);
		$this->assertEquals($canton1['canton_id'], $result[0]['canton_id']);
	}

	public function testGetById(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$canton = $this->createTestCanton();

		$result = $this->service->getById($canton['canton_id']);

		$this->assertEquals($canton['canton_id'], $result['canton_id']);
		$this->assertEquals($canton['canton_snit_code'], $result['canton_snit_code']);
		$this->assertEquals($canton['canton_name'], $result['canton_name']);
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
		$canton = $this->createTestCanton();

		try {
			$this->service->getById($canton['canton_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	public function testGetBySnitCode(): void
	{
		$this->authenticateAs(AllowedUserRoles::MAINTENANCE);
		$canton = $this->createTestCanton();

		$result = $this->service->getBySnitCode($canton['canton_snit_code']);

		$this->assertEquals($canton['canton_id'], $result['canton_id']);
	}

	public function testGetBySnitCodeThrowsNotFoundForNonexistentCode(): void
	{
		$this->authenticateAs(AllowedUserRoles::INVESTIGATOR);

		try {
			$this->service->getBySnitCode(999999);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	public function testCreate(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$province = $this->createTestProvince();

		$dto = CantonDTO::fromArray([
			'province_snit_code' => $province['province_snit_code'],
			'canton_snit_code' => 30001,
			'canton_name' => 'Escazú',
		]);

		$this->service->create($dto);

		$stmt = $this->pdo->prepare('SELECT * FROM cantons WHERE canton_snit_code = ?');
		$stmt->execute([30001]);
		$created = $stmt->fetch();

		$this->assertNotFalse($created);
		$this->assertEquals('Escazú', $created['canton_name']);
		$this->assertEquals($province['province_snit_code'], $created['province_snit_code']);
	}

	public function testCreateThrowsInvalidFieldWhenProvinceDoesNotExist(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);

		$dto = CantonDTO::fromArray([
			'province_snit_code' => 999999,
			'canton_snit_code' => 30002,
			'canton_name' => 'Orphan Canton',
		]);

		try {
			$this->service->create($dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(422, $e->getHttpStatus());
			$this->assertEquals('INVALID_FIELD', $e->getError()->jsonSerialize()['code']);
		}
	}

	public function testCreateThrowsConflictWhenSnitCodeExists(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$existing = $this->createTestCanton();

		$dto = CantonDTO::fromArray([
			'province_snit_code' => $existing['province_snit_code'],
			'canton_snit_code' => $existing['canton_snit_code'],
			'canton_name' => 'Duplicated Canton',
		]);

		try {
			$this->service->create($dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(409, $e->getHttpStatus());
			$this->assertEquals('CONFLICT_ERROR', $e->getError()->jsonSerialize()['code']);
		}
	}

	public function testCreateThrowsForbiddenForUnauthorizedRole(): void
	{
		$this->authenticateAs(AllowedUserRoles::MAINTENANCE);
		$province = $this->createTestProvince();

		$dto = CantonDTO::fromArray([
			'province_snit_code' => $province['province_snit_code'],
			'canton_snit_code' => 30003,
			'canton_name' => 'Forbidden Canton',
		]);

		try {
			$this->service->create($dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	public function testUpdate(): void
	{
		$this->authenticateAs(AllowedUserRoles::INVESTIGATOR);
		$existing = $this->createTestCanton();

		$dto = CantonDTO::fromArray([
			'province_snit_code' => $existing['province_snit_code'],
			'canton_snit_code' => $existing['canton_snit_code'],
			'canton_name' => 'Updated Canton Name',
		]);

		$this->service->update($existing['canton_id'], $dto);

		$updated = $this->findCantonRow($existing['canton_id']);
		$this->assertEquals('Updated Canton Name', $updated['canton_name']);
	}

	public function testUpdateThrowsNotFoundForNonexistentId(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$province = $this->createTestProvince();

		$dto = CantonDTO::fromArray([
			'province_snit_code' => $province['province_snit_code'],
			'canton_snit_code' => 30004,
			'canton_name' => 'Ghost Canton',
		]);

		try {
			$this->service->update(UlidGenerator::generate(), $dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	public function testUpdateThrowsConflictWhenNewSnitCodeExists(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$province = $this->createTestProvince();
		$cantonA = $this->createTestCanton(['province' => $province, 'canton_snit_code' => 40001]);
		$cantonB = $this->createTestCanton(['province' => $province, 'canton_snit_code' => 40002]);

		$dto = CantonDTO::fromArray([
			'province_snit_code' => $province['province_snit_code'],
			'canton_snit_code' => $cantonB['canton_snit_code'],
			'canton_name' => $cantonA['canton_name'],
		]);

		try {
			$this->service->update($cantonA['canton_id'], $dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(409, $e->getHttpStatus());
		}
	}

	public function testUpdateThrowsInvalidFieldWhenProvinceDoesNotExist(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$existing = $this->createTestCanton();

		$dto = CantonDTO::fromArray([
			'province_snit_code' => 999999,
			'canton_snit_code' => $existing['canton_snit_code'],
			'canton_name' => $existing['canton_name'],
		]);

		try {
			$this->service->update($existing['canton_id'], $dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(422, $e->getHttpStatus());
		}
	}

	public function testDelete(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$canton = $this->createTestCanton();

		$this->service->delete($canton['canton_id']);

		$this->assertNull($this->findCantonRow($canton['canton_id']));
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
		$this->authenticateAs(AllowedUserRoles::MAINTENANCE);
		$canton = $this->createTestCanton();

		try {
			$this->service->delete($canton['canton_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}
}