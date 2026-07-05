<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\GeoreportService;

class GeoreportServiceTest extends TestCase
{
    private GeoreportService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new GeoreportService($this->pdo);
    }

    public function testCreate(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetById(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetByManifestation(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetCurrentByManifestation(): void
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

}
