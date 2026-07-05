<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\RegisterGeomanifestationDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class RegisterGeomanifestationDTOTest extends TestCase
{
  public function testFromArrayWithValidData(): void
  {
    $data = [
      'name' => 'Test GM',
      'latitude' => 10.5,
      'longitude' => -84.5,
      'province_snit_code' => 1,
      'canton_snit_code' => 2,
      'district_snit_code' => 3,
      'description' => 'Desc',
      'current_georeport_id' => 'gr1',
      'visibility' => true,
    ];

    $dto = RegisterGeomanifestationDTO::fromArray($data);

    $this->assertSame('Test GM', $dto->name);
    $this->assertSame(10.5, $dto->latitude);
    $this->assertSame(-84.5, $dto->longitude);
    $this->assertSame(1, $dto->provinceSnitCode);
    $this->assertSame(2, $dto->cantonSnitCode);
    $this->assertSame(3, $dto->districtSnitCode);
    $this->assertSame('Desc', $dto->description);
    $this->assertSame('gr1', $dto->currentGeoreportId);
    $this->assertTrue($dto->visibility);
  }

  public function testFromArrayWithDefaultVisibilityFalse(): void
  {
    $data = [
      'name' => 'Test GM',
      'latitude' => 10.5,
      'longitude' => -84.5,
    ];

    $dto = RegisterGeomanifestationDTO::fromArray($data);
    $this->assertFalse($dto->visibility);
  }

  public function testFromArrayThrowsExceptionForMissingName(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterGeomanifestationDTO::fromArray(
      [
        'latitude' => 10.5,
        'longitude' => -84.5
      ]
    );
  }

  public function testFromArrayThrowsExceptionForEmptyName(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterGeomanifestationDTO::fromArray(
      [
        'name' => '   ',
        'latitude' => 10.5,
        'longitude' => -84.5
      ]
    );
  }

  public function testFromArrayThrowsExceptionForMissingLatitude(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterGeomanifestationDTO::fromArray(
      [
        'name' => 'Test',
        'longitude' => -84.5
      ]
    );
  }

  public function testFromArrayThrowsExceptionForNonNumericLatitude(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterGeomanifestationDTO::fromArray(
      [
        'name' => 'Test',
        'latitude' => 'abc',
        'longitude' => -84.5
      ]
    );
  }

  public function testFromArrayThrowsExceptionForMissingLongitude(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterGeomanifestationDTO::fromArray(
      [
        'name' => 'Test',
        'latitude' => 10.5
      ]
    );
  }

  public function testToArray(): void
  {
    $dto = new RegisterGeomanifestationDTO(
      name : 'Name',
      latitude : 10.5,
      longitude : -84.5,
      provinceSnitCode : 1,
      cantonSnitCode : 2,
      districtSnitCode : 3,
      description : 'Desc',
      currentGeoreportId : 'gr1',
      visibility : true
    );

    $arr = $dto->toArray();

    $this->assertSame('Name', $arr['name']);
    $this->assertSame(10.5, $arr['latitude']);
    $this->assertSame(-84.5, $arr['longitude']);
    $this->assertSame(1, $arr['province_snit_code']);
    $this->assertSame(2, $arr['canton_snit_code']);
    $this->assertSame(3, $arr['district_snit_code']);
    $this->assertSame('Desc', $arr['description']);
    $this->assertSame('gr1', $arr['current_georeport_id']);
    $this->assertSame(1, $arr['visibility']);
  }

  public function testValidatePassesWithValidData(): void
  {
    $dto = new RegisterGeomanifestationDTO('Name', 10.5, -84.5, 1, 2, 3);
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNameTooLong(): void
  {
    $dto = new RegisterGeomanifestationDTO(str_repeat('a', 256), 10.5, -84.5);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForInvalidLatitude(): void
  {
    $dto = new RegisterGeomanifestationDTO('Name', 100.5, -84.5);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForInvalidLongitude(): void
  {
    $dto = new RegisterGeomanifestationDTO('Name', 10.5, -190.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeProvinceSnitCode(): void
  {
    $dto = new RegisterGeomanifestationDTO('Name', 10.5, -84.5, -1);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForZeroCantonSnitCode(): void
  {
    $dto = new RegisterGeomanifestationDTO('Name', 10.5, -84.5, 1, 0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeDistrictSnitCode(): void
  {
    $dto = new RegisterGeomanifestationDTO('Name', 10.5, -84.5, 1, 2, -3);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateAllowsNullSnitCodes(): void
  {
    $dto = new RegisterGeomanifestationDTO('Name', 10.5, -84.5);
    $this->expectNotToPerformAssertions();
    $dto->validate();
  }
}