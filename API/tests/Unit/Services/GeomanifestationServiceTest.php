<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\GeomanifestationService;
use DTO\RegisterGeomanifestationDTO;
use DTO\UpdateGeomanifestationDTO;
use DTO\AllowedUserRoles;
use Http\ApiException;
use Http\Request;
use Core\UlidGenerator;

class GeomanifestationServiceTest extends TestCase
{
	private GeomanifestationService $service;

	protected function setUp(): void
	{
		parent::setUp();
		$this->service = new GeomanifestationService($this->pdo);
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

	// ------------------------------- Fixtures ------------------------------- //

	private function authenticateAs(string $role): array
	{
		$user = $this->createTestUser(['role' => $role]);
		Request::setUser($user);
		return $user;
	}

	/**
	 * Creates a real province/canton/district chain with SNIT codes that
	 * respect the hierarchical prefix rule enforced by validateSnitHierarchy().
	 */
	private function createTestGeoHierarchy(): array
	{
		$provinceSnit = random_int(100, 999);
		$cantonSnit = (int)($provinceSnit . random_int(10, 99));
		$districtSnit = (int)($cantonSnit . random_int(10, 99));

		$this->pdo->prepare(
			'INSERT INTO provinces (province_id, province_snit_code, province_name, created_by, created_at)
             VALUES (?, ?, ?, ?, NOW())'
		)->execute([UlidGenerator::generate(), $provinceSnit, 'Province ' . $provinceSnit, UlidGenerator::generate()]);

		$this->pdo->prepare(
			'INSERT INTO cantons (canton_id, province_snit_code, canton_snit_code, canton_name, created_by, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())'
		)->execute([UlidGenerator::generate(), $provinceSnit, $cantonSnit, 'Canton ' . $cantonSnit, UlidGenerator::generate()]);

		$this->pdo->prepare(
			'INSERT INTO districts (district_id, canton_snit_code, district_snit_code, district_name, created_by, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())'
		)->execute([UlidGenerator::generate(), $cantonSnit, $districtSnit, 'District ' . $districtSnit, UlidGenerator::generate()]);

		return [
			'province_snit_code' => $provinceSnit,
			'canton_snit_code' => $cantonSnit,
			'district_snit_code' => $districtSnit,
		];
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
                :id, :province_snit, :canton_snit, :district_snit,
                NULL, :name, :lat, :lng, :desc,
                :visibility, :created_by, NOW()
            )'
		);
		$stmt->execute([
			':id' => $id,
			':province_snit' => $overrides['province_snit_code'] ?? null,
			':canton_snit' => $overrides['canton_snit_code'] ?? null,
			':district_snit' => $overrides['district_snit_code'] ?? null,
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
			'province_snit_code' => $overrides['province_snit_code'] ?? null,
			'canton_snit_code' => $overrides['canton_snit_code'] ?? null,
			'district_snit_code' => $overrides['district_snit_code'] ?? null,
		];
	}

