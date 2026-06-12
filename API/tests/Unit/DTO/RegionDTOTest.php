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

        $dto = new RegionDTO($data);
        
        $this->assertNotNull($dto);
    }

    public function testFromArrayCreatesInstance(): void
    {
        $data = ['name' => 'Zona Sur'];

        $dto = new RegionDTO($data);
        
        $this->assertInstanceOf(RegionDTO::class, $dto);
    }

    public function testValidateThrowsOnMissingName(): void
    {
        $data = [];

        $this->expectException(ApiException::class);
        $dto = new RegionDTO($data);
        $dto->validate();
    }

    public function testValidateThrowsOnInvalidRegion(): void
    {
        $data = ['name' => 'Invalid Region'];

        $this->expectException(ApiException::class);
        $dto = new RegionDTO($data);
        $dto->validate();
    }

    public function testValidateThrowsOnEmptyName(): void
    {
        $data = ['name' => ''];

        $this->expectException(ApiException::class);
        $dto = new RegionDTO($data);
        $dto->validate();
    }

    public function testValidateAcceptsAllValidRegions(): void
    {
        $validRegions = [
            'Guanacaste',
            'Alajuela',
            'San José',
            'Puntarenas',
            'Limón',
            'Heredia',
            'Cartago'
        ];

        foreach ($validRegions as $region) {
            $data = ['name' => $region];
            $dto = new RegionDTO($data);
            $dto->validate(); // Should not throw
        }

        $this->assertTrue(true);
    }
}