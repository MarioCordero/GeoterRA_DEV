<?php
declare(strict_types=1);

namespace Controllers;

use DTO\RegisterGeoreportDTO;
use DTO\UpdateGeoreportDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use PDO;
use Services\GeoreportService;
use Throwable;

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
   * GET /admin/georeports
   * Returns all georeports for a given geomanifestation.
   * Query parameter: geomanifestation_id (required)
   */
  public function index(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $geomanifestationId = $body['geomanifestation_id'] ?? '';

      if (empty($geomanifestationId)) {
        throw new ApiException(
          ErrorType::missingField('geomanifestation_id'), 422
        );
      }

      $reports = $this->service->getByManifestation($geomanifestationId);
      Response::success($reports);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /georeports
   * Returns the current georeport for a geomanifestation.
   * Query parameter: geomanifestation_id (required)
   */
  public function current(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $geomanifestationId = $body['geomanifestation_id'] ?? '';

      if (empty($geomanifestationId)) {
        throw new ApiException(
          ErrorType::missingField('geomanifestation_id'), 422
        );
      }

      $report = $this->service->getCurrentByManifestation($geomanifestationId);
      Response::success($report);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /admin/georeports/{id}
   * Returns a single georeport.
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
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /admin/georeports
   * Creates a new georeport and optionally sets it as current.
   * JSON body may include "set_as_current" (boolean, default true).
   */
  public function store(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = RegisterGeoreportDTO::fromArray($body);
      $setAsCurrent = $body['set_as_current'] ?? true;

      $report = $this->service->create($dto, (bool)$setAsCurrent);
      Response::success($report, null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /admin/georeports/{id}
   * Updates an existing georeport and optionally sets it as current.
   * JSON body may include "set_as_current" (boolean, default false).
   *
   * @param string $id
   */
  public function update(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = UpdateGeoreportDTO::fromArray($body);
      $setAsCurrent = $body['set_as_current'] ?? false;

      $report = $this->service->update($id, $dto, (bool)$setAsCurrent);
      Response::success($report, null, 200);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /admin/georeports/{id}
   * Deletes a georeport. If it was the current one, the reference is cleared.
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
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}