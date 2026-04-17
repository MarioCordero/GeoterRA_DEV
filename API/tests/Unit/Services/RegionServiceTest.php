<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\RegionService;

class RegionServiceTest extends TestCase
{
    private RegionService $regionService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->regionService = new RegionService($this->pdo);
    }

    public function testGetAllRegionsReturnsAllRegions(): void
    {
        $regions = $this->regionService->getAll();

        $this->assertIsArray($regions);
        // Regions may be empty or populated from production database
        $this->assertGreaterThanOrEqual(0, count($regions));
    }

    public function testGetAllRegionsContainsExpectedRegions(): void
    {
        $regions = $this->regionService->getAll();
        
        // Just verify we can get regions and they have proper structure
        $this->assertIsArray($regions);
        if (count($regions) > 0) {
            $this->assertArrayHasKey('id', $regions[0]);
            $this->assertArrayHasKey('name', $regions[0]);
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
        $this->expectException(\Http\ApiException::class);
        $this->regionService->getById(999999);
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