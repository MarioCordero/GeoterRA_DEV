<?php
declare(strict_types=1);

namespace Controllers;

use DTO\InsituTestDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use Services\InsituTestService;
use PDO;

/**
 * Controller for in‑situ test endpoints.
 */
final class InsituTestController
{
  private InsituTestService $service;

  public function __construct(private PDO $pdo)
  {
    $this->service = new InsituTestService($pdo);
  }

  /**
   * GET /insitu-tests
   * Returns all in‑situ tests for a given geomanifestation (public, respects visibility).
   * Query parameter: geomanifestation_id (required)
   */
  public function index(): void
  {
    try {
      $geomanifestationId = $_GET['geomanifestation_id'] ?? '';
      if (empty($geomanifestationId)) {
        throw new ApiException(ErrorType::missingField('geomanifestation_id'), 422);
      }
      $tests = $this->service->getByManifestation($geomanifestationId);
      Response::success($tests);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /insitu-tests/{id}
   * Returns a single in‑situ test (public, respects manifestation visibility).
   *
   * @param string $id
   */
  public function show(string $id): void
  {
    try {
      $test = $this->service->getById($id);
      Response::success($test);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /insitu-tests
   * Creates a new in‑situ test (admin only).
   */
  public function store(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = InsituTestDTO::fromArray($body);
      $this->service->create($dto);
      Response::success(['success' => true], null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /insitu-tests/{id}
   * Updates an existing in‑situ test (admin only).
   *
   * @param string $id
   */
  public function update(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = InsituTestDTO::fromArray($body);
      $this->service->update($id, $dto);
      Response::success(['updated' => true]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /insitu-tests/{id}
   * Deletes an in‑situ test (admin only).
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