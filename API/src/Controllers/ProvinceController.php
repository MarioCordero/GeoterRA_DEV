<?php
declare(strict_types=1);

namespace Controllers;

use DTO\PermissionsDTO;
use DTO\ProvinceDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use Services\PermissionService;
use Services\ProvinceService;
use PDO;
use Throwable;

/**
 * Controller for province endpoints.
 */
final class ProvinceController
{
  private ProvinceService $service;

  public function __construct(private PDO $pdo)
  {
    $this->service = new ProvinceService($pdo);
  }

  /**
   * GET /provinces
   * Retrieves all provinces (public access).
   */
  public function index(): void
  {
    try {
      $provinces = $this->service->getAll();
      Response::success($provinces);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /provinces/{id}
   * Retrieves a single province by its ULID (administrative access).
   *
   * @param string $id
   */
  public function show(string $id): void
  {
    try {
      $province = $this->service->getById($id);
      Response::success($province);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /provinces/snit/{code}
   * Retrieves a province by its SNIT code (administrative access).
   *
   * @param string $code
   */
  public function showBySnitCode(string $code): void
  {
    try {
      $codeInt = (int) $code;
      $province = $this->service->getBySnitCode($codeInt);
      Response::success($province);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /provinces
   * Creates a new province (administrative access only).
   */
  public function store(): void
  {
    try {

      $body = Request::parseJsonRequest();
      $dto = ProvinceDTO::fromArray($body);
      $this->service->create($dto);
      Response::success(['success' => true], null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /provinces/{id}
   * Updates an existing province (administrative access only).
   *
   * @param string $id
   */
  public function update(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = ProvinceDTO::fromArray($body);
      $this->service->update($id, $dto);
      Response::success(['updated' => true]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /provinces/{id}
   * Deletes a province (administrative access only). Cascades to cantons and districts.
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