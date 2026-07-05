<?php
declare(strict_types=1);

namespace Controllers;

use DTO\DistrictDTO;
use DTO\PermissionsDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use Services\DistrictService;
use Services\PermissionService;
use PDO;
use Throwable;

/**
 * Controller for district endpoints.
 */
final class DistrictController
{
  private DistrictService $service;

  public function __construct(private PDO $pdo)
  {
    $this->service = new DistrictService($pdo);
  }

  /**
   * GET /districts
   * Retrieves all districts, optionally filtered by canton_snit_code query param.
   */
  public function index(): void
  {
    try {
      $cantonSnitCode = isset($_GET['canton_snit_code'])
        ? (int) $_GET['canton_snit_code']
        : null;
      $districts = $this->service->getAll($cantonSnitCode);
      Response::success($districts);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /districts/{id}
   * Retrieves a single district by its ULID.
   *
   * @param string $id
   */
  public function show(string $id): void
  {
    try {
      $district = $this->service->getById($id);
      Response::success($district);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /districts/snit/{code}
   * Retrieves a district by its SNIT code.
   *
   * @param string $code
   */
  public function showBySnitCode(string $code): void
  {
    try {
      $codeInt = (int) $code;
      $district = $this->service->getBySnitCode($codeInt);
      Response::success($district);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /districts
   * Creates a new district (admin only).
   */
  public function store(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = DistrictDTO::fromArray($body);
      $this->service->create($dto);
      Response::success(['success' => true], null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /districts/{id}
   * Updates an existing district (admin only).
   *
   * @param string $id
   */
  public function update(string $id): void
  {
    try {

      $body = Request::parseJsonRequest();
      $dto = DistrictDTO::fromArray($body);
      $this->service->update($id, $dto);
      Response::success(['updated' => true]);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getHttpStatus());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /districts/{id}
   * Deletes a district (admin only).
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