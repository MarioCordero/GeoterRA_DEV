<?php
declare(strict_types=1);

namespace Services;

use Repositories\HealthRepository;

final class HealthService
{
  public function __construct(private HealthRepository $repo) {}

  public function check(): array
  {
    return [
      'db' => $this->repo->ping() ? 'ok' : 'fail',
      'time' => date('c'),
    ];
  }
}