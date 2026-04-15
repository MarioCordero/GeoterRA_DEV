<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\RegionService;
use Repositories\RegionRepository;

class RegionServiceTest extends TestCase
{
    private RegionService $regionService;
    private RegionRepository $regionRepository;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->regionRepository = new RegionRepository($this->pdo);
        $this->regionService = new RegionService($this->regionRepository);
    }

    public function testGetAllRegionsReturnsAllRegions(): void
    {
        $regions = $this->regionService->getAll();

        $this->assertIsArray($regions);
        $this->assertGreaterThan(0, count($regions));
        
        // Should have 7 default regions
        $this->assertGreaterThanOrEqual(7, count($regions));
    }

    public function testGetAllRegionsContainsExpectedRegions(): void
    {
        $regions = $this->regionService->getAll();
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
        $this->expectException(\Exception::class);
        $this->regionService->getById('nonexistent_region_id');
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
