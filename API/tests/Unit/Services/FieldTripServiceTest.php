<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Services\FieldTripService;
use Tests\TestCase;

class FieldTripServiceTest extends TestCase
{
  private FieldTripService $service;

  protected function setUp(): void
  {
    parent::setUp();
    $this->service = new FieldTripService($this->pdo);
  }

  public function testServiceCanBeInstantiated(): void
  {
    $this->assertInstanceOf(FieldTripService::class, $this->service);
  }
}
