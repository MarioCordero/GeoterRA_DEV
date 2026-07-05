<?php
declare(strict_types=1);

namespace Controllers;

use DTO\RegisterInsituTestDTO;
use DTO\UpdateInsituTestDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use PDO;
use Services\InsituTestService;
use Throwable;

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
   * GET /admin/insitu-tests
   * Returns all in‑situ tests for a given geomanifestation.
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

      $tests = $this->service->getByManifestation($geomanifestationId);
      Response::success($tests);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /admin/insitu-tests/{id}
   * Returns a single in‑situ test.
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
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /admin/insitu-tests
   * Creates a new in‑situ test.
   */
  public function store(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = RegisterInsituTestDTO::fromArray($body);
      $result = $this->service->create($dto);
      Response::success($result, null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /admin/insitu-tests/{id}
   * Updates an existing in‑situ test.
   *
   * @param string $id
   */
  public function update(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = UpdateInsituTestDTO::fromArray($body);
      $result = $this->service->update($id, $dto);
      Response::success($result);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /admin/insitu-tests/{id}
   * Deletes an in‑situ test.
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