<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\UpdateInvestigationRequestDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class UpdateInvestigationRequestDTOTest extends TestCase
{
  public function testFromArrayWithValidData(): void
  {
    $data = [
      'province_snit_code' => 1,
      'canton_snit_code' => 2,
      'district_snit_code' => 3,
      'current_usage' => 'Comercial',
      'temperature_sensation' => 'Caliente',
      'owner_name' => 'Juan Perez',
      'owner_phone_number' => '88888888',
      'owner_email' => 'juan@example.com',
      'bubbles' => true,
      'details' => 'Updated details',
      'exact_address' => 'Calle 2',
      'latitude' => 11.0,
      'longitude' => -85.0,
      'relation_with_owner' => 'Titular',
    ];

    $dto = UpdateInvestigationRequestDTO::fromArray($data);

    $this->assertSame(1, $dto->provinceSnitCode);
    $this->assertSame(2, $dto->cantonSnitCode);
    $this->assertSame(3, $dto->districtSnitCode);
    $this->assertSame('Comercial', $dto->currentUsage);
    $this->assertSame('Caliente', $dto->temperatureSensation);
    $this->assertSame('Juan Perez', $dto->ownerName);
    $this->assertSame('88888888', $dto->ownerPhoneNumber);
    $this->assertSame('juan@example.com', $dto->ownerEmail);
    $this->assertTrue($dto->bubbles);
    $this->assertSame('Updated details', $dto->details);
    $this->assertSame('Calle 2', $dto->exactAddress);
    $this->assertSame(11.0, $dto->latitude);
    $this->assertSame(-85.0, $dto->longitude);
    $this->assertSame('Titular', $dto->relationWithOwner);
  }

  public function testFromArrayWithPartialData(): void
  {
    $data = [
      'province_snit_code' => 1,
      'current_usage' => 'Residencial',
    ];

    $dto = UpdateInvestigationRequestDTO::fromArray($data);

    $this->assertSame(1, $dto->provinceSnitCode);
    $this->assertNull($dto->cantonSnitCode);
    $this->assertNull($dto->districtSnitCode);
    $this->assertSame('Residencial', $dto->currentUsage);
    $this->assertNull($dto->temperatureSensation);
    $this->assertNull($dto->ownerName);
    $this->assertNull($dto->bubbles);
  }

  public function testFromArrayWithEmptyData(): void
  {
    $dto = UpdateInvestigationRequestDTO::fromArray([]);
    $this->assertNull($dto->provinceSnitCode);
    $this->assertNull($dto->cantonSnitCode);
    $this->assertNull($dto->districtSnitCode);
    $this->assertNull($dto->currentUsage);
    $this->assertNull($dto->temperatureSensation);
    $this->assertNull($dto->bubbles);
    $this->assertNull($dto->relationWithOwner);
  }

  public function testToArrayReturnsOnlyNonNullFields(): void
  {
    $dto = new UpdateInvestigationRequestDTO(
      provinceSnitCode: 1,
      cantonSnitCode: null,
      districtSnitCode: 3,
      currentUsage: null,
      temperatureSensation: 'Caliente',
      ownerName: null,
      ownerPhoneNumber: '88888888',
      ownerEmail: null,
      bubbles: false,
      details: null,
      exactAddress: null,
      latitude: 10.0,
      longitude: null,
      relationWithOwner: 'Familiar'
    );

    $arr = $dto->toArray();

    $expected = [
      'province_snit_code' => 1,
      'district_snit_code' => 3,
      'temperature_sensation' => 'Caliente',
      'owner_phone_number' => '88888888',
      'bubbles' => 0,
      'latitude' => 10.0,
      'relation_with_owner' => 'Familiar',
    ];
    $this->assertSame($expected, $arr);
  }

  public function testToArrayIncludesFalseForBubbles(): void
  {
    $dto = new UpdateInvestigationRequestDTO(bubbles: false);
    $arr = $dto->toArray();
    $this->assertArrayHasKey('bubbles', $arr);
    $this->assertSame(0, $arr['bubbles']);
  }

  public function testValidatePassesWithValidData(): void
  {
    $dto = new UpdateInvestigationRequestDTO(
      provinceSnitCode: 1,
      cantonSnitCode: 2,
      districtSnitCode: 3,
      currentUsage: 'Comercial',
      temperatureSensation: 'Caliente'
    );
    $userData = ['first_name' => 'John', 'last_name' => 'Doe', 'phone_number' => '88888888', 'email' => 'john@example.com'];

    $this->expectNotToPerformAssertions();
    $dto->validate($userData);
  }

  public function testValidatePassesWithNullFields(): void
  {
    $dto = new UpdateInvestigationRequestDTO();
    $this->expectNotToPerformAssertions();
    $dto->validate([]);
  }

  public function testValidateThrowsExceptionForNegativeProvinceSnitCode(): void
  {
    $dto = new UpdateInvestigationRequestDTO(provinceSnitCode: -1);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate([]);
  }

  public function testValidateThrowsExceptionForInvalidCurrentUsage(): void
  {
    $dto = new UpdateInvestigationRequestDTO(currentUsage: 'Invalid');
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate([]);
  }

  public function testValidateThrowsExceptionForInvalidTemperatureSensation(): void
  {
    $dto = new UpdateInvestigationRequestDTO(temperatureSensation: 'Invalid');
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate([]);
  }

  public function testValidateThrowsExceptionForInvalidEmail(): void
  {
    $dto = new UpdateInvestigationRequestDTO(ownerEmail: 'invalid-email');
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate([]);
  }

  public function testValidateThrowsExceptionForInvalidPhone(): void
  {
    $dto = new UpdateInvestigationRequestDTO(ownerPhoneNumber: '123');
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate([]);
  }

  public function testValidateThrowsExceptionForLatitudeOutOfRange(): void
  {
    $dto = new UpdateInvestigationRequestDTO(latitude: 100.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate([]);
  }

  public function testValidateThrowsExceptionForLongitudeOutOfRange(): void
  {
    $dto = new UpdateInvestigationRequestDTO(longitude: -190.0);
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate([]);
  }

  public function testValidateThrowsExceptionWhenOwnerDiffersAndRelationMissing(): void
  {
    $dto = new UpdateInvestigationRequestDTO(
      ownerName: 'Different Owner'
    );

    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidatePassesWhenOwnerDiffersAndRelationProvided(): void
  {
    $dto = new UpdateInvestigationRequestDTO(
      ownerName: 'Different Owner',
      relationWithOwner: 'Familiar'
    );

    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidateThrowsExceptionWhenOwnerDiffersAndRelationInvalid(): void
  {
    $dto = new UpdateInvestigationRequestDTO(
      ownerName: 'Different Owner',
      relationWithOwner: 'Invalido'
    );

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidatePassesWhenOwnerSameAndRelationNotRequired(): void
  {
    $dto = new UpdateInvestigationRequestDTO(
      ownerName: 'John Doe'  // same as user
    );

    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidatePassesWhenOwnerDiffersByPhoneButRelationProvided(): void
  {
    $dto = new UpdateInvestigationRequestDTO(
      ownerPhoneNumber: '99999999',
      relationWithOwner: 'Empleado'
    );

    $this->expectNotToPerformAssertions();
    $dto->validate();
  }
}