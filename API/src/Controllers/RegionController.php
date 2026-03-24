<?php
// src/Controllers/RegionController.php
declare(strict_types=1);

namespace Controllers;

use PDO;
use DTO\RegionDTO;
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
  /**
   * GET /regions/:id
   * Get region by ID
   */
  public function show(string $id = ''): void
  {
    try {
      $id = (int) $id;
      if ($id <= 0) {
        throw new ApiException(ErrorType::invalidInput('id must be a positive integer'), 400);
      }

      $region = $this->service->getById($id);
      Response::success($region);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /regions
   * Create new region
   */
  public function store(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = new RegionDTO($body);
      $region = $this->service->create($dto);
      Response::success($region);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /regions/:id
   * Update region
   */
  public function update(string $id = ''): void
  {
    try {
      $id = (int) $id;
      if ($id <= 0) {
        throw new ApiException(ErrorType::invalidInput('id must be a positive integer'), 400);
      }

      $body = Request::parseJsonRequest();
      $dto = new RegionDTO($body);
      $region = $this->service->update($id, $dto);
      Response::success($region);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /regions/:id
   * Delete region
   */
  public function delete(string $id = ''): void
  {
    try {
      $id = (int) $id;
      if ($id <= 0) {
        throw new ApiException(ErrorType::invalidInput('id must be a positive integer'), 400);
      }
      $this->service->delete($id);
      Response::success(['message' => 'Region deleted successfully']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}