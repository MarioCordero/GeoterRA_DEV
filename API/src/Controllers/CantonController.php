<?php
declare(strict_types=1);

namespace Controllers;

use DTO\CantonDTO;
use DTO\PermissionsDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use Services\CantonService;
use Services\PermissionService;
use PDO;

/**
 * Controller for canton endpoints.
 */
final class CantonController
{
  private CantonService $service;

  public function __construct(private PDO $pdo)
  {
    $this->service = new CantonService($pdo);
  }

  /**
   * GET /cantons
   * Retrieves all cantons, optionally filtered by province_snit_code query param.
   */
  public function index(): void
  {
    try {
      $provinceSnitCode = isset($_GET['province_snit_code'])
        ? (int) $_GET['province_snit_code']
        : null;
      $cantons = $this->service->getAll($provinceSnitCode);
      Response::success($cantons);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /cantons/{id}
   * Retrieves a single canton by its ULID.
   *
   * @param string $id
   */
  public function show(string $id): void
  {
    try {
      $canton = $this->service->getById($id);
      Response::success($canton);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /cantons/snit/{code}
   * Retrieves a canton by its SNIT code.
   *
   * @param int $code
   */
  public function showBySnitCode(string $code): void
  {
    try {
      $codeInt = (int) $code;
      $canton = $this->service->getBySnitCode($codeInt);
      Response::success($canton);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /cantons
   * Creates a new canton (admin only).
   */
  public function store(): void
  {
    try {
      $user = Request::getUser();
      if (!$user || !PermissionService::hasPermission($user['role'], PermissionsDTO::MANAGE_TERRITORIES)) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

      $body = Request::parseJsonRequest();
      $dto = CantonDTO::fromArray($body);
      $this->service->create($dto);
      Response::success(['success' => true], null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /cantons/{id}
   * Updates an existing canton (admin only).
   *
   * @param string $id
   */
  public function update(string $id): void
  {
    try {
      $user = Request::getUser();
      if (!$user || !PermissionService::hasPermission($user['role'], PermissionsDTO::MANAGE_TERRITORIES)) {
        Response::error(ErrorType::forbidden(), 403);
        return;
      }

      $body = Request::parseJsonRequest();
      $dto = CantonDTO::fromArray($body);
      $this->service->update($id, $dto);
      Response::success(['updated' => true]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /cantons/{id}
   * Deletes a canton (admin only). Cascades to districts.
   *
   * @param string $id
   */
  public function delete(string $id): void
  {
    try {
      $user = Request::getUser();
      if (!$user || !PermissionService::hasPermission($user['role'], PermissionsDTO::MANAGE_TERRITORIES)) {
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