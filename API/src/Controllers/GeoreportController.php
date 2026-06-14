<?php
declare(strict_types=1);

namespace Controllers;

use DTO\GeoreportDTO;
use DTO\PermissionsDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use Services\GeoreportService;
use Services\PermissionService;
use PDO;

/**
 * Controller for geothermal report endpoints.
 */
final class GeoreportController
{
  private GeoreportService $service;

  public function __construct(private PDO $pdo)
  {
    $this->service = new GeoreportService($pdo);
  }

  /**
   * GET /georeports
   * Returns all georeports for a given geomanifestation (public, respects visibility).
   * Query parameter: geomanifestation_id (required)
   */
  public function index(): void
  {
    try {
      $geomanifestationId = $_GET['geomanifestation_id'] ?? '';
      if (empty($geomanifestationId)) {
        throw new ApiException(ErrorType::missingField('geomanifestation_id'), 422);
      }
      $reports = $this->service->getByManifestation($geomanifestationId);
      Response::success($reports);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /georeports/current
   * Returns the current (latest) georeport for a geomanifestation.
   * Query parameter: geomanifestation_id (required)
   */
  public function current(): void
  {
    try {
      $geomanifestationId = $_GET['geomanifestation_id'] ?? '';
      if (empty($geomanifestationId)) {
        throw new ApiException(ErrorType::missingField('geomanifestation_id'), 422);
      }
      $report = $this->service->getCurrentByManifestation($geomanifestationId);
      if ($report === null) {
        Response::success(null);
      } else {
        Response::success($report);
      }
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /georeports/{id}
   * Returns a single georeport (public, respects manifestation visibility).
   *
   * @param string $id
   */
  public function show(string $id): void
  {
    try {
      $report = $this->service->getById($id);
      Response::success($report);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /georeports
   * Creates a new georeport and optionally sets it as current (admin only).
   * JSON body may include "set_as_current" (boolean, default true).
   */
  public function store(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = GeoreportDTO::fromArray($body);
      $setAsCurrent = $body['set_as_current'] ?? true;
      $this->service->create($dto, (bool) $setAsCurrent);
      Response::success(['success' => true], null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /georeports/{id}
   * Updates an existing georeport (admin only).
   * JSON body may include "set_as_current" (boolean, default false).
   *
   * @param string $id
   */
  public function update(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = GeoreportDTO::fromArray($body);
      $setAsCurrent = $body['set_as_current'] ?? false;
      $this->service->update($id, $dto, (bool) $setAsCurrent);
      Response::success(['updated' => true]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /georeports/{id}
   * Deletes a georeport (admin only). If it was the current one, the reference is cleared.
   *
   * @param string $id
   */
  public function delete(string $id): void
  {
    try {
      $this->service->delete($id);
      Response::success(['deleted' => true]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}