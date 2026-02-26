<?php
declare(strict_types=1);

namespace Controllers;

use Services\HealthService;
use Http\Response;

final class HealthController
{
  public function __construct(private HealthService $service) {}

  public function check(): void
  {
    $data = $this->service->check();
    Response::success($data);
  }
}