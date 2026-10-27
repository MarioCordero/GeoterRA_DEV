<?php
declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\RegisterFieldTripDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class RegisterFieldTripDTOTest extends TestCase
{
  public function testFromArrayWithValidData(): void
  {
    $data = [
      'field_trip_name' => 'Gira Volcán Tenorio 2026',
      'field_trip_start_date' => '2026-10-15 08:30:00',
      'field_trip_finish_date' => '2026-10-15 17:00:00',
      'province_snit_code' => 5,
      'canton_snit_code' => 501,
      'district_snit_code' => 50101,
      'participants' => ['01HXYZ12345678901234567890'],
      'geomanifestations' => ['01HABC12345678901234567890'],
    ];

    $dto = RegisterFieldTripDTO::fromArray($data);

    $this->assertSame('Gira Volcán Tenorio 2026', $dto->fieldTripName);
    $this->assertSame('2026-10-15 08:30:00', $dto->fieldTripStartDate);
    $this->assertSame('2026-10-15 17:00:00', $dto->fieldTripFinishDate);
    $this->assertSame(5, $dto->provinceSnitCode);
    $this->assertSame(501, $dto->cantonSnitCode);
    $this->assertSame(50101, $dto->districtSnitCode);
    $this->assertCount(1, $dto->participants);
    $this->assertCount(1, $dto->geomanifestations);

    $array = $dto->toArray();
    $this->assertSame('Gira Volcán Tenorio 2026', $array['field_trip_name']);
    $this->assertSame('2026-10-15 08:30:00', $array['field_trip_start_date']);
    $this->assertSame('2026-10-15 17:00:00', $array['field_trip_finish_date']);
    $this->assertArrayNotHasKey('field_trip_is_active', $array);
    $this->assertArrayNotHasKey('field_trip_scheduled_date', $array);
  }

  public function testFromArrayThrowsOnMissingName(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterFieldTripDTO::fromArray([
      'field_trip_start_date' => '2026-10-15 08:30:00',
      'field_trip_finish_date' => '2026-10-15 17:00:00',
      'province_snit_code' => 5,
      'canton_snit_code' => 501,
      'district_snit_code' => 50101,
    ]);
  }

  public function testFromArrayThrowsOnMissingStartDate(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterFieldTripDTO::fromArray([
      'field_trip_name' => 'Gira Test',
      'field_trip_finish_date' => '2026-10-15 17:00:00',
      'province_snit_code' => 5,
      'canton_snit_code' => 501,
      'district_snit_code' => 50101,
    ]);
  }

  public function testValidateThrowsOnLongName(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = new RegisterFieldTripDTO(
      fieldTripName: str_repeat('A', 111),
      fieldTripStartDate: '2026-10-15 08:30:00',
      fieldTripFinishDate: '2026-10-15 17:00:00',
      provinceSnitCode: 5,
      cantonSnitCode: 501,
      districtSnitCode: 50101
    );
    $dto->validate();
  }

  public function testValidateThrowsOnInvalidDateRange(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    $dto = new RegisterFieldTripDTO(
      fieldTripName: 'Gira Test',
      fieldTripStartDate: '2026-10-15 18:00:00',
      fieldTripFinishDate: '2026-10-15 17:00:00',
      provinceSnitCode: 5,
      cantonSnitCode: 501,
      districtSnitCode: 50101
    );
    $dto->validate();
  }
}