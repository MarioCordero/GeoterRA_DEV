<?php
declare(strict_types=1);

namespace Controllers;

use DTO\RegisterInvestigationRequestDTO;
use DTO\UpdateInvestigationRequestDTO;
use Http\ApiException;
use Http\ErrorType;
use Http\Request;
use Http\Response;
use PDO;
use Services\InvestigationRequestService;
use Throwable;

/**
 * Controller for handling analysis request (geothermal manifestation request) endpoints.
 */
final class InvestigationRequestController
{
  private InvestigationRequestService $service;

  public function __construct(private PDO $pdo)
  {
    $this->service = new InvestigationRequestService($this->pdo);
  }

  /**
   * POST /analysis-request
   * Creates a new analysis request for the authenticated user.
   */
  public function store(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = RegisterInvestigationRequestDTO::fromArray($body);

      $result = $this->service->create($dto);
      Response::success(
        $result, null, 201
      );
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /analysis-request
   * Returns a paginated list of analysis requests created by the authenticated user, optionally filtered.
   */
  public function index(): void
  {
    try {
      $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
      $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
      $province = isset($_GET['province_snit_code']) ? (int)$_GET['province_snit_code'] : null;
      $canton = isset($_GET['canton_snit_code']) ? (int)$_GET['canton_snit_code'] : null;
      $district = isset($_GET['district_snit_code']) ? (int)$_GET['district_snit_code'] : null;

      $result = $this->service->getAllByUser(
        $page, $limit,
        $province, $canton, $district
      );

      // Send unstructured envelope since the service manages 'data' and 'pagination' keys
      Response::success(
        $result['data'], ['pagination' => $result['pagination']]
      );
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /analysis-request/{id}
   * Returns a specific analysis request if it belongs to the authenticated user.
   *
   * @param string $id
   */
  public function show(string $id): void
  {
    try {
      $request = $this->service->getById($id);
      Response::success($request);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /analysis-request/{id}/states
   * Returns all state history for a request (accessible for owner).
   *
   * @param string $id
   */
  public function states(string $id): void
  {
    try {
      $states = $this->service->getStates($id);
      Response::success($states);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /admin/analysis-request/{id}/states
   * Returns all state history for a request (accessible by admin).
   *
   * @param string $id
   */
  public function adminStates(string $id): void
  {
    try {
      $states = $this->service->adminGetStates($id);
      Response::success($states);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /analysis-request/{id}
   * Updates an existing analysis request (only if owned by the user AND current state is 'Pendiente').
   *
   * @param string $id
   */
  public function update(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = UpdateInvestigationRequestDTO::fromArray($body);

      $result = $this->service->update($id, $dto);
      Response::success($result, null, 201);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /analysis-request/{id}
   * Deletes an analysis request owned by the authenticated user.
   *
   * @param string $id
   */
  public function delete(string $id): void
  {
    try {
      $this->service->delete($id);
      Response::success(['message' => 'Analysis request deleted successfully']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /admin/analysis-request
   * Returns all analysis requests in the system, supporting pagination and comprehensive filters (admin only).
   */
  public function adminIndex(): void
  {
    try {
      $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
      $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;

      $province = isset($_GET['province_snit_code']) ? (int)$_GET['province_snit_code'] : null;
      $canton = isset($_GET['canton_snit_code']) ? (int)$_GET['canton_snit_code'] : null;
      $district = isset($_GET['district_snit_code']) ? (int)$_GET['district_snit_code'] : null;

      $requestName = isset($_GET['request_name']) ? (string)$_GET['request_name'] : null;
      $userName = isset($_GET['user_name']) ? (string)$_GET['user_name'] : null;
      $userEmail = isset($_GET['user_email']) ? (string)$_GET['user_email'] : null;

      $result = $this->service->adminGetAll(
        $page,
        $limit,
        $province,
        $canton,
        $district,
        $requestName,
        $userName,
        $userEmail
      );

      Response::success(
        $result['data'], ['pagination' => $result['pagination']]
      );
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /admin/analysis-request/{id}
   * Returns any analysis request by ID (admin only).
   *
   * @param string $id
   */
  public function adminShow(string $id): void
  {
    try {
      $request = $this->service->adminGetById($id);
      Response::success($request);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * POST /admin/analysis-request/{id}/states
   * Adds a new state to a request (admin only).
   * Expected JSON body: { "state": "Aprobada", "description": "Optional text" }
   *
   * @param string $id
   */
  public function adminAddState(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      if (!isset($body['state']) || trim($body['state']) === '') {
        throw new ApiException(ErrorType::missingField('state'), 422);
      }
      $stateValue = $body['state'];
      $description = $body['description'] ?? '';
      $this->service->adminAddState($id, $stateValue, $description);
      Response::success(['message' => 'State added successfully']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}