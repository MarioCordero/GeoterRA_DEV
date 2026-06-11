<?php
declare(strict_types=1);

namespace Controllers;

use DTO\InlabTestDTO;
use DTO\PermissionsDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use Services\InlabTestService;
use Services\PermissionService;
use PDO;

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
   * GET /inlab-tests
   * Returns all in‑lab tests for a given geomanifestation (public, respects visibility).
   * Query parameter: geomanifestation_id (required)
   */
  public function index(): void
  {
    try {
      $user = Request::getUser();
      if (!$user || !PermissionService::hasPermission($user['role'], PermissionsDTO::MANAGE_INLAB_TESTS)) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

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
   * GET /inlab-tests/{id}
   * Returns a single in‑lab test (public, respects manifestation visibility).
   *
   * @param string $id
   */
  public function show(string $id): void
  {
    try {
      $user = Request::getUser();
      if (!$user || !PermissionService::hasPermission($user['role'], PermissionsDTO::MANAGE_INLAB_TESTS)) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

      $test = $this->service->getById($id);
      Response::success($test);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /inlab-tests
   * Creates a new in‑lab test (admin only).
   */
  public function store(): void
  {
    try {
      $user = Request::getUser();
      if (!$user || !PermissionService::hasPermission($user['role'], PermissionsDTO::MANAGE_INLAB_TESTS)) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

      $body = Request::parseJsonRequest();
      $dto = InlabTestDTO::fromArray($body);
      $this->service->create($dto);
      Response::success(['success' => true], null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /inlab-tests/{id}
   * Updates an existing in‑lab test (admin only).
   *
   * @param string $id
   */
  public function update(string $id): void
  {
    try {
      $user = Request::getUser();
      if (!$user || !PermissionService::hasPermission($user['role'], PermissionsDTO::MANAGE_INLAB_TESTS)) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

      $body = Request::parseJsonRequest();
      $dto = InlabTestDTO::fromArray($body);
      $this->service->update($id, $dto);
      Response::success(['updated' => true]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /inlab-tests/{id}
   * Deletes an in‑lab test (admin only).
   *
   * @param string $id
   */
  public function delete(string $id): void
  {
    try {
      $user = Request::getUser();
      if (!$user || !PermissionService::hasPermission($user['role'], PermissionsDTO::MANAGE_INLAB_TESTS)) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

      $this->service->delete($id);
      Response::success(['deleted' => true]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}