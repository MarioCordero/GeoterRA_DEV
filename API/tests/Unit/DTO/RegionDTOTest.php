<?php

declare(strict_types=1);

namespace Tests\Unit\DTO;

use Tests\TestCase;
use DTO\RegionDTO;
use Http\ApiException;

class RegionDTOTest extends TestCase
{
    public function testValidRegionDTOCreation(): void
    {
        $data = ['name' => 'Los Andes'];

        $dto = RegionDTO::fromArray($data);
        
        $this->assertNotNull($dto);
    }

    public function testFromArrayCreatesInstance(): void
    {
        $data = ['name' => 'Zona Sur'];

        $dto = RegionDTO::fromArray($data);
        
        $this->assertInstanceOf(RegionDTO::class, $dto);
    }

    public function testValidateThrowsOnMissingName(): void
    {
        $data = [];

        $this->expectException(ApiException::class);
        $dto = RegionDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnInvalidRegion(): void
    {
        $data = ['name' => 'Invalid Region'];

        $this->expectException(ApiException::class);
        $dto = RegionDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateThrowsOnEmptyName(): void
    {
        $data = ['name' => ''];

        $this->expectException(ApiException::class);
        $dto = RegionDTO::fromArray($data);
        $dto->validate();
    }

    public function testValidateAcceptsAllValidRegions(): void
    {
        $validRegions = [
            'Los Andes',
            'Zona Sur',
            'Pacifico',
            'Zona Central',
            'Araucanía',
            'Los Lagos',
            'Zona Austral'
        ];

        foreach ($validRegions as $region) {
            $data = ['name' => $region];
            $dto = RegionDTO::fromArray($data);
            $dto->validate(); // Should not throw
        }

        $this->assertTrue(true);
    }
}
