<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\UpdateGeomanifestationDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class UpdateGeomanifestationDTOTest extends TestCase
{
  public function testFromArrayWithValidData(): void
  {
    $data = [
      'name' => 'Updated GM',
      'latitude' => 11.5,
      'longitude' => -85.0,
      'province_snit_code' => 2,
      'canton_snit_code' => 3,
      'district_snit_code' => 4,
      'description' => 'New desc',
      'current_georeport_id' => 'gr2',
      'visibility' => false,
    ];

    $dto = UpdateGeomanifestationDTO::fromArray($data);

    $this->assertSame('Updated GM', $dto->name);
    $this->assertSame(11.5, $dto->latitude);
    $this->assertSame(-85.0, $dto->longitude);
    $this->assertSame(2, $dto->provinceSnitCode);
    $this->assertSame(3, $dto->cantonSnitCode);
    $this->assertSame(4, $dto->districtSnitCode);
    $this->assertSame('New desc', $dto->description);
    $this->assertSame('gr2', $dto->currentGeoreportId);
    $this->assertFalse($dto->visibility);
  }

  public function testFromArrayWithPartialData(): void
  {
    $data = [
      'name' => 'Updated GM',
      'latitude' => 11.5,
    ];

    $dto = UpdateGeomanifestationDTO::fromArray($data);

    $this->assertSame('Updated GM', $dto->name);
    $this->assertSame(11.5, $dto->latitude);
    $this->assertNull($dto->longitude);
    $this->assertNull($dto->provinceSnitCode);
  }

  public function testFromArrayWithEmptyData(): void
  {
    $dto = UpdateGeomanifestationDTO::fromArray([]);
    $this->assertNull($dto->name);
    $this->assertNull($dto->latitude);
    $this->assertNull($dto->longitude);
    $this->assertNull($dto->visibility);
  }

  public function testToArrayReturnsOnlyNonNullFields(): void
  {
    $dto = new UpdateGeomanifestationDTO(
      name : 'Name',
      latitude : 10.5,
      longitude : null,
      provinceSnitCode : 1,
      cantonSnitCode : null,
      districtSnitCode : null,
      currentGeoreportId : null,
      description : null,
      visibility : false
    );

    $arr = $dto->toArray();

    $this->assertArrayHasKey('geomanifestation_name', $arr);
    $this->assertArrayHasKey('latitude', $arr);
    $this->assertArrayHasKey('province_snit_code', $arr);
    $this->assertArrayHasKey('visibility', $arr);
    $this->assertArrayNotHasKey('longitude', $arr);
    $this->assertArrayNotHasKey('canton_snit_code', $arr);
    $this->assertArrayNotHasKey('district_snit_code', $arr);
    $this->assertArrayNotHasKey('current_georeport_id', $arr);
    $this->assertArrayNotHasKey('description', $arr);

    $this->assertSame('Name', $arr['geomanifestation_name']);
    $this->assertSame(10.5, $arr['latitude']);
    $this->assertSame(1, $arr['province_snit_code']);
    $this->assertSame(0, $arr['visibility']); // false -> 0
  }

  public function testToArrayIncludesNullVisibilityAsFalse(): void
  {
    $dto = new UpdateGeomanifestationDTO(visibility : false);
    $arr = $dto->toArray();
    $this->assertArrayHasKey('visibility', $arr);
    $this->assertSame(0, $arr['visibility']);
  }

  public function testValidatePassesWithValidData(): void
  {
    $dto = new UpdateGeomanifestationDTO('Name', 10.5, -84.5, 1, 2, 3);
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidatePassesWithNullFields(): void
  {
    $dto = new UpdateGeomanifestationDTO();
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidateThrowsExceptionForInvalidLatitude(): void
  {
    $dto = new UpdateGeomanifestationDTO(null, 100.5);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForInvalidLongitude(): void
  {
    $dto = new UpdateGeomanifestationDTO(null, null, -190.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeProvinceSnitCode(): void
  {
    $dto = new UpdateGeomanifestationDTO(null, null, null, -1);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForZeroCantonSnitCode(): void
  {
    $dto = new UpdateGeomanifestationDTO(null, null, null, null, 0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeDistrictSnitCode(): void
  {
    $dto = new UpdateGeomanifestationDTO(null, null, null, null, null, -3);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateAllowsNullSnitCodes(): void
  {
    $dto = new UpdateGeomanifestationDTO(null, null, null, null, null, null);
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }
}