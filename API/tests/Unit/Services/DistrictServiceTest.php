<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\DistrictService;
use DTO\DistrictDTO;
use DTO\AllowedUserRoles;
use Http\ApiException;
use Http\Request;
use Core\UlidGenerator;

class DistrictServiceTest extends TestCase
{
	private DistrictService $service;

	protected function setUp(): void
	{
		parent::setUp();
		$this->service = new DistrictService($this->pdo);
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

	private function authenticateAs(string $role): array
	{
		$user = $this->createTestUser(['role' => $role]);
		Request::setUser($user);
		$_SERVER['HTTP_X_CLIENT_ID'] = 'web-secret-key-789';
		return $user;
	}

	private static int $testCounter = 100;

	private function createTestProvince(array $overrides = []): array
	{
		$provinceId = $overrides['province_id'] ?? UlidGenerator::generate();
		$snitCode = $overrides['province_snit_code'] ?? (self::$testCounter % 9 + 1);
		$name = $overrides['province_name'] ?? ('Test Province ' . self::$testCounter++);
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
		$cantonSnitCode = $overrides['canton_snit_code'] ?? (int)($province['province_snit_code'] . sprintf('%02d', (self::$testCounter % 90 + 1)));
		$name = $overrides['canton_name'] ?? ('Test Canton ' . self::$testCounter++);
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
		];
	}

	private function createTestDistrict(array $overrides = []): array
	{
		$canton = $overrides['canton'] ?? $this->createTestCanton();
		$districtId = $overrides['district_id'] ?? UlidGenerator::generate();
		$districtSnitCode = $overrides['district_snit_code'] ?? (int)($canton['canton_snit_code'] . sprintf('%02d', (self::$testCounter % 90 + 1)));
		$name = $overrides['district_name'] ?? ('Test District ' . self::$testCounter++);
		$createdBy = $overrides['created_by'] ?? $this->getOrCreateDefaultUser()['user_id'];

		$stmt = $this->pdo->prepare(
			'INSERT INTO districts (district_id, canton_snit_code, district_snit_code, district_name, created_by, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())'
		);
		$stmt->execute([$districtId, $canton['canton_snit_code'], $districtSnitCode, $name, $createdBy]);

		return [
			'district_id' => $districtId,
			'canton_snit_code' => $canton['canton_snit_code'],
			'district_snit_code' => $districtSnitCode,
			'district_name' => $name,
			'created_by' => $createdBy,
			'canton' => $canton,
		];
	}

	private function findDistrictRow(string $districtId): ?array
	{
		$stmt = $this->pdo->prepare('SELECT * FROM districts WHERE district_id = ?');
		$stmt->execute([$districtId]);
		return $stmt->fetch() ?: null;
	}

	public function testGetAll(): void
	{
		$canton = $this->createTestCanton();
		$district1 = $this->createTestDistrict(['canton' => $canton]);
		$district2 = $this->createTestDistrict(['canton' => $canton]);
		$otherDistrict = $this->createTestDistrict();

		$result = $this->service->getAll();

		$this->assertCount(3, $result);
		$ids = array_column($result, 'district_id');
		$this->assertContains($district1['district_id'], $ids);
		$this->assertContains($district2['district_id'], $ids);
		$this->assertContains($otherDistrict['district_id'], $ids);
	}

	public function testGetAllFiltersByCantonSnitCode(): void
	{
		$canton = $this->createTestCanton();
		$district1 = $this->createTestDistrict(['canton' => $canton]);
		$this->createTestDistrict();

		$result = $this->service->getAll($canton['canton_snit_code']);

		$this->assertCount(1, $result);
		$this->assertEquals($district1['district_id'], $result[0]['district_id']);
	}

