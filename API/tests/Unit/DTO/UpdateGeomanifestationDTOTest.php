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
        ];

        $dto = UpdateGeomanifestationDTO::fromArray($data);

        $this->assertSame('Updated GM', $dto->name);
        $this->assertSame(11.5, $dto->latitude);
        $this->assertNull($dto->longitude);
    }

    public function testToUpdateArray(): void
    {
        $dto = new UpdateGeomanifestationDTO('Name', 10.5, null, 1, null, null, null, null, true);
        
        $arr = $dto->toUpdateArray();
        
        $this->assertArrayHasKey('geomanifestation_name', $arr);
        $this->assertArrayHasKey('latitude', $arr);
        $this->assertArrayHasKey('province_snit_code', $arr);
        $this->assertArrayHasKey('visibility', $arr);
        $this->assertArrayNotHasKey('longitude', $arr);
        
        $this->assertSame('Name', $arr['geomanifestation_name']);
        $this->assertSame(1, $arr['visibility']);
    }

    public function testValidatePassesWithValidData(): void
    {
        $dto = new UpdateGeomanifestationDTO('Name', 10.5, -84.5, 1, 1, 1);
        
        $this->expectNotToPerformAssertions();
        $dto->validate();
    }

    public function testValidateThrowsExceptionForInvalidLatitude(): void
    {
        $dto = new UpdateGeomanifestationDTO(null, 100.5);
        
        $this->expectException(ApiException::class);
        $dto->validate();
    }

    public function testValidateThrowsExceptionForInvalidSnitCode(): void
    {
        $dto = new UpdateGeomanifestationDTO(null, null, null, -1);
        
        $this->expectException(ApiException::class);
        $dto->validate();
    }
}
