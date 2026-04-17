<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\RegionService;
<<<<<<< HEAD
=======
use Repositories\RegionRepository;
>>>>>>> origin/web{fixWebApp}

class RegionServiceTest extends TestCase
{
    private RegionService $regionService;
<<<<<<< HEAD
=======
    private RegionRepository $regionRepository;
>>>>>>> origin/web{fixWebApp}

    protected function setUp(): void
    {
        parent::setUp();
<<<<<<< HEAD
        $this->regionService = new RegionService($this->pdo);
=======
        
        $this->regionRepository = new RegionRepository($this->pdo);
        $this->regionService = new RegionService($this->regionRepository);
>>>>>>> origin/web{fixWebApp}
    }

    public function testGetAllRegionsReturnsAllRegions(): void
    {
        $regions = $this->regionService->getAll();

        $this->assertIsArray($regions);
<<<<<<< HEAD
        // Regions may be empty or populated from production database
        $this->assertGreaterThanOrEqual(0, count($regions));
=======
        $this->assertGreaterThan(0, count($regions));
        
        // Should have 7 default regions
        $this->assertGreaterThanOrEqual(7, count($regions));
>>>>>>> origin/web{fixWebApp}
    }

    public function testGetAllRegionsContainsExpectedRegions(): void
    {
        $regions = $this->regionService->getAll();
<<<<<<< HEAD
        
        // Just verify we can get regions and they have proper structure
        $this->assertIsArray($regions);
        if (count($regions) > 0) {
            $this->assertArrayHasKey('id', $regions[0]);
            $this->assertArrayHasKey('name', $regions[0]);
=======
        $regionNames = array_column($regions, 'name');

        $expectedRegions = [
            'Los Andes',
            'Zona Sur',
            'Pacifico',
            'Zona Central',
            'Araucanía',
            'Los Lagos',
            'Zona Austral'
        ];

        foreach ($expectedRegions as $expected) {
            $this->assertContains($expected, $regionNames);
>>>>>>> origin/web{fixWebApp}
        }
    }

    public function testGetByIdReturnsRegion(): void
    {
        $allRegions = $this->regionService->getAll();
        $firstRegion = $allRegions[0];

        $region = $this->regionService->getById($firstRegion['id']);

        $this->assertNotNull($region);
        $this->assertEquals($firstRegion['id'], $region['id']);
        $this->assertEquals($firstRegion['name'], $region['name']);
    }

    public function testGetByIdThrowsOnNonexistentRegion(): void
    {
<<<<<<< HEAD
        $this->expectException(\Http\ApiException::class);
        $this->regionService->getById(999999);
=======
        $this->expectException(\Exception::class);
        $this->regionService->getById('nonexistent_region_id');
>>>>>>> origin/web{fixWebApp}
    }

    public function testRegionsHaveConsistentStructure(): void
    {
        $regions = $this->regionService->getAll();

        foreach ($regions as $region) {
            $this->assertArrayHasKey('id', $region);
            $this->assertArrayHasKey('name', $region);
            $this->assertNotEmpty($region['id']);
            $this->assertNotEmpty($region['name']);
        }
    }
}
