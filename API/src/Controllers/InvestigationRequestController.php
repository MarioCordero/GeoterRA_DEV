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
   * Returns all analysis requests created by the authenticated user (includes current state).
   */
  public function index(): void
  {
    try {
      $requests = $this->service->getAllByUser();
      Response::success($requests);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /analysis-request/{id}
   * Returns a specific analysis request if it belongs to the authenticated user.
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
   * Returns all analysis requests in the system (admin only).
   */
  public function adminIndex(): void
  {
    try {
      $requests = $this->service->getAll();
      Response::success($requests);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /admin/analysis-request/{id}
   * Returns any analysis request by ID (admin only).
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
//
//  /**
//   * PUT /admin/analysis-request/{id}
//   * Updates any analysis request (admin only, no state restriction).
//   */
//  public function adminUpdate(string $id): void
//  {
//    try {
//      $body = Request::parseJsonRequest();
//      $dto = UpdateInvestigationRequestDTO::fromArray($body);
//      $this->service->adminUpdate($id, $dto);
//      Response::success(['message' => 'Analysis request updated successfully']);
//    } catch (ApiException $e) {
//      Response::error($e->getError(), $e->getCode());
//    } catch (Throwable $e) {
//      Response::error(ErrorType::internal($e->getMessage()), 500);
//    }
//  }

  /**
   * POST /admin/analysis-request/{id}/states
   * Adds a new state to a request (admin only).
   * Expected JSON body: { "state": "Aprobada", "description": "Optional text" }
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
      $this->service->addState($id, $stateValue, $description);
      Response::success(['message' => 'State added successfully']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /admin/analysis-request/{id}
   * Deletes any analysis request (admin only).
   */
  public function adminDelete(string $id): void
  {
    try {
      $this->service->adminDelete($id);
      Response::success(['message' => 'Analysis request deleted successfully']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}