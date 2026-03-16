<?php
// src/Controllers/AnalysisRequestController.php
declare(strict_types=1);

namespace Controllers;

use DTO\AnalysisRequestDTO;
use Http\Request;
use Http\Response;
use Http\ApiException;
use Http\ErrorType;
use Services\AnalysisRequestService;

/**
 * Controller for handling analysis request related endpoints.
 */
final class AnalysisRequestController
{
  private AnalysisRequestService $service;
  public function __construct(private \PDO $pdo)
  {
    $this->service = new AnalysisRequestService($this->pdo);
  }

  /**
   * POST /analysis-request
   * Creates a new analysis request for the authenticated user
   */
  public function store(): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = AnalysisRequestDTO::fromArray($body);
      $this->service->create($dto);
      Response::success(['message' => 'Analysis request created successfully'], [], 201); // Use http response code 201 for created?
    } catch (ApiException $e) {
        Response::error($e->getError(), 400);
    } catch (\Throwable $e) {
         Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /analysis-request
   * Returns all analysis requests created by the authenticated user
   */
  public function index(): void
  {
    try {
      $requests = $this->service->getAllByUser();
      Response::success(data: $requests);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * GET /analysis-request
   * Returns all analysis requests on the system, only if the authenticated user is an admin
   */
  public function adminIndex(): void
  {
    try {
      $requests = $this->service->getAll();
      Response::success(data: $requests);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /analysis-request/{id}
   * Updates an existing analysis request by ID, only if it belongs to the authenticated user
   */
  public function update(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = AnalysisRequestDTO::fromArray($body);
      $this->service->update($id, $dto);
      Response::success(['message' => 'Analysis request updated successfully']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * PUT /analysis-request/{id}
   * Updates an existing user's analysis request by ID, only if the authenticated user is an admin
   */
  public function adminUpdate(string $id): void
  {
    try {
      $body = Request::parseJsonRequest();
      $dto = AnalysisRequestDTO::fromArray($body);
      $this->service->adminUpdate($id, $dto);
      Response::success(['message' => 'Analysis request updated successfully']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /analysis-request/{id}
   * Deletes an analysis request by ID, only if it belongs to the authenticated user
   */
  public function delete(string $id): void
  {
    try {
      $this->service->delete($id);
      Response::success(['message' => 'Analysis request deleted successfully']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /analysis-request/{id}
   * Deletes an user's analysis request by ID, only if the authenticated user is an admin
   */
  public function adminDelete(string $id): void
  {
    try {
      $this->service->adminDelete($id);
      Response::success(['message' => 'Analysis request deleted successfully']);
    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());
    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}