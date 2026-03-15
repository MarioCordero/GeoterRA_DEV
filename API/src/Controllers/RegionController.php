<?php
// src/Controllers/RegionController.php
declare(strict_types=1);

namespace Controllers;

use DTO\AnalysisRequestDTO;
use Http\Request;
use Http\Response;
use Http\ApiException;
use Http\ErrorType;
use Services\RegionService;

/**
 * Controller for handling region.
 */
final class RegionController
{
  private RegionService $service;
  public function __construct(private \PDO $pdo)
  {
    $this->service = new RegionService($this->pdo);
  }

  /**
   * GET /regions
   * Retrieves all regions
   */
  public function index(): void
  {
    try {
      $regions = $this->service->getAll();
      Response::success($regions);
    } catch (\Throwable $e) {
         Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}