<?php
// src/Controllers/AnalysisRequestController.php
declare(strict_types=1);

namespace Controllers;

use DTO\AllowedUserRoles;
use Services\AnalysisRequestService;
use DTO\AnalysisRequestDTO;
use Http\Response;
use Http\Request;

use Services\AuthService;
USE Http\ApiException;
use Http\ErrorType;

/**
 * Controlador para endpoints de AnalysisRequest
 */
final class AnalysisRequestController
{
  public function __construct(
    private AnalysisRequestService $service,
    private AuthService $authService
  ) {}

  /**
   * Endpoint POST /analysis-request
   */
  public function store(): void
  {
    try {
      $auth = $this->authService->requireAuth();

      $userId = (string)$auth['user_id'];

      // Obtén JSON del body
      $body = Request::parseJsonRequest();
      $dto = AnalysisRequestDTO::fromArray($body);
      $this->service->create($dto, $userId);

      Response::success(['message' => 'Analysis request created successfully'], [], 201);

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
      $auth = $this->authService->requireAuth();

      $userId = (string) $auth['user_id'];

      // Fetch user requests
      $requests = $this->service->getAllByUser($userId);

      Response::success(data: $requests);

    } catch (ApiException $e) {
      Response::error($e->getError(), 400);

    } catch (\Throwable $e) {
      Response::error(
        ErrorType::internal($e->getMessage()),
        500
      );
    }
  }

  /**
   * PUT /analysis-request/{id}
   */
  public function update(string $id): void
  {
    try {
      $auth = $this->authService->requireAuth();
      $userId = (string) $auth['user_id'];

      $body = Request::parseJsonRequest();

      $dto = AnalysisRequestDTO::fromArray($body);

      $this->service->update($id, $dto, $userId);

      Response::success(['message' => 'Analysis request updated successfully']);

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());

    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }

  /**
   * DELETE /analysis-request/{id}
   */
  public function delete(string $id): void
  {
    try {
      $auth = $this->authService->requireAuth();
      $userId = (string) $auth['user_id'];

      $this->service->delete($id, $userId);

      Response::success(['message' => 'Analysis request deleted successfully']);

    } catch (ApiException $e) {
      Response::error($e->getError(), $e->getCode());

    } catch (\Throwable $e) {
      Response::error(ErrorType::internal($e->getMessage()), 500);
    }
  }
}
?>