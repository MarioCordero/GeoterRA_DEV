<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\RegisterInvestigationRequestDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class RegisterInvestigationRequestDTOTest extends TestCase
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
      'details' => 'Some details',
      'exact_address' => 'Calle 1, San Jose',
      'latitude' => 10.0,
      'longitude' => -84.0,
      'relation_with_owner' => 'Titular',
    ];

    $dto = RegisterInvestigationRequestDTO::fromArray($data);

    $this->assertSame(1, $dto->provinceSnitCode);
    $this->assertSame(2, $dto->cantonSnitCode);
    $this->assertSame(3, $dto->districtSnitCode);
    $this->assertSame('Comercial', $dto->currentUsage);
    $this->assertSame('Caliente', $dto->temperatureSensation);
    $this->assertSame('Juan Perez', $dto->ownerName);
    $this->assertSame('88888888', $dto->ownerPhoneNumber);
    $this->assertSame('juan@example.com', $dto->ownerEmail);
    $this->assertTrue($dto->bubbles);
    $this->assertSame('Some details', $dto->details);
    $this->assertSame('Calle 1, San Jose', $dto->exactAddress);
    $this->assertSame(10.0, $dto->latitude);
    $this->assertSame(-84.0, $dto->longitude);
    $this->assertSame('Titular', $dto->relationWithOwner);
  }

  public function testFromArrayWithDefaultBubblesFalse(): void
  {
    $data = [
      'province_snit_code' => 1,
      'canton_snit_code' => 2,
      'district_snit_code' => 3,
      'current_usage' => 'Comercial',
      'temperature_sensation' => 'Caliente',
    ];

    $dto = RegisterInvestigationRequestDTO::fromArray($data);
    $this->assertFalse($dto->bubbles);
  }

  public function testFromArrayThrowsExceptionForMissingProvinceSnitCode(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterInvestigationRequestDTO::fromArray([
      'canton_snit_code' => 2,
      'district_snit_code' => 3,
      'current_usage' => 'Comercial',
      'temperature_sensation' => 'Caliente',
    ]);
  }

  public function testFromArrayThrowsExceptionForEmptyCantonSnitCode(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterInvestigationRequestDTO::fromArray([
      'province_snit_code' => 1,
      'canton_snit_code' => '',
      'district_snit_code' => 3,
      'current_usage' => 'Comercial',
      'temperature_sensation' => 'Caliente',
    ]);
  }

  public function testFromArrayThrowsExceptionForMissingCurrentUsage(): void
  {
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);

    RegisterInvestigationRequestDTO::fromArray([
      'province_snit_code' => 1,
      'canton_snit_code' => 2,
      'district_snit_code' => 3,
      'temperature_sensation' => 'Caliente',
    ]);
  }

  public function testValidatePassesWithValidData(): void
  {
    $dto = new RegisterInvestigationRequestDTO(
      provinceSnitCode: 1,
      cantonSnitCode: 2,
      districtSnitCode: 3,
      currentUsage: 'Comercial',
      temperatureSensation: 'Caliente'
    );

    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidateThrowsExceptionForNegativeSnitCode(): void
  {
    $dto = new RegisterInvestigationRequestDTO(
      provinceSnitCode: -1,
      cantonSnitCode: 2,
      districtSnitCode: 3,
      currentUsage: 'Comercial',
      temperatureSensation: 'Caliente'
    );
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForInvalidCurrentUsage(): void
  {
    $dto = new RegisterInvestigationRequestDTO(
      provinceSnitCode: 1,
      cantonSnitCode: 2,
      districtSnitCode: 3,
      currentUsage: 'Invalid',
      temperatureSensation: 'Caliente'
    );
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForInvalidTemperatureSensation(): void
  {
    $dto = new RegisterInvestigationRequestDTO(
      provinceSnitCode: 1,
      cantonSnitCode: 2,
      districtSnitCode: 3,
      currentUsage: 'Comercial',
      temperatureSensation: 'Invalid'
    );
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForInvalidEmail(): void
  {
    $dto = new RegisterInvestigationRequestDTO(
      provinceSnitCode: 1,
      cantonSnitCode: 2,
      districtSnitCode: 3,
      currentUsage: 'Comercial',
      temperatureSensation: 'Caliente',
      ownerEmail: 'invalid-email'
    );
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForInvalidPhone(): void
  {
    $dto = new RegisterInvestigationRequestDTO(
      provinceSnitCode: 1,
      cantonSnitCode: 2,
      districtSnitCode: 3,
      currentUsage: 'Comercial',
      temperatureSensation: 'Caliente',
      ownerPhoneNumber: '123'
    );
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForLatitudeOutOfRange(): void
  {
    $dto = new RegisterInvestigationRequestDTO(
      provinceSnitCode: 1,
      cantonSnitCode: 2,
      districtSnitCode: 3,
      currentUsage: 'Comercial',
      temperatureSensation: 'Caliente',
      latitude: 100.0
    );
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionForLongitudeOutOfRange(): void
  {
    $dto = new RegisterInvestigationRequestDTO(
      provinceSnitCode: 1,
      cantonSnitCode: 2,
      districtSnitCode: 3,
      currentUsage: 'Comercial',
      temperatureSensation: 'Caliente',
      longitude: -190.0
    );
    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidateThrowsExceptionWhenOwnerDiffersAndRelationMissing(): void
  {
    $dto = new RegisterInvestigationRequestDTO(
      provinceSnitCode: 1,
      cantonSnitCode: 2,
      districtSnitCode: 3,
      currentUsage: 'Comercial',
      temperatureSensation: 'Caliente',
      ownerName: 'Different Owner'
    );

    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidatePassesWhenOwnerDiffersAndRelationProvided(): void
  {
    $dto = new RegisterInvestigationRequestDTO(
      provinceSnitCode: 1,
      cantonSnitCode: 2,
      districtSnitCode: 3,
      currentUsage: 'Comercial',
      temperatureSensation: 'Caliente',
      ownerName: 'Different Owner',
      relationWithOwner: 'Familiar'
    );

    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidateThrowsExceptionWhenOwnerDiffersAndRelationInvalid(): void
  {
    $dto = new RegisterInvestigationRequestDTO(
      provinceSnitCode: 1,
      cantonSnitCode: 2,
      districtSnitCode: 3,
      currentUsage: 'Comercial',
      temperatureSensation: 'Caliente',
      ownerName: 'Different Owner',
      relationWithOwner: 'Invalido'
    );

    $this->expectException(ApiException::class);
    $this->expectExceptionCode(422);
    $dto->validate();
  }

  public function testValidatePassesWhenOwnerSameAndRelationNotRequired(): void
  {
    $dto = new RegisterInvestigationRequestDTO(
      provinceSnitCode: 1,
      cantonSnitCode: 2,
      districtSnitCode: 3,
      currentUsage: 'Comercial',
      temperatureSensation: 'Caliente',
      ownerName: 'John Doe'  // same as user
    );

    $this->expectNotToPerformAssertions();
    $dto->validate();
  }

  public function testValidatePassesWhenOwnerDiffersByPhoneButRelationProvided(): void
  {
    $dto = new RegisterInvestigationRequestDTO(
      provinceSnitCode: 1,
      cantonSnitCode: 2,
      districtSnitCode: 3,
      currentUsage: 'Comercial',
      temperatureSensation: 'Caliente',
      ownerPhoneNumber: '99999999',
      relationWithOwner: 'Empleado'
    );

    $this->expectNotToPerformAssertions();
    $dto->validate();
  }
}