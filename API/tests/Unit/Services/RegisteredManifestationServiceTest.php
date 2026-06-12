<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Tests\TestCase;
use Services\RegisteredManifestationService;

class RegisteredManifestationServiceTest extends TestCase
{
    private RegisteredManifestationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new RegisteredManifestationService($this->pdo);
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

    public function testGetAllByRegion(): void
    {
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

}
