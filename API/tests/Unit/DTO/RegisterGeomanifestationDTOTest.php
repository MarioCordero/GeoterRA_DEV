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
        ];

        $dto = RegisterGeomanifestationDTO::fromArray($data);

        $this->assertSame('Test GM', $dto->name);
        $this->assertSame(10.5, $dto->latitude);
        $this->assertSame(-84.5, $dto->longitude);
        $this->assertSame(1, $dto->provinceSnitCode);
        $this->assertFalse($dto->visibility);
    }

    public function testFromArrayThrowsExceptionForMissingName(): void
    {
        $this->expectException(ApiException::class);
        $this->expectExceptionCode(422);

        RegisterGeomanifestationDTO::fromArray([
            'latitude' => 10.5,
            'longitude' => -84.5
        ]);
    }

    public function testToDatabaseArray(): void
    {
        $dto = new RegisterGeomanifestationDTO('Name', 10.5, -84.5, 1, 1, 1, 'gr1', 'desc', true);
        
        $arr = $dto->toDatabaseArray();
        
        $this->assertSame('Name', $arr['name']);
        $this->assertSame(10.5, $arr['latitude']);
        $this->assertSame(1, $arr['visibility']);
    }

    public function testValidatePassesWithValidData(): void
    {
        $dto = new RegisterGeomanifestationDTO('Name', 10.5, -84.5, 1, 1, 1);
        
        $this->expectNotToPerformAssertions();
        $dto->validate();
    }

    public function testValidateThrowsExceptionForInvalidLatitude(): void
    {
        $dto = new RegisterGeomanifestationDTO('Name', 100.5, -84.5);
        
        $this->expectException(ApiException::class);
        $dto->validate();
    }

    public function testValidateThrowsExceptionForInvalidSnitCode(): void
    {
        $dto = new RegisterGeomanifestationDTO('Name', 10.5, -84.5, -1);
        
        $this->expectException(ApiException::class);
        $dto->validate();
    }
}
