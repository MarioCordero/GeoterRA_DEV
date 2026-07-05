<?php
declare(strict_types=1);

namespace Controllers;

use DTO\RegisterInlabTestDTO;
use DTO\UpdateInlabTestDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use PDO;
use Services\InlabTestService;
use Throwable;

/**
 * Controller for in‑lab test endpoints.
 */
final class InlabTestController
{
  private InlabTestService $service;

  public function __construct(private PDO $pdo)
  {
    $this->service = new InlabTestService($pdo);
  }

  /**
   * GET /admin/inlab-tests
   * Returns all in‑lab tests for a given geomanifestation.
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
   * GET /admin/inlab-tests/{id}
   * Returns a single in‑lab test.
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
   * POST /admin/inlab-tests
   * Creates a new in‑lab test.
   */
  public function store(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = RegisterInlabTestDTO::fromArray($body);
      $result = $this->service->create($dto);
      Response::success($result, null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /admin/inlab-tests/{id}
   * Updates an existing in‑lab test.
   *
   * @param string $id
   */
  public function update(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = UpdateInlabTestDTO::fromArray($body);
      $result = $this->service->update($id, $dto);
      Response::success($result, null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /admin/inlab-tests/{id}
   * Deletes an in‑lab test.
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