	private function createTestInsituTest(string $geomanifestationId, float $temperature): void
	{
		$this->pdo->prepare(
			'INSERT INTO insitu_tests (
                insitu_test_id, geomanifestation_id, temperature, conductivity,
                ph, description, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())'
		)->execute([
			UlidGenerator::generate(),
			$geomanifestationId,
			$temperature,
			300.0,
			7.0,
			'Test in-situ measurement',
			UlidGenerator::generate(),
		]);
	}

	private function findGeomanifestationRow(string $id): ?array
	{
		$stmt = $this->pdo->prepare('SELECT * FROM geomanifestations WHERE geomanifestation_id = ?');
		$stmt->execute([$id]);
		return $stmt->fetch() ?: null;
	}

	// -------------------------------- create -------------------------------- //

	public function testCreate(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);

		$dto = RegisterGeomanifestationDTO::fromArray([
			'name' => 'Las Hornillas',
			'latitude' => 10.1,
			'longitude' => -85.3,
		]);

		$result = $this->service->create($dto);

		$this->assertNotEmpty($result['geomanifestation_id']);
		$this->assertEquals('Las Hornillas', $result['name']);
		$this->assertNull($result['location']['province']);
		$this->assertArrayHasKey('visibility', $result);
		$this->assertArrayNotHasKey('insitu_test', $result);

		$this->assertNotNull($this->findGeomanifestationRow($result['geomanifestation_id']));
	}

	public function testCreateWithValidLocation(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$geo = $this->createTestGeoHierarchy();

		$dto = RegisterGeomanifestationDTO::fromArray([
			'name' => 'Rincon de la Vieja Fumarole',
			'latitude' => 10.83,
			'longitude' => -85.34,
			'province_snit_code' => $geo['province_snit_code'],
			'canton_snit_code' => $geo['canton_snit_code'],
			'district_snit_code' => $geo['district_snit_code'],
		]);

		$result = $this->service->create($dto);

		$this->assertEquals($geo['province_snit_code'], $result['location']['province_snit_code']);
		$this->assertEquals($geo['canton_snit_code'], $result['location']['canton_snit_code']);
		$this->assertEquals($geo['district_snit_code'], $result['location']['district_snit_code']);
	}

	public function testCreateThrowsInvalidFieldWhenProvinceDoesNotExist(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);

		$dto = RegisterGeomanifestationDTO::fromArray([
			'name' => 'Orphan Manifestation',
			'latitude' => 10.0,
			'longitude' => -84.0,
			'province_snit_code' => 999999,
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
		$this->authenticateAs(AllowedUserRoles::USER);

		$dto = RegisterGeomanifestationDTO::fromArray([
			'name' => 'Forbidden Manifestation',
			'latitude' => 10.0,
			'longitude' => -84.0,
		]);

		try {
			$this->service->create($dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	public function testCreateThrowsForInvalidLatitude(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);

		$dto = RegisterGeomanifestationDTO::fromArray([
			'name' => 'Invalid Latitude',
			'latitude' => 120.0,
			'longitude' => -84.0,
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
		$manifestation = $this->createTestGeomanifestation(['visibility' => 1]);

		$result = $this->service->getById($manifestation['geomanifestation_id']);

		$this->assertEquals($manifestation['geomanifestation_id'], $result['geomanifestation_id']);
		$this->assertArrayHasKey('insitu_test', $result);
		$this->assertArrayNotHasKey('visibility', $result);
	}

	public function testGetByIdHiddenNotFoundWithoutIncludeHidden(): void
	{
		$manifestation = $this->createTestGeomanifestation(['visibility' => 0]);

		try {
			$this->service->getById($manifestation['geomanifestation_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	public function testGetByIdIncludeHiddenRequiresRole(): void
	{
		$manifestation = $this->createTestGeomanifestation(['visibility' => 0]);
		$this->authenticateAs(AllowedUserRoles::MAINTENANCE);

		$result = $this->service->getById($manifestation['geomanifestation_id'], true);

		$this->assertEquals($manifestation['geomanifestation_id'], $result['geomanifestation_id']);
		$this->assertArrayHasKey('visibility', $result);
		$this->assertArrayNotHasKey('insitu_test', $result);
	}

	public function testGetByIdIncludeHiddenThrowsForbiddenWithoutRole(): void
	{
		$manifestation = $this->createTestGeomanifestation(['visibility' => 0]);

		try {
			$this->service->getById($manifestation['geomanifestation_id'], true);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	public function testGetByIdThrowsNotFoundForNonexistentId(): void
	{
		try {
			$this->service->getById(UlidGenerator::generate());
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
			$this->assertEquals('NOT_FOUND', $e->getError()->jsonSerialize()['code']);
		}
	}

	// -------------------------------- update --------------------------------- //

	public function testUpdate(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation();

		$dto = UpdateGeomanifestationDTO::fromArray(['name' => 'Updated Name']);
		$result = $this->service->update($manifestation['geomanifestation_id'], $dto);

		$this->assertEquals('Updated Name', $result['name']);
		$this->assertArrayHasKey('visibility', $result);
	}

	public function testUpdateThrowsNotFoundForNonexistentId(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$dto = UpdateGeomanifestationDTO::fromArray(['name' => 'Ghost']);

		try {
			$this->service->update(UlidGenerator::generate(), $dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	public function testUpdateThrowsForbiddenForUnauthorizedRole(): void
	{
		$this->authenticateAs(AllowedUserRoles::USER);
		$manifestation = $this->createTestGeomanifestation();
		$dto = UpdateGeomanifestationDTO::fromArray(['name' => 'Should not apply']);

		try {
			$this->service->update($manifestation['geomanifestation_id'], $dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	public function testUpdateThrowsInvalidFieldWhenNewProvinceDoesNotExist(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation();
		$dto = UpdateGeomanifestationDTO::fromArray(['province_snit_code' => 999999]);

		try {
			$this->service->update($manifestation['geomanifestation_id'], $dto);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(422, $e->getHttpStatus());
		}
	}

	public function testUpdateWithNoFieldsReturnsCurrentRecord(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation();
		$dto = UpdateGeomanifestationDTO::fromArray([]);

		$result = $this->service->update($manifestation['geomanifestation_id'], $dto);

		$this->assertEquals($manifestation['geomanifestation_name'], $result['name']);
	}

	// -------------------------------- delete --------------------------------- //

	public function testDelete(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation();

		$this->service->delete($manifestation['geomanifestation_id']);

		$this->assertNull($this->findGeomanifestationRow($manifestation['geomanifestation_id']));
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
		$manifestation = $this->createTestGeomanifestation();

		try {
			$this->service->delete($manifestation['geomanifestation_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	// ------------------------------ setVisibility ----------------------------- //

	public function testSetVisibility(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation(['visibility' => 0]);

		$result = $this->service->setVisibility($manifestation['geomanifestation_id'], true);

		$this->assertTrue($result['visibility']);
		$row = $this->findGeomanifestationRow($manifestation['geomanifestation_id']);
		$this->assertEquals(1, (int)$row['visibility']);
	}

	public function testSetVisibilityNoChangeWhenSameValue(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$manifestation = $this->createTestGeomanifestation(['visibility' => 1]);

		$result = $this->service->setVisibility($manifestation['geomanifestation_id'], true);

		$this->assertTrue($result['visibility']);
	}

	public function testSetVisibilityThrowsNotFoundForNonexistentId(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);

		try {
			$this->service->setVisibility(UlidGenerator::generate(), true);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	public function testSetVisibilityThrowsForbiddenForUnauthorizedRole(): void
	{
		$this->authenticateAs(AllowedUserRoles::MAINTENANCE);
		$manifestation = $this->createTestGeomanifestation();

		try {
			$this->service->setVisibility($manifestation['geomanifestation_id'], true);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	// ------------------------------ getAllVisible ----------------------------- //

	public function testGetAllVisible(): void
	{
		$visible = $this->createTestGeomanifestation(['visibility' => 1]);
		$this->createTestGeomanifestation(['visibility' => 0]);

		$result = $this->service->getAllVisible();

		$ids = array_column($result['data'], 'geomanifestation_id');
		$this->assertContains($visible['geomanifestation_id'], $ids);
		$this->assertCount(1, $result['data']);
		$this->assertEquals(1, $result['pagination']['total']);
	}

	// --------------------------------- getAll --------------------------------- //

	public function testGetAll(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$visible = $this->createTestGeomanifestation(['visibility' => 1]);
		$hidden = $this->createTestGeomanifestation(['visibility' => 0]);

		$result = $this->service->getAll();

		$ids = array_column($result['data'], 'geomanifestation_id');
		$this->assertContains($visible['geomanifestation_id'], $ids);
		$this->assertContains($hidden['geomanifestation_id'], $ids);
		$this->assertArrayHasKey('visibility', $result['data'][0]);
	}

	public function testGetAllThrowsForbiddenForUnauthorizedRole(): void
	{
		$this->authenticateAs(AllowedUserRoles::USER);

		try {
			$this->service->getAll();
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	// ------------------------------ getByProvince ----------------------------- //

	/**
	 * Documents current behavior: getByProvince() forwards only the province
	 * SNIT code to getFiltered()/validateSnitHierarchy(), which requires all
	 * three codes (province, canton, district) to be present whenever any one
	 * of them is provided. As written, this means getByProvince() always
	 * throws a 422 error, regardless of the SNIT code passed.
	 */
	public function testGetByProvinceThrowsDueToPartialHierarchyValidation(): void
	{
		$geo = $this->createTestGeoHierarchy();

		try {
			$this->service->getByProvince($geo['province_snit_code']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(422, $e->getHttpStatus());
			$this->assertEquals('INVALID_FIELD', $e->getError()->jsonSerialize()['code']);
		}
	}

	public function testGetByProvinceThrowsInvalidFieldForNonexistentProvince(): void
	{
		try {
			$this->service->getByProvince(999999);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(422, $e->getHttpStatus());
		}
	}

	// ------------------------------- getViewById ------------------------------ //

	public function testGetViewById(): void
	{
		$manifestation = $this->createTestGeomanifestation(['visibility' => 1]);

		$result = $this->service->getViewById($manifestation['geomanifestation_id']);

		$this->assertEquals($manifestation['geomanifestation_id'], $result['geomanifestation_id']);
		$this->assertArrayNotHasKey('visibility', $result);
	}

	public function testGetViewByIdThrowsNotFoundWhenHidden(): void
	{
		$manifestation = $this->createTestGeomanifestation(['visibility' => 0]);

		try {
			$this->service->getViewById($manifestation['geomanifestation_id']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(404, $e->getHttpStatus());
		}
	}

	// --------------------------- getViewAllPaginated --------------------------- //

	public function testGetViewAllPaginatedDefaultOnlyVisible(): void
	{
		$visible = $this->createTestGeomanifestation(['visibility' => 1]);
		$this->createTestGeomanifestation(['visibility' => 0]);

		$result = $this->service->getViewAllPaginated();

		$ids = array_column($result['data'], 'geomanifestation_id');
		$this->assertContains($visible['geomanifestation_id'], $ids);
		$this->assertCount(1, $result['data']);
	}

	public function testGetViewAllPaginatedThrowsForbiddenWhenNotOnlyVisibleWithoutRole(): void
	{
		try {
			$this->service->getViewAllPaginated(1, 20, null, null, null, null, null, false);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(403, $e->getHttpStatus());
		}
	}

	public function testGetViewAllPaginatedAllowsAdminToSeeHidden(): void
	{
		$this->authenticateAs(AllowedUserRoles::ADMIN);
		$hidden = $this->createTestGeomanifestation(['visibility' => 0]);

		$result = $this->service->getViewAllPaginated(1, 20, null, null, null, null, null, false);

		$ids = array_column($result['data'], 'geomanifestation_id');
		$this->assertContains($hidden['geomanifestation_id'], $ids);
	}

	public function testGetViewAllPaginatedThrowsWhenOnlyPartialSnitProvided(): void
	{
		$geo = $this->createTestGeoHierarchy();

		try {
			$this->service->getViewAllPaginated(1, 20, $geo['province_snit_code']);
			$this->fail('Expected ApiException was not thrown');
		} catch (ApiException $e) {
			$this->assertEquals(422, $e->getHttpStatus());
		}
	}

	public function testGetViewAllPaginatedFiltersByFullHierarchy(): void
	{
		$geo = $this->createTestGeoHierarchy();
		$matching = $this->createTestGeomanifestation([
			'visibility' => 1,
			'province_snit_code' => $geo['province_snit_code'],
			'canton_snit_code' => $geo['canton_snit_code'],
			'district_snit_code' => $geo['district_snit_code'],
		]);
		$this->createTestGeomanifestation(['visibility' => 1]);

		$result = $this->service->getViewAllPaginated(
			1, 20,
			$geo['province_snit_code'],
			$geo['canton_snit_code'],
			$geo['district_snit_code']
		);

		$ids = array_column($result['data'], 'geomanifestation_id');
		$this->assertContains($matching['geomanifestation_id'], $ids);
		$this->assertCount(1, $result['data']);
	}

	public function testGetViewAllPaginatedFiltersByTemperatureRange(): void
	{
		$geo = $this->createTestGeoHierarchy();

		$hot = $this->createTestGeomanifestation([
			'visibility' => 1,
			'province_snit_code' => $geo['province_snit_code'],
			'canton_snit_code' => $geo['canton_snit_code'],
			'district_snit_code' => $geo['district_snit_code'],
		]);
		$this->createTestInsituTest($hot['geomanifestation_id'], 85.0);

		$cold = $this->createTestGeomanifestation([
			'visibility' => 1,
			'province_snit_code' => $geo['province_snit_code'],
			'canton_snit_code' => $geo['canton_snit_code'],
			'district_snit_code' => $geo['district_snit_code'],
		]);
		$this->createTestInsituTest($cold['geomanifestation_id'], 25.0);

		$result = $this->service->getViewAllPaginated(
			1, 20,
			$geo['province_snit_code'],
			$geo['canton_snit_code'],
			$geo['district_snit_code'],
			50.0,
			null
		);

		$ids = array_column($result['data'], 'geomanifestation_id');
		$this->assertContains($hot['geomanifestation_id'], $ids);
		$this->assertNotContains($cold['geomanifestation_id'], $ids);
	}
}