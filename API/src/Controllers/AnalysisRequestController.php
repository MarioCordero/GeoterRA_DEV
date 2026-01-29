<?php
// src/Controllers/AnalysisRequestController.php
declare(strict_types=1);

namespace Controllers;

use Services\AnalysisRequestService;
use DTO\AnalysisRequestDTO;
use Http\Response;
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
  public function __invoke(): void
  {
    try {
      $headers = getallheaders();
      $token = $headers['Authorization'] ?? '';
      $token = str_replace('Bearer ', '', $token);
      $token = trim($token);

      if (!$token) {
        Response::error(ErrorType::missingAuthToken(), 401);
        return;
      }

      $session = $this->authService->validateToken($token);

      if (!$session) {
        Response::error(ErrorType::invalidToken(), 401);
        return;
      }

      $userId = (int)$session['user_id'];

      // Obtén JSON del body
      $body = json_decode(file_get_contents('php://input'), true);
      if (!$body) {
        Response::error(ErrorType::invalidJson(), 400);
        return;
      }

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
      // Extract Authorization header
      $headers = getallheaders();
      $token = $headers['Authorization'] ?? '';
      $token = str_replace('Bearer ', '', $token);
      $token = trim($token);

      if (!$token) {
        Response::error(ErrorType::missingAuthToken(), 401);
        return;
      }

      // Validate token
      $session = $this->authService->validateToken($token);
      if (!$session) {
        Response::error(ErrorType::invalidToken(), 401);
        return;
      }

      $userId = (int) $session['user_id'];

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
}
?>