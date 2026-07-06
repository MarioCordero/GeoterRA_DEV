<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\ProvinceService;
use DTO\ProvinceDTO;
use DTO\AllowedUserRoles;
use Http\ApiException;
use Http\Request;
use Core\UlidGenerator;

class ProvinceServiceTest extends TestCase
{
	private ProvinceService $service;

	protected function setUp(): void
	{
		parent::setUp();
		$this->service = new ProvinceService($this->pdo);
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
		$user = ['user_id' => UlidGenerator::generate(), 'role' => $role];
		Request::setUser($user);
		return $user;
	}

	private function createTestProvince(array $overrides = []): array
	{
		$provinceId = $overrides['province_id'] ?? UlidGenerator::generate();
		$snitCode = $overrides['province_snit_code'] ?? random_int(1000, 999999);
		$name = $overrides['province_name'] ?? ('Test Province ' . $snitCode);
		$createdBy = $overrides['created_by'] ?? UlidGenerator::generate();

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

	private function findProvinceRow(string $provinceId): ?array
	{
		$stmt = $this->pdo->prepare('SELECT * FROM provinces WHERE province_id = ?');
		$stmt->execute([$provinceId]);
		return $stmt->fetch() ?: null;
	}

	public function testGetAll(): void
	{
		$province1 = $this->createTestProvince();
		$province2 = $this->createTestProvince();

		$result = $this->service->getAll();

		$this->assertCount(2, $result);
		$ids = array_column($result, 'province_id');
		$this->assertContains($province1['province_id'], $ids);
		$this->assertContains($province2['province_id'], $ids);
	}

	public function testGetAllReturnsEmptyArrayWhenNoProvinces(): void
	{
		$result = $this->service->getAll();
		$this->assertSame([], $result);
	}

	public function testGetById(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$province = $this->createTestProvince();

		$result = $this->service->getById($province['province_id']);

		$this->assertEquals($province['province_id'], $result['province_id']);
		$this->assertEquals($province['province_snit_code'], $result['province_snit_code']);
		$this->assertEquals($province['province_name'], $result['province_name']);
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
		$province = $this->createTestProvince();

		try {
			$this->service->getById($province['province_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
			$this->assertEquals('FORBIDDEN_ACCESS', $e->getError()->jsonSerialize()['code']);
		}
	}

	public function testGetBySnitCode(): void
	{
		$this->authenticateAs(AllowedUserRoles::FIELD_INVESTIGATOR);
		$province = $this->createTestProvince();

		$result = $this->service->getBySnitCode($province['province_snit_code']);

		$this->assertEquals($province['province_id'], $result['province_id']);
		$this->assertEquals($province['province_snit_code'], $result['province_snit_code']);
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
		$this->authenticateAs(AllowedUserRoles::MAINTENANCE);
		$dto = ProvinceDTO::fromArray([
			'province_snit_code' => 12345,
			'province_name' => 'San José',
		]);

		$this->service->create($dto);

		$row = $this->pdo->prepare('SELECT * FROM provinces WHERE province_snit_code = ?');
		$row->execute([12345]);
		$created = $row->fetch();

		$this->assertNotFalse($created);
		$this->assertEquals('San José', $created['province_name']);
	}

	public function testCreateThrowsConflictWhenSnitCodeExists(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$existing = $this->createTestProvince(['province_snit_code' => 55555]);

		$dto = ProvinceDTO::fromArray([
			'province_snit_code' => $existing['province_snit_code'],
			'province_name' => 'Duplicated Province',
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
		$dto = ProvinceDTO::fromArray([
			'province_snit_code' => 77777,
			'province_name' => 'Forbidden Province',
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
		$existing = $this->createTestProvince();

		$dto = ProvinceDTO::fromArray([
			'province_snit_code' => $existing['province_snit_code'],
			'province_name' => 'Updated Name',
		]);

		$this->service->update($existing['province_id'], $dto);

		$updated = $this->findProvinceRow($existing['province_id']);
		$this->assertEquals('Updated Name', $updated['province_name']);
	}

	public function testUpdateThrowsNotFoundForNonexistentId(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$dto = ProvinceDTO::fromArray([
			'province_snit_code' => 11111,
			'province_name' => 'Ghost Province',
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
		$provinceA = $this->createTestProvince(['province_snit_code' => 20001]);
		$provinceB = $this->createTestProvince(['province_snit_code' => 20002]);

		$dto = ProvinceDTO::fromArray([
			'province_snit_code' => $provinceB['province_snit_code'],
			'province_name' => $provinceA['province_name'],
		]);

		try {
			$this->service->update($provinceA['province_id'], $dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(409, $e->getHttpStatus());
		}
	}

	public function testDelete(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$province = $this->createTestProvince();

		$this->service->delete($province['province_id']);

		$this->assertNull($this->findProvinceRow($province['province_id']));
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
}