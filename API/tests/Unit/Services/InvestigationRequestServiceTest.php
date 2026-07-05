<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\InvestigationRequestService;

class InvestigationRequestServiceTest extends TestCase
{
    private InvestigationRequestService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new InvestigationRequestService($this->pdo);
    }

    public function testCreate(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testUpdate(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testAdminUpdate(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testAddState(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetStates(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testDelete(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testAdminDelete(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetAllByUser(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetAll(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testGetById(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function testAdminGetById(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

}
