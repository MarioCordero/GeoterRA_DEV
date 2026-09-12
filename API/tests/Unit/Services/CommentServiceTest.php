<?php
declare(strict_types=1);

namespace Tests\Unit\Services;

use Services\CommentService;
use Tests\TestCase;

class CommentServiceTest extends TestCase
{
  private CommentService $service;

  protected function setUp(): void
  {
    parent::setUp();
    $this->service = new CommentService($this->pdo);
  }

  public function testServiceCanBeInstantiated(): void
  {
    $this->assertInstanceOf(CommentService::class, $this->service);
  }
}
