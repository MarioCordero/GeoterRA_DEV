<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\CantonService;

class CantonServiceTest extends TestCase
{
    private CantonService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new CantonService($this->pdo);
    }

    public function testGetAll(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetById(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetBySnitCode(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testCreate(): void
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
