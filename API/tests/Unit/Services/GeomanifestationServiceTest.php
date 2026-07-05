<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\GeomanifestationService;

class GeomanifestationServiceTest extends TestCase
{
    private GeomanifestationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new GeomanifestationService($this->pdo);
    }

    public function testCreate(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetById(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testUpdate(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testDelete(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testSetVisibility(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetAllVisible(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetAll(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetByProvince(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetViewById(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetViewAllPaginated(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

}