	public function testGetById(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$district = $this->createTestDistrict();

		$result = $this->service->getById($district['district_id']);

		$this->assertEquals($district['district_id'], $result['district_id']);
		$this->assertEquals($district['district_snit_code'], $result['district_snit_code']);
		$this->assertEquals($district['district_name'], $result['district_name']);
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
		$district = $this->createTestDistrict();

		try {
			$this->service->getById($district['district_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	public function testGetBySnitCode(): void
	{
		$this->authenticateAs(AllowedUserRoles::MAINTENANCE);
		$district = $this->createTestDistrict();

		$result = $this->service->getBySnitCode($district['district_snit_code']);

		$this->assertEquals($district['district_id'], $result['district_id']);
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
		$canton = $this->createTestCanton();
		$districtSnit = (int)($canton['canton_snit_code'] . '01');

		$dto = DistrictDTO::fromArray([
			'canton_snit_code' => $canton['canton_snit_code'],
			'district_snit_code' => $districtSnit,
			'district_name' => 'Carmen',
		]);

		$this->service->create($dto);

		$stmt = $this->pdo->prepare('SELECT * FROM districts WHERE district_snit_code = ?');
		$stmt->execute([$districtSnit]);
		$created = $stmt->fetch();

		$this->assertNotFalse($created);
		$this->assertEquals('Carmen', $created['district_name']);
		$this->assertEquals($canton['canton_snit_code'], $created['canton_snit_code']);
	}

	public function testCreateThrowsInvalidFieldWhenCantonDoesNotExist(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);

		$dto = DistrictDTO::fromArray([
			'canton_snit_code' => 999999,
			'district_snit_code' => 60002,
			'district_name' => 'Orphan District',
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
		$existing = $this->createTestDistrict();

		$dto = DistrictDTO::fromArray([
			'canton_snit_code' => $existing['canton_snit_code'],
			'district_snit_code' => $existing['district_snit_code'],
			'district_name' => 'Duplicated District',
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
		$this->authenticateAs(AllowedUserRoles::USER);
		$canton = $this->createTestCanton();

		$dto = DistrictDTO::fromArray([
			'canton_snit_code' => $canton['canton_snit_code'],
			'district_snit_code' => 60003,
			'district_name' => 'Forbidden District',
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
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$existing = $this->createTestDistrict();

		$dto = DistrictDTO::fromArray([
			'canton_snit_code' => $existing['canton_snit_code'],
			'district_snit_code' => $existing['district_snit_code'],
			'district_name' => 'Updated District Name',
		]);

		$this->service->update($existing['district_id'], $dto);

		$updated = $this->findDistrictRow($existing['district_id']);
		$this->assertEquals('Updated District Name', $updated['district_name']);
	}

	public function testUpdateThrowsNotFoundForNonexistentId(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$canton = $this->createTestCanton();

		$dto = DistrictDTO::fromArray([
			'canton_snit_code' => $canton['canton_snit_code'],
			'district_snit_code' => 60004,
			'district_name' => 'Ghost District',
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
		$canton = $this->createTestCanton();
		$districtA = $this->createTestDistrict(['canton' => $canton, 'district_snit_code' => 70001]);
		$districtB = $this->createTestDistrict(['canton' => $canton, 'district_snit_code' => 70002]);

		$dto = DistrictDTO::fromArray([
			'canton_snit_code' => $canton['canton_snit_code'],
			'district_snit_code' => $districtB['district_snit_code'],
			'district_name' => $districtA['district_name'],
		]);

		try {
			$this->service->update($districtA['district_id'], $dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(409, $e->getHttpStatus());
		}
	}

	public function testUpdateThrowsInvalidFieldWhenCantonDoesNotExist(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$existing = $this->createTestDistrict();

		$dto = DistrictDTO::fromArray([
			'canton_snit_code' => 999999,
			'district_snit_code' => $existing['district_snit_code'],
			'district_name' => $existing['district_name'],
		]);

		try {
			$this->service->update($existing['district_id'], $dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(422, $e->getHttpStatus());
		}
	}

	public function testDelete(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$district = $this->createTestDistrict();

		$this->service->delete($district['district_id']);

		$this->assertNull($this->findDistrictRow($district['district_id']));
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
		$district = $this->createTestDistrict();

		try {
			$this->service->delete($district['district_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}
}