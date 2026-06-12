<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use DTO\RegisteredManifestationDTO;
use Http\ApiException;
use PHPUnit\Framework\TestCase;

class RegisteredManifestationDTOTest extends TestCase
{
    public function testFromArrayWithValidData(): void
    {
        $data = [
            'name' => 'Test GM',
            'region_id' => 1,
            'latitude' => 10.5,
            'longitude' => -84.5,
            'temperature' => 90.0,
            'cl' => 10.5
        ];

        $dto = RegisteredManifestationDTO::fromArray($data);

        $this->assertSame('Test GM', $dto->name);
        $this->assertSame(1, $dto->region_id);
        $this->assertSame(10.5, $dto->latitude);
        $this->assertSame(90.0, $dto->temperature);
        $this->assertSame(10.5, $dto->cl);
        $this->assertNull($dto->field_pH);
    }

    public function testFromArrayThrowsExceptionForMissingRequiredFields(): void
    {
        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        RegisteredManifestationDTO::fromArray([
            'region_id' => 1,
            'latitude' => 10.5,
            'longitude' => -84.5
        ]); // missing name
    }

    public function testValidatePassesWithValidData(): void
    {
        $dto = new RegisteredManifestationDTO('Name', 1, 10.5, -84.5, null, 90.0, 7.0, 100.0, 7.1, 101.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0);
        
        $this->expectNotToPerformAssertions();
        $dto->validate();
    }

    public function testValidateThrowsExceptionForInvalidLatitude(): void
    {
        $dto = new RegisteredManifestationDTO('Name', 1, -100.5, -84.5, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
        
        $this->expectException(ApiException::class);
        $dto->validate();
    }

    public function testValidateThrowsExceptionForInvalidTemperature(): void
    {
        $dto = new RegisteredManifestationDTO('Name', 1, 10.5, -84.5, null, 300.0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
        
        $this->expectException(ApiException::class);
        $dto->validate();
    }

    public function testValidateThrowsExceptionForNegativeChemicals(): void
    {
        $dto = new RegisteredManifestationDTO('Name', 1, 10.5, -84.5, null, null, null, null, null, null, -1.0, null, null, null, null, null, null, null, null, null, null, null);
        
        $this->expectException(ApiException::class);
        $dto->validate();
    }
}
